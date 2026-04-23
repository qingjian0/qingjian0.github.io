
import { Link, useLocation } from 'react-router-dom'

interface NativeSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const NativeSidebar: React.FC<NativeSidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation()

  const getActiveClass = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  const handleLinkClick = () => {
    onClose?.()
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
      <ul className="sidebar-menu">
        <li className="sidebar-menu-item">
          <Link to="/" className={`sidebar-menu-link ${getActiveClass('/')}`} onClick={handleLinkClick}>
            <span className="menu-icon">💬</span>
            <span className="menu-text">聊天</span>
          </Link>
        </li>
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