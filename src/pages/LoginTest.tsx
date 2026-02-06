import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'

export default function LoginTest() {
  const [loading, setLoading] = useState(false)

  // 最简化的提交处理
  const handleSubmit = (values: any) => {
    alert('表单提交成功！数据：' + JSON.stringify(values))
    console.log('✅✅✅ 表单提交成功！', values)
    message.success('表单提交成功！')
  }

  return (
    <div className="aox-page login-test">
      <Card title="登录测试页面">
        <Form onFinish={handleSubmit}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录测试
            </Button>
          </Form.Item>
        </Form>

        <div className="login-test-tips">
          <p><strong>测试说明：</strong></p>
          <p>1. 填写任意用户名和密码</p>
          <p>2. 点击"登录测试"按钮</p>
          <p>3. 应该看到弹窗和 Console 日志</p>
        </div>
      </Card>
    </div>
  )
}
