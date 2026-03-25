import java.util.Properties
import org.gradle.api.GradleException

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("rust")
}

val tauriProperties = Properties().apply {
    val propFile = file("tauri.properties")
    if (propFile.exists()) {
        propFile.inputStream().use { load(it) }
    }
}

// 发布签名信息，优先从 tauri.properties 或环境变量读取，未配置时回退到仓库根目录的 release.keystore
val repoRoot = rootDir.resolve("../../../").canonicalFile
val releaseKeystorePath = tauriProperties.getProperty(
    "tauri.android.signing.keystore",
    repoRoot.resolve("release.keystore").path
)
val releaseKeyAlias = tauriProperties.getProperty(
    "tauri.android.signing.keyAlias",
    System.getenv("TAURI_ANDROID_KEY_ALIAS") ?: "cypridina"
)
val releaseStorePassword = tauriProperties.getProperty(
    "tauri.android.signing.storePassword",
    System.getenv("TAURI_ANDROID_KEYSTORE_PASSWORD") ?: "123456"
)
val releaseKeyPassword = tauriProperties.getProperty(
    "tauri.android.signing.keyPassword",
    System.getenv("TAURI_ANDROID_KEY_PASSWORD") ?: releaseStorePassword
)

android {
    compileSdk = 36
    namespace = "com.renteng.sales"
    defaultConfig {
        manifestPlaceholders["usesCleartextTraffic"] = "false"
        applicationId = "com.renteng.sales"
        minSdk = 24
        targetSdk = 36
        versionCode = tauriProperties.getProperty("tauri.android.versionCode", "1").toInt()
        versionName = tauriProperties.getProperty("tauri.android.versionName", "1.0")
    }
    signingConfigs {
        create("release") {
            val releaseKeystore = file(releaseKeystorePath)
            if (!releaseKeystore.exists()) {
                throw GradleException("未找到发布签名文件: $releaseKeystorePath")
            }
            storeFile = releaseKeystore
            storePassword = releaseStorePassword
            keyAlias = releaseKeyAlias
            keyPassword = releaseKeyPassword
        }
    }
    buildTypes {
        getByName("debug") {
            manifestPlaceholders["usesCleartextTraffic"] = "true"
            isDebuggable = true
            isJniDebuggable = true
            isMinifyEnabled = false
            packaging {                jniLibs.keepDebugSymbols.add("*/arm64-v8a/*.so")
                jniLibs.keepDebugSymbols.add("*/armeabi-v7a/*.so")
                jniLibs.keepDebugSymbols.add("*/x86/*.so")
                jniLibs.keepDebugSymbols.add("*/x86_64/*.so")
            }
        }
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            proguardFiles(
                *fileTree(".") { include("**/*.pro") }
                    .plus(getDefaultProguardFile("proguard-android-optimize.txt"))
                    .toList().toTypedArray()
            )
        }
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        buildConfig = true
    }
}

rust {
    rootDirRel = "../../../"
}

dependencies {
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("com.google.android.material:material:1.12.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.4")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.0")
}

apply(from = "tauri.build.gradle.kts")