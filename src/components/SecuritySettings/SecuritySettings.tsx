import { useState, useEffect } from 'react'
import CryptoJS from 'crypto-js'

const SecuritySettings: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [dataEncryption, setDataEncryption] = useState(false)
  const [autoSaveChats, setAutoSaveChats] = useState(true)
  const [allowSync, setAllowSync] = useState(false)
  const [anonymousMode, setAnonymousMode] = useState(false)

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
      }
    }

    loadSettings()
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const handleSavePassword = () => {
    if (password !== confirmPassword) {
      setMessage('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setMessage('密码长度至少为6位')
      return
    }

    // 保存密码（实际应用中应该加密存储）
    try {
      const encryptedPassword = CryptoJS.AES.encrypt(password, 'secret-key').toString()
      localStorage.setItem('ai-zhishu-password', encryptedPassword)
      setMessage('密码设置成功')
    } catch (error) {
      console.error('Failed to save password:', error)
      setMessage('密码设置失败')
    }
  }

  const handleSettingChange = (setting: string, value: boolean) => {
    try {
      localStorage.setItem(`ai-zhishu-${setting}`, value.toString())
    } catch (error) {
      console.error(`Failed to save ${setting} setting:`, error)
    }
  }

  return (
    <div className="security-settings">
      <div className="security-settings-header">
        <h2>安全设置</h2>
        <p>管理您的账户安全和数据加密设置</p>
      </div>

      <div className="security-section">
        <h3>密码设置</h3>
        <p>设置密码以保护您的聊天记忆和个人信息</p>
        
        <div className="form-group">
          <label htmlFor="password">新密码</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={handlePasswordChange}
            placeholder="请输入新密码"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">确认密码</label>
          <input 
            type="password" 
            id="confirm-password" 
            value={confirmPassword} 
            onChange={handleConfirmPasswordChange}
            placeholder="请确认新密码"
          />
        </div>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        <button className="btn btn-primary" onClick={handleSavePassword}>
          保存密码
        </button>
      </div>

      <div className="security-section">
        <h3>数据加密</h3>
        <p>启用数据加密以保护您的聊天记录和个人信息</p>
        
        <div className="setting-item">
          <div>
            <div className="setting-label">启用数据加密</div>
            <div className="setting-description">
              启用加密后，您的聊天记录将以加密形式存储，需要密码才能访问。
            </div>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={dataEncryption}
              onChange={(e) => {
                setDataEncryption(e.target.checked)
                handleSettingChange('encryption', e.target.checked)
              }}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="security-section">
        <h3>隐私设置</h3>
        <p>管理您的隐私偏好</p>
        
        <div className="setting-item">
          <div>
            <div className="setting-label">自动保存聊天记录</div>
            <div className="setting-description">
              自动保存您的聊天历史到本地存储
            </div>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={autoSaveChats}
              onChange={(e) => {
                setAutoSaveChats(e.target.checked)
                handleSettingChange('auto-save', e.target.checked)
              }}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="setting-item">
          <div>
            <div className="setting-label">允许数据同步</div>
            <div className="setting-description">
              允许在不同设备之间同步您的聊天记录
            </div>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={allowSync}
              onChange={(e) => {
                setAllowSync(e.target.checked)
                handleSettingChange('sync', e.target.checked)
              }}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="setting-item">
          <div>
            <div className="setting-label">匿名使用模式</div>
            <div className="setting-description">
              以匿名方式使用应用，不记录个人信息
            </div>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={anonymousMode}
              onChange={(e) => {
                setAnonymousMode(e.target.checked)
                handleSettingChange('anonymous', e.target.checked)
              }}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default SecuritySettings