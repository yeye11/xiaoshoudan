# 项目打包信息汇总 
 
 
 本文档汇总了 **靓仔的app**  (`com.renteng.sales`) 的打包配置、命令、产物路径及常见问题修复方法。 
 
 
 ## 1. 基础信息 
 
 
 | 项目 | 内容 | 备注 | 
 | :--- | :--- | :--- | 
 | **应用名称**  | 靓仔的app | | 
 | **包名 (Package ID)**  | `com.renteng.sales` | 定义在 `tauri.conf.json` | 
 | **版本**  | 1.0.0 | | 
 | **框架**  | Tauri (SvelteKit + Rust) | | 
 
 
 ## 2. Android 打包与发布 
 
 
 ### 2.1 签名配置 (已配置) 
 
 
 项目已配置自动签名，使用根目录下的密钥库文件。 
 
 
 - **Keystore 文件** : `release.keystore` (位于项目根目录) 
 - **Key Alias (别名)** : `cypridina` 
 - **Password** : `123456` (Store Password 和 Key Password 相同) 
 - **配置原理** : `build.gradle.kts` 脚本会自动检测根目录的 `release.keystore` 文件并应用签名配置。 
 
 
 ### 2.2 构建命令 
 
 
 确保在项目根目录下运行以下命令： 
 
 
 **构建 Release 版本 (正式版)** 
 ```bash 
 npm run android:build 
 ``` 
 > 此命令会生成已签名的 APK 和 AAB 文件。 
 
 
 **构建 Debug 版本 (调试版)** 
 ```bash 
 npm run android:build -- --debug 
 ``` 
 
 
 ### 2.3 构建产物路径 
 
 
 构建完成后，文件位于以下路径 (相对于项目根目录)： 
 
 
 - **Universal APK (通用架构)** : 
   `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk` 
   > 包含所有支持的架构 (arm64, armeabi-v7a, x86, x86_64)，体积较大但兼容性最好。 
 
 
 - **App Bundle (AAB)** : 
   `src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab` 
   > 用于上传 Google Play Store。 
 
 
 ### 2.4 安装与部署 
 
 
 **连接远程 ADB 设备** 
 ```bash 
 adb connect 192.168.31.14:5555 
 ``` 
 
 
 **覆盖安装 Release APK** 
 ```bash 
 adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk 
 ``` 
 
 
 ## 3. macOS 桌面打包 
 
 
 ### 3.1 构建命令 
 ```bash 
 npm run tauri:build 
 ``` 
 
 
 ### 3.2 产物路径 
 - **DMG 安装包** : `src-tauri/target/release/bundle/dmg/` 
 - **App 应用程序** : `src-tauri/target/release/bundle/macos/` 
 
 
 ## 4. 常见问题与故障排除 
 
 
 ### 4.1 `@tauri-apps/cli` 依赖模块丢失 
 **症状** : 构建时报错 `Cannot find module '@tauri-apps/cli-darwin-universal'` 或类似错误。 
 **原因** : npm 依赖安装不完整或平台特定包缺失。 
 **解决方案** : 
 ```bash 
 # 1. 清理并重新安装基础依赖 
 rm -rf node_modules package-lock.json 
 npm install 
 
 
 # 2. (可选) 强制安装平台特定包 
 npm install --save-dev @tauri-apps/cli-darwin-x64 @tauri-apps/cli-darwin-arm64 
 ``` 
 
 
 ### 4.2 Gradle 构建失败 
 **症状** : Android 构建过程中 Gradle 报错。 
 **解决方案** : 
 进入 Android 项目目录手动运行 Gradle 以获取详细日志： 
 ```bash 
 cd src-tauri/gen/android 
 chmod +x gradlew 
 ./gradlew assembleRelease --info 
 ``` 
 
 
 ### 4.3 签名文件未找到 
 **症状** : 报错 `未找到发布签名文件`。 
 **解决方案** : 
 确保 `release.keystore` 文件存在于项目根目录 `/Users/zdp/Documents/GitHub/baojiadan/` 下。如果丢失，请参考 `SIGNING_INFO.md` 重新生成。 
