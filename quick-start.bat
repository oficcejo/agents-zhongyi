@echo off
chcp 65001 >nul

echo ╔════════════════════════════════════════════════════════╗
echo ║      中医智能诊疗系统 - 快速启动向导                 ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM 检测 Docker 是否安装
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ 检测到 Docker 环境
        echo.
        echo 选择部署方式：
        echo   [1] Docker 部署（推荐）
        echo   [2] 传统部署
        echo.
        set /p choice="请输入选项 [1/2]: "
    ) else (
        set choice=2
    )
) else (
    echo ⚠ 未检测到 Docker，将使用传统部署方式
    set choice=2
)

echo.

REM Docker 部署
if "%choice%"=="1" (
    echo ════════════════════════════════════════
    echo   使用 Docker 部署
    echo ════════════════════════════════════════
    echo.
    
    REM 检查 .env 文件
    if not exist ".env" (
        echo ⚠ 未找到 .env 配置文件
        echo.
        set /p api_key="请输入你的 DeepSeek API Key: "
        
        (
            echo DEEPSEEK_API_KEY=!api_key!
            echo DEEPSEEK_API_BASE=https://api.deepseek.com/v1
            echo DEEPSEEK_MODEL=deepseek-chat
        ) > .env
        
        echo ✓ .env 文件已创建
        echo.
    )
    
    echo [1/2] 构建 Docker 镜像...
    docker-compose build
    
    echo.
    echo [2/2] 启动服务...
    docker-compose up -d
    
    echo.
    echo ════════════════════════════════════════
    echo   ✓ 部署完成！
    echo ════════════════════════════════════════
    echo.
    echo 访问地址: http://localhost:8000
    echo.
    echo 常用命令:
    echo   查看日志: docker-compose logs -f
    echo   停止服务: docker-compose down
    echo   重启服务: docker-compose restart
    echo.
    
) else (
    REM 传统部署
    echo ════════════════════════════════════════
    echo   使用传统方式部署
    echo ════════════════════════════════════════
    echo.
    
    REM 检查 Python
    python --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ✗ 未检测到 Python
        echo 请安装 Python 3.8 或更高版本
        pause
        exit /b 1
    )
    
    echo ✓ Python 版本:
    python --version
    echo.
    
    REM 检查 .env 文件
    if not exist ".env" (
        echo ⚠ 未找到 .env 配置文件
        echo.
        set /p api_key="请输入你的 DeepSeek API Key: "
        
        (
            echo DEEPSEEK_API_KEY=%api_key%
            echo DEEPSEEK_API_BASE=https://api.deepseek.com/v1
            echo DEEPSEEK_MODEL=deepseek-chat
        ) > .env
        
        echo ✓ .env 文件已创建
        echo.
    )
    
    REM 创建虚拟环境
    if not exist "venv" (
        echo [1/3] 创建虚拟环境...
        python -m venv venv
    )
    
    echo [2/3] 激活虚拟环境...
    call venv\Scripts\activate.bat
    
    echo [3/3] 安装依赖...
    pip install -r requirements.txt
    
    echo.
    echo ════════════════════════════════════════
    echo   ✓ 安装完成！
    echo ════════════════════════════════════════
    echo.
    echo 启动服务:
    echo   start.bat
    echo.
    echo 或者:
    echo   venv\Scripts\activate.bat
    echo   cd backend
    echo   python main.py
    echo.
    
    set /p start_now="是否现在启动服务? [y/N]: "
    if /i "%start_now%"=="y" (
        call start.bat
    )
)

pause

