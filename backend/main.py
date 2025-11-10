"""
中医诊疗系统 - FastAPI 主程序
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from agents import TCMAgents
import json
import asyncio
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
    disease_name: str  # 现代病名
    chief_complaint: str  # 主诉
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
    return {
        "status": "healthy",
        "api_configured": bool(api_key),
        "message": "系统运行正常" if api_key else "请配置 DEEPSEEK_API_KEY"
    }


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
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

