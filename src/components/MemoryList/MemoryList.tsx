import { useState, useEffect } from 'react'

interface Memory {
  id: string
  content: string
  createdAt: string
}

const MemoryList: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([])
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'content'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)

  useEffect(() => {
    // 从localStorage加载记忆
    const loadMemories = () => {
      try {
        const storedMemories = localStorage.getItem('ai-zhishu-memories')
        if (storedMemories) {
          setMemories(JSON.parse(storedMemories))
        }
      } catch (error) {
        console.error('Failed to load memories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMemories()
  }, [])

  // 过滤和排序记忆
  useEffect(() => {
    let result = [...memories]
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(memory => 
        memory.content.toLowerCase().includes(term)
      )
    }
    
    // 排序
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else {
        // 按内容排序
        const contentA = a.content.toLowerCase()
        const contentB = b.content.toLowerCase()
        return sortOrder === 'asc' 
          ? contentA.localeCompare(contentB) 
          : contentB.localeCompare(contentA)
      }
    })
    
    setFilteredMemories(result)
  }, [memories, searchTerm, sortBy, sortOrder])

  const handleDeleteMemory = (id: string) => {
    try {
      const updatedMemories = memories.filter(memory => memory.id !== id)
      setMemories(updatedMemories)
      setSelectedMemories(selectedMemories.filter(selectedId => selectedId !== id))
      localStorage.setItem('ai-zhishu-memories', JSON.stringify(updatedMemories))
    } catch (error) {
      console.error('Failed to delete memory:', error)
    }
  }

  const handleBatchDelete = () => {
    if (selectedMemories.length === 0) return
    
    try {
      const updatedMemories = memories.filter(memory => !selectedMemories.includes(memory.id))
      setMemories(updatedMemories)
      setSelectedMemories([])
      setIsSelectMode(false)
      localStorage.setItem('ai-zhishu-memories', JSON.stringify(updatedMemories))
    } catch (error) {
      console.error('Failed to batch delete memories:', error)
    }
  }

  const handleSelectMemory = (id: string) => {
    setSelectedMemories(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedMemories.length === filteredMemories.length) {
      setSelectedMemories([])
    } else {
      setSelectedMemories(filteredMemories.map(memory => memory.id))
    }
  }

  const handleStartChat = () => {
    // 导航到聊天页面
    window.location.href = '/'
  }

  const handleExportMemories = () => {
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
  }

  const getMemoryStats = () => {
    const total = memories.length
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMemories = memories.filter(memory => {
      const memoryDate = new Date(memory.createdAt)
      return memoryDate >= today
    })
    return { total, today: todayMemories.length, filtered: filteredMemories.length }
  }

  const stats = getMemoryStats()

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
      
      {memories.length > 0 && (
        <div className="memory-controls">
          <div className="memory-search">
            <input
              type="text"
              placeholder="搜索记忆..."
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
          <h3>{searchTerm ? '未找到匹配的记忆' : '暂无记忆'}</h3>
          <p>{searchTerm ? '尝试使用其他关键词搜索' : '开始聊天后，您的对话将会被保存到这里，方便您随时回顾和管理'}</p>
          {!searchTerm && (
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
              onClick={isSelectMode ? () => handleSelectMemory(memory.id) : undefined}
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
              <div className="memory-item-meta">
                <div className="memory-item-time">
                  {new Date(memory.createdAt).toLocaleString()}
                </div>
                <div className="memory-item-actions">
                  <button 
                    className="memory-item-button delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteMemory(memory.id)
                    }}
                  >
                    🗑️ 删除
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