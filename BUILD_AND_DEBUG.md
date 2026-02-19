# 📱 Android APK 打包和远程调试指南

## 🔧 环境准备

### 1. 安装 Android 开发环境

#### 安装 Android Studio
1. 下载 Android Studio: https://developer.android.com/studio
2. 安装并打开 Android Studio
3. 安装 Android SDK 和 NDK

#### 配置环境变量（Mac）
```bash
# 编辑 ~/.zshrc 或 ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export NDK_HOME=$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk)
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

#### 应用环境变量
```bash
source ~/.zshrc  # 或 source ~/.bash_profile
```

#### 验证安装
```bash
adb --version
```

### 2. 安装 Rust Android 目标

```bash
# 添加 Android 目标
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add i686-linux-android
rustup target add x86_64-linux-android
```

### 3. 安装 Tauri CLI（如果还没有）

```bash
cargo install tauri-cli
```

## 📦 打包 APK

### 方法1: 开发版 APK（推荐用于调试）

```bash
# 在项目根目录执行
npm run tauri android dev
```

这会：
1. 构建前端代码
2. 生成 Android 项目
3. 编译 APK
4. 自动安装到连接的设备（如果有）

### 方法2: 发布版 APK

```bash
# 构建发布版
npm run tauri android build
```

生成的 APK 位置：
```
src-tauri/gen/android/app/build/outputs/apk/
```

### 方法3: 仅初始化 Android 项目

```bash
# 首次需要初始化
npm run tauri android init
```

## 📱 安装 APK 到手机

### 方法1: 通过 USB 安装（推荐）

```bash
# 1. 连接手机到电脑（USB 线）
# 2. 手机启用 USB 调试
# 3. 执行安装命令

adb install src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk
```

### 方法2: 通过文件传输

1. 将 APK 文件传输到手机
2. 在手机上打开文件管理器
3. 点击 APK 文件安装
4. 允许"未知来源"安装

## 🔍 远程调试

### 步骤1: 准备手机

1. **启用开发者选项**
   - 设置 → 关于手机 → 连续点击"版本号" 7次

2. **启用 USB 调试**
   - 设置 → 开发者选项 → USB 调试（开启）

3. **连接手机到电脑**
   - 使用 USB 数据线连接
   - 手机上点击"允许 USB 调试"

### 步骤2: 验证连接

```bash
# 查看连接的设备
adb devices

# 应该显示类似：
# List of devices attached
# XXXXXXXXXX    device
```

### 步骤3: 启动应用并调试

#### 在 Chrome 中调试

1. 打开 Chrome 浏览器
2. 访问：`chrome://inspect#devices`
3. 确保勾选 **Discover USB devices**
4. 在手机上打开应用
5. 在 Chrome 中会看到应用的 WebView
6. 点击 **inspect** 打开开发者工具

#### 查看日志

```bash
# 实时查看应用日志
adb logcat | grep -i "renteng"

# 或者查看所有日志
adb logcat
```

### 步骤4: 调试打印功能

1. 在 Chrome DevTools 中打开 **Console** 标签
2. 在应用中进入销售单详情页面
3. 点击 **🔍 调试信息** 查看状态
4. 点击 **打印/保存PDF** 按钮
5. 在 Console 中查看所有日志输出（🖨️ 开头的）

## 🐛 常见问题

### 问题1: adb 命令找不到

**解决**:
```bash
# 检查 Android SDK 是否安装
ls ~/Library/Android/sdk

# 重新配置环境变量
export PATH=$PATH:~/Library/Android/sdk/platform-tools
```

### 问题2: 设备未授权

**症状**: `adb devices` 显示 `unauthorized`

**解决**:
1. 在手机上撤销 USB 调试授权
2. 重新连接 USB
3. 在手机上点击"允许"

### 问题3: 无法安装 APK

**症状**: 安装失败或提示"未知来源"

**解决**:
1. 设置 → 安全 → 允许未知来源
2. 或者在安装时点击"设置" → 允许此来源

### 问题4: Chrome 中看不到设备

**解决**:
1. 确保 USB 调试已启用
2. 重新插拔 USB 线
3. 在 Chrome 中刷新 `chrome://inspect` 页面
4. 确保应用正在运行

### 问题5: WebView 调试未启用

**解决**:
在 Tauri 配置中启用调试模式（开发版自动启用）

## 📝 快速调试流程

### 完整流程（首次）

```bash
# 1. 初始化 Android 项目
npm run tauri android init

# 2. 连接手机并启用 USB 调试

# 3. 验证连接
adb devices

# 4. 构建并安装
npm run tauri android dev

# 5. 在 Chrome 中打开调试
# 访问 chrome://inspect#devices

# 6. 在应用中测试打印功能

# 7. 查看 Console 日志
```

### 后续调试（已有 APK）

```bash
# 1. 确保手机已连接
adb devices

# 2. 重新构建并安装
npm run tauri android dev

# 3. 在 Chrome 中调试
# chrome://inspect#devices
```

## 🎯 调试打印功能的关键点

### 在 Chrome DevTools Console 中查找：

1. **页面加载日志**
   ```
   📱 页面加载完成
   📍 invoiceContainer: ...
   📍 contentRef: ...
   ```

2. **打印开始日志**
   ```
   🖨️ handlePrint 开始
   📍 contentRef: ...
   📍 invoiceContainer: ...
   ```

3. **打印过程日志**
   ```
   ✅ 找到打印目标: ...
   📏 目标尺寸: ...
   📋 开始克隆目标元素...
   🔧 移除 transform 样式...
   ✅ overlay 已添加到 body
   🖨️ 调用 window.print()...
   ```

4. **错误日志**
   ```
   ❌ 打印目标元素未找到
   ❌ window.print() 调用失败
   ```

### 在应用中查看调试信息

1. 打开销售单详情页面
2. 向下滚动到底部
3. 点击 **🔍 调试信息**
4. 截图保存所有信息

## 💡 提示

1. **开发版 vs 发布版**
   - 开发版：包含调试信息，体积较大，可以远程调试
   - 发布版：优化过的，体积小，但不能调试

2. **保持 USB 连接**
   - 调试时保持 USB 连接
   - 不要断开连接

3. **查看完整日志**
   - 在 Console 中勾选 "Preserve log"
   - 这样切换页面时日志不会丢失

4. **网络调试**
   - 在 Network 标签可以查看网络请求
   - 在 Application 标签可以查看 localStorage

## 📊 需要收集的调试信息

测试后，请提供：

1. **Chrome DevTools Console 的完整日志**
   - 从打开页面到点击打印的所有日志
   - 特别是 🖨️ 开头的日志

2. **调试面板的截图**
   - 显示所有元素的状态

3. **错误信息**
   - 任何红色的错误信息
   - 弹窗提示的内容

4. **设备信息**
   - 手机型号
   - Android 版本
   - Chrome 版本（在应用中使用的 WebView 版本）

5. **实际表现**
   - 点击打印按钮后发生了什么
   - 是否有打印对话框
   - 打印预览是否正确

