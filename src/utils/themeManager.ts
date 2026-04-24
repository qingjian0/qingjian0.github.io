// 主题类型
export type Theme = 'light' | 'dark' | 'system'

// 主题配置
const themes = {
  light: {
    '--primary-color': '#ff3b30',
    '--primary-dark': '#d62f26',
    '--primary-light': '#ff453a',
    '--secondary-color': '#8e8e93',
    '--background-color': '#ffffff',
    '--card-background': '#ffffff',
    '--sidebar-background': '#f2f2f7',
    '--text-primary': '#000000',
    '--text-secondary': '#8e8e93',
    '--text-tertiary': '#c7c7cc',
    '--border-color': '#e2e2e7',
    '--border-light': '#f2f2f7',
    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  },
  dark: {
    '--primary-color': '#ff453a',
    '--primary-dark': '#ff3b30',
    '--primary-light': '#ff5750',
    '--secondary-color': '#8e8e93',
    '--background-color': '#1c1c1e',
    '--card-background': '#2c2c2e',
    '--sidebar-background': '#2c2c2e',
    '--text-primary': '#ffffff',
    '--text-secondary': '#a1a1a6',
    '--text-tertiary': '#636366',
    '--border-color': '#38383a',
    '--border-light': '#2c2c2e',
    '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)'
  }
}

// 保存主题设置
export const saveTheme = (theme: Theme) => {
  try {
    localStorage.setItem('ai-zhishu-theme', theme)
  } catch (error) {
    console.error('保存主题设置失败:', error)
  }
}

// 获取主题设置
export const getTheme = (): Theme => {
  try {
    const savedTheme = localStorage.getItem('ai-zhishu-theme') as Theme
    return savedTheme || 'system'
  } catch (error) {
    console.error('获取主题设置失败:', error)
    return 'system'
  }
}

// 应用主题
export const applyTheme = (theme: Theme = getTheme()) => {
  const root = document.documentElement
  
  let themeToApply: 'light' | 'dark'
  
  if (theme === 'system') {
    themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } else {
    themeToApply = theme
  }
  
  // 应用主题变量
  Object.entries(themes[themeToApply]).forEach(([key, value]) => {
    root.style.setProperty(key, value as string)
  })
  
  // 添加主题类
  root.classList.remove('theme-light', 'theme-dark')
  root.classList.add(`theme-${themeToApply}`)
  
  // 保存当前实际应用的主题
  saveTheme(theme)
}

// 监听系统主题变化
export const setupThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = () => {
    if (getTheme() === 'system') {
      applyTheme('system')
    }
  }
  
  mediaQuery.addEventListener('change', handleChange)
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange)
  }
}
