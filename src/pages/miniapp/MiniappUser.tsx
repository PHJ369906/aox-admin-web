import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Drawer, Descriptions, Input, Select, DatePicker, message, Modal, Statistic, Row, Col } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined, StopOutlined, CheckCircleOutlined, UserOutlined, TeamOutlined, RiseOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getMiniappUserList, getMiniappUserDetail, updateMiniappUserStatus, getMiniappUserStatistics } from '../../api/miniappUser'
import type { MiniappUser, MiniappUserQueryParams, UserStatistics } from '../../api/miniappUser'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

/**
 * 小程序用户管理页面
 */
const MiniappUser: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [userList, setUserList] = useState<MiniappUser[]>([])
  const [total, setTotal] = useState(0)
  const [queryParams, setQueryParams] = useState<MiniappUserQueryParams>({
    pageNum: 1,
    pageSize: 10
  })
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState<MiniappUser | null>(null)
  const [statistics, setStatistics] = useState<UserStatistics | null>(null)

  // 搜索表单状态
  const [searchForm, setSearchForm] = useState({
    phone: '',
    nickname: '',
    status: undefined as number | undefined,
    dateRange: null as any
  })

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const response = await getMiniappUserStatistics()
      if (response.code === 0) {
        setStatistics(response.data)
      }
    } catch (error: any) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 加载用户列表
  const loadUserList = async () => {
    setLoading(true)
    try {
      const response = await getMiniappUserList(queryParams)
      if (response.code === 0) {
        setUserList(response.data.records)
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

  // 初始加载
  useEffect(() => {
    loadStatistics()
  }, [])

  // 查询参数变化时加载数据
  useEffect(() => {
    loadUserList()
  }, [queryParams])

  // 搜索
  const handleSearch = () => {
    const params: MiniappUserQueryParams = {
      pageNum: 1,
      pageSize: queryParams.pageSize,
      phone: searchForm.phone || undefined,
      nickname: searchForm.nickname || undefined,
      status: searchForm.status,
      startTime: searchForm.dateRange?.[0] ? dayjs(searchForm.dateRange[0]).format('YYYY-MM-DD HH:mm:ss') : undefined,
      endTime: searchForm.dateRange?.[1] ? dayjs(searchForm.dateRange[1]).format('YYYY-MM-DD HH:mm:ss') : undefined
    }
    setQueryParams(params)
  }

  // 重置搜索
  const handleReset = () => {
    setSearchForm({
      phone: '',
      nickname: '',
      status: undefined,
      dateRange: null
    })
    setQueryParams({
      pageNum: 1,
      pageSize: 10
    })
  }

  // 查看详情
  const handleViewDetail = async (userId: number) => {
    try {
      const response = await getMiniappUserDetail(userId)
      if (response.code === 0) {
        setCurrentUser(response.data)
        setDetailVisible(true)
      } else {
        message.error(response.msg || '查询用户详情失败')
      }
    } catch (error: any) {
      message.error(error.message || '查询用户详情失败')
    }
  }

  // 更新用户状态
  const handleUpdateStatus = (userId: number, currentStatus: number) => {
    const newStatus = currentStatus === 0 ? 1 : 0
    const statusText = newStatus === 0 ? '启用' : '禁用'

    Modal.confirm({
      title: `确认${statusText}用户？`,
      content: `确定要${statusText}该用户吗？`,
      onOk: async () => {
        try {
          const response = await updateMiniappUserStatus(userId, newStatus)
          if (response.code === 0) {
            message.success(`${statusText}成功`)
            loadUserList()
            loadStatistics()
          } else {
            message.error(response.msg || `${statusText}失败`)
          }
        } catch (error: any) {
          message.error(error.message || `${statusText}失败`)
        }
      }
    })
  }

  // 表格列定义
  const columns: ColumnsType<MiniappUser> = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      width: 80
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 120,
      render: (text, record) => (
        <Space>
          {record.avatar && <img src={record.avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />}
          <span>{text || '-'}</span>
        </Space>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 80,
      render: (gender) => {
        const genderMap: Record<number, string> = { 0: '未知', 1: '男', 2: '女' }
        return genderMap[gender] || '-'
      }
    },
    {
      title: '注册来源',
      dataIndex: 'registerSource',
      width: 100,
      render: (source) => {
        const sourceMap: Record<string, { text: string; color: string }> = {
          wechat: { text: '微信', color: 'green' },
          sms: { text: '短信', color: 'blue' },
          password: { text: '账号', color: 'default' }
        }
        const config = sourceMap[source] || { text: source, color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 0 ? 'success' : 'error'}>
          {status === 0 ? '正常' : '禁用'}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 160
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      width: 160,
      render: (text) => text || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.userId)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            danger={record.status === 0}
            icon={record.status === 0 ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleUpdateStatus(record.userId, record.status)}
          >
            {record.status === 0 ? '禁用' : '启用'}
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">小程序用户</div>
          <div className="aox-page-subtitle">用户概览与活跃趋势</div>
        </div>
      </div>

      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="用户总数"
                value={statistics.totalUsers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日新增"
                value={statistics.todayNewUsers}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃用户（7天）"
                value={statistics.activeUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="微信注册"
                value={statistics.wechatUsers}
                suffix={`/ ${statistics.phoneUsers} 手机号`}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 搜索区域 */}
      <Card className="aox-filter-card" title="筛选条件">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap className="aox-search-stack">
            <Input
              placeholder="手机号"
              value={searchForm.phone}
              onChange={(e) => setSearchForm({ ...searchForm, phone: e.target.value })}
              style={{ width: 200 }}
              allowClear
            />
            <Input
              placeholder="昵称"
              value={searchForm.nickname}
              onChange={(e) => setSearchForm({ ...searchForm, nickname: e.target.value })}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="用户状态"
              value={searchForm.status}
              onChange={(value) => setSearchForm({ ...searchForm, status: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value={0}>正常</Select.Option>
              <Select.Option value={1}>禁用</Select.Option>
            </Select>
            <RangePicker
              value={searchForm.dateRange}
              onChange={(dates) => setSearchForm({ ...searchForm, dateRange: dates })}
              placeholder={['开始日期', '结束日期']}
            />
          </Space>
          <div className="aox-filter-actions">
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </div>
        </Space>
      </Card>

      {/* 用户列表 */}
      <Card className="aox-table-card" title="用户列表">
        <Table
          columns={columns}
          dataSource={userList}
          rowKey="userId"
          loading={loading}
          pagination={{
            current: queryParams.pageNum,
            pageSize: queryParams.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams({ ...queryParams, pageNum: page, pageSize: pageSize || 10 })
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 用户详情抽屉 */}
      <Drawer
        title="用户详情"
        placement="right"
        width={600}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
      >
        {currentUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="用户ID">{currentUser.userId}</Descriptions.Item>
            <Descriptions.Item label="用户名">{currentUser.username}</Descriptions.Item>
            <Descriptions.Item label="昵称">{currentUser.nickname || '-'}</Descriptions.Item>
            <Descriptions.Item label="头像">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%' }} />
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="性别">
              {currentUser.gender === 1 ? '男' : currentUser.gender === 2 ? '女' : '未知'}
            </Descriptions.Item>
            <Descriptions.Item label="手机号">{currentUser.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{currentUser.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="个性签名">{currentUser.signature || '-'}</Descriptions.Item>
            <Descriptions.Item label="注册来源">
              {currentUser.registerSource === 'wechat' ? '微信' : currentUser.registerSource === 'sms' ? '短信' : '账号密码'}
            </Descriptions.Item>
            <Descriptions.Item label="微信OpenID">{currentUser.wxOpenid || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={currentUser.status === 0 ? 'success' : 'error'}>
                {currentUser.status === 0 ? '正常' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">{currentUser.createdAt}</Descriptions.Item>
            <Descriptions.Item label="最后登录时间">{currentUser.lastLoginTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="最后登录IP">{currentUser.lastLoginIp || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default MiniappUser
