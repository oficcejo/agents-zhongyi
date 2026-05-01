"""
中医诊疗系统 - FastAPI 主程序
"""
import sys
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from agents import TCMAgents
from multimodal import VisionClient, ASRClient, TTSClient
from prompts_multimodal import TCMMultimodalPrompts
import json
import asyncio
import base64
from collections import defaultdict

# 加载环境变量
load_dotenv()

app = FastAPI(
    title="中医智能诊疗系统",
    description="基于 DeepSeek AI 的中医多智能体诊疗系统",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")


class PatientInput(BaseModel):
    """患者输入数据模型"""
    disease_name: Optional[str] = ""  # 现代病名（选填）
    chief_complaint: Optional[str] = ""  # 主诉（选填，问诊记录中已有）
    four_examinations: str  # 四诊（望闻问切）
    special_conditions: Optional[str] = ""  # 特殊情况（妊娠、肝肾功能等）


class DiagnosisResponse(BaseModel):
    """诊疗响应模型"""
    status: str
    message: str
    data: dict


# 初始化 Agents
tcm_agents = TCMAgents()

# 存储进度队列的字典 {session_id: queue}
progress_queues = {}


@app.get("/", response_class=HTMLResponse)
async def read_root():
    """返回前端页面"""
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>中医智能诊疗系统</h1><p>请确保前端文件存在</p>"


@app.get("/api/health")
async def health_check():
    """健康检查"""
    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    vision_key = os.getenv("VISION_API_KEY", "")
    asr_key = os.getenv("ASR_API_KEY", "")
    tts_key = os.getenv("TTS_API_KEY", "")
    return {
        "status": "healthy",
        "api_configured": bool(api_key),
        "vision_configured": bool(vision_key) and vision_key != "your-vision-api-key",
        "asr_configured": bool(asr_key) and asr_key != "your-asr-api-key",
        "tts_configured": bool(tts_key) and tts_key != "your-tts-api-key",
        "message": "系统运行正常" if api_key else "请配置 DEEPSEEK_API_KEY"
    }


@app.get("/ai-diagnosis", response_class=HTMLResponse)
async def ai_diagnosis_page():
    """返回AI望诊问诊页面"""
    html_file = os.path.join(frontend_path, "ai-diagnosis.html")
    if os.path.exists(html_file):
        with open(html_file, "r", encoding="utf-8") as f:
            return f.read()
    raise HTTPException(status_code=404, detail="页面不存在")


class ImageInput(BaseModel):
    """图像输入"""
    image: str  # data:image/jpeg;base64,... 或纯 base64


class AudioInput(BaseModel):
    """音频输入"""
    audio: str  # base64 编码
    format: str = "webm"
    transcription: Optional[str] = None  # 前端已转写文本（Web Speech API）


class FollowupInput(BaseModel):
    """追问生成输入"""
    organized_text: str


class SpeechInput(BaseModel):
    """语音合成输入"""
    text: str


# 初始化多模态客户端
vision_client = VisionClient()
asr_client = ASRClient()
tts_client = TTSClient()


@app.post("/api/analyze-face")
async def analyze_face(data: ImageInput):
    """望脸色分析"""
    if not os.getenv("VISION_API_KEY") or os.getenv("VISION_API_KEY") == "your-vision-api-key":
        raise HTTPException(status_code=500, detail="未配置 VISION_API_KEY，请在 .env 文件中配置")

    try:
        prompt = TCMMultimodalPrompts.face_analysis_prompt()
        result = await vision_client.analyze_image(data.image, prompt)
        return JSONResponse(content={"status": "success", "analysis": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"望脸色分析失败: {str(e)}")


@app.post("/api/analyze-tongue")
async def analyze_tongue(data: ImageInput):
    """舌诊分析"""
    if not os.getenv("VISION_API_KEY") or os.getenv("VISION_API_KEY") == "your-vision-api-key":
        raise HTTPException(status_code=500, detail="未配置 VISION_API_KEY，请在 .env 文件中配置")

    try:
        prompt = TCMMultimodalPrompts.tongue_analysis_prompt()
        result = await vision_client.analyze_image(data.image, prompt)
        return JSONResponse(content={"status": "success", "analysis": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"舌诊分析失败: {str(e)}")


@app.post("/api/transcribe-audio")
async def transcribe_audio(data: AudioInput):
    """语音转文字 + 整理为结构化问诊"""
    if not os.getenv("ASR_API_KEY") or os.getenv("ASR_API_KEY") == "your-asr-api-key":
        raise HTTPException(status_code=500, detail="未配置 ASR_API_KEY，请在 .env 文件中配置")

    try:
        # 如果前端已提供转写文本（Web Speech API），直接使用
        if data.transcription:
            transcription = data.transcription
        else:
            # 解码 base64 音频
            audio_bytes = base64.b64decode(data.audio)
            # ASR 转文字
            transcription = await asr_client.transcribe(audio_bytes, data.format)

        # 整理为结构化问诊（使用文本 LLM，不需要视觉能力）
        organize_prompt = TCMMultimodalPrompts.inquiry_organize_prompt(transcription)
        from agents import DeepSeekClient
        text_client = DeepSeekClient()
        organized = await text_client.chat_completion(organize_prompt, temperature=0.3)

        return JSONResponse(content={
            "status": "success",
            "transcription": transcription,
            "organized": organized
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"语音转写失败: {str(e)}")


@app.post("/api/generate-followup")
async def generate_followup(data: FollowupInput):
    """根据问诊内容生成追问"""
    try:
        from agents import DeepSeekClient
        text_client = DeepSeekClient()
        prompt = TCMMultimodalPrompts.inquiry_followup_prompt(data.organized_text)
        result = await text_client.chat_completion(prompt, temperature=0.4)

        # 尝试解析 JSON 数组
        import re
        try:
            questions = json.loads(result)
        except:
            match = re.search(r'\[.*\]', result, re.DOTALL)
            if match:
                questions = json.loads(match.group(0))
            else:
                questions = [result]

        return JSONResponse(content={"status": "success", "questions": questions})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成追问失败: {str(e)}")


@app.post("/api/synthesize-speech")
async def synthesize_speech(data: SpeechInput):
    """文字转语音"""
    if not os.getenv("TTS_API_KEY") or os.getenv("TTS_API_KEY") == "your-tts-api-key":
        raise HTTPException(status_code=500, detail="未配置 TTS_API_KEY，请在 .env 文件中配置")

    try:
        audio_bytes = await tts_client.synthesize(data.text)
        if audio_bytes is None:
            raise HTTPException(status_code=500, detail="语音合成失败")

        return StreamingResponse(
            iter([audio_bytes]),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"语音合成失败: {str(e)}")


@app.get("/api/diagnose/progress/{session_id}")
async def diagnose_progress(session_id: str):
    """
    SSE端点 - 实时推送诊疗进度
    """
    async def event_generator():
        queue = progress_queues[session_id]
        try:
            while True:
                # 等待进度更新
                progress_data = await queue.get()

                # 如果收到结束信号
                if progress_data.get("status") == "done":
                    yield f"data: {json.dumps(progress_data)}\n\n"
                    break

                # 发送进度数据
                yield f"data: {json.dumps(progress_data)}\n\n"

        except asyncio.CancelledError:
            # 客户端断开连接
            pass
        finally:
            # 清理队列
            if session_id in progress_queues:
                del progress_queues[session_id]

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


async def process_diagnosis_background(session_id: str, patient_info: dict):
    """后台处理诊疗任务"""
    try:
        queue = progress_queues[session_id]

        # 定义进度回调函数
        async def progress_callback(progress_data):
            await queue.put(progress_data)

        # 创建带进度回调的agents实例
        agents_with_progress = TCMAgents(progress_callback=progress_callback)

        # 调用诊疗流程
        results = await agents_with_progress.process_diagnosis(patient_info)

        # 发送完成信号
        await queue.put({"status": "done", "data": results})

    except Exception as e:
        # 发送错误信号
        await queue.put({
            "status": "error",
            "message": str(e)
        })


@app.post("/api/diagnose")
async def diagnose(patient: PatientInput):
    """
    主要诊疗接口

    接收患者信息，立即返回session_id，然后异步处理
    """
    # 验证 API Key
    if not os.getenv("DEEPSEEK_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="未配置 DEEPSEEK_API_KEY，请在 .env 文件中配置"
        )

    # 生成会话ID
    import uuid
    session_id = str(uuid.uuid4())

    # 创建进度队列
    queue = asyncio.Queue()
    progress_queues[session_id] = queue

    # 转换为字典
    patient_info = {
        "disease_name": patient.disease_name,
        "chief_complaint": patient.chief_complaint,
        "four_examinations": patient.four_examinations,
        "special_conditions": patient.special_conditions or "无"
    }

    # 启动后台任务
    asyncio.create_task(process_diagnosis_background(session_id, patient_info))

    # 立即返回session_id
    return JSONResponse(content={
        "status": "success",
        "message": "诊疗任务已启动",
        "session_id": session_id
    })


@app.post("/api/export-report")
async def export_report(data: dict):
    """
    导出报告
    
    将诊疗结果导出为 Markdown 或 PDF
    """
    try:
        report_content = data.get("final_report", "")
        
        return JSONResponse(content={
            "status": "success",
            "report": report_content,
            "download_link": "/api/download-report"
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"导出报告失败: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    # SSL 配置（支持 HTTPS，手机摄像头需要）
    ssl_certfile = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ssl", "cert.pem")
    ssl_keyfile = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ssl", "key.pem")

    ssl_kwargs = {}
    if os.path.exists(ssl_certfile) and os.path.exists(ssl_keyfile):
        ssl_kwargs["ssl_certfile"] = ssl_certfile
        ssl_kwargs["ssl_keyfile"] = ssl_keyfile
        print(f"HTTPS 模式: https://0.0.0.0:8000")
        print(f"手机访问: https://<你的IP>:8000/ai-diagnosis")
    else:
        print(f"HTTP 模式: http://0.0.0.0:8000")
        print(f"提示: 手机摄像头需要 HTTPS，请确保 ssl/cert.pem 和 ssl/key.pem 存在")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
        **ssl_kwargs
    )

