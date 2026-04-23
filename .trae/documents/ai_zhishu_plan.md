# AI 智枢项目实现计划

## 一、项目概述
根据技术文档，AI 智枢是一款增强型 AI 聚合浏览器应用，主要特点包括：
- Flutter 原生框架作为基座
- WebView 容器嵌入主流 AI 网页
- 跨模型的本地记忆与云端同步系统
- 双轨制存储（明文/加密）
- 腾讯云开发（TCB）支持

## 二、当前工作区状态
- 工作区 `/workspace` 为空，需要从零搭建
- 无任何现有代码或配置文件

## 三、技术栈与依赖（基于文档推断）
- **框架**: Flutter (Dart)
- **状态管理**: Provider (文档提到 providers 目录)
- **本地数据库**: SQLite (使用 sqflite 或 path_provider + sqflite)
- **WebView**: webview_flutter 插件
- **加密**: encrypt 或 pointycastle 库
- **文件操作**: path_provider, file 库
- **云服务**: tencent_cloud_base 或类似 TCB SDK

## 四、实现步骤

### 阶段一：项目初始化与基础架构搭建
1. 创建 Flutter 项目结构
2. 配置 pubspec.yaml 依赖
3. 建立目录结构（按文档规范）
4. 创建常量配置文件
5. 基础工具类实现

### 阶段二：核心基础设施实现
1. 实现双轨制加密/解密服务
2. 文件锁队列实现（并发控制）
3. Markdown 格式化工具
4. JS 热更新服务基础框架

### 阶段三：WebView 容器管理系统
1. WebView 池管理（LRU 机制）
2. 骨架屏组件
3. 键盘适配逻辑
4. WebView 容器主组件

### 阶段四：数据提取与交互层
1. 统一数据接口层
2. Web AI 提供者实现
3. JS Bridge 通信机制
4. Fetch Hook 注入脚本框架

### 阶段五：记忆模块
1. 本地数据源（双轨制存储）
2. SQLite 索引数据库
3. 记忆列表界面
4. 搜索功能

### 阶段六：设置与安全模块
1. 安全设置界面
2. 明→密转换逻辑
3. 密→明转换逻辑
4. 进度条展示

### 阶段七：云同步模块
1. TCB 同步服务框架
2. 冲突解决机制
3. 后台流式保护

### 阶段八：UI 层整合
1. 侧边栏组件
2. 模型切换器
3. 主应用集成

## 五、关键文件清单
- `pubspec.yaml`: 依赖管理
- `lib/main.dart`: 入口文件
- `lib/core/constants/ai_urls.dart`: AI 模型 URL 配置
- `lib/core/security/aes_crypto_service.dart`: 加解密引擎
- `lib/core/utils/file_lock_queue.dart`: 文件锁队列
- `lib/features/chat/presentation/widgets/webview_container.dart`: WebView 容器
- `lib/shared/providers/webview_pool_provider.dart`: WebView 池管理
- `lib/features/memory/data/memory_local_ds.dart`: 本地数据源
- `lib/features/settings/presentation/security_settings_screen.dart`: 安全设置

## 六、风险与考虑
1. **WebView 内存管理**: LRU 机制需要仔细测试，避免内存泄漏
2. **加密安全性**: AES 密钥管理需要安全存储
3. **AI 网页改版**: JS 注入需要兼容未来变化
4. **文件并发**: 文件锁队列需确保不产生死锁

## 七、验收标准
- 项目能正常编译运行
- 目录结构符合文档规范
- 核心模块接口定义完整
- 基础功能可正常演示