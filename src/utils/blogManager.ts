export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
  isDraft: boolean;
}

const STORAGE_KEY = 'ai_zhishu_blog_posts';
const SAMPLE_DATA_INITIALIZED = 'ai_zhishu_blog_initialized';

export class BlogManager {
  private static instance: BlogManager;
  private posts: BlogPost[] = [];

  private constructor() {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  static getInstance(): BlogManager {
    if (!BlogManager.instance) {
      BlogManager.instance = new BlogManager();
    }
    return BlogManager.instance;
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.posts = parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.posts));
    } catch (error) {
      console.error('Failed to save blog posts:', error);
    }
  }

  private initializeSampleData(): void {
    if (localStorage.getItem(SAMPLE_DATA_INITIALIZED)) {
      return;
    }

    if (this.posts.length === 0) {
      const samplePosts: BlogPost[] = [
        {
          id: this.generateId(),
          title: '欢迎使用 AI 智枢',
          content: `# 欢迎使用 AI 智枢

这是一个强大的 AI 聚合平台，让你可以同时使用多个 AI 模型。

## 主要功能

- 🌐 **WebView 集成** - 直接在应用中使用各个 AI 平台
- 💾 **记忆管理** - 保存和管理你的对话历史
- 🔒 **安全设置** - 支持加密存储你的敏感信息
- 📝 **博客功能** - 记录你的学习和使用心得

## 开始使用

1. 在侧边栏选择你想要使用的 AI 模型
2. 在对话框中输入你的问题
3. 保存你的对话到记忆中
4. 记录你的心得到博客

祝你使用愉快！`,
          summary: '这是一个强大的 AI 聚合平台，让你可以同时使用多个 AI 模型。',
          category: '教程',
          tags: ['入门', '使用指南'],
          createdAt: new Date(),
          isDraft: false,
        },
        {
          id: this.generateId(),
          title: 'DeepSeek 使用技巧',
          content: `# DeepSeek 使用技巧

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

\`\`\`
用 Python 写一个简单的爬虫，从 https://example.com 提取所有链接。
要求使用 requests 和 BeautifulSoup 库。
\`\`\``,
          summary: 'DeepSeek 是一个强大的代码和通用对话 AI，这里是一些使用技巧。',
          category: '技巧',
          tags: ['DeepSeek', '代码', 'AI 技巧'],
          createdAt: new Date(Date.now() - 86400000),
          isDraft: false,
        },
      ];

      this.posts = samplePosts;
      this.saveToStorage();
      localStorage.setItem(SAMPLE_DATA_INITIALIZED, 'true');
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getAllPosts(includeDrafts = false): BlogPost[] {
    return this.posts
      .filter(p => includeDrafts || !p.isDraft)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getPostById(id: string): BlogPost | undefined {
    return this.posts.find(p => p.id === id);
  }

  getPostsByCategory(category: string): BlogPost[] {
    return this.posts
      .filter(p => !p.isDraft && p.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  searchPosts(query: string): BlogPost[] {
    const lowerQuery = query.toLowerCase();
    return this.posts
      .filter(p => 
        !p.isDraft && 
        (p.title.toLowerCase().includes(lowerQuery) || 
         p.content.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.posts.forEach(p => {
      if (p.category) {
        categories.add(p.category);
      }
    });
    return Array.from(categories).sort();
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    this.posts.forEach(p => {
      if (p.tags) {
        p.tags.forEach(t => tags.add(t));
      }
    });
    return Array.from(tags).sort();
  }

  createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): BlogPost {
    const newPost: BlogPost = {
      ...post,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.posts.unshift(newPost);
    this.saveToStorage();
    return newPost;
  }

  updatePost(id: string, updates: Partial<BlogPost>): BlogPost | undefined {
    const index = this.posts.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const updatedPost: BlogPost = {
      ...this.posts[index],
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.posts[index] = updatedPost;
    this.saveToStorage();
    return updatedPost;
  }

  deletePost(id: string): boolean {
    const index = this.posts.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.posts.splice(index, 1);
    this.saveToStorage();
    return true;
  }
}
