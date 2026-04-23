import { useState, useEffect } from 'react'

interface Memory {
  id: string
  content: string
  createdAt: string
}

const MemoryList: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const handleDeleteMemory = (id: string) => {
    try {
      const updatedMemories = memories.filter(memory => memory.id !== id)
      setMemories(updatedMemories)
      localStorage.setItem('ai-zhishu-memories', JSON.stringify(updatedMemories))
    } catch (error) {
      console.error('Failed to delete memory:', error)
    }
  }

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
      </div>
      
      {memories.length === 0 ? (
        <div className="memory-empty">
          <h3>暂无记忆</h3>
          <p>开始聊天后，您的对话将会被保存到这里</p>
        </div>
      ) : (
        memories.map((memory) => (
          <div key={memory.id} className="memory-item">
            <div className="memory-item-content">
              {memory.content}
            </div>
            <div className="memory-item-meta">
              <span>{new Date(memory.createdAt).toLocaleString()}</span>
              <div className="memory-item-actions">
                <button 
                  className="memory-item-button"
                  onClick={() => handleDeleteMemory(memory.id)}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default MemoryList