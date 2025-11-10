"""
中医诊疗系统 - AI Agents 实现
"""
import httpx
import json
import asyncio
from typing import Dict, Any, List
from prompts import TCMPrompts
import os


class DeepSeekClient:
    """DeepSeek API 客户端"""
    
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.api_base = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com/v1")
        self.model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
        
    async def chat_completion(self, prompt: str, temperature: float = 0.7) -> str:
        """调用 DeepSeek API"""
        url = f"{self.api_base}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": 4000
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
            except Exception as e:
                return f"API调用错误: {str(e)}"


class TCMAgents:
    """中医诊疗智能体系统"""

    def __init__(self, progress_callback=None):
        self.client = DeepSeekClient()
        self.prompts = TCMPrompts()
        self.progress_callback = progress_callback

    async def _send_progress(self, step: int, name: str, status: str, message: str = ""):
        """发送进度更新"""
        if self.progress_callback:
            await self.progress_callback({
                "step": step,
                "name": name,
                "status": status,
                "message": message
            })
    
    async def diagnosis_agent(self, patient_info: Dict[str, Any]) -> Dict[str, Any]:
        """Agent 1: 中医辨证"""
        print("🔍 执行中医辨证分析...")
        await self._send_progress(1, "中医辨证分析", "processing", "正在进行八纲、六经、卫气营血、脏腑辨证...")

        prompt = self.prompts.diagnosis_agent(patient_info)
        result = await self.client.chat_completion(prompt, temperature=0.3)

        try:
            # 尝试提取 JSON
            result_json = self._extract_json(result)
            await self._send_progress(1, "中医辨证分析", "completed", "辨证分析完成")
            return {
                "status": "success",
                "agent": "中医辨证",
                "data": result_json,
                "raw": result
            }
        except:
            await self._send_progress(1, "中医辨证分析", "completed", "辨证分析完成")
            return {
                "status": "success",
                "agent": "中医辨证",
                "data": {},
                "raw": result
            }
    
    async def ancient_cases_agent(self, patient_info: Dict[str, Any], diagnosis_result: str) -> Dict[str, Any]:
        """Agent 2: 古籍病案分析"""
        print("📚 查询古籍病案...")
        await self._send_progress(2, "古籍病案检索", "processing", "正在检索汉唐至民国历代医案...")

        prompt = self.prompts.ancient_cases_agent(patient_info, diagnosis_result)
        result = await self.client.chat_completion(prompt, temperature=0.5)

        try:
            result_json = self._extract_json(result)
            await self._send_progress(2, "古籍病案检索", "completed", "古籍病案分析完成")
            return {
                "status": "success",
                "agent": "古籍病案",
                "data": result_json,
                "raw": result
            }
        except:
            await self._send_progress(2, "古籍病案检索", "completed", "古籍病案分析完成")
            return {
                "status": "success",
                "agent": "古籍病案",
                "data": {},
                "raw": result
            }

    async def modern_literature_agent(self, patient_info: Dict[str, Any], diagnosis_result: str) -> Dict[str, Any]:
        """Agent 3: 现代文献分析"""
        print("🔬 分析现代文献...")
        await self._send_progress(3, "现代文献分析", "processing", "正在分析CNKI核心期刊文献...")

        prompt = self.prompts.modern_literature_agent(patient_info, diagnosis_result)
        result = await self.client.chat_completion(prompt, temperature=0.5)

        try:
            result_json = self._extract_json(result)
            await self._send_progress(3, "现代文献分析", "completed", "现代文献分析完成")
            return {
                "status": "success",
                "agent": "现代文献",
                "data": result_json,
                "raw": result
            }
        except:
            await self._send_progress(3, "现代文献分析", "completed", "现代文献分析完成")
            return {
                "status": "success",
                "agent": "现代文献",
                "data": {},
                "raw": result
            }
    
    async def prescription_master_agent(self, patient_info: Dict[str, Any], synthesis: str) -> Dict[str, Any]:
        """Agent 4: 经方大师"""
        print("💊 经方大师开方...")
        await self._send_progress(4, "经方大师开方", "processing", "正在选方配伍、计算剂量...")

        prompt = self.prompts.prescription_master_agent(patient_info, synthesis)
        result = await self.client.chat_completion(prompt, temperature=0.4)

        try:
            result_json = self._extract_json(result)
            await self._send_progress(4, "经方大师开方", "completed", "处方开具完成")
            return {
                "status": "success",
                "agent": "经方大师",
                "data": result_json,
                "raw": result
            }
        except:
            await self._send_progress(4, "经方大师开方", "completed", "处方开具完成")
            return {
                "status": "success",
                "agent": "经方大师",
                "data": {},
                "raw": result
            }

    async def pharmacist_review_agent(self, prescription: str, patient_info: Dict[str, Any]) -> Dict[str, Any]:
        """Agent 5: 药剂师审方"""
        print("⚕️ 药剂师审方...")
        await self._send_progress(5, "药剂师审方", "processing", "正在审核十八反十九畏、妊娠禁忌...")

        prompt = self.prompts.pharmacist_review_agent(prescription, patient_info)
        result = await self.client.chat_completion(prompt, temperature=0.2)

        try:
            result_json = self._extract_json(result)
            await self._send_progress(5, "药剂师审方", "completed", "审方完成")
            return {
                "status": "success",
                "agent": "药剂师审方",
                "data": result_json,
                "raw": result
            }
        except:
            await self._send_progress(5, "药剂师审方", "completed", "审方完成")
            return {
                "status": "success",
                "agent": "药剂师审方",
                "data": {},
                "raw": result
            }

    async def rehabilitation_agent(self, patient_info: Dict[str, Any], diagnosis: str) -> Dict[str, Any]:
        """Agent 6: 康复理疗"""
        print("🏃 制定康复方案...")
        await self._send_progress(6, "康复理疗方案", "processing", "正在制定针灸、推拿、食疗、气功方案...")

        prompt = self.prompts.rehabilitation_agent(patient_info, diagnosis)
        result = await self.client.chat_completion(prompt, temperature=0.5)

        try:
            result_json = self._extract_json(result)
            await self._send_progress(6, "康复理疗方案", "completed", "康复方案制定完成")
            return {
                "status": "success",
                "agent": "康复理疗",
                "data": result_json,
                "raw": result
            }
        except:
            await self._send_progress(6, "康复理疗方案", "completed", "康复方案制定完成")
            return {
                "status": "success",
                "agent": "康复理疗",
                "data": {},
                "raw": result
            }

    async def report_generator_agent(self, all_results: Dict[str, Any]) -> str:
        """Agent 7: 报告生成"""
        print("📄 生成诊疗报告...")
        await self._send_progress(7, "生成诊疗报告", "processing", "正在整合所有分析结果...")

        prompt = self.prompts.report_generator_agent(all_results)
        result = await self.client.chat_completion(prompt, temperature=0.3)

        await self._send_progress(7, "生成诊疗报告", "completed", "诊疗报告生成完成")
        return result
    
    def _extract_json(self, text: str) -> Dict[str, Any]:
        """从文本中提取 JSON"""
        # 尝试直接解析
        try:
            return json.loads(text)
        except:
            pass
        
        # 查找 JSON 代码块
        import re
        json_pattern = r'```json\s*(.*?)\s*```'
        match = re.search(json_pattern, text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        
        # 查找花括号内容
        brace_pattern = r'\{.*\}'
        match = re.search(brace_pattern, text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        
        raise ValueError("无法提取 JSON")
    
    async def process_diagnosis(self, patient_info: Dict[str, Any]) -> Dict[str, Any]:
        """完整的诊疗流程"""
        results = {}
        
        # Step 1: 中医辨证
        diagnosis_result = await self.diagnosis_agent(patient_info)
        results["diagnosis"] = diagnosis_result
        
        # Steps 2-3: 并行调用古籍和现代文献 Agent
        diagnosis_text = diagnosis_result.get("raw", "")
        ancient_task = self.ancient_cases_agent(patient_info, diagnosis_text)
        modern_task = self.modern_literature_agent(patient_info, diagnosis_text)
        
        ancient_result, modern_result = await asyncio.gather(ancient_task, modern_task)
        results["ancient_cases"] = ancient_result
        results["modern_literature"] = modern_result
        
        # Step 4: 综合分析，经方大师开方
        synthesis = self._create_synthesis(results)
        prescription_result = await self.prescription_master_agent(patient_info, synthesis)
        results["prescription"] = prescription_result
        
        # Steps 5-6: 并行调用审方和康复 Agent
        prescription_text = prescription_result.get("raw", "")
        review_task = self.pharmacist_review_agent(prescription_text, patient_info)
        rehab_task = self.rehabilitation_agent(patient_info, diagnosis_text)
        
        review_result, rehab_result = await asyncio.gather(review_task, rehab_task)
        results["review"] = review_result
        results["rehabilitation"] = rehab_result
        
        # Step 7: 生成最终报告
        final_report = await self.report_generator_agent({
            "patient_info": patient_info,
            "diagnosis": diagnosis_result,
            "ancient_cases": ancient_result,
            "modern_literature": modern_result,
            "prescription": prescription_result,
            "review": review_result,
            "rehabilitation": rehab_result
        })
        results["final_report"] = final_report
        
        return results
    
    def _create_synthesis(self, results: Dict[str, Any]) -> str:
        """创建综合分析文本"""
        synthesis_parts = []
        
        if "diagnosis" in results:
            synthesis_parts.append(f"【中医辨证】\n{results['diagnosis'].get('raw', '')}")
        
        if "ancient_cases" in results:
            synthesis_parts.append(f"\n【古籍病案】\n{results['ancient_cases'].get('raw', '')}")
        
        if "modern_literature" in results:
            synthesis_parts.append(f"\n【现代文献】\n{results['modern_literature'].get('raw', '')}")
        
        return "\n\n".join(synthesis_parts)

