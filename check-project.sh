#!/bin/bash

# 中医智能诊疗系统 - 项目完整性检查脚本

echo "════════════════════════════════════════════════════"
echo "  中医智能诊疗系统 - 项目完整性检查"
echo "════════════════════════════════════════════════════"
echo ""

# 检查计数器
total_checks=0
passed_checks=0

# 检查函数
check_file() {
    total_checks=$((total_checks + 1))
    if [ -f "$1" ]; then
        echo "✓ $1"
        passed_checks=$((passed_checks + 1))
        return 0
    else
        echo "✗ $1 [缺失]"
        return 1
    fi
}

check_dir() {
    total_checks=$((total_checks + 1))
    if [ -d "$1" ]; then
        echo "✓ $1/"
        passed_checks=$((passed_checks + 1))
        return 0
    else
        echo "✗ $1/ [缺失]"
        return 1
    fi
}

echo "【1/5】检查目录结构..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_dir "backend"
check_dir "frontend"
echo ""

echo "【2/5】检查后端文件..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "backend/__init__.py"
check_file "backend/main.py"
check_file "backend/agents.py"
check_file "backend/prompts.py"
echo ""

echo "【3/5】检查前端文件..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "frontend/index.html"
check_file "frontend/style.css"
check_file "frontend/script.js"
echo ""

echo "【4/5】检查 Docker 配置..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "Dockerfile"
check_file "docker-compose.yml"
check_file "docker-compose.dev.yml"
check_file ".dockerignore"
echo ""

echo "【5/5】检查启动脚本和文档..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "requirements.txt"
check_file "start.bat"
check_file "start.sh"
check_file "quick-start.bat"
check_file "quick-start.sh"
check_file "Makefile"
check_file ".gitignore"
check_file "README.md"
check_file "DOCKER.md"
check_file "USAGE.md"
check_file "DEPLOY.md"
check_file "CHANGELOG.md"
check_file "PROJECT_SUMMARY.md"
echo ""

echo "════════════════════════════════════════════════════"
echo "  检查完成！"
echo "════════════════════════════════════════════════════"
echo ""
echo "检查项目：$total_checks"
echo "通过检查：$passed_checks"
echo "缺失文件：$((total_checks - passed_checks))"
echo ""

if [ $passed_checks -eq $total_checks ]; then
    echo "🎉 恭喜！项目完整性检查 100% 通过！"
    echo ""
    echo "您现在可以："
    echo "  1. 配置 .env 文件（填入 DeepSeek API Key）"
    echo "  2. 运行 quick-start.sh 快速启动"
    echo "  3. 访问 http://localhost:8000 开始使用"
    echo ""
else
    echo "⚠️  检查未通过，有 $((total_checks - passed_checks)) 个文件缺失"
    echo "请确保所有文件都已正确创建"
    echo ""
fi

echo "════════════════════════════════════════════════════"

# 检查 .env 文件
echo ""
echo "【额外检查】环境配置..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ".env" ]; then
    echo "✓ .env 文件已存在"
    if grep -q "DEEPSEEK_API_KEY=your_api_key_here" .env 2>/dev/null; then
        echo "⚠️  请编辑 .env 文件，填入真实的 API Key"
    else
        echo "✓ API Key 已配置"
    fi
else
    echo "✗ .env 文件不存在"
    echo "  请复制 .env.example 为 .env 并配置 API Key"
fi
echo ""

# 检查 Docker
echo "【环境检查】Docker..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v docker &> /dev/null; then
    echo "✓ Docker 已安装: $(docker --version)"
    if command -v docker-compose &> /dev/null; then
        echo "✓ Docker Compose 已安装"
    else
        echo "⚠️  Docker Compose 未安装（可选）"
    fi
else
    echo "⚠️  Docker 未安装（可选，可使用传统部署）"
fi
echo ""

# 检查 Python
echo "【环境检查】Python..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v python3 &> /dev/null; then
    echo "✓ Python 已安装: $(python3 --version)"
elif command -v python &> /dev/null; then
    echo "✓ Python 已安装: $(python --version)"
else
    echo "⚠️  Python 未安装（使用 Docker 部署则非必需）"
fi
echo ""

echo "════════════════════════════════════════════════════"
echo "  检查脚本执行完毕"
echo "════════════════════════════════════════════════════"

