# Docker 部署指南

本文档详细说明如何使用 Docker 部署中医智能诊疗系统。

---

## 📦 前置要求

### 安装 Docker

#### Windows
1. 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. 安装并启动 Docker Desktop
3. 验证安装：
```bash
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)
```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

#### macOS
1. 下载 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
2. 安装并启动 Docker Desktop
3. 验证安装：
```bash
docker --version
docker-compose --version
```

---

## 🚀 快速部署

### 方式一：使用 Docker Compose（推荐）

#### 1. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

#### 2. 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 3. 访问系统

打开浏览器访问：http://localhost:8000

### 方式二：使用 Docker 命令

#### 1. 构建镜像

```bash
docker build -t tcm-diagnosis:latest .
```

#### 2. 运行容器

```bash
docker run -d \
  --name tcm-diagnosis \
  -p 8000:8000 \
  -e DEEPSEEK_API_KEY=your_api_key_here \
  -e DEEPSEEK_API_BASE=https://api.deepseek.com/v1 \
  -e DEEPSEEK_MODEL=deepseek-chat \
  --restart unless-stopped \
  tcm-diagnosis:latest
```

#### 3. 查看容器状态

```bash
# 查看运行中的容器
docker ps

# 查看日志
docker logs -f tcm-diagnosis

# 进入容器
docker exec -it tcm-diagnosis bash
```

---

## 🛠️ 开发环境部署

如果需要在开发环境中使用 Docker，支持代码热重载：

```bash
# 使用开发配置启动
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# 此模式会挂载本地代码目录，修改代码后自动重载
```

---

## 📋 Docker 命令速查

### 镜像管理

```bash
# 列出镜像
docker images

# 删除镜像
docker rmi tcm-diagnosis:latest

# 清理未使用的镜像
docker image prune -a
```

### 容器管理

```bash
# 启动容器
docker-compose up -d

# 停止容器
docker-compose stop

# 重启容器
docker-compose restart

# 删除容器
docker-compose down

# 查看容器日志
docker-compose logs -f

# 查看容器状态
docker-compose ps

# 进入容器
docker-compose exec tcm-diagnosis bash
```

### 健康检查

```bash
# 查看容器健康状态
docker inspect --format='{{.State.Health.Status}}' tcm-diagnosis

# 手动测试健康检查
docker-compose exec tcm-diagnosis python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/api/health').read())"
```

---

## 🔧 配置说明

### 端口映射

默认端口映射：`8000:8000`（主机:容器）

修改主机端口（如改为 9000）：

**docker-compose.yml:**
```yaml
ports:
  - "9000:8000"
```

**Docker 命令:**
```bash
docker run -p 9000:8000 ...
```

### 环境变量

支持的环境变量：

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| DEEPSEEK_API_KEY | DeepSeek API Key | - | ✅ |
| DEEPSEEK_API_BASE | API 地址 | https://api.deepseek.com/v1 | ❌ |
| DEEPSEEK_MODEL | 模型名称 | deepseek-chat | ❌ |

### 持久化数据

如需持久化数据（如日志、缓存等），可添加 volume：

**docker-compose.yml:**
```yaml
services:
  tcm-diagnosis:
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
```

### 资源限制

限制容器资源使用：

**docker-compose.yml:**
```yaml
services:
  tcm-diagnosis:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

**Docker 命令:**
```bash
docker run --cpus="2" --memory="2g" ...
```

---

## 🌐 网络配置

### 自定义网络

```yaml
networks:
  tcm-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 连接到已有网络

```yaml
services:
  tcm-diagnosis:
    networks:
      - existing-network

networks:
  existing-network:
    external: true
```

---

## 📊 日志管理

### 查看实时日志

```bash
# Docker Compose
docker-compose logs -f

# 查看最近 100 行
docker-compose logs --tail=100

# 只查看错误日志
docker-compose logs | grep ERROR
```

### 配置日志轮转

**docker-compose.yml:**
```yaml
services:
  tcm-diagnosis:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"    # 单个日志文件最大 10MB
        max-file: "3"      # 保留最近 3 个日志文件
```

---

## 🔒 安全最佳实践

### 1. 使用非 root 用户

Dockerfile 中已配置：
```dockerfile
USER appuser
```

### 2. 保护环境变量

```bash
# 设置 .env 文件权限
chmod 600 .env

# 不要将 .env 提交到 Git
echo ".env" >> .gitignore
```

### 3. 使用 secrets（生产环境）

**docker-compose.yml:**
```yaml
services:
  tcm-diagnosis:
    secrets:
      - deepseek_api_key
    environment:
      - DEEPSEEK_API_KEY_FILE=/run/secrets/deepseek_api_key

secrets:
  deepseek_api_key:
    file: ./secrets/api_key.txt
```

### 4. 启用 HTTPS（使用反向代理）

推荐使用 Nginx 或 Traefik 作为反向代理：

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - tcm-diagnosis
```

---

## 🚀 生产环境部署

### 完整的生产配置示例

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  tcm-diagnosis:
    image: tcm-diagnosis:latest
    container_name: tcm-diagnosis-prod
    ports:
      - "8000:8000"
    environment:
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - DEEPSEEK_API_BASE=${DEEPSEEK_API_BASE}
      - DEEPSEEK_MODEL=${DEEPSEEK_MODEL}
    restart: always
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
        reservations:
          cpus: '2'
          memory: 1G
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
    networks:
      - prod-network

networks:
  prod-network:
    driver: bridge
```

启动生产环境：
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔄 更新和维护

### 更新镜像

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build --no-cache

# 重启服务
docker-compose down
docker-compose up -d
```

### 备份

```bash
# 导出镜像
docker save tcm-diagnosis:latest | gzip > tcm-diagnosis-backup.tar.gz

# 导入镜像
docker load < tcm-diagnosis-backup.tar.gz
```

### 清理

```bash
# 清理停止的容器
docker container prune

# 清理未使用的镜像
docker image prune -a

# 清理所有未使用的资源
docker system prune -a --volumes
```

---

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查容器状态
docker-compose ps

# 检查配置文件语法
docker-compose config
```

### 端口冲突

```bash
# 查看端口占用
netstat -tuln | grep 8000

# 修改端口映射
# 编辑 docker-compose.yml，修改 ports 配置
```

### API 连接失败

```bash
# 进入容器检查
docker-compose exec tcm-diagnosis bash

# 测试网络连接
curl https://api.deepseek.com/v1/models

# 检查环境变量
env | grep DEEPSEEK
```

### 内存不足

```bash
# 查看容器资源使用
docker stats tcm-diagnosis

# 增加内存限制或清理系统
docker system prune -a
```

---

## 📈 性能优化

### 1. 多阶段构建（高级）

```dockerfile
# 构建阶段
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# 运行阶段
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "backend/main.py"]
```

### 2. 使用 Alpine 镜像（更小体积）

```dockerfile
FROM python:3.11-alpine
# ... 其他配置
```

### 3. 启用 BuildKit

```bash
# Linux/Mac
export DOCKER_BUILDKIT=1
docker-compose build

# Windows PowerShell
$env:DOCKER_BUILDKIT=1
docker-compose build
```

---

## 📚 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Python Docker 最佳实践](https://docs.docker.com/language/python/)

---

## 💡 提示

1. **首次构建**可能需要几分钟时间下载依赖
2. **API Key** 必须配置才能正常使用
3. **生产环境**建议使用 HTTPS 和反向代理
4. **日志监控**对于排查问题非常重要
5. **定期更新**镜像和依赖以获得安全更新

---

**祝您部署顺利！** 🐳🚀

