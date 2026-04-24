interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface APIResponse {
  success: boolean
  data?: string
  error?: string
}

// 模拟API调用（后续替换为真实API）
export const chatWithAI = async (modelName: string, _messages: ChatMessage[]): Promise<APIResponse> => {
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟不同模型的回复
    const responses: Record<string, string> = {
      'DeepSeek': '这是DeepSeek的智能回复。我可以帮助你解决各种问题，包括编程、数学、科学等领域的问题。',
      '豆包': '你好！我是豆包，由字节跳动开发的AI助手。很高兴为你服务，有什么可以帮助你的吗？',
      '千问': '我是阿里巴巴的千问AI，专注于提供准确、可靠的信息和解决方案。',
      '智谱清言': '我是智谱清言，由智谱AI开发。我可以协助你完成各种任务，包括写作、学习、工作等。'
    }
    
    return {
      success: true,
      data: responses[modelName] || '这是AI的回复。'
    }
  } catch (error) {
    console.error('API调用失败:', error)
    return {
      success: false,
      error: 'API调用失败，请稍后重试'
    }
  }
}

// 保存API密钥
export const saveAPIKey = (modelName: string, apiKey: string) => {
  try {
    const keys = JSON.parse(localStorage.getItem('ai-zhishu-api-keys') || '{}')
    keys[modelName] = apiKey
    localStorage.setItem('ai-zhishu-api-keys', JSON.stringify(keys))
    return true
  } catch (error) {
    console.error('保存API密钥失败:', error)
    return false
  }
}

// 获取API密钥
export const getAPIKey = (modelName: string): string => {
  try {
    const keys = JSON.parse(localStorage.getItem('ai-zhishu-api-keys') || '{}')
    return keys[modelName] || ''
  } catch (error) {
    console.error('获取API密钥失败:', error)
    return ''
  }
}
