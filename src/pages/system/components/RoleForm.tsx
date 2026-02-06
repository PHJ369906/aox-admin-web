import { Modal, Form, Input, InputNumber, Radio, message } from 'antd'
import { useEffect } from 'react'
import type { Role, RoleCreateData, RoleUpdateData } from '../../../types/role'

interface RoleFormProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Role
  onCancel: () => void
  onSuccess: () => void
}

/**
 * 角色表单组件（新增/编辑）
 */
const RoleForm: React.FC<RoleFormProps> = ({
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
        // 新增角色
        const { createRole } = await import('../../../api/role')
        await createRole(values as RoleCreateData)
        message.success('新增角色成功')
      } else {
        // 更新角色
        const { updateRole } = await import('../../../api/role')
        await updateRole(initialValues!.roleId, values as RoleUpdateData)
        message.success('更新角色成功')
      }

      onSuccess()
      form.resetFields()
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return
      }
      message.error(error.message || `${mode === 'create' ? '新增' : '更新'}角色失败`)
    }
  }

  return (
    <Modal
      title={mode === 'create' ? '新增角色' : '编辑角色'}
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
          label="角色编码"
          name="roleCode"
          rules={[
            { required: true, message: '请输入角色编码' },
            { min: 2, max: 50, message: '角色编码长度必须在2-50个字符之间' }
          ]}
        >
          <Input placeholder="请输入角色编码" disabled={mode === 'edit'} />
        </Form.Item>

        <Form.Item
          label="角色名称"
          name="roleName"
          rules={[
            { required: true, message: '请输入角色名称' },
            { max: 50, message: '角色名称长度不能超过50个字符' }
          ]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>

        <Form.Item
          label="排序"
          name="roleSort"
          rules={[
            { required: true, message: '请输入排序' }
          ]}
          initialValue={0}
        >
          <InputNumber placeholder="请输入排序" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="数据权限" name="dataScope" initialValue={1}>
          <Radio.Group>
            <Radio value={1}>全部</Radio>
            <Radio value={2}>本部门</Radio>
            <Radio value={3}>本部门及以下</Radio>
            <Radio value={4}>仅本人</Radio>
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

export default RoleForm
