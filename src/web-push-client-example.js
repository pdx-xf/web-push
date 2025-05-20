/**
 * Web Push 客户端示例代码
 * 用于注册ServiceWorker并订阅推送通知
 */

// 服务器URL配置
const SERVER_URL = "http://localhost:3000";

/**
 * 推送通知客户端类
 */
class PushNotificationClient {
  /**
   * 创建推送通知客户端实例
   * @param {Object} options 配置选项
   * @param {string} options.serverUrl 服务器URL
   * @param {string} [options.userId] 用户ID，可选
   * @param {Function} [options.onSuccess] 订阅成功回调
   * @param {Function} [options.onError] 错误处理回调
   * @param {string} [options.serviceWorkerPath='/service-worker.js'] ServiceWorker文件路径
   */
  constructor(options = {}) {
    this.options = Object.assign(
      {
        serverUrl: SERVER_URL,
        serviceWorkerPath: "/service-worker.js",
        onSuccess: () => {},
        onError: () => {},
      },
      options,
    );

    this.swRegistration = null;
    this.userId = options.userId || "";
    this.publicKey = null;
  }

  /**
   * 检查浏览器是否支持推送通知
   * @returns {boolean} 是否支持
   */
  isPushSupported() {
    return "serviceWorker" in navigator && "PushManager" in window;
  }

  /**
   * 初始化推送通知
   * @returns {Promise} 初始化结果
   */
  async init() {
    if (!this.isPushSupported()) {
      const error = new Error("当前浏览器不支持推送通知");
      this.options.onError(error);
      return Promise.reject(error);
    }

    try {
      // 注册ServiceWorker
      this.swRegistration = await navigator.serviceWorker.register(
        this.options.serviceWorkerPath,
      );
      console.log("ServiceWorker注册成功:", this.swRegistration);

      // 获取服务器公钥
      await this.getPublicKey();

      return this.swRegistration;
    } catch (error) {
      console.error("初始化推送通知失败:", error);
      this.options.onError(error);
      return Promise.reject(error);
    }
  }

  /**
   * 获取服务器公钥
   * @returns {Promise<string>} 公钥
   */
  async getPublicKey() {
    try {
      const response = await fetch(
        `${this.options.serverUrl}/api/vapid-public-key`,
      );
      const data = await response.json();
      this.publicKey = data.publicKey;
      return this.publicKey;
    } catch (error) {
      console.error("获取公钥失败:", error);
      throw error;
    }
  }

  /**
   * 将Base64字符串转换为Uint8Array
   * @param {string} base64String Base64字符串
   * @returns {Uint8Array} 转换结果
   */
  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * 订阅推送通知
   * @returns {Promise} 订阅结果
   */
  async subscribe() {
    try {
      if (!this.swRegistration) {
        await this.init();
      }

      if (!this.publicKey) {
        await this.getPublicKey();
      }

      // 检查是否已经订阅
      const subscription =
        await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        console.log("已存在订阅，正在更新...");
        await subscription.unsubscribe();
      }

      // 创建新订阅
      const newSubscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicKey),
      });

      console.log("创建订阅成功:", newSubscription);

      // 将订阅信息发送到服务器
      const response = await fetch(`${this.options.serverUrl}/api/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: newSubscription,
          userId: this.userId,
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        // 如果服务器返回了userId，保存它
        if (responseData.userId) {
          this.userId = responseData.userId;
        }

        console.log("订阅信息已发送到服务器");
        this.options.onSuccess(newSubscription, this.userId);
        return { subscription: newSubscription, userId: this.userId };
      } else {
        throw new Error("服务器处理订阅失败");
      }
    } catch (error) {
      console.error("订阅推送通知失败:", error);
      this.options.onError(error);
      return Promise.reject(error);
    }
  }

  /**
   * 取消订阅
   * @returns {Promise} 取消订阅结果
   */
  async unsubscribe() {
    try {
      if (!this.swRegistration) {
        throw new Error("ServiceWorker未注册");
      }

      const subscription =
        await this.swRegistration.pushManager.getSubscription();
      if (!subscription) {
        return { success: true, message: "没有活跃的订阅" };
      }

      // 从服务器删除订阅
      const response = await fetch(
        `${this.options.serverUrl}/api/unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            userId: this.userId,
          }),
        },
      );

      // 从浏览器取消订阅
      await subscription.unsubscribe();
      console.log("已取消订阅");

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("取消订阅失败:", error);
      this.options.onError(error);
      return Promise.reject(error);
    }
  }

  /**
   * 检查是否已订阅
   * @returns {Promise<boolean>} 是否已订阅
   */
  async isSubscribed() {
    if (!this.swRegistration) {
      try {
        await this.init();
      } catch (error) {
        return false;
      }
    }

    const subscription =
      await this.swRegistration.pushManager.getSubscription();
    return !!subscription;
  }

  /**
   * 获取当前订阅
   * @returns {Promise<PushSubscription|null>} 订阅对象
   */
  async getSubscription() {
    if (!this.swRegistration) {
      try {
        await this.init();
      } catch (error) {
        return null;
      }
    }

    return this.swRegistration.pushManager.getSubscription();
  }
}

// 在浏览器环境中使用的示例
/*
document.addEventListener('DOMContentLoaded', async () => {
  // 创建推送通知客户端实例
  const pushClient = new PushNotificationClient({
    serverUrl: 'http://localhost:3000',
    userId: 'user123', // 可选，用户ID
    
    // 订阅成功回调
    onSuccess: (subscription, userId) => {
      console.log('推送通知订阅成功:', subscription);
      console.log('用户ID:', userId);
      updateSubscriptionStatus('已订阅');
    },
    
    // 错误处理回调
    onError: (error) => {
      console.error('推送通知错误:', error);
      updateSubscriptionStatus('订阅失败: ' + error.message);
    }
  });
  
  // 检查浏览器支持
  if (!pushClient.isPushSupported()) {
    console.error('当前浏览器不支持推送通知');
    updateSubscriptionStatus('浏览器不支持推送通知');
    return;
  }
  
  // 初始化
  await pushClient.init();
  
  // 检查是否已订阅
  const isSubscribed = await pushClient.isSubscribed();
  updateSubscriptionStatus(isSubscribed ? '已订阅' : '未订阅');
  
  // 订阅按钮点击事件
  document.getElementById('subscribeButton').addEventListener('click', async () => {
    try {
      await pushClient.subscribe();
    } catch (error) {
      console.error('订阅失败:', error);
    }
  });
  
  // 取消订阅按钮点击事件
  document.getElementById('unsubscribeButton').addEventListener('click', async () => {
    try {
      const result = await pushClient.unsubscribe();
      console.log('取消订阅结果:', result);
      updateSubscriptionStatus('未订阅');
    } catch (error) {
      console.error('取消订阅失败:', error);
    }
  });
  
  // 更新订阅状态UI
  function updateSubscriptionStatus(status) {
    document.getElementById('subscriptionStatus').textContent = status;
  }
});
*/

// 在UniApp中使用的示例
/*
export default {
  data() {
    return {
      pushClient: null,
      isSubscribed: false,
      userId: ''
    };
  },
  
  onLoad() {
    // 获取用户ID，可以从登录信息中获取
    this.userId = uni.getStorageSync('userId') || '';
    
    // 初始化推送客户端
    this.initPushClient();
  },
  
  methods: {
    async initPushClient() {
      // 创建推送通知客户端实例
      this.pushClient = new PushNotificationClient({
        serverUrl: 'http://your-server-url:3000',
        userId: this.userId,
        
        onSuccess: (subscription, userId) => {
          console.log('推送通知订阅成功');
          this.isSubscribed = true;
          this.userId = userId;
          
          // 保存用户ID
          uni.setStorageSync('userId', userId);
          
          uni.showToast({
            title: '订阅推送成功',
            icon: 'success'
          });
        },
        
        onError: (error) => {
          console.error('推送通知错误:', error);
          
          uni.showToast({
            title: '订阅推送失败',
            icon: 'none'
          });
        }
      });
      
      // 检查浏览器支持
      if (!this.pushClient.isPushSupported()) {
        uni.showToast({
          title: '当前环境不支持推送通知',
          icon: 'none'
        });
        return;
      }
      
      // 初始化
      await this.pushClient.init();
      
      // 检查是否已订阅
      this.isSubscribed = await this.pushClient.isSubscribed();
    },
    
    async subscribe() {
      if (!this.pushClient) return;
      
      try {
        await this.pushClient.subscribe();
      } catch (error) {
        console.error('订阅失败:', error);
      }
    },
    
    async unsubscribe() {
      if (!this.pushClient) return;
      
      try {
        const result = await this.pushClient.unsubscribe();
        console.log('取消订阅结果:', result);
        this.isSubscribed = false;
        
        uni.showToast({
          title: '已取消订阅',
          icon: 'success'
        });
      } catch (error) {
        console.error('取消订阅失败:', error);
      }
    }
  }
};
*/

// 导出客户端类，以便在其他文件中使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = PushNotificationClient;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return PushNotificationClient;
  });
} else if (typeof window !== "undefined") {
  window.PushNotificationClient = PushNotificationClient;
}
