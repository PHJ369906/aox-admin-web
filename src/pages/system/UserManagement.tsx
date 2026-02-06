import { useState, useEffect } from 'react'
import { Card, Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import UserSearch from './components/UserSearch'
import UserTable from './components/UserTable'
import UserForm from './components/UserForm'
import UserRoleAssign from './Permission/UserRoleAssign'
import { getUserList, deleteUser, updateUserStatus, resetUserPassword } from '../../api/user'
import type { User, UserQueryParams } from '../../types/user'

/**
 * 用户管理页面
 */
const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [userList, setUserList] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    pageNum: 1,
    pageSize: 10
  })
  const [formVisible, setFormVisible] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined)
  const [roleAssignVisible, setRoleAssignVisible] = useState(false)

  // 加载用户列表
  const loadUserList = async () => {
    setLoading(true)
    try {
      const response = await getUserList(queryParams)
      if (response.code === 0) {
        setUserList(response.data.list)
        setTotal(response.data.total)
      } else {
        message.error(response.msg || '加载用户列表失败')
      }
    } catch (error: any) {
      message.error(error.message || '加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和查询参数变化时加载数据
  useEffect(() => {
    loadUserList()
  }, [queryParams])

  // 搜索
  const handleSearch = (values: any) => {
    setQueryParams({
      ...queryParams,
      pageNum: 1,
      ...values
    })
  }

  // 重置搜索
  const handleReset = () => {
    setQueryParams({
      pageNum: 1,
      pageSize: 10
    })
  }

  // 分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setQueryParams({
      ...queryParams,
      pageNum: page,
      pageSize: pageSize
    })
  }

  // 打开新增表单
  const handleAdd = () => {
    setFormMode('create')
    setCurrentUser(undefined)
    setFormVisible(true)
  }

  // 打开编辑表单
  const handleEdit = (user: User) => {
    setFormMode('edit')
    setCurrentUser(user)
    setFormVisible(true)
  }

  // 删除用户
  const handleDelete = async (userId: number) => {
    try {
      const response = await deleteUser(userId)
      if (response.code === 0) {
        message.success('删除用户成功')
        loadUserList()
      } else {
        message.error(response.msg || '删除用户失败')
      }
    } catch (error: any) {
      message.error(error.message || '删除用户失败')
    }
  }

  // 更新用户状态
  const handleStatusChange = async (userId: number, status: number) => {
    try {
      const response = await updateUserStatus(userId, status)
      if (response.code === 0) {
        message.success(`${status === 0 ? '启用' : '禁用'}用户成功`)
        loadUserList()
      } else {
        message.error(response.msg || '更新用户状态失败')
      }
    } catch (error: any) {
      message.error(error.message || '更新用户状态失败')
    }
  }

  // 重置密码
  const handleResetPassword = async (userId: number, newPassword: string) => {
    try {
      const response = await resetUserPassword(userId, newPassword)
      if (response.code === 0) {
        message.success('重置密码成功')
      } else {
        message.error(response.msg || '重置密码失败')
      }
    } catch (error: any) {
      message.error(error.message || '重置密码失败')
    }
  }

  // 表单提交成功
  const handleFormSuccess = () => {
    setFormVisible(false)
    loadUserList()
  }

  // 打开角色分配弹窗
  const handleAssignRole = (user: User) => {
    setCurrentUser(user)
    setRoleAssignVisible(true)
  }

  // 角色分配成功
  const handleRoleAssignSuccess = () => {
    setRoleAssignVisible(false)
    message.success('角色分配成功')
    loadUserList()
  }

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">用户管理</div>
          <div className="aox-page-subtitle">维护系统用户、角色与状态</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
      </div>

      <Card className="aox-filter-card" title="筛选条件">
        <UserSearch onSearch={handleSearch} onReset={handleReset} />
      </Card>

      <Card className="aox-table-card" title="用户列表">
        <UserTable
          data={userList}
          loading={loading}
          total={total}
          pageNum={queryParams.pageNum}
          pageSize={queryParams.pageSize}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onResetPassword={handleResetPassword}
          onAssignRole={handleAssignRole}
        />
      </Card>

      <UserForm
        open={formVisible}
        mode={formMode}
        initialValues={currentUser}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />

      <UserRoleAssign
        visible={roleAssignVisible}
        userId={currentUser?.userId || null}
        userName={currentUser?.username || ''}
        onClose={() => setRoleAssignVisible(false)}
        onSuccess={handleRoleAssignSuccess}
      />
    </div>
  )
}

export default UserManagement
