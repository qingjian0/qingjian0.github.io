import { useState, useEffect, useRef } from 'react';
import { BlogPost, BlogManager } from '../../utils/blogManager';

interface BlogDetailProps {
  post: BlogPost | null;
  onBack: () => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (id: string) => void;
}

const formatDate = (date: Date): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function BlogDetail({ post, onBack, onEdit, onDelete }: BlogDetailProps) {
  const blogManager = BlogManager.getInstance();
  const [isLoading, setIsLoading] = useState(false);

  if (!post) return null;

  const renderMarkdown = (content: string) => {
    let html = content;

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

    html = html.replace(/\[([^\]]+)\]\(([^\)]+\)/g, '<a href="$2" target="_blank" rel="noopener">[$1]</a>');

    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');

    html = html.replace(/^---$/gm, '<hr>');

    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/^\s*(.*?)$/gm, function(match, group1) {
      return '<p>' + group1 + '</p>';
    });

    return { __html: html };
  };

  const handleDelete = () => {
    if (confirm('确定要删除这篇文章吗？')) {
      onDelete(post.id);
    }
  };

  return (
    <div className="blog-detail">
      <div className="blog-detail-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← 返回
        </button>
        <div className="blog-detail-actions">
          <button className="btn btn-outline" onClick={() => onEdit(post)}>
            ✏️ 编辑
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑️ 删除
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <article className="blog-article">
          <header className="article-header">
          {post.isDraft && (
            <span className="draft-badge">草稿</span>
          )}
          <h1 className="article-title">{post.title}</h1>

          {post.summary && (
            <p className="article-summary">{post.summary}</p>
          )}

          <div className="article-meta">
            {post.category && (
              <span className="category-tag">{post.category}</span>
            )}
            {post.tags?.map((tag) => (
              <span key={tag} className="post-tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="article-date">
            <span className="date-text">
              📅 {formatDate(post.createdAt)}
            </span>
            {post.updatedAt && (
              <span className="date-text">
                ✏️ 编辑于 {formatDate(post.updatedAt)}
              </span>
            )}
          </div>
          </header>

          <div className="article-content">
            <div dangerouslySetInnerHTML={renderMarkdown(post.content)} />
          </div>
        </article>
      )}
    </div>
  );
}
