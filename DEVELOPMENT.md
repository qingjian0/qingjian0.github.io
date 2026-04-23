# 开发指南

## 环境设置

### 1. 安装 Flutter

请按照 [Flutter 官方文档](https://flutter.dev/docs/get-started/install) 安装 Flutter SDK 3.0 或更高版本。

### 2. 克隆项目

```bash
git clone <repository-url>
cd ai_zhishu
```

### 3. 安装依赖

```bash
flutter pub get
```

### 4. 运行项目

```bash
# Android 模拟器或真机
flutter run

# iOS 模拟器或真机 (仅 macOS)
flutter run -d ios

# Web 浏览器
flutter run -d chrome
```

## 项目结构

### 核心模块

- **core/**: 核心基础设施，包括常量、加密、工具类等
- **features/**: 功能模块，包括聊天、记忆、设置、同步等
- **shared/**: 共享组件，包括导航栏、模型切换器等

### 开发流程

1. **创建新功能**：在 `features/` 目录下创建新的功能模块
2. **编写测试**：在 `test/` 目录下为新功能编写测试
3. **运行测试**：`flutter test`
4. **代码规范**：运行 `flutter analyze` 检查代码规范
5. **构建应用**：`flutter build apk` 或 `flutter build ios`

## 调试技巧

### 1. 查看 WebView 控制台日志

在 `webview_container.dart` 中，你可以通过 `print` 或日志工具查看 WebView 的消息：

```dart
void _onJsMessage(JavaScriptMessage message) {
  print('JS Message: ${message.message}');
}
```

### 2. 查看文件操作

在 `memory_local_ds.dart` 中，可以添加日志来查看文件读写操作：

```dart
print('Saving memory to: ${file.path}');
```

### 3. 测试加密功能

在 `security_settings_screen.dart` 中，可以通过模拟器测试加密和解密功能。

## 部署指南

### 1. 构建发布版本

```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release

# Web
flutter build web
```

### 2. 配置 JS 热更新

在 `js_hot_update_service.dart` 中，需要配置 COS 存储桶地址：

```dart
static const String _cosBaseUrl = 'https://your-cos-url.com';
```

### 3. 配置 TCB 云同步

在 `tcb_sync_service.dart` 中，需要配置 TCB 初始化参数。

## 常见问题

### 1. WebView 加载失败

- 检查网络连接
- 检查 URL 配置是否正确
- 检查 WebView 权限设置

### 2. 加密功能无法使用

- 确保密码长度至少 6 位
- 确保密码输入正确
- 检查 `aes_crypto_service.dart` 中的实现

### 3. 内存泄漏

- 检查 WebView 池管理是否正常
- 确保所有控制器都正确释放

## 版本管理

- 使用 semantic versioning (语义化版本)
- 在 `CHANGELOG.md` 中记录所有版本变更
- 发布前运行 `flutter test` 和 `flutter analyze`