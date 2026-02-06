import { useState, useEffect } from 'react'
import { Card, Button, message, Modal, Form, Input, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import RoleTable from './components/RoleTable'
import RoleForm from './components/RoleForm'
import PermissionTree from './components/PermissionTree'
import { getRoleList, deleteRole, assignPermissions, getRolePermissions } from '../../api/role'
import { getPermissionTree } from '../../api/permission'
import type { Role, RoleQueryParams, PermissionTreeNode } from '../../types/role'

/**
 * 角色管理页面
 */
const RoleManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [roleList, setRoleList] = useState<Role[]>([])
  const [total, setTotal] = useState(0)
  const [queryParams, setQueryParams] = useState<RoleQueryParams>({
    pageNum: 1,
    pageSize: 10
  })
  const [formVisible, setFormVisible] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [currentRole, setCurrentRole] = useState<Role | undefined>(undefined)

  // 权限分配相关状态
  const [permissionModalVisible, setPermissionModalVisible] = useState(false)
  const [permissionTreeData, setPermissionTreeData] = useState<PermissionTreeNode[]>([])
  const [checkedPermissions, setCheckedPermissions] = useState<number[]>([])
  const [assigningRole, setAssigningRole] = useState<Role | undefined>(undefined)

  // 搜索表单
  const [searchForm] = Form.useForm()

  // 加载角色列表
  const loadRoleList = async () => {
    setLoading(true)
    try {
      const response = await getRoleList(queryParams)
      if (response.code === 0) {
        setRoleList(response.data.list)
        setTotal(response.data.total)
      } else {
        message.error(response.msg || '加载角色列表失败')
      }
    } catch (error: any) {
      message.error(error.message || '加载角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载权限树
  const loadPermissionTree = async () => {
    try {
      const response = await getPermissionTree()
      if (response.code === 0) {
        setPermissionTreeData(response.data)
      } else {
        message.error(response.msg || '加载权限树失败')
      }
    } catch (error: any) {
      message.error(error.message || '加载权限树失败')
    }
  }

  // 初始加载
  useEffect(() => {
    loadRoleList()
  }, [queryParams])

  // 搜索
  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    setQueryParams({
      ...queryParams,
      pageNum: 1,
      ...values
    })
  }

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields()
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
    setCurrentRole(undefined)
    setFormVisible(true)
  }

  // 打开编辑表单
  const handleEdit = (role: Role) => {
    setFormMode('edit')
    setCurrentRole(role)
    setFormVisible(true)
  }

  // 删除角色
  const handleDelete = async (roleId: number) => {
    try {
      const response = await deleteRole(roleId)
      if (response.code === 0) {
        message.success('删除角色成功')
        loadRoleList()
      } else {
        message.error(response.msg || '删除角色失败')
      }
    } catch (error: any) {
      message.error(error.message || '删除角色失败')
    }
  }

  // 打开权限分配弹窗
  const handleAssignPermissions = async (role: Role) => {
    setAssigningRole(role)

    // 加载权限树
    await loadPermissionTree()

    // 加载角色已分配的权限
    try {
      const response = await getRolePermissions(role.roleId)
      if (response.code === 0) {
        setCheckedPermissions(response.data)
      }
    } catch (error: any) {
      message.error(error.message || '加载角色权限失败')
    }

    setPermissionModalVisible(true)
  }

  // 提交权限分配
  const handlePermissionSubmit = async () => {
    if (!assigningRole) return

    try {
      const response = await assignPermissions(assigningRole.roleId, checkedPermissions)
      if (response.code === 0) {
        message.success('分配权限成功')
        setPermissionModalVisible(false)
        setCheckedPermissions([])
        setAssigningRole(undefined)
      } else {
        message.error(response.msg || '分配权限失败')
      }
    } catch (error: any) {
      message.error(error.message || '分配权限失败')
    }
  }

  // 表单提交成功
  const handleFormSuccess = () => {
    setFormVisible(false)
    loadRoleList()
  }

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">角色管理</div>
          <div className="aox-page-subtitle">维护角色与权限分配</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增角色
        </Button>
      </div>

      <Card className="aox-filter-card" title="筛选条件">
        <Form form={searchForm} layout="inline" className="aox-search-form">
          <Form.Item name="roleName">
            <Input placeholder="角色名称" allowClear style={{ width: 150 }} />
          </Form.Item>

          <Form.Item name="roleCode">
            <Input placeholder="角色编码" allowClear style={{ width: 150 }} />
          </Form.Item>

          <Form.Item name="status">
            <Select placeholder="状态" allowClear style={{ width: 120 }}>
              <Select.Option value={0}>正常</Select.Option>
              <Select.Option value={1}>禁用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="aox-filter-actions">
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Card className="aox-table-card" title="角色列表">
        <RoleTable
          data={roleList}
          loading={loading}
          total={total}
          pageNum={queryParams.pageNum}
          pageSize={queryParams.pageSize}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAssignPermissions={handleAssignPermissions}
        />
      </Card>

      <RoleForm
        open={formVisible}
        mode={formMode}
        initialValues={currentRole}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />

      <Modal
        title={`分配权限 - ${assigningRole?.roleName}`}
        open={permissionModalVisible}
        onOk={handlePermissionSubmit}
        onCancel={() => {
          setPermissionModalVisible(false)
          setCheckedPermissions([])
          setAssigningRole(undefined)
        }}
        width={600}
      >
        <PermissionTree
          treeData={permissionTreeData}
          checkedKeys={checkedPermissions}
          onCheck={setCheckedPermissions}
        />
      </Modal>
    </div>
  )
}

export default RoleManagement
