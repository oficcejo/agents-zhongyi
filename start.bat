@echo off
chcp 65001 >nul
echo ===============================================
echo    中医智能诊疗系统 - 启动脚本
echo ===============================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python，请先安装 Python 3.8 或更高版本
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/5] 检查 Python 版本...
python --version

echo.
echo [2/5] 检查虚拟环境...
if not exist "venv" (
    echo 虚拟环境不存在，正在创建...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [错误] 创建虚拟环境失败
        pause
        exit /b 1
    )
    echo 虚拟环境创建成功！
)

echo.
echo [3/5] 激活虚拟环境...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo [错误] 激活虚拟环境失败
    pause
    exit /b 1
)

echo.
echo [4/5] 安装/更新依赖...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [错误] 安装依赖失败
    pause
    exit /b 1
)

echo.
echo [5/5] 检查环境变量配置...
if not exist ".env" (
    echo.
    echo [警告] 未找到 .env 配置文件！
    echo.
    echo 请在项目根目录创建 .env 文件，内容如下：
    echo.
    echo DEEPSEEK_API_KEY=your_api_key_here
    echo DEEPSEEK_API_BASE=https://api.deepseek.com/v1
    echo DEEPSEEK_MODEL=deepseek-chat
    echo.
    echo 请配置后重新运行本脚本。
    echo.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo    启动服务中...
echo ===============================================
echo.
echo 服务地址: http://localhost:8000
echo 按 Ctrl+C 停止服务
echo.

cd backend
python main.py

pause

