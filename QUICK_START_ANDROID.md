# 🚀 Android 调试快速开始

## ⚡ 最快的调试方法

### 1️⃣ 连接手机
```bash
# 用 USB 线连接手机到电脑
# 在手机上启用 USB 调试（设置 → 开发者选项 → USB 调试）

# 验证连接
adb devices
```

### 2️⃣ 首次构建（只需一次）
```bash
# 初始化 Android 项目
npm run android:init

# 构建并安装到手机
npm run android:dev
```

### 3️⃣ 在 Chrome 中调试
1. 打开 Chrome 浏览器
2. 访问：`chrome://inspect#devices`
3. 在手机上打开应用
4. 在 Chrome 中点击 **inspect**

### 4️⃣ 测试打印功能
1. 在应用中进入销售单详情页面
2. 点击 **🔍 调试信息** 查看状态
3. 点击 **打印/保存PDF** 按钮
4. 在 Chrome DevTools Console 中查看日志

---

## 📋 可用的命令

```bash
# 初始化 Android 项目（首次需要）
npm run android:init

# 开发模式（自动安装到手机）
npm run android:dev

# 构建发布版 APK
npm run android:build

# 手动安装 APK
npm run android:install

# 查看应用日志
npm run android:logcat

# 查看所有连接的设备
adb devices

# 卸载应用
adb uninstall com.renteng.sales
```

---

## 🔍 调试步骤

### 在 Chrome DevTools 中：

1. **打开 Console 标签**
2. **勾选 "Preserve log"**（保留日志）
3. **在应用中操作**
4. **查看日志输出**

### 查找关键日志：

```
📱 页面加载完成
🖨️ handlePrint 开始
📍 contentRef: HTMLDivElement
📍 invoiceContainer: HTMLDivElement
✅ 找到打印目标
📏 目标尺寸: DOMRect {...}
📋 开始克隆目标元素...
🔧 移除 transform 样式...
✅ overlay 已添加到 body
🎨 添加打印样式类
🖨️ 调用 window.print()...
✅ window.print() 调用成功
```

### 如果有错误：

```
❌ 打印目标元素未找到
❌ window.print() 调用失败: ...
```

---

## 🐛 常见问题快速解决

### 问题：adb 命令找不到
```bash
# 安装 Android SDK platform-tools
brew install android-platform-tools

# 或者配置环境变量
export PATH=$PATH:~/Library/Android/sdk/platform-tools
```

### 问题：设备显示 unauthorized
```bash
# 1. 在手机上撤销 USB 调试授权
# 2. 重新连接 USB
# 3. 在手机上点击"允许"
```

### 问题：Chrome 中看不到设备
```bash
# 1. 确保应用正在运行
# 2. 刷新 chrome://inspect 页面
# 3. 重新插拔 USB 线
```

### 问题：构建失败
```bash
# 清理并重新构建
cd src-tauri
cargo clean
cd ..
npm run android:dev
```

---

## 📊 需要的调试信息

测试后，请提供：

### 1. Chrome DevTools Console 日志
- 完整的控制台输出
- 特别是 🖨️ 和 ❌ 开头的日志

### 2. 调试面板截图
- 点击 🔍 调试信息后的截图

### 3. 错误信息
- 任何红色错误
- 弹窗提示内容

### 4. 设备信息
```bash
# 在 Chrome DevTools Console 中执行：
console.log(navigator.userAgent);
```

---

## 💡 提示

1. **保持 USB 连接**：调试时不要断开 USB
2. **保留日志**：在 Console 中勾选 "Preserve log"
3. **清除缓存**：如果有问题，在 Application → Storage → Clear site data
4. **查看网络**：在 Network 标签可以看到资源加载情况

---

## 🎯 下一步

根据调试结果，我会：
1. 分析 `window.print()` 在 Android WebView 中的支持情况
2. 如果不支持，实现替代方案（PDF 生成或图片导出）
3. 优化移动端打印体验

