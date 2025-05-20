@echo off
chcp 65001 > nul

:: Web Push 服务 Docker 部署启动脚本 (Windows版)

echo [32m开始部署 Web Push 服务...[0m

:: 检查 Docker 是否安装
docker --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [31m错误: Docker 未安装. 请先安装 Docker.[0m
    echo 访问 https://www.docker.com/get-started 获取安装指南.
    exit /b 1
)

:: 检查 Docker Compose 是否安装
docker-compose --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [31m错误: Docker Compose 未安装. 请先安装 Docker Compose.[0m
    echo 访问 https://docs.docker.com/compose/install/ 获取安装指南.
    exit /b 1
)

:: 检查配置文件
if not exist "docker-compose.yml" (
    echo [31m错误: docker-compose.yml 文件不存在.[0m
    exit /b 1
)

if not exist "Dockerfile" (
    echo [31m错误: Dockerfile 文件不存在.[0m
    exit /b 1
)

:: 提示用户检查配置
echo [33m请确保已经在 docker-compose.yml 中设置了正确的环境变量:[0m
echo   - PORT: 服务端口
echo   - VAPID_SUBJECT: 你的邮箱地址 (例如: mailto:your-email@example.com)
echo.

set /p confirm=是否继续? (y/n): 
if /i "%confirm%" neq "y" (
    echo [33m部署已取消.[0m
    exit /b 0
)

:: 构建并启动服务
echo [32m构建并启动 Docker 容器...[0m
docker-compose up -d --build

:: 检查服务是否成功启动
if %ERRORLEVEL% equ 0 (
    echo [32mWeb Push 服务已成功启动![0m
    echo 服务地址: http://localhost:3000
    echo API 端点:
    echo   - 获取公钥: GET http://localhost:3000/api/vapid-public-key
    echo   - 订阅推送: POST http://localhost:3000/api/subscribe
    echo   - 发送通知: POST http://localhost:3000/api/send-notification
    echo   - 获取统计: GET http://localhost:3000/api/subscriptions/stats
    echo.
    echo [33m查看日志:[0m docker-compose logs -f
    echo [33m停止服务:[0m docker-compose down
    echo [33m重启服务:[0m docker-compose restart
    echo.
    echo [32m更多信息请参考 DOCKER-README.md 文件.[0m
) else (
    echo [31m启动服务时出现错误. 请检查日志获取详细信息:[0m
    echo docker-compose logs
)

pause