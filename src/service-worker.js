// static/service-worker.js

const CACHE_NAME = "timely-exchange-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/assets/001.ec3e71bc.jpg",
  "/assets/002.62e05cac.jpg",
  "/assets/003.cc084fb7.jpg",
  "/assets/004.7e23c792.jpg",
  "/assets/005.83d13ec7.jpg",
  "/assets/006.073b9fef.jpg",
  "/assets/007.b25c4f84.jpg",
  "/assets/008.fac2371f.jpg",
  "/assets/009.a47c52b9.jpg",
  "/assets/010.3b887547.jpg",
  "/assets/011.3de0b03d.jpg",
  "/assets/012.12ac9f5a.jpg",
  "/assets/013.bedfbf76.jpg",
  "/assets/014.915c87e5.jpg",
  "/assets/015.9acd67f9.jpg",
  "/assets/016.49137f2c.jpg",
  "/assets/017.381593c8.jpg",
  "/assets/018.282a92d7.jpg",
  "/assets/019.71aff4b2.jpg",
  "/assets/020.c7ffbf0c.jpg",
  "/assets/021.a33db138.jpg",
  "/assets/022.05fb7e4f.jpg",
  "/assets/023.9a884d3c.jpg",
  "/assets/024.58dfeeef.jpg",
  "/assets/025.330368a8.jpg",
  "/assets/screenshot1.png",
  "/assets/screenshot2.png",
  "/assets/uniicons.2579c7da.ttf",
  "/assets/uvicons.f0fbf8a0.ttf",
  "/assets/zhenggui.e011c752.png",
  "/static/38day.png",
  "/static/38day1.png",
  "/static/38day2.png",
  "/static/434.png",
  "/static/881714294947841.png",
  "/static/881714294947841_jiushui.png",
  "/static/881714298093568.png",
  "/static/881714298093568_jiushui.png",
  "/static/abouts.png",
  "/static/apple-touch-icon.png",
  "/static/badge-mbl.png",
  "/static/badge-txlh.png",
  "/static/banner-mbl.png",
  "/static/banner-txlh.png",
  "/static/baozhang.png",
  "/static/btn2.png",
  "/static/btn3.gif",
  "/static/btn4.png",
  "/static/btn5.png",
  "/static/daifahuo@2x.c7383769.png",
  "/static/daifukuan@2x.e7e85c00.png",
  "/static/daishouhou@2x.ccb0d2e6.png",
  "/static/daishouhuo@2x.87ad262b.png",
  "/static/dui.png",
  "/static/duihaoico.png",
  "/static/expire_icon.png",
  "/static/fangxingou.png",
  "/static/favicon.ico",
  "/static/favicon.png",
  "/static/fdj_ico.png",
  "/static/fireworks.gif",
  "/static/fonts/iconfont.1b2a8133.ttf",
  "/static/fonts/iconfont.67e8f6eb.woff2",
  "/static/fonts/iconfont.915d46ea.woff",
  "/static/fonts/iconfont3/iconfont..ttf",
  "/static/fonts/iconfont3/iconfont.woff",
  "/static/fonts/iconfont3/iconfont.woff2",
  "/static/gg_ico.png",
  "/static/header_icon1.jpg",
  "/static/header_icon2.jpg",
  "/static/header_icon3.jpg",
  "/static/header_icon4.jpg",
  "/static/header_icon5.jpg",
  "/static/header_rank - 副本.png",
  "/static/header_rank.png",
  "/static/header_rank1.png",
  "/static/hot.png",
  "/static/hotbang.png",
  "/static/hottitle.png",
  "/static/hot_icon.png",
  "/static/hr_ico.png",
  "/static/icon-192-maskable.png",
  "/static/icon-192.png",
  "/static/icon-512-maskable.png",
  "/static/icon-512.png",
  "/static/icon_close.png",
  "/static/icon_edit.png",
  "/static/icon_promise.png",
  "/static/icon_star.png",
  "/static/image/icon/machine1.png",
  "/static/image/icon/machine2.png",
  "/static/image/icon/merchant.png",
  "/static/image/icon/mine1.png",
  "/static/image/icon/mine2.png",
  "/static/image/icon/promotion1.png",
  "/static/image/icon/promotion2.png",
  "/static/image/icon/shouye1.png",
  "/static/image/icon/shouye2.png",
  "/static/image/icon2/1.jpg",
  "/static/image/icon2/2.jpg",
  "/static/image/icon2/3.jpg",
  "/static/image/icon2/4.jpg",
  "/static/image/icon2/5.jpg",
  "/static/image/icon2/6.jpg",
  "/static/img/880841921658880.png",
  "/static/img/889122864496642.png",
  "/static/img/897094253543424.png",
  "/static/img/897094253543424_jiushui.png",
  "/static/img/897094253543425.png",
  "/static/img/897094253543425_jiushui.png",
  "/static/img/900913539579944.png",
  "/static/img/900913539579944_jiushui.png",
  "/static/img/908146465308674.png",
  "/static/img/announcementIcon.png",
  "/static/img/bg_notfound.1c3a076b.png",
  "/static/img/card-bg.b9344fee.png",
  "/static/img/dingdan.d68a8cd6.png",
  "/static/img/down.png",
  "/static/img/head_bg.e138cc8c.png",
  "/static/img/icon-choose.681bc9b1.png",
  "/static/img/icon-shield.815bb803.png",
  "/static/img/laba02.gif",
  "/static/img/money.d519bdec.png",
  "/static/img/point@2x.4d940eda.png",
  "/static/img/prevIcon.png",
  "/static/img/usercenter-bg@2x.c670481b.png",
  "/static/img/vipicon.png",
  "/static/index.2da1efab.css",
  "/static/inte-banner.jpg",
  "/static/inte-banner1.png",
  "/static/inte-banner2.jpg",
  "/static/jiayou.GIF",
  "/static/jifen.png",
  "/static/js/chunk-vendors.a2e60975.js",
  "/static/js/index.f67d1547.js",
  "/static/js/pages-detail-index.cc832d73.js",
  "/static/js/pages-detail-index~pages-detail-payinfo~pages-detail-paysuccess~pages-index-index~pages-invest-index~5cdfedc4.4056e17b.js",
  "/static/js/pages-detail-index~pages-detail-payinfo~pages-order-info.b7852d56.js",
  "/static/js/pages-detail-index~pages-detail-paysuccess~pages-index-index~pages-invest-index~pages-order-index~pa~a1f2ad7c.e036c1c7.js",
  "/static/js/pages-detail-index~pages-index-index~pages-invest-index~pages-order-index~pages-rank-index~pages-sea~248104e0.6884b1fd.js",
  "/static/js/pages-detail-payinfo.e1057190.js",
  "/static/js/pages-detail-paysuccess.b99b05da.js",
  "/static/js/pages-feedback-index.aee96b33.js",
  "/static/js/pages-index-index.0d43c551.js",
  "/static/js/pages-index-index~pages-invest-index~pages-order-index~pages-rank-index~pages-searchorder-index~page~7e63c056.f67f4c4b.js",
  "/static/js/pages-invest-index.64cbe4de.js",
  "/static/js/pages-kefu-index.960c4dab.js",
  "/static/js/pages-order-after-sales-his.016bb726.js",
  "/static/js/pages-order-index.4841abd2.js",
  "/static/js/pages-order-info.524954a0.js",
  "/static/js/pages-order-info~pages-order-shouhou.8d3873b4.js",
  "/static/js/pages-order-logistics.c71ad68e.js",
  "/static/js/pages-order-shouhou.69ea62a8.js",
  "/static/js/pages-promotions-rebate-index.e2d6708d.js",
  "/static/js/pages-promotions-rebate-index~pages-promotions-seckill-index~pages-promotions-zone-index~pages-rank-index.95cd39aa.js",
  "/static/js/pages-promotions-seckill-index.54734969.js",
  "/static/js/pages-promotions-zone-index.945fe623.js",
  "/static/js/pages-rank-index.623949cc.js",
  "/static/js/pages-search-search.6ea771bb.js",
  "/static/js/pages-searchorder-index.f7f27cb7.js",
  "/static/js/pages-signin-index.db05806c.js",
  "/static/js/pages-user-approve.b00d6d8e.js",
  "/static/js/pages-user-article.d2519c21.js",
  "/static/js/pages-user-index.bf5799bb.js",
  "/static/kefu11.png",
  "/static/kfrx.png",
  "/static/labag.png",
  "/static/labas.png",
  "/static/linepoint.png",
  "/static/lingqu.png",
  "/static/medal_other.png",
  "/static/medal_top1.png",
  "/static/medal_top2.png",
  "/static/medal_top3.png",
  "/static/mine_bg.png",
  "/static/nav/nav_ico1.png",
  "/static/nav/nav_ico10.png",
  "/static/nav/nav_ico2.png",
  "/static/nav/nav_ico3.png",
  "/static/nav/nav_ico4.png",
  "/static/nav/nav_ico5.png",
  "/static/nav/nav_ico6.png",
  "/static/nav/nav_ico7.png",
  "/static/nav/nav_ico8.png",
  "/static/nav/nav_ico9.png",
  "/static/new_goods.png",
  "/static/orderProtect.png",
  "/static/point@2x.4d940eda.png",
  "/static/q1-ico.png",
  "/static/rank.png",
  "/static/rank_bg.png",
  "/static/rank_bg_red.png",
  "/static/rebate-banner1.png",
  "/static/rebate-banner2.jpg",
  "/static/recommend_bg.png",
  "/static/redhong.png",
  "/static/seckill-banner1.jpg",
  "/static/seckill-banner1_jiushui.jpg",
  "/static/seckill-banner2.jpg",
  "/static/split-line.png",
  "/static/superdeal.png",
  "/static/szgchw/881714277646336.jfif",
  "/static/szgchw/881714277646337.jfif",
  "/static/szgchw/881714277646339.jfif",
  "/static/szgchw/881714277646340.jfif",
  "/static/szgchw/881714277646341.jfif",
  "/static/szgchw/884094779523072.png",
  "/static/szgchw/892337805328384.png",
  "/static/szgchw/892337805328385.png",
  "/static/szgchw/892337805328386.png",
  "/static/szgchw/892337805328387.png",
  "/static/szgchw/892337805328388.png",
  "/static/szgchw/896063144722432.png",
  "/static/tab-active-line.png",
  "/static/tabBar/900871124156416.png",
  "/static/tabBar/907738517864449.png",
  "/static/tabBar/pointscenter@2x.2d01004a.png",
  "/static/tabBar/tab1.png",
  "/static/tabBar/tab1_active.png",
  "/static/tabBar/tab2.png",
  "/static/tabBar/tab2_active.png",
  "/static/tabBar/tab3.png",
  "/static/tabBar/tab3_active.png",
  "/static/tabBar/tab4.png",
  "/static/tabBar/tab4_active.png",
  "/static/tabBar/tab5.png",
  "/static/tabBar/tab5_active.png",
  "/static/tabBar/tab_01.png",
  "/static/tabBar/tab_02.png",
  "/static/tabBar/tab_03.png",
  "/static/tabBar/tab_04.png",
  "/static/tabBar/tab_05.png",
  "/static/tabBar/tab_06.png",
  "/static/tabBar/tab_07.png",
  "/static/tabBar/tab_08.png",
  "/static/tabBar/tab_09.png",
  "/static/tabBar/tab_10.png",
  "/static/userPhoto.fb3aff37.png",
  "/static/vipicon.png",
  "/static/wntj_title.png",
  "/static/wx_pay.png",
  "/static/xsqg_title.png",
  "/static/yanxuansafe1.png",
  "/static/ye_pay.png",
  "/static/yjfk.png",
  "/static/ysxys.png",
  "/static/zan.png",
  "/static/zfb_pay.png",
];

// 安装阶段，缓存静态资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// 激活阶段，清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// 拦截请求，优先缓存
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const method = event.request.method;

  // 只处理 HTTP/HTTPS 请求
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 对POST请求不进行缓存，直接使用网络请求
  if (method === "POST") {
    event.respondWith(fetch(event.request));
    return;
  }

  // 区分 API 请求和静态资源
  const isAPIRequest = url.includes("/api/");

  if (isAPIRequest) {
    // API 请求使用网络优先策略
    event.respondWith(networkFirst(event.request));
  } else {
    // 静态资源使用缓存优先策略
    event.respondWith(cacheFirst(event.request));
  }
});

// 缓存优先策略
function cacheFirst(request) {
  return caches
    .match(request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        console.log("Service Worker: Found in cache", request.url);
        return cachedResponse;
      }
      return fetchAndCache(request);
    })
    .catch(() => {
      // 提供离线回退页面或资源
    });
}

// 网络优先策略
function networkFirst(request) {
  return fetchAndCache(request).catch(() => {
    return caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("Service Worker: Found in cache", request.url);
        return cachedResponse;
      }
    });
  });
}

// 获取并缓存响应
function fetchAndCache(request) {
  return fetch(request).then((response) => {
    // 检查响应是否有效且可缓存
    if (response.ok) {
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        // 考虑缓存控制头
        const headers = response.headers;
        if (!headers.get("no-store") && !headers.get("no-cache")) {
          cache.put(request, responseToCache);
        }
      });
    }
    return response;
  });
}

// 可选：监听消息，实现跳过等待等高级功能
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 处理推送消息
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    console.log("Service Worker: 收到推送消息", data);

    const options = {
      body: data.body || "您有一条新消息",
      icon: data.icon || "/static/favicon.png",
      badge: data.badge || "/static/favicon.png",
      data: data.data || {},
      tag: data.tag || "default-tag",
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "新消息通知", options),
    );
  } catch (err) {
    console.error("Service Worker: 推送消息处理失败", err);

    // 如果数据不是JSON格式，尝试以文本形式显示
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("新消息通知", {
        body: text,
        icon: "/static/favicon.png",
      }),
    );
  }
});

// 处理通知点击事件
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: 通知被点击", event.notification.tag);

  event.notification.close();

  // 处理通知点击，打开相应页面
  const urlToOpen = event.notification.data.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // 检查是否已有打开的窗口
      for (let client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // 如果没有打开的窗口，则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});

// 处理推送订阅更改
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("Service Worker: 推送订阅已更改");

  // 这里可以实现订阅更新的逻辑
  // 通常需要向服务器发送新的订阅信息
  event.waitUntil(
    // 这里应该发送新的订阅信息到你的服务器
    // 示例代码：
    // fetch('/api/update-subscription', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event.newSubscription)
    // })
    Promise.resolve(),
  );
});
