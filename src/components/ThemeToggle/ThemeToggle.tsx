import { useState } from 'react'
import { Theme, applyTheme, getTheme, saveTheme } from '../../utils/themeManager'

interface ThemeToggleProps {
  className?: string
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [theme, setTheme] = useState<Theme>(getTheme())

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
    saveTheme(newTheme)
  }

  const getThemeIcon = () => {
    if (theme === 'light') return '☀️'
    if (theme === 'dark') return '🌙'
    return '⚡'
  }

  const getThemeOptions = () => {
    return [
      { value: 'light' as Theme, label: '浅色', icon: '☀️' },
      { value: 'dark' as Theme, label: '深色', icon: '🌙' },
      { value: 'system' as Theme, label: '系统', icon: '⚡' }
    ]
  }

  return (
    <div className={`theme-toggle ${className}`}>
      <div className="theme-toggle-button">
        <button
          className="theme-toggle-icon-button"
          title="切换主题"
        >
          {getThemeIcon()}
        </button>
        <div className="theme-toggle-dropdown">
          {getThemeOptions().map((option) => (
            <button
              key={option.value}
              className={`theme-toggle-option ${theme === option.value ? 'active' : ''}`}
              onClick={() => handleThemeChange(option.value)}
            >
              <span className="theme-option-icon">{option.icon}</span>
              <span className="theme-option-label">{option.label}</span>
              {theme === option.value && (
                <span className="theme-option-check">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ThemeToggle
