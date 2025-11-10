# 中医智能诊疗系统

<div align="center">

![中医AI](https://img.shields.io/badge/中医-AI智能诊疗-2c5f2d?style=for-the-badge)
![DeepSeek](https://img.shields.io/badge/DeepSeek-API-4a8c4e?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=for-the-badge)

**基于 DeepSeek AI 的多智能体协同中医诊疗系统**

[功能特点](#功能特点) • [系统架构](#系统架构) • [快速开始](#快速开始) • [使用指南](#使用指南) • [注意事项](#注意事项)

</div>

---
<img width="981" height="859" alt="image" src="https://github.com/user-attachments/assets/affd53ea-c28b-4531-b14b-f61bdf9630eb" />



## 📋 项目简介

本系统是一个创新的中医智能诊疗平台，整合了多个专业 AI 智能体，从中医辨证、古籍查询、现代文献分析到处方开具、审方、康复理疗等环节，提供全流程的中医诊疗辅助服务。

### 🌟 核心亮点

- 🤖 **7 个专业 AI 智能体**协同工作
- 📚 **古今结合**：融合古籍医案与现代文献
- 💊 **安全审方**：十八反十九畏、妊娠禁忌全面检查
- 🎯 **精准开方**：经方大师含剂量换算
- 🏃 **全面康复**：针灸、推拿、食疗、气功
- 📄 **专业报告**：详细的诊疗报告可导出分享
- 🎨 **现代界面**：美观易用的 Web 界面

---

## 🚀 功能特点

### 智能体架构

```
患者输入 → [现代病名 + 主诉 + 四诊]
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

#### 1️⃣ 中医辨证 Agent
- **八纲辨证**：阴阳、表里、寒热、虚实
- **六经辨证**：太阳、阳明、少阳、太阴、少阴、厥阴
- **卫气营血辨证**：温热病传变层次分析
- **脏腑辨证**：五脏六腑功能失调判断
- **理论依据**：引用《黄帝内经》《伤寒论》等经典

#### 2️⃣ 古籍病案 Agent
- 检索历代名家医案
- 分析治疗方法和用药规律
- 提供经方应用参考
- 评估疗效与预后

#### 3️⃣ 现代文献 Agent
- 临床研究进展分析
- 证型分布规律统计
- 用药规律数据挖掘
- 循证医学证据评估

#### 4️⃣ 经方大师 Agent
- 精准选方配伍
- 古今剂量换算
- 完整处方开具
- 中成药推荐（医保 2023 版）
- 疗程与复诊建议

#### 5️⃣ 药剂师审方 Agent
- ⚠️ 十八反十九畏检查
- 🤰 妊娠禁忌审核
- 👨‍⚕️ 特殊人群用药
- 📖 药典剂量核对
- 🔍 药物相互作用

#### 6️⃣ 康复理疗 Agent
- 🎯 针灸：主穴配穴、手法
- 👐 推拿：手法部位、自我按摩
- 🍜 食疗：食疗方、药膳
- 🧘 气功：功法导引、呼吸配合
- 📅 生活调护

#### 7️⃣ 报告生成 Agent
- 整合所有分析结果
- 生成专业医疗报告
- 支持 Markdown 格式
- 便于打印和分享

---

## 🏗️ 系统架构

### 技术栈

**后端**
- FastAPI - 现代化 Web 框架
- Python 3.8+ - 编程语言
- httpx - 异步 HTTP 客户端
- pydantic - 数据验证

**前端**
- HTML5 + CSS3
- 原生 JavaScript
- 响应式设计
- 现代化 UI/UX

**AI 服务**
- DeepSeek API - 大语言模型
- 异步并发调用
- 智能提示词工程

### 项目结构

```
agent-zhongyi/
├── backend/
│   ├── main.py          # FastAPI 主程序
│   ├── agents.py        # AI Agents 实现
│   ├── prompts.py       # 提示词定义
│   └── __init__.py      # Python 包初始化
├── frontend/
│   ├── index.html       # 主页面
│   ├── style.css        # 样式文件
│   └── script.js        # 交互逻辑
├── requirements.txt     # Python 依赖
├── .env                 # 环境变量配置（需创建）
├── .env.example         # 环境变量示例
├── Dockerfile           # Docker 镜像构建文件
├── docker-compose.yml   # Docker Compose 配置
├── docker-compose.dev.yml # 开发环境配置
├── .dockerignore        # Docker 忽略文件
├── .gitignore           # Git 忽略文件
├── start.bat            # Windows 启动脚本
├── start.sh             # Linux/Mac 启动脚本
├── quick-start.bat      # Windows 快速启动向导
├── quick-start.sh       # Linux/Mac 快速启动向导
├── README.md            # 项目说明文档
├── DOCKER.md            # Docker 部署文档
├── USAGE.md             # 使用指南
└── CHANGELOG.md         # 更新日志
```

---

## 🎯 快速开始

本系统支持两种部署方式：**Docker 部署**（推荐）和**传统部署**。

### 部署方式选择

| 方式 | 优点 | 适用场景 |
|------|------|----------|
| 🐳 **Docker 部署** | 环境隔离、一键部署、易于维护 | 生产环境、快速体验 |
| 🐍 **传统部署** | 灵活性高、便于开发调试 | 开发环境、定制化需求 |

---

## 🐳 方式一：Docker 部署（推荐）

### 环境要求

- Docker 和 Docker Compose
- DeepSeek API Key（[获取地址](https://platform.deepseek.com/)）
- longcat API Key（[获取地址](https://longcat.chat/platform/)）美团出品，强烈推荐，目前免费55万token

### 🚀 一键启动（最简单）

```bash
# Windows
quick-start.bat

# Linux/Mac
chmod +x quick-start.sh
./quick-start.sh
```

脚本会自动检测环境并引导你完成部署！

### 手动部署

#### 1. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

#### 2. 启动服务

```bash
# 使用 Docker Compose 一键启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

#### 3. 访问系统

打开浏览器访问：`http://localhost:8000`

#### 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 更新服务
docker-compose pull
docker-compose up -d
```

> 📖 **详细文档**：查看 [DOCKER.md](DOCKER.md) 了解完整的 Docker 部署说明（包括生产环境配置、性能优化、故障排查等）

---

## 🐍 方式二：传统部署

### 环境要求

- Python 3.8 或更高版本
- DeepSeek API Key（[获取地址](https://platform.deepseek.com/)）
- 现代浏览器（Chrome、Firefox、Edge 等）

### 安装步骤

#### 1. 克隆或下载项目

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

在项目根目录创建 `.env` 文件：

```env
# DeepSeek API 配置
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

> ⚠️ **重要**：请将 `your_api_key_here` 替换为你的实际 API Key

#### 5. 启动服务

**方式一：使用启动脚本**

Windows:
```bash
start.bat
```

Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

**方式二：手动启动**

```bash
cd backend
python main.py
```

#### 6. 访问系统

打开浏览器访问：`http://localhost:8000`

---

## 📖 使用指南

### 输入患者信息

1. **现代病名**
   - 输入西医诊断的疾病名称
   - 例如：慢性胃炎、高血压、失眠、糖尿病等

2. **主诉**
   - 描述主要症状
   - 说明病程（多久了）
   - 近期变化（加重或缓解）
   - 伴随症状

3. **四诊信息**
   - **望诊**：面色、舌象、形体、精神状态等
   - **闻诊**：声音、语气、呼吸、气味等
   - **问诊**：寒热、汗、饮食、二便、睡眠、疼痛、月经等
   - **切诊**：脉象（浮沉、迟数、滑涩等）

4. **特殊情况**（选填）
   - 妊娠或哺乳期
   - 肝肾功能不全
   - 药物过敏史
   - 正在服用的其他药物

### 示例输入

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

## ⚠️ 注意事项

### 重要声明

> **本系统仅供学习研究和参考使用，不能作为医疗诊断的唯一依据！**
> 
> - ✅ 可用于：中医学习、教学、研究、辅助参考
> - ❌ 不可：替代专业医生诊断、自行用药
> - 🏥 就医：有疾病请到正规医疗机构就诊

### 使用建议

1. **API 费用**
   - DeepSeek API 按调用计费
   - 单次诊疗约调用 7 次 API
   - 建议设置 API 使用额度限制

2. **数据隐私**
   - 患者信息仅发送到 DeepSeek API
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

## 🔧 配置说明

### DeepSeek API 配置

在 `.env` 文件中可配置：

```env
# API Key（必填）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx

# API 地址（选填，使用默认值即可）
DEEPSEEK_API_BASE=https://api.deepseek.com/v1

# 模型名称（选填）
DEEPSEEK_MODEL=deepseek-chat
```

### 服务器配置

在 `backend/main.py` 中可修改：

```python
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",      # 监听地址
        port=8000,           # 端口号
        reload=True,         # 开发模式自动重载
        log_level="info"     # 日志级别
    )
```

---

## 🐛 故障排查

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
3. 检查 DeepSeek API 服务状态

---

## 📚 提示词工程

本系统的核心在于精心设计的提示词，所有提示词定义在 `backend/prompts.py` 中。

### 提示词特点

- 🎯 **角色定位明确**：每个 Agent 有清晰的专业角色
- 📋 **任务要求具体**：详细说明分析维度和输出格式
- 📖 **引经据典**：要求引用经典理论和文献
- 🔍 **格式化输出**：统一使用 JSON 格式便于解析
- ⚖️ **温度控制**：不同 Agent 使用不同的 temperature 参数

### 自定义提示词

你可以根据需要修改 `prompts.py` 中的提示词，调整：
- 分析维度
- 输出格式
- 专业深度
- 理论倾向

---

## 🔄 更新日志

### v1.0.0 (2024-11)

- ✨ 初始版本发布
- 🤖 实现 7 个专业 AI Agent
- 🎨 现代化 Web 界面
- 📄 完整诊疗报告生成
- 💾 报告导出和分享功能

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发建议

1. Fork 本项目
2. 创建功能分支
3. 提交代码变更
4. 发起 Pull Request

---

## 📄 许可证

本项目仅供学习研究使用。

---

## 🙏 致谢

- DeepSeek - 提供强大的 AI 能力
- 中医经典 - 理论基础
- 开源社区 - 技术支持

---

## 📧 联系方式

如有问题或建议，欢迎提 Issue。

---

<div align="center">

**⚕️ 传承中医智慧，拥抱 AI 未来 🤖**

Made with ❤️ for TCM and AI

</div>

