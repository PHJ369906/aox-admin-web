import { Modal, Form, Input, Select, Radio, message } from 'antd'
import { useEffect } from 'react'
import type { User, UserCreateData, UserUpdateData } from '../../../types/user'

interface UserFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: User
  onCancel: () => void
  onSuccess: () => void
}

/**
 * 用户表单组件（新增/编辑）
 */
const UserForm: React.FC<UserFormProps> = ({
  open,
  mode,
  initialValues,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue(initialValues)
      } else {
        form.resetFields()
      }
    }
  }, [open, mode, initialValues, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (mode === 'create') {
        // 新增用户
        const { createUser } = await import('../../../api/user')
        await createUser(values as UserCreateData)
        message.success('新增用户成功')
      } else {
        // 更新用户
        const { updateUser } = await import('../../../api/user')
        await updateUser(initialValues!.userId, values as UserUpdateData)
        message.success('更新用户成功')
      }

      onSuccess()
      form.resetFields()
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return
      }
      message.error(error.message || `${mode === 'create' ? '新增' : '更新'}用户失败`)
    }
  }

  return (
    <Modal
      title={mode === 'create' ? '新增用户' : '编辑用户'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 2, max: 30, message: '用户名长度必须在2-30个字符之间' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
          ]}
        >
          <Input placeholder="请输入用户名" disabled={mode === 'edit'} />
        </Form.Item>

        {mode === 'create' && (
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度必须在6-20个字符之间' }
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        )}

        <Form.Item
          label="昵称"
          name="nickname"
          rules={[
            { required: true, message: '请输入昵称' },
            { max: 50, message: '昵称长度不能超过50个字符' }
          ]}
        >
          <Input placeholder="请输入昵称" />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { type: 'email', message: '邮箱格式不正确' },
            { max: 100, message: '邮箱长度不能超过100个字符' }
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item
          label="手机号"
          name="phone"
          rules={[
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>

        <Form.Item label="性别" name="gender">
          <Radio.Group>
            <Radio value={1}>男</Radio>
            <Radio value={0}>女</Radio>
            <Radio value={2}>未知</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="状态" name="status" initialValue={0}>
          <Radio.Group>
            <Radio value={0}>正常</Radio>
            <Radio value={1}>禁用</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={3} placeholder="请输入备注" maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserForm
