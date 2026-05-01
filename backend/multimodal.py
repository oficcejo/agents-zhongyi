"""
中医诊疗系统 - 多模态客户端（视觉分析 + 语音识别 + 语音合成）
"""
import httpx
import json
import base64
import os
from typing import Optional


class VisionClient:
    """多模态视觉模型客户端（OpenAI 兼容格式）"""

    def __init__(self):
        self.api_key = os.getenv("VISION_API_KEY", "")
        self.api_base = os.getenv("VISION_API_BASE", "https://api.openai.com/v1")
        self.model = os.getenv("VISION_MODEL", "gpt-4o")

    async def analyze_image(self, image_base64: str, prompt: str) -> str:
        """分析图像，返回文本结果"""
        url = f"{self.api_base}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        # 确保 image_base64 带有 data URI 前缀
        if not image_base64.startswith("data:"):
            image_url = f"data:image/jpeg;base64,{image_base64}"
        else:
            image_url = image_base64

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            "temperature": 0.3,
            "max_tokens": 2000
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
            except Exception as e:
                return f"视觉分析错误: {str(e)}"


class ASRClient:
    """语音识别客户端（OpenAI Whisper 兼容格式）"""

    def __init__(self):
        self.api_key = os.getenv("ASR_API_KEY", "")
        self.api_base = os.getenv("ASR_API_BASE", "https://api.openai.com/v1")
        self.model = os.getenv("ASR_MODEL", "whisper-1")

    async def transcribe(self, audio_bytes: bytes, audio_format: str = "webm") -> str:
        """语音转文字"""
        # 策略A: Whisper 兼容端点
        result = await self._try_whisper_endpoint(audio_bytes, audio_format)
        if result is not None:
            return result

        # 策略B: chat/completions with input_audio
        return await self._try_chat_audio_endpoint(audio_bytes, audio_format)

    async def _try_whisper_endpoint(self, audio_bytes: bytes, audio_format: str) -> Optional[str]:
        """策略A: POST /audio/transcriptions（multipart 上传）"""
        url = f"{self.api_base}/audio/transcriptions"
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }

        mime_map = {
            "webm": "audio/webm",
            "mp3": "audio/mpeg",
            "mp4": "audio/mp4",
            "wav": "audio/wav",
            "m4a": "audio/mp4",
            "ogg": "audio/ogg"
        }
        mime_type = mime_map.get(audio_format, "audio/webm")
        filename = f"recording.{audio_format}"

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                files = {"file": (filename, audio_bytes, mime_type)}
                data = {"model": self.model}
                response = await client.post(url, headers=headers, files=files, data=data)
                if response.status_code == 404:
                    return None  # 端点不存在，回退到策略B
                response.raise_for_status()
                result = response.json()
                return result.get("text", "")
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return None
                return f"语音识别错误: {str(e)}"
            except Exception as e:
                return f"语音识别错误: {str(e)}"

    async def _try_chat_audio_endpoint(self, audio_bytes: bytes, audio_format: str) -> str:
        """策略B: POST /chat/completions with input_audio content block"""
        url = f"{self.api_base}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_audio",
                            "input_audio": {
                                "data": audio_b64,
                                "format": audio_format
                            }
                        },
                        {
                            "type": "text",
                            "text": "你是一个语音识别系统。请将上面音频中的语音内容准确转录为文字。只输出转录的原文，不要添加任何解释、标点注释或额外内容。如果音频是中文就输出中文，是英文就输出英文。"
                        }
                    ]
                }
            ],
            "temperature": 0.0,
            "max_tokens": 2000
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
            except Exception as e:
                return f"语音识别错误: {str(e)}"


class TTSClient:
    """语音合成客户端（OpenAI TTS 兼容格式）"""

    def __init__(self):
        self.api_key = os.getenv("TTS_API_KEY", "")
        self.api_base = os.getenv("TTS_API_BASE", "https://api.openai.com/v1")
        self.model = os.getenv("TTS_MODEL", "tts-1")

    async def synthesize(self, text: str) -> Optional[bytes]:
        """文字转语音，返回音频 bytes"""
        # 策略A: OpenAI /audio/speech 端点
        result = await self._try_openai_tts(text)
        if result is not None:
            return result

        # 策略B: chat/completions 格式（MiMo TTS 等）
        return await self._try_chat_tts(text)

    async def _try_openai_tts(self, text: str) -> Optional[bytes]:
        """策略A: POST /audio/speech（OpenAI 标准格式）"""
        url = f"{self.api_base}/audio/speech"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "input": text,
            "voice": "alloy",
            "response_format": "mp3"
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code == 404:
                    return None
                response.raise_for_status()
                return response.content
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return None
                print(f"TTS 策略A错误: {str(e)}")
                return None
            except Exception as e:
                print(f"TTS 策略A错误: {str(e)}")
                return None

    async def _try_chat_tts(self, text: str) -> Optional[bytes]:
        """策略B: POST /chat/completions with assistant message（MiMo TTS 格式）"""
        url = f"{self.api_base}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": "请用语音回复"},
                {"role": "assistant", "content": text}
            ],
            "max_tokens": 200
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                msg = result["choices"][0]["message"]
                # MiMo TTS 返回 audio.data (base64)
                if "audio" in msg and "data" in msg["audio"]:
                    return base64.b64decode(msg["audio"]["data"])
                print("TTS 响应中无音频数据")
                return None
            except Exception as e:
                print(f"TTS 策略B错误: {str(e)}")
                return None
