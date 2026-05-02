export type AccessMode = 'api' | 'webview'

export const STORAGE_KEY_MODE = 'ai-zhishu-access-mode'

export const getAccessMode = (): AccessMode => {
  try {
    const mode = localStorage.getItem(STORAGE_KEY_MODE) as AccessMode
    return mode || 'api'
  } catch (error) {
    console.error('获取访问模式失败:', error)
    return 'api'
  }
}

export const setAccessMode = (mode: AccessMode): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY_MODE, mode)
    return true
  } catch (error) {
    console.error('保存访问模式失败:', error)
    return false
  }
}

export const WEBVIEW_URLS: Record<string, string> = {
  'DeepSeek': 'https://chat.deepseek.com',
  '豆包': 'https://www.doubao.com',
  '千问': 'https://qianwen.aliyun.com',
  '智谱清言': 'https://chatglm.cn'
}

export const getWebviewUrl = (modelName: string): string => {
  return WEBVIEW_URLS[modelName] || 'https://chat.deepseek.com'
}
