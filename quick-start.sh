#!/bin/bash

# 中医智能诊疗系统 - 快速启动脚本
# 此脚本会自动选择最佳部署方式

echo "╔════════════════════════════════════════════════════════╗"
echo "║      中医智能诊疗系统 - 快速启动向导                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 检测 Docker 是否安装
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✓ 检测到 Docker 环境"
    echo ""
    echo "选择部署方式："
    echo "  [1] Docker 部署（推荐）"
    echo "  [2] 传统部署"
    echo ""
    read -p "请输入选项 [1/2]: " choice
else
    echo "⚠ 未检测到 Docker，将使用传统部署方式"
    choice=2
fi

echo ""

# Docker 部署
if [ "$choice" = "1" ]; then
    echo "════════════════════════════════════════"
    echo "  使用 Docker 部署"
    echo "════════════════════════════════════════"
    echo ""
    
    # 检查 .env 文件
    if [ ! -f ".env" ]; then
        echo "⚠ 未找到 .env 配置文件"
        echo ""
        read -p "请输入你的 DeepSeek API Key: " api_key
        
        cat > .env << EOF
DEEPSEEK_API_KEY=$api_key
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
EOF
        echo "✓ .env 文件已创建"
        echo ""
    fi
    
    echo "[1/2] 构建 Docker 镜像..."
    docker-compose build
    
    echo ""
    echo "[2/2] 启动服务..."
    docker-compose up -d
    
    echo ""
    echo "════════════════════════════════════════"
    echo "  ✓ 部署完成！"
    echo "════════════════════════════════════════"
    echo ""
    echo "访问地址: http://localhost:8000"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
    echo ""

# 传统部署
else
    echo "════════════════════════════════════════"
    echo "  使用传统方式部署"
    echo "════════════════════════════════════════"
    echo ""
    
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        echo "✗ 未检测到 Python3"
        echo "请安装 Python 3.8 或更高版本"
        exit 1
    fi
    
    echo "✓ Python 版本: $(python3 --version)"
    echo ""
    
    # 检查 .env 文件
    if [ ! -f ".env" ]; then
        echo "⚠ 未找到 .env 配置文件"
        echo ""
        read -p "请输入你的 DeepSeek API Key: " api_key
        
        cat > .env << EOF
DEEPSEEK_API_KEY=$api_key
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
EOF
        echo "✓ .env 文件已创建"
        echo ""
    fi
    
    # 创建虚拟环境
    if [ ! -d "venv" ]; then
        echo "[1/3] 创建虚拟环境..."
        python3 -m venv venv
    fi
    
    echo "[2/3] 激活虚拟环境..."
    source venv/bin/activate
    
    echo "[3/3] 安装依赖..."
    pip install -r requirements.txt
    
    echo ""
    echo "════════════════════════════════════════"
    echo "  ✓ 安装完成！"
    echo "════════════════════════════════════════"
    echo ""
    echo "启动服务:"
    echo "  ./start.sh"
    echo ""
    echo "或者:"
    echo "  source venv/bin/activate"
    echo "  cd backend"
    echo "  python main.py"
    echo ""
    
    read -p "是否现在启动服务? [y/N]: " start_now
    if [ "$start_now" = "y" ] || [ "$start_now" = "Y" ]; then
        chmod +x start.sh
        ./start.sh
    fi
fi

