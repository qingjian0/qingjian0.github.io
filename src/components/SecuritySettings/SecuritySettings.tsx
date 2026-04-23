import { useState } from 'react'
import CryptoJS from 'crypto-js'

const SecuritySettings: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

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
        
        <div className="form-group">
          <label>
            <input type="checkbox" />
            启用数据加密
          </label>
        </div>

        <p className="form-note">
          启用加密后，您的聊天记录将以加密形式存储，需要密码才能访问。
        </p>
      </div>

      <div className="security-section">
        <h3>隐私设置</h3>
        <p>管理您的隐私偏好</p>
        
        <div className="form-group">
          <label>
            <input type="checkbox" />
            自动保存聊天记录
          </label>
        </div>

        <div className="form-group">
          <label>
            <input type="checkbox" />
            允许数据同步
          </label>
        </div>

        <div className="form-group">
          <label>
            <input type="checkbox" />
            匿名使用模式
          </label>
        </div>
      </div>
    </div>
  )
}

export default SecuritySettings