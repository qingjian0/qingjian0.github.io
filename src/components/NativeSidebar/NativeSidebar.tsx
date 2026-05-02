import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { sessionManager, Session } from '../../utils/sessionManager'

interface NativeSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onSessionChange?: (sessionId: string) => void
}

const NativeSidebar: React.FC<NativeSidebarProps> = ({ 
  isOpen = false, 
  onClose,
  onSessionChange 
}) => {
  const location = useLocation()
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const loadSessions = () => {
    const allSessions = sessionManager.getAllSessions()
    setSessions(allSessions)
    setCurrentSessionId(sessionManager.getCurrentSessionId())
  }

  const getActiveClass = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  const handleLinkClick = () => {
    onClose?.()
  }

  const handleCreateSession = () => {
    const newSession = sessionManager.createSession('default')
    loadSessions()
    onSessionChange?.(newSession.id)
  }

  const handleSwitchSession = (sessionId: string) => {
    sessionManager.setCurrentSession(sessionId)
    setCurrentSessionId(sessionId)
    onSessionChange?.(sessionId)
  }

  const handleDeleteSession = (sessionId: string) => {
    sessionManager.deleteSession(sessionId)
    loadSessions()
    if (currentSessionId === sessionId) {
      const newCurrentId = sessionManager.getCurrentSessionId()
      if (newCurrentId) {
        onSessionChange?.(newCurrentId)
      }
    }
    setShowDeleteConfirm(null)
  }

  const handleStartRename = (session: Session) => {
    setEditingId(session.id)
    setEditingName(session.name)
  }

  const handleRenameSubmit = (sessionId: string) => {
    if (editingName.trim()) {
      sessionManager.renameSession(sessionId, editingName.trim())
      loadSessions()
    }
    setEditingId(null)
    setEditingName('')
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, sessionId: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(sessionId)
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditingName('')
    }
  }

  const filteredSessions = searchQuery.trim()
    ? sessions.filter(session => 
        session.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return '今天'
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <div className="user-info">
            <div className="user-avatar">
              <span className="avatar-text">古</span>
            </div>
            <div className="user-details">
              <div className="user-name">古空年</div>
              <div className="user-status">
                <span className="status-indicator"></span>
                <span className="status-text">在线中</span>
              </div>
            </div>
          </div>
          <button className="sidebar-close-button" onClick={onClose}>
            <span className="close-icon">×</span>
          </button>
        </div>
        <h2 className="sidebar-title">AI 智枢</h2>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <span className="sidebar-section-title">会话列表</span>
          <button 
            className="session-create-button" 
            onClick={handleCreateSession}
            title="新建会话"
          >
            +
          </button>
        </div>

        <div className="session-search">
          <input
            type="text"
            className="session-search-input"
            placeholder="搜索会话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="session-list">
          {filteredSessions.length === 0 ? (
            <div className="session-empty">
              {searchQuery ? '没有找到匹配的会话' : '暂无会话，点击 + 创建新会话'}
            </div>
          ) : (
            filteredSessions.map(session => (
              <div
                key={session.id}
                className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
                onClick={() => handleSwitchSession(session.id)}
              >
                {editingId === session.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    className="session-rename-input"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRenameSubmit(session.id)}
                    onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="session-item-content">
                      <div className="session-name">{session.name}</div>
                      <div className="session-meta">
                        <span className="session-time">{formatDate(session.updatedAt)}</span>
                        <span className="session-count">{session.messages.length} 条消息</span>
                      </div>
                    </div>
                    <div className="session-actions">
                      <button
                        className="session-action-button rename"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartRename(session)
                        }}
                        title="重命名"
                      >
                        ✎
                      </button>
                      <button
                        className="session-action-button delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(session.id)
                        }}
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}

                {showDeleteConfirm === session.id && (
                  <div 
                    className="session-delete-confirm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="confirm-text">确定删除？</span>
                    <div className="confirm-buttons">
                      <button
                        className="confirm-button yes"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        是
                      </button>
                      <button
                        className="confirm-button no"
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        否
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <hr className="sidebar-divider" />
      
      <ul className="sidebar-menu">
        <li className="sidebar-menu-item">
          <Link to="/memory" className={`sidebar-menu-link ${getActiveClass('/memory')}`} onClick={handleLinkClick}>
            <span className="menu-icon">🧠</span>
            <span className="menu-text">记忆管理</span>
          </Link>
        </li>
        <li className="sidebar-menu-item">
          <Link to="/settings" className={`sidebar-menu-link ${getActiveClass('/settings')}`} onClick={handleLinkClick}>
            <span className="menu-icon">🔒</span>
            <span className="menu-text">安全设置</span>
          </Link>
        </li>
      </ul>
      <hr className="sidebar-divider" />
      <ul className="sidebar-menu">
        <li className="sidebar-menu-item">
          <a href="#" className="sidebar-menu-link" onClick={handleLinkClick}>
            <span className="menu-icon">ℹ️</span>
            <span className="menu-text">关于</span>
          </a>
        </li>
        <li className="sidebar-menu-item">
          <a href="#" className="sidebar-menu-link" onClick={handleLinkClick}>
            <span className="menu-icon">❓</span>
            <span className="menu-text">帮助</span>
          </a>
        </li>
      </ul>
    </div>
  )
}

export default NativeSidebar
