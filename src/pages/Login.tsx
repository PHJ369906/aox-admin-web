import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import './Login.css'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values: any) => {
    try {
      setLoading(true)

      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      let data: any = null
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch {
          data = null
        }
      }

      if (!response.ok) {
        message.error(`登录失败: ${response.status}`)
        return
      }

      if (data && (data.code === 0 || data.code === 200)) {
        message.success('登录成功')
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))

        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      } else {
        message.error(`登录失败: ${data?.msg || '请稍后重试'}`)
      }
    } catch (error) {
      message.error('请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-brand">
          <div className="brand-mark">A</div>
          <div className="brand-title">Aox 后台管理</div>
          <div className="brand-subtitle">简洁高效的三端运营中枢</div>
          <div className="brand-metrics">
            <div className="metric">
              <span>多租户</span>
              <small>权限清晰</small>
            </div>
            <div className="metric">
              <span>安全</span>
              <small>审计可追溯</small>
            </div>
            <div className="metric">
              <span>效率</span>
              <small>数据集中</small>
            </div>
          </div>
        </div>

        <Card className="login-card">
          <div className="login-title">
            <h2>欢迎回来</h2>
            <p>使用账号密码继续登录</p>
          </div>
          <Form
            name="loginForm"
            onFinish={handleLogin}
            onFinishFailed={() => {
              message.error('表单验证失败')
            }}
          >
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined />} placeholder="用户名: admin" size="large" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码: admin123" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="login-hint">测试账号: admin / admin123</div>
        </Card>
      </div>
    </div>
  )
}
