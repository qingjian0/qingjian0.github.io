import 'dart:math';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'models/blog_post.dart';

class BlogLocalDataSource {
  static final BlogLocalDataSource _instance = BlogLocalDataSource._internal();
  static Database? _db;

  factory BlogLocalDataSource() => _instance;

  BlogLocalDataSource._internal();

  Future<Database> get db async {
    if (_db != null) return _db!;
    _db = await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'blog_posts.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE blog_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        category TEXT,
        tags TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT,
        isDraft INTEGER DEFAULT 0
      )
    ''');
  }

  Future<String> _generateId() async {
    final random = Random.secure();
    return DateTime.now().millisecondsSinceEpoch.toString() +
        random.nextInt(999999).toString().padLeft(6, '0');
  }

  Future<BlogPost> createBlogPost(BlogPost post) async {
    final dbClient = await db;
    final id = post.id ?? await _generateId();
    final newPost = post.copyWith(id: id);
    
    await dbClient.insert(
      'blog_posts',
      newPost.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    
    return newPost;
  }

  Future<BlogPost?> getBlogPost(String id) async {
    final dbClient = await db;
    final List<Map<String, dynamic>> maps = await dbClient.query(
      'blog_posts',
      where: 'id = ?',
      whereArgs: [id],
    );
    
    if (maps.isEmpty) return null;
    return BlogPost.fromMap(maps.first);
  }

  Future<List<BlogPost>> getAllBlogPosts({bool includeDrafts = false}) async {
    final dbClient = await db;
    final whereClause = includeDrafts ? null : 'isDraft = 0';
    final List<Map<String, dynamic>> maps = await dbClient.query(
      'blog_posts',
      where: whereClause,
      orderBy: 'createdAt DESC',
    );
    
    return List.generate(maps.length, (i) => BlogPost.fromMap(maps[i]));
  }

  Future<List<BlogPost>> getBlogPostsByCategory(String category) async {
    final dbClient = await db;
    final List<Map<String, dynamic>> maps = await dbClient.query(
      'blog_posts',
      where: 'category = ? AND isDraft = 0',
      whereArgs: [category],
      orderBy: 'createdAt DESC',
    );
    
    return List.generate(maps.length, (i) => BlogPost.fromMap(maps[i]));
  }

  Future<List<BlogPost>> searchBlogPosts(String query) async {
    final dbClient = await db;
    final List<Map<String, dynamic>> maps = await dbClient.query(
      'blog_posts',
      where: 'isDraft = 0 AND (title LIKE ? OR content LIKE ?)',
      whereArgs: ['%$query%', '%$query%'],
      orderBy: 'createdAt DESC',
    );
    
    return List.generate(maps.length, (i) => BlogPost.fromMap(maps[i]));
  }

  Future<BlogPost> updateBlogPost(BlogPost post) async {
    final dbClient = await db;
    final updatedPost = post.copyWith(updatedAt: DateTime.now());
    
    await dbClient.update(
      'blog_posts',
      updatedPost.toMap(),
      where: 'id = ?',
      whereArgs: [updatedPost.id],
    );
    
    return updatedPost;
  }

  Future<void> deleteBlogPost(String id) async {
    final dbClient = await db;
    await dbClient.delete(
      'blog_posts',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<List<String>> getAllCategories() async {
    final dbClient = await db;
    final List<Map<String, dynamic>> maps = await dbClient.rawQuery(
      'SELECT DISTINCT category FROM blog_posts WHERE category IS NOT NULL AND category != ""'
    );
    
    return List.generate(maps.length, (i) => maps[i]['category'] as String);
  }

  Future<List<String>> getAllTags() async {
    final dbClient = await db;
    final List<Map<String, dynamic>> maps = await dbClient.query(
      'blog_posts',
      columns: ['tags'],
      where: 'tags IS NOT NULL AND tags != ""',
    );
    
    final Set<String> allTags = {};
    for (var map in maps) {
      if (map['tags'] != null) {
        final tags = (map['tags'] as String).split(',');
        allTags.addAll(tags.where((tag) => tag.isNotEmpty));
      }
    }
    
    return allTags.toList()..sort();
  }

  Future<void> initSampleData() async {
    final existingPosts = await getAllBlogPosts(includeDrafts: true);
    if (existingPosts.isNotEmpty) return;

    final samplePosts = [
      BlogPost(
        title: '欢迎使用 AI 智枢',
        content: '''
# 欢迎使用 AI 智枢

这是一个强大的 AI 聚合平台，让你可以同时使用多个 AI 模型。

## 主要功能

- 🌐 **WebView 集成** - 直接在应用中使用各个 AI 平台
- 💾 **记忆管理** - 保存和管理你的对话历史
- 🔒 **安全存储** - 支持加密存储你的敏感信息
- ☁️ **云端同步** - 跨设备同步你的数据

## 开始使用

1. 在侧边栏选择你想要使用的 AI 模型
2. 在对话框中输入你的问题
3. 保存你的对话到记忆中

祝你使用愉快！
''',
        summary: '这是一个强大的 AI 聚合平台，让你可以同时使用多个 AI 模型。',
        category: '教程',
        tags: ['入门', '使用指南'],
        isDraft: false,
      ),
      BlogPost(
        title: 'DeepSeek 使用技巧',
        content: '''
# DeepSeek 使用技巧

DeepSeek 是一个强大的代码和通用对话 AI。

## 最佳实践

### 代码编写
- 明确说明你想要实现的功能
- 提供具体的编程语言和框架
- 要求提供可运行的代码示例

### 通用对话
- 使用清晰的问题描述
- 提供上下文信息
- 分步骤提问复杂问题

## 示例提示词

```
用 Python 写一个简单的爬虫，从 https://example.com 提取所有链接。
要求使用 requests 和 BeautifulSoup 库。
```

''',
        summary: 'DeepSeek 是一个强大的代码和通用对话 AI，这里是一些使用技巧。',
        category: '技巧',
        tags: ['DeepSeek', '代码', 'AI 技巧'],
        isDraft: false,
      ),
    ];

    for (var post in samplePosts) {
      await createBlogPost(post);
    }
  }
}
