@echo off
chcp 65001 >nul

echo ════════════════════════════════════════════════════
echo   中医智能诊疗系统 - 项目完整性检查
echo ════════════════════════════════════════════════════
echo.

setlocal enabledelayedexpansion
set total_checks=0
set passed_checks=0

echo 【1/5】检查目录结构...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call :check_dir "backend"
call :check_dir "frontend"
echo.

echo 【2/5】检查后端文件...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call :check_file "backend\__init__.py"
call :check_file "backend\main.py"
call :check_file "backend\agents.py"
call :check_file "backend\prompts.py"
echo.

echo 【3/5】检查前端文件...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call :check_file "frontend\index.html"
call :check_file "frontend\style.css"
call :check_file "frontend\script.js"
echo.

echo 【4/5】检查 Docker 配置...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call :check_file "Dockerfile"
call :check_file "docker-compose.yml"
call :check_file "docker-compose.dev.yml"
call :check_file ".dockerignore"
echo.

echo 【5/5】检查启动脚本和文档...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
call :check_file "requirements.txt"
call :check_file "start.bat"
call :check_file "start.sh"
call :check_file "quick-start.bat"
call :check_file "quick-start.sh"
call :check_file "Makefile"
call :check_file ".gitignore"
call :check_file "README.md"
call :check_file "DOCKER.md"
call :check_file "USAGE.md"
call :check_file "DEPLOY.md"
call :check_file "CHANGELOG.md"
call :check_file "PROJECT_SUMMARY.md"
echo.

echo ════════════════════════════════════════════════════
echo   检查完成！
echo ════════════════════════════════════════════════════
echo.
echo 检查项目：%total_checks%
echo 通过检查：%passed_checks%
set /a missing_files=%total_checks%-%passed_checks%
echo 缺失文件：%missing_files%
echo.

if %passed_checks% equ %total_checks% (
    echo 🎉 恭喜！项目完整性检查 100%% 通过！
    echo.
    echo 您现在可以：
    echo   1. 配置 .env 文件（填入 DeepSeek API Key）
    echo   2. 运行 quick-start.bat 快速启动
    echo   3. 访问 http://localhost:8000 开始使用
    echo.
) else (
    echo ⚠️  检查未通过，有 %missing_files% 个文件缺失
    echo 请确保所有文件都已正确创建
    echo.
)

echo ════════════════════════════════════════════════════

echo.
echo 【额外检查】环境配置...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if exist ".env" (
    echo ✓ .env 文件已存在
    findstr /C:"DEEPSEEK_API_KEY=your_api_key_here" .env >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠️  请编辑 .env 文件，填入真实的 API Key
    ) else (
        echo ✓ API Key 已配置
    )
) else (
    echo ✗ .env 文件不存在
    echo   请复制 .env.example 为 .env 并配置 API Key
)
echo.

echo 【环境检查】Docker...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
docker --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('docker --version') do echo ✓ Docker 已安装: %%i
    docker-compose --version >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ Docker Compose 已安装
    ) else (
        echo ⚠️  Docker Compose 未安装（可选）
    )
) else (
    echo ⚠️  Docker 未安装（可选，可使用传统部署）
)
echo.

echo 【环境检查】Python...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
python --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('python --version') do echo ✓ Python 已安装: %%i
) else (
    echo ⚠️  Python 未安装（使用 Docker 部署则非必需）
)
echo.

echo ════════════════════════════════════════════════════
echo   检查脚本执行完毕
echo ════════════════════════════════════════════════════

pause
goto :eof

:check_file
set /a total_checks+=1
if exist "%~1" (
    echo ✓ %~1
    set /a passed_checks+=1
) else (
    echo ✗ %~1 [缺失]
)
goto :eof

:check_dir
set /a total_checks+=1
if exist "%~1\" (
    echo ✓ %~1\
    set /a passed_checks+=1
) else (
    echo ✗ %~1\ [缺失]
)
goto :eof

