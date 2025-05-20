/**
 * Web Push 推送通知服务端
 * 用于向已注册的ServiceWorker发送推送通知
 */

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const webpush = require("web-push");
const fs = require("fs");
const path = require("path");

// 配置
const PORT = process.env.PORT || 3000;
const VAPID_SUBJECT = "mailto:example@yourdomain.com"; // 更改为你的邮箱

// 存储订阅信息的文件路径
const SUBSCRIPTIONS_FILE = path.join(__dirname, "subscriptions.json");

// 初始化Express应用
const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 生成VAPID密钥（如果不存在）
let vapidKeys;
const VAPID_FILE = path.join(__dirname, "vapid-keys.json");

if (fs.existsSync(VAPID_FILE)) {
  // 如果密钥文件存在，读取密钥
  vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, "utf8"));
  console.log("已加载VAPID密钥");
} else {
  // 如果密钥文件不存在，生成新密钥
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys), "utf8");
  console.log("已生成新的VAPID密钥");
}

// 设置Web Push
webpush.setVapidDetails(
  VAPID_SUBJECT,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 加载订阅信息
let subscriptions = [];
if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
  try {
    subscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, "utf8"));
    console.log(`已加载 ${subscriptions.length} 个订阅`);
  } catch (error) {
    console.error("加载订阅信息失败:", error);
  }
}

// 保存订阅信息到文件
function saveSubscriptions() {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions), "utf8");
}

// 路由

// 获取公钥
app.get("/api/vapid-public-key", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// 订阅推送
app.post("/api/subscribe", (req, res) => {
  const subscription = req.body.subscription;
  const userId = req.body.userId || generateId();

  if (!subscription) {
    return res.status(400).json({ success: false, message: "缺少订阅信息" });
  }

  // 检查是否已存在相同的订阅
  const existingIndex = subscriptions.findIndex(
    (s) => s.subscription.endpoint === subscription.endpoint
  );

  if (existingIndex !== -1) {
    // 更新现有订阅
    subscriptions[existingIndex] = {
      id: userId,
      subscription,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    console.log(`更新订阅: ${userId}`);
  } else {
    // 添加新订阅
    subscriptions.push({
      id: userId,
      subscription,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
    console.log(`新订阅: ${userId}`);
  }

  saveSubscriptions();
  res.json({ success: true, userId });
});

// 取消订阅
app.post("/api/unsubscribe", (req, res) => {
  const { endpoint, userId } = req.body;

  if (!endpoint && !userId) {
    return res
      .status(400)
      .json({ success: false, message: "需要提供endpoint或userId" });
  }

  let removed = false;

  if (endpoint) {
    // 通过endpoint删除
    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter(
      (s) => s.subscription.endpoint !== endpoint
    );
    removed = subscriptions.length < initialLength;
  } else if (userId) {
    // 通过userId删除
    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter((s) => s.id !== userId);
    removed = subscriptions.length < initialLength;
  }

  if (removed) {
    saveSubscriptions();
    console.log("已删除订阅");
    res.json({ success: true, message: "已取消订阅" });
  } else {
    res.status(404).json({ success: false, message: "未找到订阅" });
  }
});

// 发送推送通知给所有订阅者
app.post("/api/send-notification", async (req, res) => {
  const { title, body, icon, badge, tag, url, requireInteraction, data } =
    req.body;
  const userId = req.body.userId; // 可选，特定用户ID

  if (!title && !body) {
    return res
      .status(400)
      .json({ success: false, message: "至少需要提供标题或内容" });
  }

  const payload = JSON.stringify({
    title: title || "新消息通知",
    body: body || "",
    icon: icon || "/static/favicon.png",
    badge: badge || "/static/favicon.png",
    tag: tag || "default-tag",
    url: url || "/",
    requireInteraction: requireInteraction || false,
    data: data || {},
    timestamp: new Date().toISOString(),
  });

  const targetSubscriptions = userId
    ? subscriptions.filter((s) => s.id === userId)
    : subscriptions;

  if (targetSubscriptions.length === 0) {
    return res.status(404).json({
      success: false,
      message: userId ? "未找到指定用户的订阅" : "没有活跃的订阅",
    });
  }

  const results = [];
  const failedSubscriptions = [];

  // 发送推送通知
  for (const sub of targetSubscriptions) {
    try {
      const result = await webpush.sendNotification(sub.subscription, payload);
      results.push({
        userId: sub.id,
        statusCode: result.statusCode,
        success: true,
      });
      console.log(`推送成功: ${sub.id}, 状态码: ${result.statusCode}`);
    } catch (error) {
      console.error(`推送失败: ${sub.id}`, error);

      // 检查是否是订阅过期或无效
      if (error.statusCode === 404 || error.statusCode === 410) {
        failedSubscriptions.push(sub);
      }

      results.push({
        userId: sub.id,
        statusCode: error.statusCode,
        success: false,
        error: error.message,
      });
    }
  }

  // 移除失效的订阅
  if (failedSubscriptions.length > 0) {
    subscriptions = subscriptions.filter(
      (s) =>
        !failedSubscriptions.some(
          (f) => f.subscription.endpoint === s.subscription.endpoint
        )
    );
    saveSubscriptions();
    console.log(`已移除 ${failedSubscriptions.length} 个失效的订阅`);
  }

  res.json({
    success: true,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    total: results.length,
    results,
  });
});

// 获取订阅统计信息
app.get("/api/subscriptions/stats", (req, res) => {
  res.json({
    success: true,
    total: subscriptions.length,
    lastUpdated:
      subscriptions.length > 0
        ? new Date(
            Math.max(
              ...subscriptions.map((s) => new Date(s.lastUpdated).getTime())
            )
          ).toISOString()
        : null,
  });
});

// 辅助函数

// 生成唯一ID
function generateId() {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`Web Push 服务已启动，监听端口: ${PORT}`);
  console.log(`公钥: ${vapidKeys.publicKey}`);
  console.log(`API URL: http://localhost:${PORT}/api/send-notification`);
});

// 处理进程退出
process.on("SIGINT", () => {
  console.log("正在关闭服务...");
  saveSubscriptions();
  process.exit(0);
});
