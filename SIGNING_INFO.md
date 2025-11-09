# Android APK 签名信息

## 签名密钥信息

- **密钥库文件**: `release.keystore` (⚠️ 不要上传到 Git!)
- **密钥库类型**: JKS
- **密钥别名**: `cypridina`
- **密钥算法**: RSA
- **密钥大小**: 2048 位
- **有效期**: 10,000 天
- **密码**: `123456` (⚠️ 生产环境请使用强密码!)

## 签名者信息

- **CN** (Common Name): Cypridina
- **OU** (Organizational Unit): Sales
- **O** (Organization): Renteng
- **L** (Locality): Beijing
- **ST** (State): Beijing
- **C** (Country): CN

## 签名命令

### 使用 apksigner 签名

```bash
/Users/zdp/Library/Android/sdk/build-tools/35.0.0/apksigner sign \
  --ks release.keystore \
  --ks-key-alias cypridina \
  --ks-pass pass:123456 \
  --key-pass pass:123456 \
  --out 靓仔的app-signed.apk \
  src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk
```

### 验证签名

```bash
/Users/zdp/Library/Android/sdk/build-tools/35.0.0/apksigner verify --verbose 靓仔的app-signed.apk
```

## 密钥备份建议

⚠️ **重要**: 请务必备份 `release.keystore` 文件!

1. **本地备份**: 复制到安全的本地目录
2. **云备份**: 上传到加密的云存储(iCloud、Google Drive 等)
3. **密码管理器**: 使用密码管理器保存密钥信息

**如果丢失密钥**:
- 无法更新已发布的应用
- 用户无法升级到新版本
- 必须发布全新的应用(不同的包名)

## 密钥存放位置

建议将 `release.keystore` 保存在:
- `/Users/zdp/Documents/Android_Keys/` (本地安全目录)
- 或项目根目录(已在 `.gitignore` 中排除)

## 生产环境建议

对于正式发布的应用,建议:

1. **使用强密码**: 至少 16 位,包含大小写字母、数字、特殊字符
2. **分离密钥**: 开发环境和生产环境使用不同的密钥
3. **密钥管理**: 使用专业的密钥管理服务(如 Google Play App Signing)
4. **访问控制**: 限制密钥访问权限,只有授权人员可以使用

## 重新生成密钥

如果需要重新生成密钥(仅用于新应用):

```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias cypridina \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STRONG_PASSWORD \
  -keypass YOUR_STRONG_PASSWORD \
  -dname "CN=Cypridina, OU=Sales, O=Renteng, L=Beijing, ST=Beijing, C=CN"
```

## 查看密钥信息

```bash
keytool -list -v -keystore release.keystore -alias cypridina -storepass 123456
```

