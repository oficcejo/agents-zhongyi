# 部署指南汇总

本文档汇总了中医智能诊疗系统的所有部署方式和文档链接。

---

## 📚 文档导航

| 文档 | 说明 | 适用人群 |
|------|------|----------|
| [README.md](README.md) | 项目总览、快速开始 | 所有用户 |
| [DOCKER.md](DOCKER.md) | Docker 部署详细指南 | 使用 Docker 的用户 |
| [USAGE.md](USAGE.md) | 详细使用说明、示例 | 所有用户 |
| [CHANGELOG.md](CHANGELOG.md) | 版本更新历史 | 开发者、维护者 |

---

## 🚀 快速选择部署方式

### 我应该选择哪种方式？

#### 选择 Docker 部署，如果你：
- ✅ 想要快速体验系统
- ✅ 需要在生产环境部署
- ✅ 希望环境隔离、易于维护
- ✅ 不想配置 Python 环境
- ✅ 需要容器化部署

**→ 查看 [Docker 部署指南](DOCKER.md)**

#### 选择传统部署，如果你：
- ✅ 需要开发或调试代码
- ✅ 想要更灵活的配置
- ✅ 熟悉 Python 开发环境
- ✅ 需要定制化修改

**→ 查看 [README.md - 传统部署](README.md#方式二传统部署)**

---

## ⚡ 三种启动方式

### 1. 一键启动（推荐新手）

**最简单的方式，脚本会自动引导你完成所有步骤：**

```bash
# Windows
quick-start.bat

# Linux/Mac
chmod +x quick-start.sh
./quick-start.sh
```

### 2. Docker 启动（推荐生产）

```bash
# 1. 创建 .env 文件并配置 API Key
# 2. 启动服务
docker-compose up -d
```

**详细文档：** [DOCKER.md](DOCKER.md)

### 3. 传统启动（推荐开发）

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

**详细文档：** [README.md](README.md)

---

## 🌍 不同环境的部署建议

### 本地开发环境

**推荐方式：** 传统部署 + 虚拟环境

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
cd backend
python main.py
```

**优势：**
- 代码修改后自动重载
- 便于调试
- 灵活性高

### 测试环境

**推荐方式：** Docker 开发模式

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**优势：**
- 环境一致性
- 支持代码热重载
- 易于团队协作

### 生产环境

**推荐方式：** Docker + 反向代理

```bash
# 使用生产配置
docker-compose -f docker-compose.prod.yml up -d

# 配合 Nginx 或 Traefik
```

**必须配置：**
- HTTPS 证书
- 资源限制
- 日志管理
- 监控告警

**详细文档：** [DOCKER.md - 生产环境部署](DOCKER.md#生产环境部署)

---

## 🔧 配置说明

### 必须配置

**DeepSeek API Key**（所有部署方式都需要）

创建 `.env` 文件：
```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

获取 API Key：https://platform.deepseek.com/

### 可选配置

#### 端口修改

**Docker:**
```yaml
# docker-compose.yml
ports:
  - "9000:8000"  # 修改主机端口为 9000
```

**传统部署:**
```python
# backend/main.py
uvicorn.run("main:app", host="0.0.0.0", port=9000)
```

#### 资源限制（Docker）

```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

---

## 📊 性能对比

| 指标 | Docker 部署 | 传统部署 |
|------|-------------|----------|
| 启动速度 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 内存占用 | ~200MB | ~150MB |
| 部署难度 | ⭐ 简单 | ⭐⭐ 中等 |
| 维护成本 | ⭐ 低 | ⭐⭐⭐ 较高 |
| 环境隔离 | ✅ 完全隔离 | ❌ 依赖系统 |
| 可移植性 | ✅ 优秀 | ⭐⭐ 一般 |
| 开发调试 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 优秀 |

---

## 🐛 常见问题

### Q: 部署后无法访问？

**A:** 检查以下项：
1. 服务是否正常启动：`docker-compose ps` 或查看控制台
2. 端口是否被占用：`netstat -tuln | grep 8000`
3. 防火墙是否开放端口
4. 浏览器访问 `http://localhost:8000`

### Q: API 调用失败？

**A:** 检查以下项：
1. `.env` 文件是否存在且配置正确
2. API Key 是否有效
3. 网络是否能访问 DeepSeek API
4. DeepSeek 账户余额是否充足

### Q: Docker 镜像构建失败？

**A:** 可能的原因：
1. 网络问题 - 使用国内镜像源
2. 磁盘空间不足 - 清理 `docker system prune`
3. Docker 版本过低 - 升级到最新版

### Q: 内存不足？

**A:** 解决方案：
1. 增加系统内存
2. 设置 Docker 内存限制
3. 关闭不必要的服务

---

## 🔒 安全建议

### 生产环境必备

1. **使用 HTTPS**
   - 配置 SSL 证书
   - 使用反向代理（Nginx/Traefik）

2. **保护 API Key**
   - 不要将 `.env` 提交到 Git
   - 使用 Docker secrets（生产环境）
   - 定期轮换 API Key

3. **访问控制**
   - 配置防火墙规则
   - 限制访问 IP
   - 添加身份验证

4. **监控和日志**
   - 配置日志轮转
   - 监控服务状态
   - 设置告警

---

## 📈 扩展部署

### 负载均衡

使用多个容器实例：

```yaml
# docker-compose.yml
services:
  tcm-diagnosis:
    deploy:
      replicas: 3
```

### 高可用部署

- 使用 Docker Swarm 或 Kubernetes
- 配置健康检查和自动重启
- 数据持久化和备份

### 集群部署

参考 Docker Swarm 或 K8s 文档进行集群部署。

---

## 📞 获取帮助

如果遇到问题：

1. 📖 查看对应的详细文档
2. 🔍 搜索 [常见问题](#常见问题)
3. 📝 查看系统日志
4. 💬 提交 GitHub Issue

---

## 🎓 学习资源

- [Docker 官方文档](https://docs.docker.com/)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)

---

**祝您部署顺利！如有问题请查阅相关文档。** 🚀

