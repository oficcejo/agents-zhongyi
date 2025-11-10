# 中医智能诊疗系统 Makefile
# 方便快速执行常用命令

.PHONY: help install start stop restart logs clean docker-build docker-up docker-down docker-logs test

# 默认目标
.DEFAULT_GOAL := help

help: ## 显示帮助信息
	@echo "中医智能诊疗系统 - 可用命令："
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ============ 传统部署 ============

install: ## 安装依赖（传统部署）
	@echo "正在安装依赖..."
	python -m venv venv
	. venv/bin/activate && pip install -r requirements.txt
	@echo "✓ 依赖安装完成"

start: ## 启动服务（传统部署）
	@echo "正在启动服务..."
	. venv/bin/activate && cd backend && python main.py

# ============ Docker 部署 ============

docker-build: ## 构建 Docker 镜像
	@echo "正在构建 Docker 镜像..."
	docker-compose build
	@echo "✓ 镜像构建完成"

docker-up: ## 启动 Docker 服务
	@echo "正在启动 Docker 服务..."
	docker-compose up -d
	@echo "✓ 服务已启动"
	@echo "访问地址: http://localhost:8000"

docker-down: ## 停止 Docker 服务
	@echo "正在停止 Docker 服务..."
	docker-compose down
	@echo "✓ 服务已停止"

docker-restart: ## 重启 Docker 服务
	@echo "正在重启 Docker 服务..."
	docker-compose restart
	@echo "✓ 服务已重启"

docker-logs: ## 查看 Docker 日志
	docker-compose logs -f

docker-ps: ## 查看 Docker 容器状态
	docker-compose ps

docker-shell: ## 进入 Docker 容器
	docker-compose exec tcm-diagnosis bash

# ============ 开发 ============

dev: ## 启动开发模式（Docker）
	@echo "正在启动开发模式..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# ============ 清理 ============

clean: ## 清理临时文件
	@echo "正在清理临时文件..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.log" -delete
	@echo "✓ 清理完成"

clean-all: clean ## 清理所有（包括虚拟环境和 Docker）
	@echo "正在清理所有..."
	rm -rf venv
	docker-compose down -v
	docker system prune -f
	@echo "✓ 清理完成"

# ============ 健康检查 ============

health: ## 检查服务健康状态
	@echo "检查服务状态..."
	@curl -s http://localhost:8000/api/health | python -m json.tool || echo "✗ 服务未运行"

# ============ 测试 ============

test: ## 运行测试（占位）
	@echo "测试功能待实现..."

# ============ 文档 ============

docs: ## 在浏览器中打开文档
	@echo "打开文档..."
	@open README.md || xdg-open README.md || start README.md

# ============ 快速命令 ============

quick-start: ## 快速启动（自动检测环境）
	@if command -v docker >/dev/null 2>&1; then \
		echo "使用 Docker 部署..."; \
		make docker-build docker-up; \
	else \
		echo "使用传统部署..."; \
		make install start; \
	fi

