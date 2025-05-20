# Web Push 推送通知服务

这是一个基于Web Push协议的推送通知服务，用于向已注册的ServiceWorker发送推送通知。该服务可以与现有的ServiceWorker配合使用，实现后台推送功能。

## 功能特点

- 基于Web Push标准协议
- 支持VAPID密钥认证
- 支持多用户订阅管理
- 支持定向推送和广播推送
- 自动清理失效的订阅
- 简单的HTTP API接口
- 完整的客户端示例代码
- Service Worker缓存管理

## 项目文件结构

```
├── src/                      # 源代码目录
│   ├── manifest.json         # PWA应用配置文件
│   ├── service-worker.js     # Service Worker脚本
│   ├── subscriptions.json    # 推送订阅信息存储文件
│   ├── update-service-worker-cache.js  # Service Worker缓存更新工具
│   ├── vapid-keys.json       # VAPID密钥存储文件
│   ├── web-push-client-example.js  # Web Push客户端示例代码
│   └── web-push-server.js    # Web Push推送通知服务端
├── Dockerfile                # Docker镜像构建文件
├── docker-compose.yml        # Docker容器配置文件
├── docker-start.bat          # Windows下Docker启动脚本
├── docker-start.sh           # Linux/Mac下Docker启动脚本
└── package.json              # 项目依赖配置
```

## 安装依赖

服务端依赖于以下Node.js包：

```bash
npm install express cors body-parser web-push
```

## 服务端使用说明

### 启动服务

```bash
node src/web-push-server.js
```

默认情况下，服务将在3000端口启动。你可以通过设置环境变量`PORT`来更改端口：

```bash
PORT=8080 node src/web-push-server.js
```

### 配置

在使用前，请修改`web-push-server.js`中的以下配置：

```javascript
const VAPID_SUBJECT = "mailto:example@yourdomain.com"; // 更改为你的邮箱
```

首次运行时，服务会自动生成VAPID密钥对并保存到`vapid-keys.json`文件中。这些密钥用于验证推送服务的身份。

## HTTP API

### 获取公钥

- **URL**: `/api/vapid-public-key`
- **方法**: GET
- **响应**:
  ```json
  {
    "publicKey": "BLGrDr5tSJVNgHXFJIUjwbj..." // VAPID公钥
  }
  ```

### 订阅推送

- **URL**: `/api/subscribe`
- **方法**: POST
- **请求体**:
  ```json
  {
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "expirationTime": null,
      "keys": {
        "p256dh": "BLxV-Q4...",
        "auth": "Xtg0J..."
      }
    },
    "userId": "user123" // 可选，用户ID
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "userId": "user123" // 如果请求中未提供userId，则会生成一个新的
  }
  ```

### 取消订阅

- **URL**: `/api/unsubscribe`
- **方法**: POST
- **请求体**:
  ```json
  {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...", // 订阅的endpoint
    "userId": "user123" // 可选，用户ID
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
  }
  ```

### 发送推送通知

- **URL**: `/api/send-notification`
- **方法**: POST
- **请求体**:
  ```json
  {
    "title": "通知标题",
    "body": "通知内容",
    "icon": "/static/icon-192.png", // 可选
    "badge": "/static/badge.png", // 可选
    "image": "/static/image.jpg", // 可选
    "data": { // 可选，自定义数据
      "url": "https://example.com/page"
    },
    "actions": [ // 可选，通知按钮
      {
        "action": "view",
        "title": "查看"
      },
      {
        "action": "close",
        "title": "关闭"
      }
    ],
    "userId": "user123" // 可选，指定接收通知的用户ID，不提供则广播给所有订阅用户
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "sent": 1, // 成功发送的数量
    "failed": 0 // 发送失败的数量
  }
  ```

### 获取订阅统计信息

- **URL**: `/api/subscriptions/stats`
- **方法**: GET
- **响应**:
  ```json
  {
    "total": 10, // 总订阅数
    "byBrowser": { // 按浏览器统计
      "Chrome": 5,
      "Firefox": 3,
      "Edge": 2
    }
  }
  ```

## 客户端使用说明

### 基本用法

```javascript
// 创建推送通知客户端实例
const pushClient = new PushNotificationClient({
  serverUrl: "http://localhost:3000",
  userId: "user123", // 可选
  onSuccess: (subscription, userId) => {
    console.log("推送通知订阅成功:", subscription);
  },
  onError: (error) => {
    console.error("推送通知错误:", error);
  },
});

// 初始化
await pushClient.init();

// 订阅推送通知
await pushClient.subscribe();
```

## Service Worker 缓存更新工具

**功能**：自动更新 Service Worker 缓存列表并复制相关文件到构建目录。

**使用方式**：

```bash
node src/update-service-worker-cache.js
```

**工作流程**：

1. 递归获取 `assets` 和 `static` 目录下的所有静态资源文件
2. 更新 `service-worker.js` 中的 `urlsToCache` 数组
3. 将更新后的 `service-worker.js` 复制到构建目录
4. 复制额外文件（如 `manifest.json` 和截图）到构建目录

## Docker 部署说明

### 前提条件

- 安装 [Docker](https://www.docker.com/get-started)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)

### 快速开始

#### 1. 配置环境变量

在使用前，请修改 `docker-compose.yml` 文件中的环境变量：

```yaml
environment:
  - PORT=3000 # 服务端口
  - VAPID_SUBJECT=mailto:your-email@example.com # 更改为你的邮箱
```

#### 2. 构建并启动服务

在项目根目录下运行以下命令：

```bash
# Windows
docker-start.bat

# Linux/Mac
./docker-start.sh
```

或者手动执行：

```bash
docker-compose up -d
```

这将在后台启动 Web Push 服务。首次运行时，Docker 会自动构建镜像。

#### 3. 查看日志

```bash
docker-compose logs -f
```

#### 4. 停止服务

```bash
docker-compose down
```

### 数据持久化

服务使用 Docker 卷来持久化存储订阅信息和 VAPID 密钥：

```yaml
volumes:
  - ./src/subscriptions.json:/app/subscriptions.json
  - ./src/vapid-keys.json:/app/vapid-keys.json
```

这确保了即使容器重启，订阅数据和密钥也不会丢失。

## 生产环境部署建议

1. 使用 HTTPS：在生产环境中，Web Push 服务需要通过 HTTPS 提供。可以使用 Nginx 作为反向代理，配置 SSL 证书。

2. 设置防火墙：只开放必要的端口。

3. 使用更可靠的数据存储：考虑将订阅信息存储在数据库中，而不是 JSON 文件。
