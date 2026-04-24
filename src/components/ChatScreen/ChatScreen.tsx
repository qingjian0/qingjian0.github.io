import { useState, useRef, useEffect } from 'react'
import { chatWithAI } from '../../utils/apiService'

interface ChatScreenProps {
  modelName: string
  url?: string
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

const ChatScreen: React.FC<ChatScreenProps> = ({ modelName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '你好！我是你的AI助手，有什么我可以帮助你的吗？',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setIsTyping(true)
    setError('')

    try {
      // 构建API消息格式
      const apiMessages = [
        { role: 'system' as const, content: '你是一个智能AI助手' },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text
        })),
        { role: 'user' as const, content: inputText.trim() }
      ]

      // 调用AI API
      const response = await chatWithAI(modelName, apiMessages)
      
      if (response.success && response.data) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data,
          sender: 'ai',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        setError(response.error || 'AI回复失败')
      }
    } catch (err) {
      console.error('发送消息失败:', err)
      setError('发送消息失败，请稍后重试')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2>{modelName}</h2>
          <div className="chat-status">在线</div>
        </div>
      </div>
      <div className="chat-body">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message-container ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className={`message-bubble ${message.sender === 'user' ? 'sent' : 'received'}`}>
              <div className="message-content">{message.text}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
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
        {error && (
          <div className="message-container error-message">
            <div className="message-bubble error">
              <div className="message-content">{error}</div>
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
        />
        <button 
          className="send-button"
          onClick={handleSendMessage}
          disabled={inputText.trim() === ''}
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