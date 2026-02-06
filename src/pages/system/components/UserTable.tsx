import { Table, Tag, Space, Button, Popconfirm, message, Modal, Input } from 'antd'
import { EditOutlined, DeleteOutlined, KeyOutlined, StopOutlined, CheckCircleOutlined, TeamOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { User } from '../../../types/user'
import { useState } from 'react'

interface UserTableProps {
  data: User[]
  loading: boolean
  total: number
  pageNum: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
  onEdit: (user: User) => void
  onDelete: (userId: number) => void
  onStatusChange: (userId: number, status: number) => void
  onResetPassword: (userId: number, newPassword: string) => void
  onAssignRole: (user: User) => void
}

/**
 * 用户表格组件
 */
const UserTable: React.FC<UserTableProps> = ({
  data,
  loading,
  total,
  pageNum,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  onStatusChange,
  onResetPassword,
  onAssignRole
}) => {
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    visible: boolean
    userId?: number
    username?: string
  }>({ visible: false })
  const [newPassword, setNewPassword] = useState('')

  const handleResetPassword = () => {
    if (!newPassword) {
      message.error('请输入新密码')
      return
    }
    if (newPassword.length < 6 || newPassword.length > 20) {
      message.error('密码长度必须在6-20个字符之间')
      return
    }

    onResetPassword(resetPasswordModal.userId!, newPassword)
    setResetPasswordModal({ visible: false })
    setNewPassword('')
  }

  const columns: ColumnsType<User> = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: number) => {
        const genderMap: Record<number, string> = {
          0: '女',
          1: '男',
          2: '未知'
        }
        return genderMap[gender] || '-'
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <Tag color={status === 0 ? 'success' : 'error'}>
          {status === 0 ? '正常' : '禁用'}
        </Tag>
      )
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 160,
      render: (time: string) => time || '-'
    },
    {
      title: '最后登录IP',
      dataIndex: 'lastLoginIp',
      key: 'lastLoginIp',
      width: 120,
      render: (ip: string) => ip || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => time || '-'
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 350,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>

          <Button
            type="link"
            size="small"
            icon={<TeamOutlined />}
            onClick={() => onAssignRole(record)}
          >
            分配角色
          </Button>

          <Button
            type="link"
            size="small"
            icon={record.status === 0 ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => onStatusChange(record.userId, record.status === 0 ? 1 : 0)}
          >
            {record.status === 0 ? '禁用' : '启用'}
          </Button>

          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => {
              setResetPasswordModal({
                visible: true,
                userId: record.userId,
                username: record.username
              })
            }}
          >
            重置密码
          </Button>

          <Popconfirm
            title="确认删除"
            description={`确定要删除用户 "${record.username}" 吗？`}
            onConfirm={() => onDelete(record.userId)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="userId"
        loading={loading}
        scroll={{ x: 1500 }}
        pagination={{
          current: pageNum,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: onPageChange
        }}
      />

      <Modal
        title={`重置密码 - ${resetPasswordModal.username}`}
        open={resetPasswordModal.visible}
        onOk={handleResetPassword}
        onCancel={() => {
          setResetPasswordModal({ visible: false })
          setNewPassword('')
        }}
        okText="确定"
        cancelText="取消"
      >
        <Input.Password
          placeholder="请输入新密码（6-20个字符）"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onPressEnter={handleResetPassword}
        />
      </Modal>
    </>
  )
}

export default UserTable
