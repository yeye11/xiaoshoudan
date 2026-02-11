# 靓仔的app（Cypridina Client）项目总文档

本文件是项目唯一维护文档。  
原根目录的拆分说明文档已清理，后续请只更新本文件。

## 1. 项目概览

- 项目类型：Tauri 2 + SvelteKit 的移动优先销售管理应用
- 前端：SvelteKit + TypeScript + Tailwind CSS
- 容器：Tauri（桌面 + Android）
- 数据存储：本地 `localStorage`（离线可用）
- 当前应用信息（以 `src-tauri/tauri.conf.json` 为准）：
  - 应用名：`靓仔的app`
  - 包名：`com.renteng.sales`
  - 版本：`1.0.0`

## 2. 功能范围

### 2.1 销售业务

- 客户管理：增删改查、搜索
- 产品管理：增删改查、搜索
- 销售单：新建、编辑、详情、删除、导出图片
- 送货单：由销售单生成并导出图片
- 报价单：增删改查与复制
- 数据看板：销售额、欠款、排行
- 标签和规格管理：全局维护

### 2.2 视频去水印

- 入口：`/mobile/video-tools/tools`
- 支持平台：抖音、快手、小红书、TikTok（按链接识别）
- 支持类型：视频、图文
- 能力：链接提取、解析、预览、下载（含 Android 原生下载桥接）

## 3. 当前业务规则（按代码）

### 3.1 特定客户名开关

- 客户名 `291769418@张总最帅`：
  - 存在时，`我的`页面才显示“编辑资料”按钮。
  - 存在时，导出前弹出是否导出“客户+销售单”的确认框。
  - 导入/导出传输时，此客户会被过滤，不写入备份。
- 客户名 `1063727010@张总最帅`：
  - 作为视频去水印功能开关，存在时才显示入口并可使用。

### 3.2 多公司、多地址（已支持）

- 在 `我的 -> 编辑资料` 中可添加多个公司和多个地址。
- 新建/编辑销售单里：
  - 销售公司和销售地址均为“大按钮 + 下拉列表选择”。
  - 默认值优先级：当前值 -> 上次选择值 -> 列表第一个。
  - 上次选择分别存储在：
    - `last_selected_sales_company`
    - `last_selected_sales_address`
- 销售单保存的是当时快照，不会因为后续修改“我的资料”而联动历史单。

### 3.3 安装时限控制（Tauri）

- 启动时调用 `check_access_status`。
- 首次运行会写入安装时间（`app_data_dir/.install_time`）。
- 当前阈值时间戳：`1773417599`（即 `2026-03-13 23:59:59 CST`）。
- 规则：`install_time <= threshold` 允许使用，否则拦截并提示停服。

## 4. 关键路由

- 首页：`/mobile`
- 销售单：`/mobile/sales-management/sales`
- 客户：`/mobile/sales-management/customers`
- 产品：`/mobile/sales-management/products`
- 报价单：`/mobile/sales-management/quotation`
- 数据：`/mobile/sales-management/data`
- 视频去水印：`/mobile/video-tools/tools`
- 我的：`/mobile/profile`

## 5. 本地数据键（localStorage）

核心业务：

- `customers`：客户
- `products`：产品
- `invoice_history`：销售单
- `quotations`：报价单
- `quotation_products`：报价产品库
- `user_info`：个人资料（含 `companies[]`、`addresses[]`）
- `settings`：应用设置

其他业务键：

- `customer_product_history`
- `global_tags`
- `global_specifications`
- `customer_categories`
- `product_categories`
- `product_units`

## 6. 开发运行

### 6.1 环境要求

- Node.js 18+
- Rust（建议 rustup）
- Android 构建时额外需要：Android SDK / NDK / JDK 17

### 6.2 常用命令

```bash
# 安装依赖
npm install

# Web 开发（默认 http://localhost:1420）
npm run dev

# Tauri 开发
npm run tauri:dev

# 类型检查
npm run check
```

## 7. 构建与打包

### 7.1 桌面端

```bash
# 一键脚本（会安装依赖+构建前端+tauri build）
./build.sh

# 或手动
npm run build
npm run tauri:build
```

产物目录：`src-tauri/target/release/bundle/`

### 7.2 Android

```bash
# 首次初始化
npm run android:init

# 构建发布 APK
./build-android.sh

# 构建并安装到指定设备（无线 adb）
./build-android.sh <设备IP>:5555

# 查看应用日志
./build-android.sh --logs
```

APK 目录：`src-tauri/gen/android/app/build/outputs/apk/`

### 7.3 Android 签名

`src-tauri/gen/android/app/build.gradle.kts` 当前策略：

- 优先读取 `tauri.properties` 或环境变量
- 未配置时回退使用仓库根目录 `release.keystore`
- 默认别名和密码在脚本里有回退值，仅适合内部环境

建议发布前配置环境变量：

```bash
export TAURI_ANDROID_KEY_ALIAS=your_alias
export TAURI_ANDROID_KEYSTORE_PASSWORD=your_store_password
export TAURI_ANDROID_KEY_PASSWORD=your_key_password
```

## 8. 导入导出（`.cbin`）

- 仅支持导入/导出加密二进制文件 `.cbin`
- 导出需要输入密码（不少于 4 位）
- 导入支持两种模式：
  - 合并：保留现有数据，追加新数据（按 `id` 去重）
  - 覆盖：清空现有业务数据后完全替换
- 特殊规则：
  - 若存在 `291769418@张总最帅`，导出前询问是否包含客户+销售单
  - 该客户在导入/导出数据中始终被过滤

## 9. 视频去水印实现链路

前端解析顺序（`src/lib/services/videoParser.ts`）：

1. Tauri 环境优先调用 Rust 命令 `parse_video_via_providers`
2. 失败则回退旧命令 `parse_douyin_video`（抖音）
3. 浏览器环境走本地 API：`/api/video-tools-parse-douyin`
4. 再失败才尝试第三方公开 API

服务端解析顺序（`src/routes/api/video-tools-parse-douyin/+server.ts`）：

1. `tryDouyinSharePage`
2. `tryTikwm`
3. `tryPearktrue`
4. `tryVvhan`
5. `tryLolimi`

下载链路：

- API 下载：`/api/video-tools-download-video`
- 代理播放：`/api/video-tools-proxy-video`
- Android 下优先走原生下载接口（若注入桥接成功）

## 10. 常见问题

### 10.1 视频解析失败

- 平台接口会变化，公开 API 可能失效
- 先确认链接可在手机端正常打开
- 优先在 Tauri 环境测试（绕开浏览器 CORS 限制）

### 10.2 Android 构建失败

- 检查 `ANDROID_HOME`、`NDK_HOME`、`JAVA_HOME`
- 执行 `./verify-android-setup.sh`
- 重新执行 `npm run build` 后再构建

### 10.3 下拉选项为空

- 在“我的资料”先录入公司/地址列表
- 若仍为空，清理异常空字符串数据后重试

## 11. 维护约定

- 后续文档更新统一改 `README.md`
- 不再恢复根目录拆分文档，避免信息冲突和重复维护
