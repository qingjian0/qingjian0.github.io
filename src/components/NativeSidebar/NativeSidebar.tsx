
import { Link } from 'react-router-dom'

const NativeSidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>AI 智枢</h2>
      </div>
      <ul className="sidebar-menu">
        <li className="sidebar-menu-item">
          <Link to="/" className="sidebar-menu-link active">
            <span>聊天</span>
          </Link>
        </li>
        <li className="sidebar-menu-item">
          <Link to="/memory" className="sidebar-menu-link">
            <span>记忆管理</span>
          </Link>
        </li>
        <li className="sidebar-menu-item">
          <Link to="/settings" className="sidebar-menu-link">
            <span>安全设置</span>
          </Link>
        </li>
      </ul>
      <hr className="sidebar-divider" />
      <ul className="sidebar-menu">
        <li className="sidebar-menu-item">
          <a href="#" className="sidebar-menu-link">
            <span>关于</span>
          </a>
        </li>
        <li className="sidebar-menu-item">
          <a href="#" className="sidebar-menu-link">
            <span>帮助</span>
          </a>
        </li>
      </ul>
    </div>
  )
}

export default NativeSidebar