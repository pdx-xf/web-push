FROM node:18-alpine

# 创建应用目录
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts
RUN npm install express cors body-parser web-push

# 复制应用代码
COPY src/web-push-server.js ./
COPY src/vapid-keys.json ./vapid-keys.json
COPY src/subscriptions.json ./subscriptions.json

# 设置环境变量
ENV PORT=3000
ENV VAPID_SUBJECT=mailto:example@yourdomain.com

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "web-push-server.js"]