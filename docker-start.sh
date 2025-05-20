#!/bin/bash

# Web Push 服务 Docker 部署启动脚本

# 显示彩色输出
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${GREEN}开始部署 Web Push 服务...${NC}"

# 检查 Docker 是否安装
if ! command -v docker &>/dev/null; then
    echo -e "${RED}错误: Docker 未安装. 请先安装 Docker.${NC}"
    echo -e "访问 https://www.docker.com/get-started 获取安装指南."
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &>/dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装. 请先安装 Docker Compose.${NC}"
    echo -e "访问 https://docs.docker.com/compose/install/ 获取安装指南."
    exit 1
fi

# 检查配置文件
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}错误: docker-compose.yml 文件不存在.${NC}"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}错误: Dockerfile 文件不存在.${NC}"
    exit 1
fi

# 提示用户检查配置
echo -e "${YELLOW}请确保已经在 docker-compose.yml 中设置了正确的环境变量:${NC}"
echo -e "  - PORT: 服务端口"
echo -e "  - VAPID_SUBJECT: 你的邮箱地址 (例如: mailto:your-email@example.com)"
echo ""
read -p "是否继续? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo -e "${YELLOW}部署已取消.${NC}"
    exit 0
fi

# 构建并启动服务
echo -e "${GREEN}构建并启动 Docker 容器...${NC}"
docker-compose up -d --build

# 检查服务是否成功启动
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Web Push 服务已成功启动!${NC}"
    echo -e "服务地址: http://localhost:3000"
    echo -e "API 端点:"
    echo -e "  - 获取公钥: GET http://localhost:3000/api/vapid-public-key"
    echo -e "  - 订阅推送: POST http://localhost:3000/api/subscribe"
    echo -e "  - 发送通知: POST http://localhost:3000/api/send-notification"
    echo -e "  - 获取统计: GET http://localhost:3000/api/subscriptions/stats"
    echo ""
    echo -e "${YELLOW}查看日志:${NC} docker-compose logs -f"
    echo -e "${YELLOW}停止服务:${NC} docker-compose down"
    echo -e "${YELLOW}重启服务:${NC} docker-compose restart"
    echo ""
    echo -e "${GREEN}更多信息请参考 DOCKER-README.md 文件.${NC}"
else
    echo -e "${RED}启动服务时出现错误. 请检查日志获取详细信息:${NC}"
    echo -e "docker-compose logs"
fi
