import { useState } from 'react'

interface ChatScreenProps {
  modelName: string
  url: string
}

const ChatScreen: React.FC<ChatScreenProps> = ({ modelName, url }) => {
  const [isLoading, setIsLoading] = useState(true)

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <h2>{modelName}</h2>
      </div>
      <div className="chat-body">
        <iframe 
          src={url} 
          className="webview-container"
          onLoad={handleIframeLoad}
          title={`${modelName} Chat`}
        />
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">加载中...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatScreen