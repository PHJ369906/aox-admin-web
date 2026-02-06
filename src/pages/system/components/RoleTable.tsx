import { Table, Tag, Space, Button, Popconfirm, message } from 'antd'
import { EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Role } from '../../../types/role'

interface RoleTableProps {
  data: Role[]
  loading: boolean
  total: number
  pageNum: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
  onEdit: (role: Role) => void
  onDelete: (roleId: number) => void
  onAssignPermissions: (role: Role) => void
}

/**
 * 角色表格组件
 */
const RoleTable: React.FC<RoleTableProps> = ({
  data,
  loading,
  total,
  pageNum,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  onAssignPermissions
}) => {
  const columns: ColumnsType<Role> = [
    {
      title: '角色ID',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 80,
    },
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      key: 'roleCode',
      width: 150,
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 150,
    },
    {
      title: '排序',
      dataIndex: 'roleSort',
      key: 'roleSort',
      width: 80,
    },
    {
      title: '数据权限',
      dataIndex: 'dataScope',
      key: 'dataScope',
      width: 120,
      render: (dataScope: number) => {
        const dataScopeMap: Record<number, string> = {
          1: '全部',
          2: '本部门',
          3: '本部门及以下',
          4: '仅本人'
        }
        return dataScopeMap[dataScope] || '-'
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
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => time || '-'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark: string) => remark || '-'
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 220,
      render: (_: any, record: Role) => (
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
            icon={<SafetyOutlined />}
            onClick={() => onAssignPermissions(record)}
          >
            分配权限
          </Button>

          <Popconfirm
            title="确认删除"
            description={`确定要删除角色 "${record.roleName}" 吗？`}
            onConfirm={() => onDelete(record.roleId)}
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
    <Table
      columns={columns}
      dataSource={data}
      rowKey="roleId"
      loading={loading}
      scroll={{ x: 1200 }}
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
  )
}

export default RoleTable
