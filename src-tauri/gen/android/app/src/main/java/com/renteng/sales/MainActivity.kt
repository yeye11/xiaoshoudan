package com.renteng.sales

import android.app.DownloadManager
import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.util.Log
import android.webkit.DownloadListener
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import java.io.ByteArrayInputStream
import java.net.URLDecoder

class MainActivity : TauriActivity() {
  companion object {
    private const val TAG = "MainActivity"
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    Log.d(TAG, "🚀 MainActivity onCreate() 开始")
    enableEdgeToEdge()

    // 启用 WebView 调试
    WebView.setWebContentsDebuggingEnabled(true)
    Log.d(TAG, "✅ WebView 调试已启用")

    super.onCreate(savedInstanceState)
    Log.d(TAG, "✅ MainActivity onCreate() 完成")
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    Log.d(TAG, "🌐 WebView 已创建: $webView")

    // 添加 JavaScript 接口，用于从 JS 调用 Android 原生方法
    webView.addJavascriptInterface(ImageSaver(this), "AndroidImageSaver")
    Log.d(TAG, "✅ JavaScript 接口已添加")

    // 设置下载监听器（作为备用方案）
    webView.setDownloadListener(object : DownloadListener {
      override fun onDownloadStart(
        url: String,
        userAgent: String,
        contentDisposition: String,
        mimetype: String,
        contentLength: Long
      ) {
        Log.d(TAG, "📥 下载开始:")
        Log.d(TAG, "  URL: $url")
        Log.d(TAG, "  MIME: $mimetype")
        Log.d(TAG, "  文件名: $contentDisposition")

        try {
          // 从 content disposition 中提取文件名
          var filename = "download"
          if (contentDisposition.isNotEmpty()) {
            val filenamePattern = "filename=\"?([^\"]+)\"?".toRegex()
            val matchResult = filenamePattern.find(contentDisposition)
            if (matchResult != null) {
              filename = matchResult.groupValues[1]
            }
          }

          // URL decode 文件名
          filename = URLDecoder.decode(filename, "UTF-8")
          Log.d(TAG, "  解析后的文件名: $filename")

          // 使用 DownloadManager 下载文件
          val request = DownloadManager.Request(Uri.parse(url))
          request.setMimeType(mimetype)
          request.addRequestHeader("User-Agent", userAgent)
          request.setDescription("正在下载...")
          request.setTitle(filename)
          request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)

          // 保存到 Pictures 目录（不需要权限）
          request.setDestinationInExternalPublicDir(Environment.DIRECTORY_PICTURES, filename)

          val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
          dm.enqueue(request)

          Log.d(TAG, "✅ 下载任务已添加到 DownloadManager")
        } catch (e: Exception) {
          Log.e(TAG, "❌ 下载失败: ${e.message}", e)
        }
      }
    })

    Log.d(TAG, "✅ DownloadListener 已设置")
  }

  // JavaScript 接口类，用于保存图片
  class ImageSaver(private val context: Context) {
    @JavascriptInterface
    fun saveImage(base64Data: String, filename: String): Boolean {
      Log.d(TAG, "📸 开始保存图片: $filename")
      Log.d(TAG, "📦 Base64 数据长度: ${base64Data.length}")

      return try {
        // 1. 解码 Base64 数据为 Bitmap
        val imageBytes = Base64.decode(base64Data, Base64.DEFAULT)
        val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)

        if (bitmap == null) {
          Log.e(TAG, "❌ Bitmap 解码失败")
          return false
        }

        Log.d(TAG, "✅ Bitmap 解码成功: ${bitmap.width}x${bitmap.height}")

        // 2. 使用 MediaStore 保存到相册（Android 10+ 不需要权限）
        val displayName = filename
        val mimeType = "image/jpeg"

        val contentValues = ContentValues().apply {
          put(MediaStore.Images.Media.DISPLAY_NAME, displayName)
          put(MediaStore.Images.Media.MIME_TYPE, mimeType)
          // Android 10+ 需指定相对路径
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES)
          }
        }

        // 3. 插入图片到 MediaStore
        val resolver = context.contentResolver
        val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)

        if (uri == null) {
          Log.e(TAG, "❌ MediaStore 插入失败")
          return false
        }

        Log.d(TAG, "✅ MediaStore URI 创建成功: $uri")

        // 4. 写入 Bitmap 数据
        resolver.openOutputStream(uri)?.use { outputStream ->
          bitmap.compress(Bitmap.CompressFormat.JPEG, 95, outputStream)
          Log.d(TAG, "✅ 图片数据写入成功")
        }

        // 5. 显示成功提示
        (context as? MainActivity)?.runOnUiThread {
          Toast.makeText(context, "✅ 图片已保存到相册！", Toast.LENGTH_SHORT).show()
        }

        Log.d(TAG, "🎉 图片保存成功！")
        true
      } catch (e: Exception) {
        Log.e(TAG, "❌ 保存图片失败: ${e.message}", e)
        e.printStackTrace()

        (context as? MainActivity)?.runOnUiThread {
          Toast.makeText(context, "❌ 保存失败: ${e.message}", Toast.LENGTH_SHORT).show()
        }

        false
      }
    }
  }
}
