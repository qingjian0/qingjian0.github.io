import { useState, useEffect } from 'react'
import CryptoJS from 'crypto-js'

const SecuritySettings: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [dataEncryption, setDataEncryption] = useState(false)
  const [autoSaveChats, setAutoSaveChats] = useState(true)
  const [allowSync, setAllowSync] = useState(false)
  const [anonymousMode, setAnonymousMode] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<number>(0)

  // 加载设置
  useEffect(() => {
    const loadSettings = () => {
      try {
        const encryptionSetting = localStorage.getItem('ai-zhishu-encryption')
        const autoSaveSetting = localStorage.getItem('ai-zhishu-auto-save')
        const syncSetting = localStorage.getItem('ai-zhishu-sync')
        const anonymousSetting = localStorage.getItem('ai-zhishu-anonymous')

        setDataEncryption(encryptionSetting === 'true')
        setAutoSaveChats(autoSaveSetting !== 'false')
        setAllowSync(syncSetting === 'true')
        setAnonymousMode(anonymousSetting === 'true')
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
      if (password.length >= 6) strength += 25
      if (/[A-Z]/.test(password)) strength += 25
      if (/[a-z]/.test(password)) strength += 25
      if (/[0-9]/.test(password)) strength += 25
      setPasswordStrength(strength)
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
      const encryptedPassword = CryptoJS.AES.encrypt(password, 'secret-key').toString()
      localStorage.setItem('ai-zhishu-password', encryptedPassword)
      showMessage('密码设置成功', 'success')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Failed to save password:', error)
      showMessage('密码设置失败', 'error')
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
                  {passwordStrength < 25 ? '弱' : passwordStrength < 50 ? '中等' : passwordStrength < 75 ? '强' : '非常强'}
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