import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { chatWithAI } from '../../utils/apiService'
import { sessionManager, Message, Session } from '../../utils/sessionManager'

interface ChatScreenProps {
  modelName: string
  url?: string
}

interface ExtendedMessage extends Message {
  error?: string
  isRetrying?: boolean
}

type ExportFormat = 'json' | 'markdown'

const ChatScreen: React.FC<ChatScreenProps> = ({ modelName }) => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string>('')
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const existingSession = sessionManager.getCurrentSession()
    if (existingSession && existingSession.model === modelName) {
      setCurrentSession(existingSession)
      setMessages(existingSession.messages.map(msg => ({ ...msg })))
    } else {
      const newSession = sessionManager.createSession(modelName)
      setCurrentSession(newSession)
      setMessages([{
        id: 'welcome-msg',
        text: '你好！我是你的AI助手，有什么我可以帮助你的吗？',
        sender: 'ai',
        timestamp: new Date()
      }])
    }
  }, [modelName])

  const saveMessageToSession = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentSession) return null
    return sessionManager.addMessage(currentSession.id, message)
  }, [currentSession])

  const handleSendMessage = async (retryMessage?: ExtendedMessage) => {
    const textToSend = retryMessage?.text || inputText.trim()
    if (textToSend === '' || !currentSession) return

    if (retryMessage) {
      setMessages(prev => prev.map(msg => 
        msg.id === retryMessage.id ? { ...msg, isRetrying: true, error: undefined } : msg
      ))
    } else {
      const userMessage: ExtendedMessage = {
        id: `temp-user-${Date.now()}`,
        text: textToSend,
        sender: 'user',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      setInputText('')
    }

    setIsTyping(true)
    setError('')

    try {
      const apiMessages = [
        { role: 'system' as const, content: '你是一个智能AI助手' },
        ...messages
          .filter(msg => !msg.error && !msg.isRetrying)
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.text
          })),
        { role: 'user' as const, content: textToSend }
      ]

      const response = await chatWithAI(modelName, apiMessages)
      
      if (response.success && response.data) {
        if (!retryMessage) {
          const savedUserMsg = saveMessageToSession({ text: textToSend, sender: 'user' })
          const savedAiMsg = saveMessageToSession({ text: response.data, sender: 'ai' })
          
          if (savedUserMsg && savedAiMsg) {
            setMessages(prev => {
              const filtered = prev.filter(msg => !msg.id.startsWith('temp-'))
              return [...filtered, savedUserMsg, savedAiMsg]
            })
          } else {
            const aiResponse: ExtendedMessage = {
              id: (Date.now() + 1).toString(),
              text: response.data,
              sender: 'ai',
              timestamp: new Date()
            }
            setMessages(prev => [...prev, aiResponse])
          }
        } else {
          const savedAiMsg = saveMessageToSession({ text: response.data, sender: 'ai' })
          if (savedAiMsg) {
            setMessages(prev => prev.map(msg => 
              msg.id === retryMessage.id 
                ? { ...savedAiMsg, isRetrying: false }
                : msg
            ))
          } else {
            setMessages(prev => prev.map(msg => 
              msg.id === retryMessage.id 
                ? { ...msg, isRetrying: false, error: undefined }
                : msg
            ))
          }
        }
      } else {
        const errorMsg = response.error || 'AI回复失败'
        if (retryMessage) {
          setMessages(prev => prev.map(msg => 
            msg.id === retryMessage.id 
              ? { ...msg, isRetrying: false, error: errorMsg }
              : msg
          ))
        } else {
          setError(errorMsg)
          setMessages(prev => {
            const tempId = `temp-ai-${Date.now()}`
            return [...prev, {
              id: tempId,
              text: textToSend,
              sender: 'ai',
              timestamp: new Date(),
              error: errorMsg
            }]
          })
        }
      }
    } catch (err) {
      console.error('发送消息失败:', err)
      const errorMsg = '发送消息失败，请稍后重试'
      if (retryMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === retryMessage.id 
            ? { ...msg, isRetrying: false, error: errorMsg }
            : msg
        ))
      } else {
        setError(errorMsg)
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleRetry = useCallback((message: ExtendedMessage) => {
    handleSendMessage(message)
  }, [])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [])

  const handleExport = useCallback((format: ExportFormat) => {
    if (!currentSession) return
    
    const content = sessionManager.exportSession(currentSession.id, format)
    if (!content) {
      setError('导出失败：无法获取会话内容')
      return
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentSession.name}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }, [currentSession])

  const renderedMessages = useMemo(() => {
    return messages.map((message) => (
      <div 
        key={message.id} 
        className={`message-container ${message.sender === 'user' ? 'user-message' : 'ai-message'} ${message.error ? 'has-error' : ''}`}
      >
        <div className={`message-bubble ${message.sender === 'user' ? 'sent' : 'received'} ${message.error ? 'error' : ''}`}>
          <div className="message-content">{message.text}</div>
          <div className="message-meta">
            <span className="message-time">
              {message.timestamp instanceof Date 
                ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            </span>
            {message.isRetrying && <span className="retry-status">重试中...</span>}
          </div>
          {message.error && (
            <div className="message-error">
              <span className="error-text">{message.error}</span>
              <button 
                className="retry-button"
                onClick={() => handleRetry(message)}
                disabled={isTyping}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.51 15C4.15839 16.8404 5.38734 18.4202 7.01166 19.5014C8.63598 20.5826 10.5677 21.1066 12.5157 20.9945C14.4637 20.8824 16.3226 20.1402 17.8121 18.8798C19.3017 17.6193 20.3413 15.9090 20.7742 14.0064C21.2072 12.1037 21.0101 10.1139 20.2126 8.33119C19.4152 6.54852 18.0605 5.06418 16.3528 4.09577C14.6451 3.12737 12.6769 2.72597 10.7447 2.95134C8.81245 3.17672 7.02089 4.01645 5.64 5.35999L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                重试
              </button>
            </div>
          )}
        </div>
      </div>
    ))
  }, [messages, handleRetry, isTyping])

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2>{modelName}</h2>
          <div className="chat-status">
            {currentSession ? currentSession.name : '加载中...'}
          </div>
        </div>
        <div className="chat-header-actions" ref={exportMenuRef}>
          <button 
            className="export-button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={!currentSession || messages.length === 0}
            title="导出对话"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showExportMenu && (
            <div className="export-menu">
              <button 
                className="export-option"
                onClick={() => handleExport('json')}
              >
                <span className="export-icon">📄</span>
                导出为 JSON
              </button>
              <button 
                className="export-option"
                onClick={() => handleExport('markdown')}
              >
                <span className="export-icon">📝</span>
                导出为 Markdown
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="chat-body">
        {renderedMessages}
        {isTyping && (
          <div className="message-container ai-message">
            <div className="message-bubble received typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {error && !messages.some(m => m.error) && (
          <div className="message-container error-message">
            <div className="message-bubble error">
              <div className="message-content">{error}</div>
              <button 
                className="retry-button global-retry"
                onClick={() => handleSendMessage()}
                disabled={isTyping}
              >
                重试
              </button>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input-container">
        <textarea
          className="message-input"
          placeholder="输入消息..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={isTyping}
        />
        <button 
          className="send-button"
          onClick={() => handleSendMessage()}
          disabled={inputText.trim() === '' || isTyping}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ChatScreen
