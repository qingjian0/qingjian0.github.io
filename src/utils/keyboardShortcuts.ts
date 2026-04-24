// 键盘快捷键类型
export interface KeyboardShortcut {
  key: string
  modifiers: ('Ctrl' | 'Alt' | 'Shift' | 'Meta')[]
  description: string
  handler: () => void
  enabled: boolean
}

// 快捷键配置
const defaultShortcuts: KeyboardShortcut[] = [
  {
    key: 'n',
    modifiers: ['Ctrl'],
    description: '新建会话',
    handler: () => {
      // 实现新建会话逻辑
      console.log('新建会话')
    },
    enabled: true
  },
  {
    key: 'k',
    modifiers: ['Ctrl'],
    description: '搜索',
    handler: () => {
      // 实现搜索逻辑
      console.log('搜索')
    },
    enabled: true
  },
  {
    key: '1',
    modifiers: ['Alt'],
    description: '切换到聊天页面',
    handler: () => {
      window.location.href = '/'
    },
    enabled: true
  },
  {
    key: '2',
    modifiers: ['Alt'],
    description: '切换到记忆管理',
    handler: () => {
      window.location.href = '/memory'
    },
    enabled: true
  },
  {
    key: '3',
    modifiers: ['Alt'],
    description: '切换到安全设置',
    handler: () => {
      window.location.href = '/settings'
    },
    enabled: true
  },
  {
    key: 'q',
    modifiers: ['Ctrl', 'Shift'],
    description: '退出应用',
    handler: () => {
      console.log('退出应用')
    },
    enabled: true
  },
  {
    key: 'Enter',
    modifiers: [],
    description: '发送消息',
    handler: () => {
      // 在聊天页面中实现
      console.log('发送消息')
    },
    enabled: true
  }
]

// 快捷键管理器
class KeyboardShortcutManager {
  private shortcuts: KeyboardShortcut[]
  private isListening: boolean

  constructor() {
    this.shortcuts = [...defaultShortcuts]
    this.isListening = false
  }

  // 启动监听
  startListening() {
    if (this.isListening) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略在输入框中的快捷键
      if (this.isInputElement(e.target as HTMLElement)) {
        return
      }

      this.shortcuts.forEach(shortcut => {
        if (!shortcut.enabled) return

        const modifiersMatch = shortcut.modifiers.every(modifier => {
          switch (modifier) {
            case 'Ctrl':
              return e.ctrlKey
            case 'Alt':
              return e.altKey
            case 'Shift':
              return e.shiftKey
            case 'Meta':
              return e.metaKey
            default:
              return false
          }
        })

        if (modifiersMatch && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
          e.preventDefault()
          shortcut.handler()
        }
      })
    }

    document.addEventListener('keydown', handleKeyDown)
    this.isListening = true

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      this.isListening = false
    }
  }

  // 检查是否为输入元素
  private isInputElement(element: HTMLElement): boolean {
    const inputTypes = ['input', 'textarea', 'select', 'contenteditable']
    return inputTypes.includes(element.tagName.toLowerCase()) || 
           element.isContentEditable
  }

  // 添加快捷键
  addShortcut(shortcut: KeyboardShortcut) {
    this.shortcuts.push(shortcut)
  }

  // 移除快捷键
  removeShortcut(key: string, modifiers: ('Ctrl' | 'Alt' | 'Shift' | 'Meta')[]) {
    this.shortcuts = this.shortcuts.filter(shortcut => 
      !(shortcut.key === key && 
        JSON.stringify(shortcut.modifiers.sort()) === JSON.stringify(modifiers.sort()))
    )
  }

  // 更新快捷键
  updateShortcut(key: string, modifiers: ('Ctrl' | 'Alt' | 'Shift' | 'Meta')[], updates: Partial<KeyboardShortcut>) {
    const index = this.shortcuts.findIndex(shortcut => 
      shortcut.key === key && 
      JSON.stringify(shortcut.modifiers.sort()) === JSON.stringify(modifiers.sort())
    )

    if (index !== -1) {
      this.shortcuts[index] = { ...this.shortcuts[index], ...updates }
    }
  }

  // 获取所有快捷键
  getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts]
  }

  // 启用/禁用快捷键
  setShortcutEnabled(key: string, modifiers: ('Ctrl' | 'Alt' | 'Shift' | 'Meta')[], enabled: boolean) {
    this.updateShortcut(key, modifiers, { enabled })
  }
}

// 导出单例
export const keyboardShortcutManager = new KeyboardShortcutManager()

// 启动快捷键监听
export const setupKeyboardShortcuts = () => {
  return keyboardShortcutManager.startListening()
}

// 格式化快捷键显示
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = shortcut.modifiers
    .map(mod => mod === 'Ctrl' ? 'Ctrl' : mod === 'Meta' ? '⌘' : mod)
  parts.push(shortcut.key.toUpperCase())
  return parts.join('+')
}
