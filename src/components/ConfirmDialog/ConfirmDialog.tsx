import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface ConfirmDialogContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  return context
}

interface ConfirmDialogProviderProps {
  children: ReactNode
}

interface DialogState extends ConfirmOptions {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialogProvider: React.FC<ConfirmDialogProviderProps> = ({ children }) => {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  })

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        isOpen: true,
        onConfirm: () => {
          setDialog(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setDialog(prev => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }, [])

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      {dialog.isOpen && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          type={dialog.type}
          onConfirm={dialog.onConfirm}
          onCancel={dialog.onCancel}
        />
      )}
    </ConfirmDialogContext.Provider>
  )
}

interface ConfirmDialogProps {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  type = 'info',
  onConfirm,
  onCancel
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️'
      case 'warning':
        return '⚡'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className={`confirm-dialog-header confirm-dialog-${type}`}>
          <span className="confirm-dialog-icon">{getIcon()}</span>
          <h3 className="confirm-dialog-title">{title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p className="confirm-dialog-message">{message}</p>
        </div>
        <div className="confirm-dialog-footer">
          <button className="confirm-dialog-btn cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`confirm-dialog-btn confirm confirm-dialog-btn-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialogProvider
