import { useState } from 'react';
import { BlogPost, BlogManager } from '../../utils/blogManager';
import BlogList from './BlogList';
import BlogDetail from './BlogDetail';
import BlogEditor from './BlogEditor';

type BlogView = 'list' | 'detail' | 'editor';

export default function Blog() {
  const [view, setView] = useState<BlogView>('list');
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);

  const blogManager = BlogManager.getInstance();

  const handleSelectPost = (post: BlogPost) => {
    setCurrentPost(post);
    setView('detail');
  };

  const handleNewPost = () => {
    setCurrentPost(null);
    setIsEditingNew(true);
    setView('editor');
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditingNew(false);
    setView('editor');
  };

  const handleSave = () => {
    setView('list');
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这篇文章吗？')) {
      blogManager.deletePost(id);
      setView('list');
      setCurrentPost(null);
    }
  };

  const handleBack = () => {
    setView('list');
    setCurrentPost(null);
  };

  return (
    <div className="blog-app">
      {view === 'list' && (
        <BlogList
          onSelectPost={handleSelectPost}
          onNewPost={handleNewPost}
        />
      )}
      {view === 'detail' && currentPost && (
        <BlogDetail
          post={currentPost}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {view === 'editor' && (
        <BlogEditor
          post={isEditingNew ? null : currentPost}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
