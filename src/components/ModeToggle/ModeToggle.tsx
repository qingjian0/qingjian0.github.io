import { useState } from 'react'
import { AccessMode, getAccessMode, setAccessMode } from '../../utils/accessModeManager'
import { hasAPIKey } from '../../utils/apiService'

interface ModeToggleProps {
  modelName: string
  onModeChange?: (mode: AccessMode) => void
}

const ModeToggle: React.FC<ModeToggleProps> = ({ modelName, onModeChange }) => {
  const [mode, setMode] = useState<AccessMode>(getAccessMode())
  const hasKey = hasAPIKey(modelName)

  const handleModeChange = (newMode: AccessMode) => {
    setMode(newMode)
    setAccessMode(newMode)
    onModeChange?.(newMode)
  }

  return (
    <div className="mode-toggle-container">
      <div className="mode-toggle-label">访问模式</div>
      <div className="mode-toggle">
        <button
          className={`mode-button ${mode === 'api' ? 'active' : ''}`}
          onClick={() => handleModeChange('api')}
          title="使用API访问"
        >
          <span className="mode-icon">🔑</span>
          <span className="mode-text">API模式</span>
          {hasKey && <span className="mode-badge">已配置</span>}
        </button>
        <button
          className={`mode-button ${mode === 'webview' ? 'active' : ''}`}
          onClick={() => handleModeChange('webview')}
          title="通过网页直接访问"
        >
          <span className="mode-icon">🌐</span>
          <span className="mode-text">网页模式</span>
        </button>
      </div>
      {mode === 'api' && !hasKey && (
        <div className="mode-hint">
          💡 当前未配置API密钥，使用模拟回复。请前往安全设置配置密钥以获取真实回复。
        </div>
      )}
      {mode === 'webview' && (
        <div className="mode-hint">
          💡 网页模式将直接打开AI平台的网页，提供原生体验。
        </div>
      )}
    </div>
  )
}

export default ModeToggle
