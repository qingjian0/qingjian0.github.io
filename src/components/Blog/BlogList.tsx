import { useState, useEffect } from 'react';
import { BlogPost, BlogManager } from '../../utils/blogManager';

interface BlogListProps {
  onSelectPost: (post: BlogPost) => void;
  onNewPost: () => void;
}

const formatDate = (date: Date): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function BlogList({ onSelectPost, onNewPost }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDrafts, setShowDrafts] = useState(false);

  const blogManager = BlogManager.getInstance();

  const loadPosts = () => {
    const allPosts = blogManager.getAllPosts(showDrafts);
    const allCategories = blogManager.getAllCategories();
    const allTags = blogManager.getAllTags();
    setPosts(allPosts);
    setFilteredPosts(allPosts);
    setCategories(allCategories);
    setTags(allTags);
  };

  useEffect(() => {
    loadPosts();
  }, [showDrafts]);

  useEffect(() => {
    let filtered = posts;

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedTag) {
      filtered = filtered.filter(p => p.tags?.includes(selectedTag));
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(lowerQuery) ||
        p.content.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredPosts(filtered);
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这篇文章吗？')) {
      blogManager.deletePost(id);
      loadPosts();
    }
  };

  return (
    <div className="blog-list">
      <div className="blog-header">
        <h2>博客</h2>
        <div className="blog-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowDrafts(!showDrafts)}
          >
            {showDrafts ? '显示全部' : '显示草稿'}
          </button>
          <button className="btn btn-primary" onClick={onNewPost}>
            新建文章
          </button>
        </div>
      </div>

      <div className="blog-filters">
        <input
          type="text"
          placeholder="搜索文章..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="blog-search"
        />

        {categories.length > 0 && (
          <div className="filter-group">
            <span className="filter-label">分类:</span>
            <button
              className={`filter-chip ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-chip ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="filter-group">
            <span className="filter-label">标签:</span>
            <button
              className={`filter-chip ${!selectedTag ? 'active' : ''}`}
              onClick={() => setSelectedTag(null)}
            >
              全部
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                className={`filter-chip ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="blog-posts">
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>
              {searchQuery || selectedCategory || selectedTag
                ? '没有找到匹配的文章'
                : '还没有文章，开始写第一篇吧！'}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article key={post.id} className="blog-card" onClick={() => onSelectPost(post)}>
              <div className="blog-card-header">
                <div className="blog-card-meta">
                  {post.isDraft && (
                    <span className="draft-badge">草稿</span>
                  )}
                </div>
                <div className="blog-card-actions">
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPost(post);
                    }}
                    title="查看"
                  >
                    👁️
                  </button>
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h3 className="blog-card-title">{post.title}</h3>

              <p className="blog-card-excerpt">
                {post.summary ||
                  (post.content.length > 200
                    ? post.content.substring(0, 200) + '...'
                    : post.content)}
              </p>

              <div className="blog-card-tags">
                {post.category && (
                  <span className="category-tag">{post.category}</span>
                )}
                {post.tags?.map((tag) => (
                  <span key={tag} className="post-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="blog-card-footer">
                <span className="blog-card-date">
                  📅 {formatDate(post.createdAt)}
                </span>
                {post.updatedAt && (
                  <span className="blog-card-date">
                    ✏️ 编辑于 {formatDate(post.updatedAt)}
                  </span>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
