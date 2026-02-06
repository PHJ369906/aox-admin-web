import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * 路由守卫组件
 * 保护需要认证的页面，未登录自动跳转到登录页
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation()

  if (!isAuthenticated()) {
    // 未登录，重定向到登录页，并记录当前路径
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default AuthGuard
