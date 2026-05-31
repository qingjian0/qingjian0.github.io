import { useState, useEffect, useRef } from 'react';
import { BlogPost, BlogManager } from '../../utils/blogManager';

interface BlogEditorProps {
  post: BlogPost | null;
  onBack: () => void;
  onSave: () => void;
}

export default function BlogEditor({ post, onBack, onSave }: BlogEditorProps) {
  const blogManager = BlogManager.getInstance();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setSummary(post.summary);
      setCategory(post.category || '');
      setTags(post.tags?.join(', ') || '');
      setIsDraft(post.isDraft);
    }
  }, [post]);

  const insertText = (text: string, afterText = '') => {
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = 
      textarea.value.substring(0, start) + 
      text + 
      selectedText + 
      afterText + 
      textarea.value.substring(end);
    
    setContent(newText);

    setTimeout(() => {
      if (afterText) {
        textarea.selectionStart = textarea.selectionEnd = start + text.length + selectedText.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
      }
      textarea.focus();
    }, 0);
  };

  const handleSave = async (asDraft = false) => {
    if (!title.trim() || !content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    setIsSaving(true);

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim(),
        category: category.trim() || undefined,
        tags: tags.split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0),
        isDraft: asDraft || isDraft,
      };

      if (post) {
        blogManager.updatePost(post.id, postData);
      } else {
        blogManager.createPost(postData);
      }

      onSave();
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const renderMarkdown = (markdown: string) => {
    let html = markdown;

    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    html = html.replace(/^\- \[ \] (.*$)/gm, '<li><input type="checkbox" disabled> $1</li>');
    html = html.replace(/^\- \[x\] (.*$)/gm, '<li><input type="checkbox" disabled checked> $1</li>');
    html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

    html = html.replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>');

    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">[$1]</a>');
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/^\s*(.*?)$/gm, '<p>$1</p>');

    return { __html: html };
  };

  return (
    <div className="blog-editor">
      <div className="blog-editor-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← 取消
        </button>

        <div className="blog-editor-actions">
          {isPreviewMode ? (
            <button
              className="btn btn-secondary"
              onClick={() => setIsPreviewMode(false)}
            >
              ✏️ 编辑
            </button>
          ) : (
            <>
              <button
                className="btn btn-outline"
                onClick={() => setIsPreviewMode(true)}
              >
                👁️ 预览
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                💾 保存草稿
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                🚀 发布
              </button>
            </>
          )}
        </div>
      </div>

      {isPreviewMode ? (
        <div className="blog-preview">
          {title && (
            <div className="preview-header">
              {isDraft && <span className="draft-badge">草稿</span>}
              <h1>{title}</h1>
              {summary && <p className="summary">{summary}</p>}
              <div className="tags-container">
                {category && <span className="category-tag">{category}</span>}
                {tags.split(',')
                  .map(t => t.trim())
                  .filter(t => t)
                  .map(tag => (
                    <span key={tag} className="post-tag">{tag}</span>
                  ))}
              </div>
            </div>
          )}
          {content && (
            <div className="preview-content">
              <div dangerouslySetInnerHTML={renderMarkdown(content)} />
            </div>
          )}
          {!title && !content && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>开始编辑你的文章吧！</p>
            </div>
          )}
        </div>
      ) : (
        <div className="blog-editor-content">
          <div className="editor-field">
            <label htmlFor="post-title">标题</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入文章标题"
            />
          </div>

          <div className="editor-field">
            <label htmlFor="post-summary">摘要（可选）</label>
            <textarea
              id="post-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="简要描述文章内容"
              rows={2}
            />
          </div>

          <div className="editor-row">
            <div className="editor-field half">
              <label htmlFor="post-category">分类（可选）</label>
              <input
                id="post-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="输入分类名称"
              />
            </div>

            <div className="editor-field half">
              <label htmlFor="post-tags">标签（可选，逗号分隔）</label>
              <input
                id="post-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="标签1, 标签2, 标签3"
              />
            </div>
          </div>

          <div className="editor-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
              />
              保存为草稿（不会显示在博客列表中）
            </label>
          </div>

          <div className="editor-field">
            <label>Markdown 工具栏</label>
            <div className="editor-toolbar">
              <button onClick={() => insertText('# ')}># 标题</button>
              <button onClick={() => insertText('**', '**')}>** 粗体</button>
              <button onClick={() => insertText('*', '*')}>* 斜体</button>
              <button onClick={() => insertText('~~', '~~')}>~~ 删除线</button>
              <button onClick={() => insertText('\n- ')}>- 列表</button>
              <button onClick={() => insertText('\n1. ')}>1. 有序</button>
              <button onClick={() => insertText('\n- [ ] ')}>[ ] 任务</button>
              <button onClick={() => insertText('[链接文本](', ')')}>🔗 链接</button>
              <button onClick={() => insertText('![图片描述](', ')')}>🖼️ 图片</button>
              <button onClick={() => insertText('`', '`')}>` 代码</button>
              <button onClick={() => insertText('\n```\n\n```\n')}>📦 代码块</button>
              <button onClick={() => insertText('\n---\n')}>— 分割线</button>
              <button onClick={() => insertText('\n> ')}>> 引用</button>
            </div>
          </div>

          <div className="editor-field full">
            <label htmlFor="post-content">内容（支持 Markdown）</label>
            <textarea
              id="post-content"
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写作..."
              rows={20}
            />
          </div>
        </div>
      )}
    </div>
  );
}
