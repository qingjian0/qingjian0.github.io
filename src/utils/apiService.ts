export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface APIResponse {
  success: boolean
  data?: string
  error?: string
  errorType?: 'network' | 'auth' | 'quota' | 'unknown'
}

const API_ENDPOINTS = {
  'DeepSeek': 'https://api.deepseek.com/chat/completions',
  '豆包': 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  '千问': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  '智谱清言': 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
}

const MODEL_IDS: Record<string, string> = {
  'DeepSeek': 'deepseek-chat',
  '豆包': 'doubao-pro-4k',
  '千问': 'qwen-turbo',
  '智谱清言': 'glm-4'
}

export const saveAPIKey = (modelName: string, apiKey: string): boolean => {
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

export const getAPIKey = (modelName: string): string => {
  try {
    const keys = JSON.parse(localStorage.getItem('ai-zhishu-api-keys') || '{}')
    return keys[modelName] || ''
  } catch (error) {
    console.error('获取API密钥失败:', error)
    return ''
  }
}

export const hasAPIKey = (modelName: string): boolean => {
  const key = getAPIKey(modelName)
  return key.length > 0
}

const makeDeepSeekRequest = async (messages: ChatMessage[], apiKey: string): Promise<APIResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS['DeepSeek'], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_IDS['DeepSeek'],
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: 'API密钥无效', errorType: 'auth' }
      }
      if (response.status === 429) {
        return { success: false, error: '请求过于频繁，请稍后重试', errorType: 'quota' }
      }
      return { success: false, error: `请求失败: ${response.status}`, errorType: 'unknown' }
    }

    const data = await response.json()
    return { success: true, data: data.choices[0]?.message?.content || '' }
  } catch (error) {
    console.error('DeepSeek API调用失败:', error)
    return { success: false, error: '网络错误，请检查网络连接', errorType: 'network' }
  }
}

const makeDoubaoRequest = async (messages: ChatMessage[], apiKey: string): Promise<APIResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS['豆包'], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_IDS['豆包'],
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: 'API密钥无效', errorType: 'auth' }
      }
      if (response.status === 429) {
        return { success: false, error: '请求过于频繁，请稍后重试', errorType: 'quota' }
      }
      return { success: false, error: `请求失败: ${response.status}`, errorType: 'unknown' }
    }

    const data = await response.json()
    return { success: true, data: data.choices[0]?.message?.content || '' }
  } catch (error) {
    console.error('豆包 API调用失败:', error)
    return { success: false, error: '网络错误，请检查网络连接', errorType: 'network' }
  }
}

const makeQianwenRequest = async (messages: ChatMessage[], apiKey: string): Promise<APIResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS['千问'], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_IDS['千问'],
        input: {
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 2000
        }
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: 'API密钥无效', errorType: 'auth' }
      }
      if (response.status === 429) {
        return { success: false, error: '请求过于频繁，请稍后重试', errorType: 'quota' }
      }
      return { success: false, error: `请求失败: ${response.status}`, errorType: 'unknown' }
    }

    const data = await response.json()
    return { success: true, data: data.output?.text || data.choices?.[0]?.message?.content || '' }
  } catch (error) {
    console.error('千问 API调用失败:', error)
    return { success: false, error: '网络错误，请检查网络连接', errorType: 'network' }
  }
}

const makeZhipuRequest = async (messages: ChatMessage[], apiKey: string): Promise<APIResponse> => {
  try {
    const response = await fetch(API_ENDPOINTS['智谱清言'], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL_IDS['智谱清言'],
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: 'API密钥无效', errorType: 'auth' }
      }
      if (response.status === 429) {
        return { success: false, error: '请求过于频繁，请稍后重试', errorType: 'quota' }
      }
      return { success: false, error: `请求失败: ${response.status}`, errorType: 'unknown' }
    }

    const data = await response.json()
    return { success: true, data: data.choices[0]?.message?.content || '' }
  } catch (error) {
    console.error('智谱清言 API调用失败:', error)
    return { success: false, error: '网络错误，请检查网络连接', errorType: 'network' }
  }
}

const getSimulatedResponse = (modelName: string): string => {
  const responses: Record<string, string> = {
    'DeepSeek': '这是DeepSeek的模拟回复。请配置API密钥以获取真实回复。',
    '豆包': '这是豆包的模拟回复。请配置API密钥以获取真实回复。',
    '千问': '这是千问的模拟回复。请配置API密钥以获取真实回复。',
    '智谱清言': '这是智谱清言的模拟回复。请配置API密钥以获取真实回复。'
  }
  return responses[modelName] || '这是AI的模拟回复。请配置API密钥以获取真实回复。'
}

export const chatWithAI = async (modelName: string, messages: ChatMessage[]): Promise<APIResponse> => {
  const apiKey = getAPIKey(modelName)
  
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      success: true,
      data: getSimulatedResponse(modelName)
    }
  }

  switch (modelName) {
    case 'DeepSeek':
      return makeDeepSeekRequest(messages, apiKey)
    case '豆包':
      return makeDoubaoRequest(messages, apiKey)
    case '千问':
      return makeQianwenRequest(messages, apiKey)
    case '智谱清言':
      return makeZhipuRequest(messages, apiKey)
    default:
      return { success: false, error: '未知的模型', errorType: 'unknown' }
  }
}

export const validateAPIKey = async (modelName: string, apiKey: string): Promise<boolean> => {
  const testMessages: ChatMessage[] = [
    { role: 'user', content: 'Hi' }
  ]
  
  const originalKey = getAPIKey(modelName)
  saveAPIKey(modelName, apiKey)
  
  try {
    const response = await chatWithAI(modelName, testMessages)
    return response.success
  } catch {
    return false
  } finally {
    if (!apiKey) {
      saveAPIKey(modelName, originalKey)
    }
  }
}
