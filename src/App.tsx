import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import LoginTest from './pages/LoginTest'
import Layout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/system/UserManagement'
import RoleManagement from './pages/system/RoleManagement'
import DictType from './pages/system/DictType'
import DictData from './pages/system/DictData'
import Post from './pages/system/Post'
import Dept from './pages/system/Dept'
import Menu from './pages/system/Menu'
import Notice from './pages/system/Notice'
import Message from './pages/system/Message'
import File from './pages/system/File'
import OssConfig from './pages/system/OssConfig'
import OperationLog from './pages/system/OperationLog'
import LoginLog from './pages/system/LoginLog'
import Config from './pages/system/Config'
import MiniappUser from './pages/miniapp/MiniappUser'
import Banner from './pages/miniapp/Banner'
import PaymentOrder from './pages/payment/PaymentOrder'
import ScheduledJobMonitor from './pages/monitor/ScheduledJob'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login-test" element={<LoginTest />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* 小程序管理 */}
        <Route path="miniapp/users" element={<MiniappUser />} />
        <Route path="miniapp/banners" element={<Banner />} />

        {/* 支付管理 */}
        <Route path="payment/orders" element={<PaymentOrder />} />

        {/* 监控管理 */}
        <Route path="monitor/scheduled-jobs" element={<ScheduledJobMonitor />} />

        {/* 用户管理 */}
        <Route path="system/user" element={<UserManagement />} />
        <Route path="system/role" element={<RoleManagement />} />

        {/* 基础数据管理 */}
        <Route path="system/dict/type" element={<DictType />} />
        <Route path="system/dict/data" element={<DictData />} />
        <Route path="system/post" element={<Post />} />
        <Route path="system/dept" element={<Dept />} />
        <Route path="system/menu" element={<Menu />} />

        {/* 系统配置 */}
        <Route path="system/config" element={<Config />} />

        {/* 消息管理 */}
        <Route path="system/notice" element={<Notice />} />
        <Route path="system/message" element={<Message />} />

        {/* 文件管理 */}
        <Route path="system/file" element={<File />} />
        <Route path="system/oss-config" element={<OssConfig />} />

        {/* 日志管理 */}
        <Route path="system/logs/operation" element={<OperationLog />} />
        <Route path="system/logs/login" element={<LoginLog />} />
      </Route>
    </Routes>
  )
}

export default App
