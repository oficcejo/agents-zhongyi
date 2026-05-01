# 中医智能诊疗系统 - API 调用说明

## 基础信息

| 项目 | 说明 |
|------|------|
| 基础地址 | `https://localhost:8000` |
| 协议 | HTTPS（ssl 目录下有证书时）或 HTTP |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| CORS | 已开启（允许所有来源） |

### 通用响应结构

**成功响应：**
```json
{
  "status": "success",
  "data": { ... }
}
```

**错误响应：**
```json
{
  "detail": "错误描述信息"
}
```

---

## API 端点一览

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查 |
| `POST` | `/api/analyze-face` | 望脸色分析 |
| `POST` | `/api/analyze-tongue` | 舌诊分析 |
| `POST` | `/api/transcribe-audio` | 问诊文本整理 |
| `POST` | `/api/generate-followup` | 生成智能追问 |
| `POST` | `/api/synthesize-speech` | 文字转语音 |
| `POST` | `/api/diagnose` | 提交诊疗（异步） |
| `GET` | `/api/diagnose/progress/{session_id}` | 诊疗进度（SSE） |
| `POST` | `/api/export-report` | 导出报告 |

---

## 1. 健康检查

检查系统状态和各 API 配置情况。

```
GET /api/health
```

**请求参数：** 无

**响应示例：**
```json
{
  "status": "healthy",
  "api_configured": true,
  "vision_configured": true,
  "asr_configured": true,
  "tts_configured": true,
  "message": "系统运行正常"
}
```

**响应字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | 系统状态 |
| `api_configured` | bool | DeepSeek API 是否已配置 |
| `vision_configured` | bool | 视觉模型是否已配置 |
| `asr_configured` | bool | 语音识别是否已配置 |
| `tts_configured` | bool | 语音合成是否已配置 |
| `message` | string | 状态描述 |

**curl 示例：**
```bash
curl -k https://localhost:8000/api/health
```

---

## 2. 望脸色分析

上传面部照片，AI 基于中医望诊理论分析面色。

```
POST /api/analyze-face
Content-Type: application/json
```

**请求体：**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | Base64 编码的图片，支持 `data:image/jpeg;base64,...` 格式或纯 Base64 字符串 |

**响应示例：**
```json
{
  "status": "success",
  "analysis": "望诊面色分析：\n\n1. 面色总体：面色萎黄，缺乏光泽...\n2. 五色辨析：以黄色为主...\n3. 脏腑对应：脾胃虚弱..."
}
```

**curl 示例：**
```bash
# 将图片转为 base64 后调用
curl -k -X POST https://localhost:8000/api/analyze-face \
  -H "Content-Type: application/json" \
  -d "{\"image\": \"data:image/jpeg;base64,$(base64 -w0 photo.jpg)\"}"
```

**依赖：** 需配置 `VISION_API_KEY`

---

## 3. 舌诊分析

上传舌头照片，AI 基于中医舌诊理论分析舌象。

```
POST /api/analyze-tongue
Content-Type: application/json
```

**请求体：**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | string | 是 | Base64 编码的舌头照片 |

**响应示例：**
```json
{
  "status": "success",
  "analysis": "舌诊分析：\n\n1. 舌色：舌淡红...\n2. 舌形：偏胖大，边有齿痕...\n3. 苔色：苔薄白...\n4. 苔质：略腻..."
}
```

**curl 示例：**
```bash
curl -k -X POST https://localhost:8000/api/analyze-tongue \
  -H "Content-Type: application/json" \
  -d "{\"image\": \"data:image/jpeg;base64,$(base64 -w0 tongue.jpg)\"}"
```

**依赖：** 需配置 `VISION_API_KEY`

---

## 4. 问诊文本整理

将患者症状描述整理为结构化的中医问诊记录。

```
POST /api/transcribe-audio
Content-Type: application/json
```

**请求体：**
```json
{
  "audio": "",
  "format": "webm",
  "transcription": "最近两周胃疼，吃东西不消化，经常反酸水，大便不成形"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `audio` | string | 否 | Base64 音频（当提供 transcription 时可为空） |
| `format` | string | 否 | 音频格式，默认 `webm` |
| `transcription` | string | 否 | 已有的症状文本，直接整理，跳过 ASR |

**响应示例：**
```json
{
  "status": "success",
  "transcription": "最近两周胃疼，吃东西不消化，经常反酸水，大便不成形",
  "organized": "【主诉】胃脘疼痛2周\n\n【现病史】患者近两周出现胃脘疼痛，食后不消化，伴反酸。\n\n【寒热】未述明显寒热异常\n\n【饮食】食欲减退，食后腹胀\n\n【二便】大便溏薄，不成形\n\n【睡眠】未述异常\n\n【情志】未述异常"
}
```

**curl 示例：**
```bash
curl -k -X POST https://localhost:8000/api/transcribe-audio \
  -H "Content-Type: application/json" \
  -d '{"audio":"","format":"webm","transcription":"最近两周胃疼，吃东西不消化，经常反酸水，大便不成形"}'
```

**说明：**
- 当提供 `transcription` 字段时，直接使用该文本进行结构化整理，不调用 ASR
- 当 `transcription` 为空时，会解码 `audio` 字段的 Base64 音频并调用 ASR 转文字
- 结构化整理使用 DeepSeek API

---

## 5. 生成智能追问

根据已有的问诊记录，AI 识别信息缺口，生成 3-5 条追问。

```
POST /api/generate-followup
Content-Type: application/json
```

**请求体：**
```json
{
  "organized_text": "【主诉】胃脘疼痛2周\n\n【现病史】患者近两周出现胃脘疼痛，食后不消化，伴反酸..."
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `organized_text` | string | 是 | 结构化的问诊文本 |

**响应示例：**
```json
{
  "status": "success",
  "questions": [
    "疼痛的性质是怎样的？是胀痛、刺痛、隐痛还是灼痛？",
    "疼痛是否与饮食有关？饭前痛还是饭后痛？",
    "是否有嗳气、恶心或呕吐的症状？",
    "近期情绪如何？是否有焦虑或压力较大的情况？",
    "既往是否有胃病史或幽门螺杆菌感染史？"
  ]
}
```

**curl 示例：**
```bash
curl -k -X POST https://localhost:8000/api/generate-followup \
  -H "Content-Type: application/json" \
  -d '{"organized_text":"【主诉】胃脘疼痛2周\n【饮食】食欲减退，食后腹胀\n【二便】大便溏薄"}'
```

---

## 6. 文字转语音

将文字合成为语音音频，用于追问问题的语音播放。

```
POST /api/synthesize-speech
Content-Type: application/json
```

**请求体：**
```json
{
  "text": "疼痛的性质是怎样的？是胀痛、刺痛、隐痛还是灼痛？"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | 是 | 要合成语音的文字 |

**响应：** 音频流（`audio/mpeg`），直接作为音频播放源使用。

**curl 示例：**
```bash
curl -k -X POST https://localhost:8000/api/synthesize-speech \
  -H "Content-Type: application/json" \
  -d '{"text":"疼痛的性质是怎样的？"}' \
  -o speech.mp3
```

**依赖：** 需配置 `TTS_API_KEY`

---

## 7. 提交诊疗

提交患者信息，启动 7-Agent 诊疗流水线。接口立即返回 `session_id`，诊疗在后台异步执行。

```
POST /api/diagnose
Content-Type: application/json
```

**请求体：**
```json
{
  "disease_name": "慢性胃炎",
  "chief_complaint": "",
  "four_examinations": "【望诊·面色】\n面色萎黄...\n\n【望诊·舌象】\n舌淡红苔薄白腻...\n\n【问诊】\n胃脘胀痛2周...",
  "special_conditions": "无"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `disease_name` | string | 否 | 现代病名，可留空 |
| `chief_complaint` | string | 否 | 主诉，可留空（问诊记录中已有） |
| `four_examinations` | string | 是 | 四诊信息，包含望诊+问诊的完整文本 |
| `special_conditions` | string | 否 | 特殊情况（妊娠、过敏等），默认"无" |

**响应示例：**
```json
{
  "status": "success",
  "message": "诊疗任务已启动",
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**curl 示例：**
```bash
curl -k -X POST https://localhost:8000/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "disease_name": "慢性胃炎",
    "chief_complaint": "",
    "four_examinations": "【望诊·面色】\n面色萎黄\n\n【问诊】\n胃脘胀痛2周，反酸，大便溏薄",
    "special_conditions": "无"
  }'
```

---

## 8. 诊疗进度（SSE）

通过 Server-Sent Events 实时接收诊疗进度。

```
GET /api/diagnose/progress/{session_id}
Accept: text/event-stream
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `session_id` | string | 诊疗任务的会话 ID（由 `/api/diagnose` 返回） |

**SSE 事件格式：**

每条事件格式为 `data: {json}\n\n`，JSON 结构如下：

**进度更新：**
```json
{
  "step": 1,
  "name": "中医辨证分析",
  "status": "processing",
  "message": "正在进行八纲、六经、卫气营血、脏腑辨证..."
}
```

**步骤完成：**
```json
{
  "step": 1,
  "name": "中医辨证分析",
  "status": "completed",
  "message": "辨证分析完成"
}
```

**全部完成：**
```json
{
  "status": "done",
  "data": {
    "diagnosis": { "raw": "...", "status": "success", "agent": "中医辨证" },
    "ancient_cases": { "raw": "...", "status": "success", "agent": "古籍病案" },
    "modern_literature": { "raw": "...", "status": "success", "agent": "现代文献" },
    "prescription": { "raw": "...", "status": "success", "agent": "经方大师" },
    "review": { "raw": "...", "status": "success", "agent": "药剂师审方" },
    "rehabilitation": { "raw": "...", "status": "success", "agent": "康复理疗" },
    "final_report": "# 中医诊疗报告\n\n## 一、辨证分析..."
  }
}
```

**错误：**
```json
{
  "status": "error",
  "message": "错误描述"
}
```

**进度步骤编号：**

| step | 名称 | 说明 |
|------|------|------|
| 1 | 中医辨证分析 | 八纲、六经、卫气营血、脏腑辨证 |
| 2 | 古籍病案检索 | 汉唐至民国历代医案 |
| 3 | 现代文献分析 | CNKI 核心期刊文献 |
| 4 | 经方大师开方 | 经方选择与剂量换算 |
| 5 | 药剂师审方 | 用药安全审核 |
| 6 | 康复理疗方案 | 针灸、推拿、食疗 |
| 7 | 生成诊疗报告 | 整合所有结果 |

**JavaScript 调用示例：**
```javascript
const eventSource = new EventSource('/api/diagnose/progress/' + sessionId);

eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.status === 'done') {
        eventSource.close();
        console.log('诊疗完成:', data.data);
    } else if (data.status === 'error') {
        eventSource.close();
        console.error('诊疗出错:', data.message);
    } else {
        console.log(`步骤${data.step} ${data.name}: ${data.status}`);
    }
};
```

---

## 9. 导出报告

将诊疗结果导出为报告。

```
POST /api/export-report
Content-Type: application/json
```

**请求体：**
```json
{
  "final_report": "# 中医诊疗报告\n\n## 一、辨证分析..."
}
```

**响应示例：**
```json
{
  "status": "success",
  "report": "# 中医诊疗报告\n\n...",
  "download_link": "/api/download-report"
}
```

---

## 典型调用流程

### 流程一：AI望诊问诊（推荐）

```
1. 拍照 → POST /api/analyze-face      → 获取面色分析
2. 拍照 → POST /api/analyze-tongue     → 获取舌象分析
3. 输入 → POST /api/transcribe-audio   → 获取结构化问诊
4. 追问 → POST /api/generate-followup  → 获取追问列表
5. 播放 → POST /api/synthesize-speech  → 语音播放追问（可选）
6. 提交 → POST /api/diagnose           → 获取 session_id
7. 监听 → GET  /api/diagnose/progress/{id} → 等待完成
```

**完整示例（Python）：**
```python
import requests
import base64
import json
import sseclient

BASE = "https://localhost:8000"
VERIFY = False  # 自签名证书

# Step 1: 望脸色
with open("face.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()
resp = requests.post(f"{BASE}/api/analyze-face",
    json={"image": f"data:image/jpeg;base64,{img_b64}"},
    verify=VERIFY)
face_analysis = resp.json()["analysis"]

# Step 2: 舌诊
with open("tongue.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode()
resp = requests.post(f"{BASE}/api/analyze-tongue",
    json={"image": f"data:image/jpeg;base64,{img_b64}"},
    verify=VERIFY)
tongue_analysis = resp.json()["analysis"]

# Step 3: 问诊
resp = requests.post(f"{BASE}/api/transcribe-audio",
    json={"audio": "", "format": "webm",
          "transcription": "胃脘胀痛2周，反酸，大便溏薄"},
    verify=VERIFY)
organized = resp.json()["organized"]

# Step 4: 生成追问
resp = requests.post(f"{BASE}/api/generate-followup",
    json={"organized_text": organized},
    verify=VERIFY)
questions = resp.json()["questions"]
print("追问列表:", questions)

# Step 5: 提交诊疗
four_examinations = (
    f"【望诊·面色】\n{face_analysis}\n\n"
    f"【望诊·舌象】\n{tongue_analysis}\n\n"
    f"【问诊】\n{organized}"
)
resp = requests.post(f"{BASE}/api/diagnose",
    json={"disease_name": "慢性胃炎",
          "chief_complaint": "",
          "four_examinations": four_examinations,
          "special_conditions": "无"},
    verify=VERIFY)
session_id = resp.json()["session_id"]

# Step 6: 监听进度
resp = requests.get(f"{BASE}/api/diagnose/progress/{session_id}",
    stream=True, verify=VERIFY)
client = sseclient.SSEClient(resp)
for event in client.events():
    data = json.loads(event.data)
    if data["status"] == "done":
        print("诊疗完成!")
        report = data["data"]["final_report"]
        break
    elif data["status"] == "error":
        print(f"出错: {data['message']}")
        break
    else:
        print(f"步骤{data['step']}: {data['message']}")
```

### 流程二：手动输入四诊

```
1. 提交 → POST /api/diagnose           → 获取 session_id
2. 监听 → GET  /api/diagnose/progress/{id} → 等待完成
```

**curl 示例：**
```bash
# 提交
curl -k -X POST https://localhost:8000/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "disease_name": "失眠",
    "chief_complaint": "入睡困难1个月",
    "four_examinations": "望诊：面色偏红，舌红少苔\n闻诊：语声正常\n问诊：心烦，口干，盗汗，大便干\n切诊：脉细数",
    "special_conditions": "无"
  }'

# 返回: {"session_id":"xxx", ...}

# 监听进度（需要支持 SSE 的客户端）
curl -k https://localhost:8000/api/diagnose/progress/xxx
```

---

## 错误码

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 422 | 请求参数校验失败 |
| 500 | 服务器内部错误（API 未配置、调用失败等） |

**常见错误：**

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `未配置 DEEPSEEK_API_KEY` | .env 中未设置 DeepSeek API Key | 在 .env 中填入 `DEEPSEEK_API_KEY` |
| `未配置 VISION_API_KEY` | .env 中未设置视觉模型 Key | 在 .env 中填入 `VISION_API_KEY` |
| `望脸色分析失败` | 视觉模型调用出错 | 检查 VISION_API_BASE 和模型名是否正确 |
| `生成追问失败` | DeepSeek API 调用出错 | 检查网络和 API Key 余额 |

---

## 环境变量

所有 API 均采用 OpenAI 兼容格式，在 `.env` 中配置：

```env
# 必填
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# 选填（望诊）
VISION_API_KEY=your-key
VISION_API_BASE=https://api.openai.com/v1
VISION_MODEL=gpt-4o

# 选填（语音合成）
TTS_API_KEY=your-key
TTS_API_BASE=https://api.openai.com/v1
TTS_MODEL=tts-1
```
