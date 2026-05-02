# 中医智能诊疗系统

<div align="center">

![中医AI](https://img.shields.io/badge/中医-AI智能诊疗-2c5f2d?style=for-the-badge)
![DeepSeek](https://img.shields.io/badge/DeepSeek-API-4a8c4e?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=for-the-badge)

**基于 DeepSeek AI 的多智能体协同中医诊疗系统**

[功能特点](#功能特点) • [系统架构](#系统架构) • [快速开始](#快速开始) • [AI望诊问诊](#ai望诊问诊) • [API文档](API.md) • [使用指南](#使用指南) • [注意事项](#注意事项)

</div>

---
<img width="981" height="859" alt="image" src="https://github.com/user-attachments/assets/affd53ea-c28b-4531-b14b-f61bdf9630eb" />

> ⚠️ **温馨提示**：右侧演示网站为商业版（欢迎定制），本项目演示网站为：[https://agents-zy.ws4.cn/](https://agents-zy.ws4.cn/)

### 商业版定制价格（ws3101001@126.com）

| 服务类型 | 价格 | 说明 |
|---------|------|------|
| 基础服务 | **5000元/次** | 包括软件授权、部署等 |
| 定制服务 | **1000元/次** | 包括Logo、名称等 |
| 功能定制 | **5000元/功能** | 增加功能、定制功能，如药店版重点推荐本店保健品等 |
| 其他定制 | **价格可议** | 面议 |


## 项目简介

**一位在中医领域深耕二十余载的实践者，为弘扬中医药文化开源此项目，旨在用现代科技激活千年医道，让中医智慧惠及更多苍生。望与同道共探岐黄之术，传承东方生命科学，使杏林春暖，橘井泉香。**

#### 本系统是一个创新的中医智能诊疗平台，整合了多个专业 AI 智能体，从中医辨证、古籍查询、现代文献分析到处方开具、审方、康复理疗等环节，提供全流程的中医诊疗辅助服务。新增 AI 望诊问诊模块，支持摄像头拍照分析面色舌象、文本输入症状描述、智能追问补充信息。


### 核心亮点

- **7 个专业 AI 智能体**协同工作
- **AI 望诊**：摄像头拍照分析面色、舌象（多模态视觉模型）
- **智能问诊**：文本输入症状 + AI 追问补充，结构化整理
- **古今结合**：融合古籍医案与现代文献
- **安全审方**：十八反十九畏、妊娠禁忌全面检查
- **精准开方**：经方大师含剂量换算
- **全面康复**：针灸、推拿、食疗、气功
- **专业报告**：详细的诊疗报告可导出分享
- **通用 API**：所有模型接口采用 OpenAI 兼容格式，可自由替换

---

## 功能特点

### 智能体架构

```
患者输入 → [AI望诊/问诊 或 手动输入四诊信息]
    ↓
    ├─→ Agent 1: 中医辨证（八纲+六经+卫气营血+脏腑）
    │   └─→ 基于《黄帝内经》等经典理论
    │
    ├─→ Agent 2: 古籍病案分析（并行）
    │   └─→ 汉唐至民国 5.6 万条医案
    │
    ├─→ Agent 3: 现代文献分析（并行）
    │   └─→ CNKI 核心期刊 20 万篇
    │
    ↓ [综合分析结果]
    │
    ├─→ Agent 4: 经方大师开方
    │   └─→ 经方选择 + 剂量换算 + 中成药推荐
    │
    ├─→ Agent 5: 药剂师审方（并行）
    │   └─→ 十八反十九畏 + 妊娠禁忌 + 剂量审核
    │
    ├─→ Agent 6: 康复理疗方案（并行）
    │   └─→ 针灸 + 推拿 + 食疗 + 气功
    │
    ↓
    └─→ Agent 7: 生成完整诊疗报告
```

### 各智能体功能详解

#### 1. 中医辨证 Agent
- **八纲辨证**：阴阳、表里、寒热、虚实
- **六经辨证**：太阳、阳明、少阳、太阴、少阴、厥阴
- **卫气营血辨证**：温热病传变层次分析
- **脏腑辨证**：五脏六腑功能失调判断
- **理论依据**：引用《黄帝内经》《伤寒论》等经典

#### 2. 古籍病案 Agent
- 检索历代名家医案
- 分析治疗方法和用药规律
- 提供经方应用参考
- 评估疗效与预后

#### 3. 现代文献 Agent
- 临床研究进展分析
- 证型分布规律统计
- 用药规律数据挖掘
- 循证医学证据评估

#### 4. 经方大师 Agent
- 精准选方配伍
- 古今剂量换算
- 完整处方开具
- 中成药推荐（医保 2023 版）
- 疗程与复诊建议

#### 5. 药剂师审方 Agent
- 十八反十九畏检查
- 妊娠禁忌审核
- 特殊人群用药
- 药典剂量核对
- 药物相互作用

#### 6. 康复理疗 Agent
- 针灸：主穴配穴、手法
- 推拿：手法部位、自我按摩
- 食疗：食疗方、药膳
- 气功：功法导引、呼吸配合
- 生活调护

#### 7. 报告生成 Agent
- 整合所有分析结果
- 生成专业医疗报告
- 支持 Markdown 格式
- 便于打印和分享

---

## 系统架构

### 技术栈

**后端**
- FastAPI - 现代化 Web 框架
- Python 3.8+ - 编程语言
- httpx - 异步 HTTP 客户端
- pydantic - 数据验证

**前端**
- HTML5 + CSS3
- 原生 JavaScript
- 响应式设计（手机/平板/桌面）
- 现代化 UI/UX

**AI 服务**
- DeepSeek API - 大语言模型（7-Agent 诊疗流水线）
- 多模态视觉模型 - 望诊分析（面色/舌象）
- 语音合成 - 追问播放（可选）
- OpenAI 兼容格式 - 所有 API 接口统一标准

### 项目结构

```
agent-zhongyi/
├── backend/
│   ├── main.py              # FastAPI 主程序 + API 端点
│   ├── agents.py            # 7 个 AI Agent 实现
│   ├── prompts.py           # 诊疗提示词定义
│   ├── multimodal.py        # 多模态客户端（视觉/ASR/TTS）
│   ├── prompts_multimodal.py # 望诊问诊提示词
│   └── __init__.py
├── frontend/
│   ├── index.html           # 主页面（手动输入四诊）
│   ├── ai-diagnosis.html    # AI望诊问诊页面
│   ├── style.css            # 全局样式
│   ├── script.js            # 主页交互逻辑
│   ├── ai-diagnosis.css     # 望诊问诊专属样式
│   └── ai-diagnosis.js      # 望诊问诊交互逻辑
├── ssl/                     # HTTPS 证书（手机摄像头需要）
│   ├── cert.pem
│   └── key.pem
├── requirements.txt         # Python 依赖
├── .env                     # 环境变量配置（需创建）
├── .env.example             # 环境变量模板
├── .gitignore
├── README.md
└── API.md                  # API 调用说明
```

---

## 快速开始

### 环境要求

- Python 3.8 或更高版本
- DeepSeek API Key（[获取地址](https://platform.deepseek.com/)）
- 现代浏览器（Chrome、Edge、Safari 等）

### 安装步骤

#### 1. 克隆项目

```bash
cd agent-zhongyi
```

#### 2. 创建虚拟环境（推荐）

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 3. 安装依赖

```bash
pip install -r requirements.txt
```

#### 4. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API Key：

```env
# 必填 - 7-Agent 诊疗流水线
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# 选填 - AI望诊（多模态视觉分析）
VISION_API_KEY=your-vision-api-key
VISION_API_BASE=https://api.openai.com/v1
VISION_MODEL=gpt-4o

# 选填 - 语音合成（追问播放）
TTS_API_KEY=your-tts-api-key
TTS_API_BASE=https://api.openai.com/v1
TTS_MODEL=tts-1
```

> 所有 API 均支持 OpenAI 兼容格式，可替换为 DeepSeek、LongCat、MiMo、Ollama 等服务。

#### 5. 启动服务

```bash
cd backend
python main.py
```

#### 6. 访问系统

- **主页**（手动输入四诊）：`https://localhost:8000`
- **AI望诊问诊**（摄像头+文本）：`https://localhost:8000/ai-diagnosis`

> 手机访问需要 HTTPS 才能使用摄像头，系统会自动检测 `ssl/` 目录下的证书。

---

## AI望诊问诊

独立的 H5 页面，集成摄像头望诊 + 文本问诊 + 7-Agent 诊疗流水线。

### 功能流程

```
Step 1: 望脸色 → 摄像头拍照 → 多模态LLM分析面色
Step 2: 舌诊   → 摄像头拍照 → 多模态LLM分析舌象
Step 3: 问诊   → 文本输入症状 → LLM结构化整理 → 智能追问
Step 4: 综合确认 → 合并望诊+问诊 → 提交到7-Agent诊疗系统
```

### 望诊分析

- **望脸色**：基于《素问·五脏生成》"五色微诊，可以目察"，分析面色青赤黄白黑对应脏腑
- **舌诊**：基于《伤寒论》《温热论》舌诊条文，分析舌色、舌形、苔色、苔质

### 问诊流程

1. **文本输入**：在文本框中详细描述症状（寒热、汗、饮食、二便、睡眠、情志等）
2. **结构化整理**：LLM 将自由描述整理为标准问诊记录
3. **智能追问**：LLN 识别信息缺口，生成 3-5 条追问
4. **补充回答**：逐条回答追问，可选择 TTS 语音播放问题

### HTTPS 配置（手机摄像头）

手机浏览器需要 HTTPS 才能访问摄像头。系统支持自签名证书：

```bash
# 生成自签名证书（Windows 需安装 openssl）
mkdir ssl
openssl req -x509 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/CN=localhost"
```

启动后通过 `https://<你的IP>:8000/ai-diagnosis` 访问，浏览器会提示证书不受信任，点击"继续访问"即可。

---

## 使用指南

### 方式一：AI望诊问诊（推荐）

1. 访问 `/ai-diagnosis` 页面
2. 拍摄面部照片 → 系统分析面色
3. 拍摄舌头照片 → 系统分析舌象
4. 文本输入症状描述 → 系统整理 + 智能追问
5. 回答追问 → 确认提交
6. 等待 7-Agent 诊疗分析（约 5-10 分钟）
7. 查看完整诊疗报告

### 方式二：手动输入四诊

1. 访问主页 `/`
2. 填写现代病名、主诉、四诊信息
3. 点击"开始诊疗"
4. 等待分析完成
5. 查看结果并导出报告

### 输入示例

```
现代病名：慢性胃炎

主诉：胃脘胀痛 2 年，加重 1 周，伴嗳气、反酸

四诊信息：
望诊：面色萎黄，舌淡红苔薄白腻，体型偏瘦
闻诊：声音低微，口气略重
问诊：怕冷，手足不温，食欲不振，食后腹胀，
      大便溏薄日行 2-3 次，睡眠尚可但多梦，
      情绪焦虑
切诊：脉象沉细无力

特殊情况：无
```

### 查看结果

系统会展示两种视图：

1. **详细数据视图**
   - 分标签页显示各 Agent 的分析结果
   - 可切换查看不同模块

2. **完整报告视图**
   - 整合所有结果的专业报告
   - 适合打印和分享

### 导出与分享

- **导出报告**：下载 Markdown 格式的报告文件
- **分享报告**：复制报告内容到剪贴板

---

## 配置说明

### API 配置

所有 API 均采用 OpenAI 兼容格式，在 `.env` 中配置：

| 变量 | 用途 | 必填 | 默认值 |
|------|------|------|--------|
| `DEEPSEEK_API_KEY` | 7-Agent 诊疗 | 是 | - |
| `DEEPSEEK_API_BASE` | 诊疗 API 地址 | 否 | `https://api.deepseek.com/v1` |
| `DEEPSEEK_MODEL` | 诊疗模型名 | 否 | `deepseek-chat` |
| `VISION_API_KEY` | 望诊视觉分析 | 否 | - |
| `VISION_API_BASE` | 视觉 API 地址 | 否 | `https://api.openai.com/v1` |
| `VISION_MODEL` | 视觉模型名 | 否 | `gpt-4o` |
| `ASR_API_KEY` | 语音识别 | 否 | - |
| `ASR_API_BASE` | ASR API 地址 | 否 | `https://api.openai.com/v1` |
| `ASR_MODEL` | ASR 模型名 | 否 | `whisper-1` |
| `TTS_API_KEY` | 语音合成 | 否 | - |
| `TTS_API_BASE` | TTS API 地址 | 否 | `https://api.openai.com/v1` |
| `TTS_MODEL` | TTS 模型名 | 否 | `tts-1` |

### 兼容服务

所有接口支持 OpenAI 兼容格式，可自由替换：

| 服务 | API Base | 推荐模型 |
|------|----------|----------|
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| 长猫 LongCat | `https://api.longcat.chat/openai` | `LongCat-Flash-Thinking` |
| 小米 MiMo | `https://token-plan-cn.xiaomimimo.com/v1` | `mimo-v2-omni` (视觉), `mimo-v2.5-tts` (TTS) |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` |
| 本地 Ollama | `http://localhost:11434/v1` | `llama3` |

### 服务器配置

在 `backend/main.py` 中可修改：

```python
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",      # 监听地址
        port=8000,           # 端口号
        reload=False,        # 生产模式
        log_level="info"     # 日志级别
    )
```

---

## 注意事项

### 重要声明

> **本系统仅供学习研究和参考使用，不能作为医疗诊断的唯一依据！**
> 
> - 可用于：中医学习、教学、研究、辅助参考
> - 不可：替代专业医生诊断、自行用药
> - 就医：有疾病请到正规医疗机构就诊

### 使用建议

1. **API 费用**
   - DeepSeek API 按调用计费
   - 单次诊疗约调用 7 次 API
   - 建议设置 API 使用额度限制

2. **数据隐私**
   - 患者信息仅发送到配置的 API 服务
   - 不存储在本地数据库
   - 建议脱敏处理敏感信息

3. **结果准确性**
   - AI 分析结果仅供参考
   - 可能存在不准确或不完整的情况
   - 请结合临床实际判断

4. **性能优化**
   - 首次调用可能较慢（10-30秒）
   - 网络环境影响响应速度
   - 建议在稳定网络环境下使用

---

## 故障排查

### API 配置问题

**问题**：系统提示"未配置 DEEPSEEK_API_KEY"

**解决**：
1. 确认 `.env` 文件在项目根目录
2. 检查 API Key 是否正确
3. 重启服务

### 依赖安装问题

**问题**：pip install 失败

**解决**：
```bash
# 升级 pip
python -m pip install --upgrade pip

# 使用国内镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 端口占用问题

**问题**：8000 端口已被占用

**解决**：
修改 `backend/main.py` 中的端口号，或关闭占用端口的程序

### API 调用超时

**问题**：诊疗过程中出现超时

**解决**：
1. 检查网络连接
2. 增加超时时间（在 `agents.py` 中修改 `timeout` 参数）
3. 检查 API 服务状态

### 手机摄像头无法打开

**问题**：手机浏览器无法访问摄像头

**解决**：
1. 确保通过 HTTPS 访问（自签名证书即可）
2. 在浏览器设置中允许摄像头权限
3. 使用 Chrome 或 Safari 浏览器

---

## 提示词工程

本系统的核心在于精心设计的提示词：

- `backend/prompts.py` - 7-Agent 诊疗提示词
- `backend/prompts_multimodal.py` - 望诊问诊提示词

### 提示词特点

- **角色定位明确**：每个 Agent 有清晰的专业角色
- **任务要求具体**：详细说明分析维度和输出格式
- **引经据典**：要求引用经典理论和文献
- **格式化输出**：统一使用 JSON 格式便于解析
- **温度控制**：不同 Agent 使用不同的 temperature 参数

---

## 更新日志

### v2.0.0 (2025-05)

- 新增 AI 望诊问诊 H5 页面（`/ai-diagnosis`）
- 集成多模态视觉模型分析面色、舌象
- 文本输入症状 + 智能追问的问诊流程
- 语音合成播放追问（可选）
- HTTPS 支持（手机摄像头）
- 所有 API 统一 OpenAI 兼容格式

### v1.0.0 (2024-11)

- 初始版本发布
- 实现 7 个专业 AI Agent
- 现代化 Web 界面
- 完整诊疗报告生成
- 报告导出和分享功能

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发建议

1. Fork 本项目
2. 创建功能分支
3. 提交代码变更
4. 发起 Pull Request

---

## 许可证

本项目仅供学习研究使用。

---

## 致谢

- DeepSeek - 提供强大的 AI 能力
- 小米 MiMo - 提供多模态视觉和语音能力
- 长猫 LongCat - 提供免费额度
- 中医经典 - 理论基础
- 开源社区 - 技术支持

---

<div align="center">

**传承中医智慧，拥抱 AI 未来**

Made with ❤️ for ZhangJian and AI

</div>
