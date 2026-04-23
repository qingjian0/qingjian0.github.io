import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import ChatScreen from './components/ChatScreen/ChatScreen'
import ModelSwitcher from './components/ModelSwitcher/ModelSwitcher'
import NativeSidebar from './components/NativeSidebar/NativeSidebar'
import MemoryList from './components/MemoryList/MemoryList'
import SecuritySettings from './components/SecuritySettings/SecuritySettings'

// AI模型配置
const aiModels = {
  'DeepSeek': 'https://chat.deepseek.com',
  '豆包': 'https://www.doubao.com',
  '千问': 'https://qianwen.aliyun.com',
  '智谱清言': 'https://chatglm.cn'
}

function App() {
  const [currentModel, setCurrentModel] = useState(Object.keys(aiModels)[0])

  const handleModelChange = (model: string) => {
    setCurrentModel(model)
  }

  return (
    <div className="app">
      <div className="app-container">
        {/* 侧边栏 */}
        <NativeSidebar />
        
        {/* 主内容区 */}
        <div className="main-content">
          {/* 顶部导航栏 */}
          <header className="app-header">
            <h1>AI 智枢</h1>
            <ModelSwitcher 
              currentModel={currentModel} 
              onModelChange={handleModelChange} 
              models={aiModels}
            />
          </header>
          
          {/* 主内容 */}
          <main className="app-main">
            <Routes>
              <Route 
                path="/" 
                element={
                  <ChatScreen 
                    modelName={currentModel} 
                    url={aiModels[currentModel as keyof typeof aiModels]}
                  />
                } 
              />
              <Route path="/memory" element={<MemoryList />} />
              <Route path="/settings" element={<SecuritySettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App