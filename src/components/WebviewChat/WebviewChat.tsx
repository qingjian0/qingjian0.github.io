import { useState, useEffect, useRef, useCallback } from 'react'
import { getWebviewUrl } from '../../utils/accessModeManager'

interface WebviewChatProps {
  modelName: string
}

type WebviewStatus = 'loading' | 'loaded' | 'error' | 'timeout'

const LOAD_TIMEOUT = 30000
const MAX_RETRIES = 2

const WebviewChat: React.FC<WebviewChatProps> = ({ modelName }) => {
  const url = getWebviewUrl(modelName)
  const [status, setStatus] = useState<WebviewStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const startTime = Date.now()
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(Math.floor((elapsed / LOAD_TIMEOUT) * 100), 95)
      setProgress(newProgress)
    }, 500)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    handleLoadStart()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [modelName])

  const handleLoadStart = useCallback(() => {
    setStatus('loading')
    setErrorMessage('')
    setRetryCount(0)
    setProgress(0)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      handleTimeout()
    }, LOAD_TIMEOUT)

    if (iframeRef.current) {
      iframeRef.current.src = getWebviewUrl(modelName)
    }
  }, [modelName])

  const handleLoad = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    setProgress(100)
    setStatus('loaded')
  }, [])

  const handleTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    setStatus('timeout')
    setErrorMessage('加载超时，请检查网络连接或稍后重试')
  }, [])

  const handleError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1)
      setStatus('loading')
      setErrorMessage(`加载失败，正在重试 (${retryCount + 1}/${MAX_RETRIES})...`)
      
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = getWebviewUrl(modelName)
        }
      }, 2000)
    } else {
      setStatus('error')
      setErrorMessage('无法加载页面，请检查网络连接或尝试刷新')
    }
  }, [retryCount, modelName])

  const handleRefresh = useCallback(() => {
    handleLoadStart()
  }, [handleLoadStart])

  const handleOpenExternal = useCallback(() => {
    const targetUrl = getWebviewUrl(modelName)
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }, [modelName])

  const handleReloadPage = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <div className="webview-container">
      <div className="webview-header">
        <div className="webview-info">
          <h3 className="webview-title">
            <span className="webview-badge">🌐</span>
            网页模式 - {modelName}
          </h3>
          <div className="webview-url-container">
            <span className="webview-url-label">地址:</span>
            <span className="webview-url">{url}</span>
          </div>
        </div>
        <div className="webview-actions">
          <button 
            className="webview-action-btn refresh-btn"
            onClick={handleRefresh}
            disabled={status === 'loading'}
            title="刷新页面"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 12H8M3 12V7M3 12L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {status === 'loading' ? '加载中' : '刷新'}
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
        {status === 'loading' && (
          <div className="webview-overlay webview-loading">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">正在加载 {modelName}...</div>
              <div className="loading-progress">
                <div 
                  className="loading-progress-bar" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="loading-hint">
                {retryCount > 0 && <span>已重试 {retryCount} 次</span>}
              </div>
            </div>
          </div>
        )}

        {(status === 'error' || status === 'timeout') && (
          <div className="webview-overlay webview-error">
            <div className="error-container">
              <div className="error-icon">
                {status === 'timeout' ? '⏱️' : '❌'}
              </div>
              <div className="error-title">
                {status === 'timeout' ? '加载超时' : '加载失败'}
              </div>
              <div className="error-message">{errorMessage}</div>
              <div className="error-actions">
                <button className="error-action-btn retry-btn" onClick={handleRefresh}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M3 12H8M3 12V7M3 12L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  重试加载
                </button>
                <button className="error-action-btn external-btn" onClick={handleOpenExternal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 3H21V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M21 3L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18 10V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  在浏览器中打开
                </button>
                <button className="error-action-btn reload-btn" onClick={handleReloadPage}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 4h-3.5C14.67 4 14 4.67 14 5.5V7H10V5.5C10 4.67 9.33 4 8.5 4H5C4.45 4 4 4.45 4 5v3.5C4 9.33 4.67 10 5.5 10H7v4H5.5C4.67 14 4 14.67 4 15.5V19c0 .55.45 1 1 1h3.5c.83 0 1.5-.67 1.5-1.5V17h4v1.5c0 .83.67 1.5 1.5 1.5H19c.55 0 1-.45 1-1v-3.5c0-.83-.67-1.5-1.5-1.5H17v-4h1.5c.83 0 1.5-.67 1.5-1.5V5c0-.55-.45-1-1-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  重新加载页面
                </button>
              </div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          className={`webview-iframe ${status === 'loaded' ? 'visible' : ''}`}
          title={`${modelName} Web Chat`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      </div>

      <div className="webview-footer">
        <div className="webview-status-bar">
          <span className={`status-indicator ${status}`}>
            {status === 'loading' && '⏳'}
            {status === 'loaded' && '✓'}
            {status === 'error' && '✗'}
            {status === 'timeout' && '⏰'}
          </span>
          <span className="status-text">
            {status === 'loading' && '加载中...'}
            {status === 'loaded' && '已就绪'}
            {status === 'error' && '加载失败'}
            {status === 'timeout' && '加载超时'}
          </span>
        </div>
        <div className="webview-security-info">
          <span className="security-badge">🔒</span>
          <span className="security-text">安全模式已启用</span>
        </div>
      </div>
    </div>
  )
}

export default WebviewChat
