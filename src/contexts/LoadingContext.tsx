import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  loadingText: string
  showLoading: (text?: string) => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('加载中...')

  const showLoading = useCallback((text: string = '加载中...') => {
    setLoadingText(text)
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, loadingText, showLoading, hideLoading }}>
      {children}
      {isLoading && <GlobalLoading text={loadingText} />}
    </LoadingContext.Provider>
  )
}

interface GlobalLoadingProps {
  text: string
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ text }) => {
  return (
    <div className="global-loading-overlay">
      <div className="global-loading-content">
        <div className="global-loading-spinner"></div>
        <div className="global-loading-text">{text}</div>
      </div>
    </div>
  )
}

export default LoadingProvider
