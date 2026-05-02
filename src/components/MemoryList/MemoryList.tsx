import { useState, useEffect, useMemo, useCallback } from 'react'
import { sessionManager, Session } from '../../utils/sessionManager'

interface Memory {
  id: string
  content: string
  createdAt: string
  tags: string[]
  source?: 'manual' | 'synced'
  sessionId?: string
}

const MEMORY_STORAGE_KEY = 'ai-zhishu-memories'
const AVAILABLE_TAGS_KEY = 'ai-zhishu-available-tags'

const DEFAULT_TAGS = ['重要', '待办', '想法', '学习', '工作', '生活']

const MemoryList: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'content'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS)
  const [newTagInput, setNewTagInput] = useState('')
  const [showTagManager, setShowTagManager] = useState(false)
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null)
  const [editingTags, setEditingTags] = useState<string[]>([])
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const loadMemories = () => {
      try {
        const storedMemories = localStorage.getItem(MEMORY_STORAGE_KEY)
        if (storedMemories) {
          const parsed = JSON.parse(storedMemories)
          const migrated = parsed.map((m: Memory) => ({
            ...m,
            tags: m.tags || []
          }))
          setMemories(migrated)
        }
        
        const storedTags = localStorage.getItem(AVAILABLE_TAGS_KEY)
        if (storedTags) {
          setAvailableTags(JSON.parse(storedTags))
        }
      } catch (error) {
        console.error('Failed to load memories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMemories()
  }, [])

  const saveMemories = useCallback((updatedMemories: Memory[]) => {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(updatedMemories))
    } catch (error) {
      console.error('Failed to save memories:', error)
    }
  }, [])

  const saveAvailableTags = useCallback((tags: string[]) => {
    try {
      localStorage.setItem(AVAILABLE_TAGS_KEY, JSON.stringify(tags))
      setAvailableTags(tags)
    } catch (error) {
      console.error('Failed to save tags:', error)
    }
  }, [])

  const allUsedTags = useMemo(() => {
    const tagSet = new Set<string>()
    memories.forEach(m => m.tags.forEach(t => tagSet.add(t)))
    return Array.from(tagSet)
  }, [memories])

  const filteredMemories = useMemo(() => {
    let result = [...memories]
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(memory => 
        memory.content.toLowerCase().includes(term) ||
        memory.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }
    
    if (selectedTags.length > 0) {
      result = result.filter(memory => 
        selectedTags.some(tag => memory.tags.includes(tag))
      )
    }
    
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else {
        const contentA = a.content.toLowerCase()
        const contentB = b.content.toLowerCase()
        return sortOrder === 'asc' 
          ? contentA.localeCompare(contentB) 
          : contentB.localeCompare(contentA)
      }
    })
    
    return result
  }, [memories, searchTerm, selectedTags, sortBy, sortOrder])

  const handleSyncFromSession = async () => {
    const currentSession = sessionManager.getCurrentSession()
    if (!currentSession || currentSession.messages.length === 0) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 2000)
      return
    }

    setSyncStatus('syncing')

    try {
      const sessionContent = formatSessionToMemory(currentSession)
      const newMemory: Memory = {
        id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: sessionContent,
        createdAt: new Date().toISOString(),
        tags: ['会话同步'],
        source: 'synced',
        sessionId: currentSession.id
      }

      const updatedMemories = [newMemory, ...memories]
      setMemories(updatedMemories)
      saveMemories(updatedMemories)
      
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 2000)
    } catch (error) {
      console.error('Failed to sync session:', error)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 2000)
    }
  }

  const formatSessionToMemory = (session: Session): string => {
    const lines = [`【会话: ${session.name}】`, '']
    session.messages.forEach(msg => {
      const sender = msg.sender === 'user' ? '👤 用户' : '🤖 AI'
      lines.push(`${sender}: ${msg.text}`)
    })
    return lines.join('\n')
  }

  const handleCopyToClipboard = async (memory: Memory) => {
    try {
      await navigator.clipboard.writeText(memory.content)
      setCopiedId(memory.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleRestoreAsContext = (memory: Memory) => {
    const contextData = {
      type: 'memory-context',
      memoryId: memory.id,
      content: memory.content,
      timestamp: Date.now()
    }
    
    try {
      localStorage.setItem('ai-zhishu-pending-context', JSON.stringify(contextData))
      window.location.href = '/?restoreContext=true'
    } catch (error) {
      console.error('Failed to restore context:', error)
    }
  }

  const handleDeleteMemory = useCallback((id: string) => {
    setMemories(prev => {
      const updatedMemories = prev.filter(memory => memory.id !== id)
      saveMemories(updatedMemories)
      return updatedMemories
    })
    setSelectedMemories(prev => prev.filter(selectedId => selectedId !== id))
  }, [saveMemories])

  const handleBatchDelete = useCallback(() => {
    if (selectedMemories.length === 0) return
    
    setMemories(prev => {
      const updatedMemories = prev.filter(memory => !selectedMemories.includes(memory.id))
      saveMemories(updatedMemories)
      return updatedMemories
    })
    setSelectedMemories([])
    setIsSelectMode(false)
  }, [selectedMemories, saveMemories])

  const handleSelectMemory = useCallback((id: string) => {
    setSelectedMemories(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id)
      } else {
        return [...prev, id]
      }
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedMemories.length === filteredMemories.length) {
      setSelectedMemories([])
    } else {
      setSelectedMemories(filteredMemories.map(memory => memory.id))
    }
  }, [selectedMemories.length, filteredMemories])

  const handleTagFilter = useCallback((tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }, [])

  const handleAddTag = useCallback(() => {
    const newTag = newTagInput.trim()
    if (newTag && !availableTags.includes(newTag)) {
      const updatedTags = [...availableTags, newTag]
      saveAvailableTags(updatedTags)
      setNewTagInput('')
    }
  }, [newTagInput, availableTags, saveAvailableTags])

  const handleDeleteTag = useCallback((tag: string) => {
    const updatedTags = availableTags.filter(t => t !== tag)
    saveAvailableTags(updatedTags)
    
    setMemories(prev => {
      const updatedMemories = prev.map(m => ({
        ...m,
        tags: m.tags.filter(t => t !== tag)
      }))
      saveMemories(updatedMemories)
      return updatedMemories
    })
    
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }, [availableTags, saveAvailableTags, saveMemories])

  const handleStartEditTags = (memory: Memory) => {
    setEditingMemoryId(memory.id)
    setEditingTags([...memory.tags])
  }

  const handleSaveTags = (memoryId: string) => {
    const updatedMemories = memories.map(m => {
      if (m.id === memoryId) {
        return { ...m, tags: editingTags }
      }
      return m
    })
    setMemories(updatedMemories)
    saveMemories(updatedMemories)
    setEditingMemoryId(null)
    setEditingTags([])
  }

  const handleToggleEditingTag = (tag: string) => {
    setEditingTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleStartChat = useCallback(() => {
    window.location.href = '/'
  }, [])

  const handleExportMemories = useCallback(() => {
    try {
      const dataStr = JSON.stringify(filteredMemories, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `memories-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export memories:', error)
    }
  }, [filteredMemories])

  const stats = useMemo(() => {
    const total = memories.length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMemories = memories.filter(memory => {
      const memoryDate = new Date(memory.createdAt)
      return memoryDate >= today
    })
    return { total, today: todayMemories.length, filtered: filteredMemories.length }
  }, [memories, filteredMemories])

  if (isLoading) {
    return (
      <div className="memory-list">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="memory-list">
      <div className="memory-list-header">
        <h2>记忆管理</h2>
        <p>管理您的聊天记忆和历史记录</p>
        
        {memories.length > 0 && (
          <div className="memory-list-stats">
            <div className="memory-stat">
              <span className="memory-stat-number">{stats.total}</span>
              <span className="memory-stat-label">总记忆数</span>
            </div>
            <div className="memory-stat">
              <span className="memory-stat-number">{stats.today}</span>
              <span className="memory-stat-label">今日记忆</span>
            </div>
            <div className="memory-stat">
              <span className="memory-stat-number">{stats.filtered}</span>
              <span className="memory-stat-label">当前显示</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="memory-controls">
        <div className="memory-search">
          <input
            type="text"
            placeholder="搜索记忆或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="memory-search-input"
          />
        </div>
        
        <div className="memory-sort">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'content')}
            className="memory-sort-select"
          >
            <option value="date">按日期</option>
            <option value="content">按内容</option>
          </select>
          <button 
            className="memory-sort-button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        
        <div className="memory-actions">
          <button 
            className="memory-action-button sync-button"
            onClick={handleSyncFromSession}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? '⏳ 同步中...' : 
             syncStatus === 'success' ? '✅ 同步成功' :
             syncStatus === 'error' ? '❌ 同步失败' : '📥 从会话同步'}
          </button>
          <button 
            className="memory-action-button"
            onClick={() => setShowTagManager(!showTagManager)}
          >
            🏷️ 标签管理
          </button>
          <button 
            className="memory-action-button"
            onClick={() => setIsSelectMode(!isSelectMode)}
          >
            {isSelectMode ? '取消选择' : '批量选择'}
          </button>
          <button 
            className="memory-action-button"
            onClick={handleExportMemories}
          >
            导出
          </button>
        </div>
      </div>

      {showTagManager && (
        <div className="tag-manager">
          <div className="tag-manager-header">
            <h3>标签管理</h3>
            <button 
              className="tag-manager-close"
              onClick={() => setShowTagManager(false)}
            >
              ✕
            </button>
          </div>
          <div className="tag-manager-content">
            <div className="tag-add-form">
              <input
                type="text"
                placeholder="添加新标签..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="tag-add-input"
              />
              <button className="tag-add-button" onClick={handleAddTag}>
                添加
              </button>
            </div>
            <div className="tag-list">
              {availableTags.map(tag => (
                <div key={tag} className="tag-item">
                  <span className="tag-name">{tag}</span>
                  <button 
                    className="tag-delete-button"
                    onClick={() => handleDeleteTag(tag)}
                    title="删除标签"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {allUsedTags.length > 0 && (
        <div className="tag-filter-section">
          <span className="tag-filter-label">按标签筛选：</span>
          <div className="tag-filter-chips">
            {allUsedTags.map(tag => (
              <button
                key={tag}
                className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => handleTagFilter(tag)}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                className="tag-chip clear"
                onClick={() => setSelectedTags([])}
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
      )}
      
      {isSelectMode && selectedMemories.length > 0 && (
        <div className="memory-batch-actions">
          <div className="batch-info">
            已选择 {selectedMemories.length} 项
          </div>
          <div className="batch-buttons">
            <button 
              className="batch-button select-all"
              onClick={handleSelectAll}
            >
              {selectedMemories.length === filteredMemories.length ? '取消全选' : '全选'}
            </button>
            <button 
              className="batch-button delete"
              onClick={handleBatchDelete}
            >
              批量删除
            </button>
          </div>
        </div>
      )}
      
      {filteredMemories.length === 0 ? (
        <div className="memory-empty">
          <div className="memory-empty-icon">🧠</div>
          <h3>{searchTerm || selectedTags.length > 0 ? '未找到匹配的记忆' : '暂无记忆'}</h3>
          <p>{searchTerm || selectedTags.length > 0 ? '尝试使用其他关键词或清除标签筛选' : '开始聊天后，您的对话将会被保存到这里，方便您随时回顾和管理'}</p>
          {!searchTerm && selectedTags.length === 0 && (
            <button 
              className="memory-empty-button"
              onClick={handleStartChat}
            >
              开始聊天
            </button>
          )}
        </div>
      ) : (
        <div className="memory-grid">
          {filteredMemories.map((memory) => (
            <div 
              key={memory.id} 
              className={`memory-item ${isSelectMode && selectedMemories.includes(memory.id) ? 'selected' : ''}`}
            >
              {isSelectMode && (
                <div className="memory-item-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedMemories.includes(memory.id)}
                    onChange={() => handleSelectMemory(memory.id)}
                  />
                </div>
              )}
              
              <div className="memory-item-content">
                {memory.content}
              </div>
              
              {memory.tags.length > 0 && (
                <div className="memory-item-tags">
                  {editingMemoryId === memory.id ? (
                    <div className="tags-edit-mode">
                      <div className="tags-edit-chips">
                        {availableTags.map(tag => (
                          <button
                            key={tag}
                            className={`tag-chip small ${editingTags.includes(tag) ? 'selected' : ''}`}
                            onClick={() => handleToggleEditingTag(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <div className="tags-edit-actions">
                        <button 
                          className="tags-edit-save"
                          onClick={() => handleSaveTags(memory.id)}
                        >
                          保存
                        </button>
                        <button 
                          className="tags-edit-cancel"
                          onClick={() => setEditingMemoryId(null)}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    memory.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="memory-tag"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTagFilter(tag)
                        }}
                      >
                        {tag}
                      </span>
                    ))
                  )}
                </div>
              )}
              
              <div className="memory-item-meta">
                <div className="memory-item-info">
                  <span className="memory-item-time">
                    {new Date(memory.createdAt).toLocaleString()}
                  </span>
                  {memory.source === 'synced' && (
                    <span className="memory-item-source">📥 会话同步</span>
                  )}
                </div>
                <div className="memory-item-actions">
                  <button 
                    className="memory-item-button copy"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyToClipboard(memory)
                    }}
                    title="复制到剪贴板"
                  >
                    {copiedId === memory.id ? '✅ 已复制' : '📋 复制'}
                  </button>
                  <button 
                    className="memory-item-button restore"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRestoreAsContext(memory)
                    }}
                    title="作为新会话上下文"
                  >
                    🔄 恢复
                  </button>
                  <button 
                    className="memory-item-button tag-edit"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEditTags(memory)
                    }}
                    title="编辑标签"
                  >
                    🏷️ 标签
                  </button>
                  <button 
                    className="memory-item-button delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteMemory(memory.id)
                    }}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MemoryList
