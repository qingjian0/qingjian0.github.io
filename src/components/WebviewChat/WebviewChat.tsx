import { useState, useEffect, useRef } from 'react'
import { getWebviewUrl } from '../../utils/accessModeManager'

interface WebviewChatProps {
  modelName: string
}

const WebviewChat: React.FC<WebviewChatProps> = ({ modelName }) => {
  const [url, setUrl] = useState(getWebviewUrl(modelName))
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setUrl(getWebviewUrl(modelName))
    setIsLoading(true)
  }, [modelName])

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    if (iframeRef.current) {
      iframeRef.current.src = url
    }
  }

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="webview-container">
      <div className="webview-header">
        <div className="webview-info">
          <h3>网页模式 - {modelName}</h3>
          <div className="webview-url">{url}</div>
        </div>
        <div className="webview-actions">
          <button 
            className="webview-action-btn refresh-btn"
            onClick={handleRefresh}
            title="刷新页面"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 12H8M3 12V7M3 12L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            刷新
          </button>
          <button 
            className="webview-action-btn external-btn"
            onClick={handleOpenExternal}
            title="在新标签页打开"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 3H21V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M21 3L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 10V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            新标签页
          </button>
        </div>
      </div>
      <div className="webview-content">
        {isLoading && (
          <div className="webview-loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在加载 {modelName}...</div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="webview-iframe"
          title={modelName}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={handleLoad}
        />
      </div>
    </div>
  )
}

export default WebviewChat
