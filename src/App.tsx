import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ModelSwitcher from './components/ModelSwitcher/ModelSwitcher'
import NativeSidebar from './components/NativeSidebar/NativeSidebar'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'
import { ToastProvider } from './components/Toast/Toast'
import { LoadingProvider } from './contexts/LoadingContext'
import { ConfirmDialogProvider } from './components/ConfirmDialog/ConfirmDialog'
import { applyTheme, setupThemeListener } from './utils/themeManager'
import { setupKeyboardShortcuts } from './utils/keyboardShortcuts'
import { getAccessMode, setAccessMode, AccessMode } from './utils/accessModeManager'

const ChatScreen = lazy(() => import('./components/ChatScreen/ChatScreen'))
const MemoryList = lazy(() => import('./components/MemoryList/MemoryList'))
const SecuritySettings = lazy(() => import('./components/SecuritySettings/SecuritySettings'))

// AI模型配置
const aiModels = {
  'DeepSeek': 'https://chat.deepseek.com',
  '豆包': 'https://www.doubao.com',
  '千问': 'https://qianwen.aliyun.com',
  '智谱清言': 'https://chatglm.cn'
}

function App() {
  const [currentModel, setCurrentModel] = useState(Object.keys(aiModels)[0])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [accessMode, setAccessModeState] = useState<AccessMode>(getAccessMode())

  useEffect(() => {
    // 应用主题
    applyTheme()
    
    // 监听系统主题变化
    const cleanupTheme = setupThemeListener()
    
    // 启用键盘快捷键
    const cleanupKeyboard = setupKeyboardShortcuts()
    
    return () => {
      cleanupTheme()
      cleanupKeyboard?.()
    }
  }, [])

  const handleModelChange = (model: string) => {
    setCurrentModel(model)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const handleAccessModeChange = (mode: AccessMode) => {
    setAccessModeState(mode)
    setAccessMode(mode)
  }

  return (
    <ToastProvider>
      <LoadingProvider>
        <ConfirmDialogProvider>
          <div className="app">
            <div className="app-container">
              {sidebarOpen && (
                <div className="sidebar-overlay active" onClick={closeSidebar}></div>
              )}
              
              <NativeSidebar 
                isOpen={sidebarOpen} 
                onClose={closeSidebar}
                accessMode={accessMode}
                onAccessModeChange={handleAccessModeChange}
                currentModel={currentModel}
              />
              
              <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <header className="app-header">
                  <button className="menu-button" onClick={toggleSidebar}>
                    <span className="menu-icon">☰</span>
                  </button>
                  <div className="app-header-brand">
                    <h1>AI 智枢</h1>
                  </div>
                  <div className="app-header-actions">
                    <ModelSwitcher 
                      currentModel={currentModel} 
                      onModelChange={handleModelChange} 
                      models={aiModels}
                    />
                    <ThemeToggle />
                  </div>
                </header>
                
                <main className="app-main">
                  <Suspense fallback={<div className="loading-overlay"><div className="loading-spinner"></div><div className="loading-text">加载中...</div></div>}>
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <ChatScreen 
                            modelName={currentModel} 
                            url={aiModels[currentModel as keyof typeof aiModels]}
                            accessMode={accessMode}
                          />
                        } 
                      />
                      <Route path="/memory" element={<MemoryList />} />
                      <Route path="/settings" element={<SecuritySettings />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </div>
          </div>
        </ConfirmDialogProvider>
      </LoadingProvider>
    </ToastProvider>
  )
}

export default App