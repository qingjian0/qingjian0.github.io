export interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export interface Session {
  id: string
  name: string
  model: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'ai-zhishu-sessions'
const CURRENT_SESSION_KEY = 'ai-zhishu-current-session'

class SessionManager {
  private sessions: Map<string, Session> = new Map()
  private currentSessionId: string | null = null
  private isInitialized: boolean = false
  private saveTimeout: ReturnType<typeof setTimeout> | null = null

  constructor() {
    this.initialize()
  }

  private initialize(): void {
    if (this.isInitialized) return
    
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY)
      if (storedSessions) {
        const sessionsArray: Session[] = JSON.parse(storedSessions)
        sessionsArray.forEach(session => {
          this.sessions.set(session.id, session)
        })
      }

      const storedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY)
      if (storedCurrentId && this.sessions.has(storedCurrentId)) {
        this.currentSessionId = storedCurrentId
      } else if (this.sessions.size > 0) {
        this.currentSessionId = this.sessions.keys().next().value || null
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize sessions:', error)
    }
  }

  private debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    this.saveTimeout = setTimeout(() => {
      this.saveToStorage()
    }, 300)
  }

  private saveToStorage(): void {
    try {
      const sessionsArray = Array.from(this.sessions.values())
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsArray))
      if (this.currentSessionId) {
        localStorage.setItem(CURRENT_SESSION_KEY, this.currentSessionId)
      }
    } catch (error) {
      console.error('Failed to save sessions:', error)
    }
  }

  createSession(model: string, name?: string): Session {
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const sessionName = name || `新对话 ${this.sessions.size + 1}`
    
    const session: Session = {
      id,
      name: sessionName,
      model,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.sessions.set(id, session)
    this.currentSessionId = id
    this.debouncedSave()
    
    return session
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id)
  }

  getCurrentSession(): Session | undefined {
    if (!this.currentSessionId) return undefined
    return this.sessions.get(this.currentSessionId)
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId
  }

  setCurrentSession(id: string): boolean {
    if (!this.sessions.has(id)) return false
    this.currentSessionId = id
    this.debouncedSave()
    return true
  }

  updateSession(id: string, updates: Partial<Session>): boolean {
    const session = this.sessions.get(id)
    if (!session) return false

    const updatedSession: Session = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.sessions.set(id, updatedSession)
    this.debouncedSave()
    return true
  }

  addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Message | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: message.text,
      sender: message.sender,
      timestamp: new Date()
    }

    session.messages.push(newMessage)
    session.updatedAt = new Date().toISOString()
    this.debouncedSave()

    return newMessage
  }

  deleteSession(id: string): boolean {
    if (!this.sessions.has(id)) return false
    
    this.sessions.delete(id)
    
    if (this.currentSessionId === id) {
      if (this.sessions.size > 0) {
        this.currentSessionId = this.sessions.keys().next().value || null
      } else {
        this.currentSessionId = null
      }
    }
    
    this.debouncedSave()
    return true
  }

  renameSession(id: string, newName: string): boolean {
    return this.updateSession(id, { name: newName })
  }

  clearSessionMessages(id: string): boolean {
    return this.updateSession(id, { messages: [] })
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  searchSessions(query: string): Session[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllSessions().filter(session => 
      session.name.toLowerCase().includes(lowerQuery) ||
      session.messages.some(msg => msg.text.toLowerCase().includes(lowerQuery))
    )
  }

  getSessionCount(): number {
    return this.sessions.size
  }

  exportSession(id: string, format: 'json' | 'markdown' = 'json'): string | null {
    const session = this.sessions.get(id)
    if (!session) return null

    if (format === 'json') {
      return JSON.stringify(session, null, 2)
    }

    const lines: string[] = [
      `# ${session.name}`,
      ``,
      `**模型**: ${session.model}`,
      `**创建时间**: ${new Date(session.createdAt).toLocaleString()}`,
      `**更新时间**: ${new Date(session.updatedAt).toLocaleString()}`,
      ``,
      `## 对话记录`,
      ``
    ]

    session.messages.forEach(msg => {
      const sender = msg.sender === 'user' ? '👤 用户' : '🤖 AI'
      const time = new Date(msg.timestamp).toLocaleTimeString()
      lines.push(`### ${sender} (${time})`)
      lines.push(``)
      lines.push(msg.text)
      lines.push(``)
    })

    return lines.join('\n')
  }

  exportAllSessions(format: 'json' | 'markdown' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.getAllSessions(), null, 2)
    }

    const lines: string[] = [
      `# AI智枢 - 所有对话导出`,
      ``,
      `导出时间: ${new Date().toLocaleString()}`,
      `会话总数: ${this.sessions.size}`,
      ``,
      `---`,
      ``
    ]

    this.getAllSessions().forEach((session, index) => {
      lines.push(`## ${index + 1}. ${session.name}`)
      lines.push(``)
      lines.push(`- 模型: ${session.model}`)
      lines.push(`- 创建: ${new Date(session.createdAt).toLocaleString()}`)
      lines.push(`- 消息数: ${session.messages.length}`)
      lines.push(``)
      
      session.messages.forEach(msg => {
        const sender = msg.sender === 'user' ? '👤' : '🤖'
        lines.push(`${sender} ${msg.text}`)
        lines.push(``)
      })
      
      lines.push(`---`)
      lines.push(``)
    })

    return lines.join('\n')
  }
}

export const sessionManager = new SessionManager()
