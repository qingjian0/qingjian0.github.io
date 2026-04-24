import { useState, useEffect } from 'react'
import CryptoJS from 'crypto-js'
import { saveAPIKey, getAPIKey } from '../../utils/apiService'

const SecuritySettings: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [passwordHint, setPasswordHint] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [dataEncryption, setDataEncryption] = useState(false)
  const [autoSaveChats, setAutoSaveChats] = useState(true)
  const [allowSync, setAllowSync] = useState(false)
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<number>(0)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    'DeepSeek': getAPIKey('DeepSeek'),
    '豆包': getAPIKey('豆包'),
    '千问': getAPIKey('千问'),
    '智谱清言': getAPIKey('智谱清言')
  })

  // 加载设置
  useEffect(() => {
    const loadSettings = () => {
      try {
        const encryptionSetting = localStorage.getItem('ai-zhishu-encryption')
        const autoSaveSetting = localStorage.getItem('ai-zhishu-auto-save')
        const syncSetting = localStorage.getItem('ai-zhishu-sync')
        const anonymousSetting = localStorage.getItem('ai-zhishu-anonymous')
        const hint = localStorage.getItem('ai-zhishu-password-hint')

        setDataEncryption(encryptionSetting === 'true')
        setAutoSaveChats(autoSaveSetting !== 'false')
        setAllowSync(syncSetting === 'true')
        setAnonymousMode(anonymousSetting === 'true')
        if (hint) {
          setPasswordHint(hint)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        showMessage('加载设置失败', 'error')
      }
    }

    loadSettings()
  }, [])

  // 密码强度检测
  useEffect(() => {
    if (password) {
      let strength = 0
      // 长度检查
      if (password.length >= 6) strength += 15
      if (password.length >= 8) strength += 10
      if (password.length >= 12) strength += 10
      // 字符类型检查
      if (/[A-Z]/.test(password)) strength += 15
      if (/[a-z]/.test(password)) strength += 15
      if (/[0-9]/.test(password)) strength += 15
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15
      // 最大强度限制
      setPasswordStrength(Math.min(strength, 100))
    } else {
      setPasswordStrength(0)
    }
  }, [password])

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleSavePassword = () => {
    if (password !== confirmPassword) {
      showMessage('两次输入的密码不一致', 'error')
      return
    }

    if (password.length < 6) {
      showMessage('密码长度至少为6位', 'error')
      return
    }

    // 保存密码（实际应用中应该加密存储）
    try {
      // 生成随机密钥
      const secretKey = CryptoJS.lib.WordArray.random(16).toString()
      const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString()
      
      // 保存密码和密钥
      localStorage.setItem('ai-zhishu-password', encryptedPassword)
      localStorage.setItem('ai-zhishu-secret-key', secretKey)
      
      // 保存密码提示
      if (passwordHint) {
        localStorage.setItem('ai-zhishu-password-hint', passwordHint)
      }
      
      showMessage('密码设置成功', 'success')
      setPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
    } catch (error) {
      console.error('Failed to save password:', error)
      showMessage('密码设置失败', 'error')
    }
  }

  const handleAPIKeyChange = (model: string, key: string) => {
    setApiKeys(prev => ({ ...prev, [model]: key }))
  }

  const handleSaveAPIKeys = () => {
    try {
      Object.entries(apiKeys).forEach(([model, key]) => {
        if (key) {
          saveAPIKey(model, key)
        }
      })
      showMessage('API密钥保存成功', 'success')
    } catch (error) {
      console.error('Failed to save API keys:', error)
      showMessage('API密钥保存失败', 'error')
    }
  }

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      try {
        localStorage.clear()
        showMessage('数据已清除', 'success')
        // 重新加载设置
        window.location.reload()
      } catch (error) {
        console.error('Failed to clear data:', error)
        showMessage('清除数据失败', 'error')
      }
    }
  }

  const handleSettingChange = (setting: string, value: boolean) => {
    try {
      localStorage.setItem(`ai-zhishu-${setting}`, value.toString())
      showMessage(`${setting === 'encryption' ? '数据加密' : setting === 'auto-save' ? '自动保存' : setting === 'sync' ? '数据同步' : '匿名模式'}设置已更新`, 'success')
    } catch (error) {
      console.error(`Failed to save ${setting} setting:`, error)
      showMessage('设置保存失败', 'error')
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'var(--secondary-color)'
    if (passwordStrength < 50) return '#ff9500'
    if (passwordStrength < 75) return '#34c759'
    return '#34c759'
  }

  return (
    <div className="security-settings">
      <div className="security-settings-header">
        <h2>安全设置</h2>
        <p>管理您的账户安全和数据加密设置</p>
      </div>

      <div className="security-card">
        <div className="security-card-header">
          <h3 className="security-card-title">密码设置</h3>
          <p className="security-card-description">设置密码以保护您的聊天记忆和个人信息</p>
        </div>
        <div className="security-card-body">
          <div className="form-group">
            <label htmlFor="current-password" className="form-label">当前密码</label>
            <input 
              type="password" 
              id="current-password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="请输入当前密码（可选）"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">新密码</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={handlePasswordChange}
              placeholder="请输入新密码"
              className="form-input"
            />
            {password && (
              <div className="password-strength">
                <div className="password-strength-bar" style={{ width: `${passwordStrength}%`, backgroundColor: getPasswordStrengthColor() }}></div>
                <span className="password-strength-text">
                  {passwordStrength < 40 ? '弱' : passwordStrength < 70 ? '中等' : '强'}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">确认密码</label>
            <input 
              type="password" 
              id="confirm-password" 
              value={confirmPassword} 
              onChange={handleConfirmPasswordChange}
              placeholder="请确认新密码"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-hint" className="form-label">密码提示（可选）</label>
            <input 
              type="text" 
              id="password-hint" 
              value={passwordHint} 
              onChange={(e) => setPasswordHint(e.target.value)}
              placeholder="设置一个提示以帮助您记住密码"
              className="form-input"
            />
          </div>

          {message && (
            <div className={`message message-${messageType}`}>
              {message}
            </div>
          )}

          <button 
            className="btn btn-primary" 
            onClick={handleSavePassword}
            disabled={!password || !confirmPassword}
          >
            保存密码
          </button>
        </div>
      </div>

      <div className="security-card">
        <div className="security-card-header">
          <h3 className="security-card-title">API密钥管理</h3>
          <p className="security-card-description">管理您的AI模型API密钥</p>
        </div>
        <div className="security-card-body">
          {Object.entries(apiKeys).map(([model, key]) => (
            <div key={model} className="form-group">
              <label htmlFor={`api-key-${model}`} className="form-label">{model} API密钥</label>
              <input 
                type="password" 
                id={`api-key-${model}`} 
                value={key} 
                onChange={(e) => handleAPIKeyChange(model, e.target.value)}
                placeholder={`请输入${model}的API密钥`}
                className="form-input"
              />
            </div>
          ))}
          
          <button 
            className="btn btn-primary" 
            onClick={handleSaveAPIKeys}
          >
            保存API密钥
          </button>
        </div>
      </div>

      <div className="security-card">
        <div className="security-card-header">
          <h3 className="security-card-title">数据管理</h3>
          <p className="security-card-description">管理您的应用数据</p>
        </div>
        <div className="security-card-body">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">清除所有数据</div>
              <div className="setting-description">
                清除所有聊天记录、设置和API密钥。此操作不可恢复。
              </div>
            </div>
            <button 
              className="btn btn-secondary delete"
              onClick={handleClearData}
            >
              清除数据
            </button>
          </div>
        </div>
      </div>

      <div className="security-card">
        <div className="security-card-header">
          <h3 className="security-card-title">数据加密</h3>
          <p className="security-card-description">启用数据加密以保护您的聊天记录和个人信息</p>
        </div>
        <div className="security-card-body">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">启用数据加密</div>
              <div className="setting-description">
                启用加密后，您的聊天记录将以加密形式存储，需要密码才能访问。
              </div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={dataEncryption}
                onChange={(e) => {
                  setDataEncryption(e.target.checked)
                  handleSettingChange('encryption', e.target.checked)
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="security-card">
        <div className="security-card-header">
          <h3 className="security-card-title">隐私设置</h3>
          <p className="security-card-description">管理您的隐私偏好</p>
        </div>
        <div className="security-card-body">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">自动保存聊天记录</div>
              <div className="setting-description">
                自动保存您的聊天历史到本地存储
              </div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={autoSaveChats}
                onChange={(e) => {
                  setAutoSaveChats(e.target.checked)
                  handleSettingChange('auto-save', e.target.checked)
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">允许数据同步</div>
              <div className="setting-description">
                允许在不同设备之间同步您的聊天记录
              </div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={allowSync}
                onChange={(e) => {
                  setAllowSync(e.target.checked)
                  handleSettingChange('sync', e.target.checked)
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">匿名使用模式</div>
              <div className="setting-description">
                以匿名方式使用应用，不记录个人信息
              </div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={anonymousMode}
                onChange={(e) => {
                  setAnonymousMode(e.target.checked)
                  handleSettingChange('anonymous', e.target.checked)
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecuritySettings