const fs = require("fs");
const path = require("path");

const swPath = path.join(__dirname, "../public/service-worker.js");
const targetDir = path.join(__dirname, "../unpackage/dist/build/web");
const targetSwPath = path.join(targetDir, "service-worker.js");
const assetsDirs = [
  "unpackage/dist/build/web/assets",
  "unpackage/dist/build/web/static",
];

// 需要复制的额外文件列表
const additionalFiles = [
  {
    src: path.join(__dirname, "../manifest.json"),
    dest: path.join(targetDir, "manifest.json"),
  },
  {
    src: path.join(__dirname, "../screenshot1.png"),
    dest: path.join(targetDir, "screenshot1.png"),
  },
  {
    src: path.join(__dirname, "../screenshot2.png"),
    dest: path.join(targetDir, "screenshot2.png"),
  },
];

// 递归获取所有文件
function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      results.push(filePath.replace(/\\/g, "/"));
    }
  });
  return results;
}

// 获取所有静态资源路径
let allFiles = [];
assetsDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(getAllFiles(dir));
  }
});
const urlPaths = allFiles.map(
  (f) =>
    "/" +
    f
      .replace(/^unpackage\/dist\/build\/web\//, "")
      .replace(/^unpackage\/dist\/build\/web\//, ""),
);

// 读取 service-worker.js
let swContent = fs.readFileSync(swPath, "utf-8");

// 匹配 urlsToCache 数组
const urlsToCacheReg = /const urlsToCache = \[[\s\S]*?\];/m;
const newUrlsToCache = `const urlsToCache = [\n  "/",\n  "/index.html",\n  ${urlPaths.map((f) => `"${f}"`).join(",\n  ")}\n];`;

// 替换内容
if (urlsToCacheReg.test(swContent)) {
  swContent = swContent.replace(urlsToCacheReg, newUrlsToCache);
  fs.writeFileSync(swPath, swContent, "utf-8");
  console.log("urlsToCache 已自动更新");

  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 复制 service-worker.js 到构建目录
  fs.copyFileSync(swPath, targetSwPath);
  console.log(`service-worker.js 已复制到 ${targetSwPath}`);

  // 复制额外文件到构建目录
  additionalFiles.forEach((file) => {
    try {
      if (fs.existsSync(file.src)) {
        fs.copyFileSync(file.src, file.dest);
        console.log(`${path.basename(file.src)} 已复制到 ${file.dest}`);
      } else {
        console.warn(`警告: 源文件 ${file.src} 不存在，无法复制`);
      }
    } catch (err) {
      console.error(`复制 ${path.basename(file.src)} 时出错:`, err);
    }
  });
} else {
  console.error("未找到 urlsToCache 数组，请检查 service-worker.js 格式");
}
