import { useState, useEffect } from 'react'
import { Card, Table, Space, Tag, Drawer, Descriptions, Input, Select, DatePicker, message, Statistic, Row, Col, Button } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined, DollarOutlined, ShoppingCartOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getPaymentOrderList, getPaymentOrderDetail, getPaymentStatistics, exportPaymentOrders } from '../../api/payment'
import type { PaymentOrder, PaymentOrderQueryParams, PaymentStatistics } from '../../api/payment'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

/**
 * 支付订单管理页面
 */
const PaymentOrder: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [orderList, setOrderList] = useState<PaymentOrder[]>([])
  const [total, setTotal] = useState(0)
  const [queryParams, setQueryParams] = useState<PaymentOrderQueryParams>({
    pageNum: 1,
    pageSize: 10
  })
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null)
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null)
  const [exporting, setExporting] = useState(false)

  // 搜索表单状态
  const [searchForm, setSearchForm] = useState({
    orderNo: '',
    phone: '',
    paymentType: undefined as string | undefined,
    status: undefined as number | undefined,
    dateRange: null as any
  })

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const response = await getPaymentStatistics()
      if (response.code === 0) {
        setStatistics(response.data)
      }
    } catch (error: any) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 加载订单列表
  const loadOrderList = async () => {
    setLoading(true)
    try {
      const response = await getPaymentOrderList(queryParams)
      if (response.code === 0) {
        setOrderList(response.data.records)
        setTotal(response.data.total)
      } else {
        message.error(response.msg || '加载订单列表失败')
      }
    } catch (error: any) {
      message.error(error.message || '加载订单列表失败')
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
    loadOrderList()
  }, [queryParams])

  // 搜索
  const handleSearch = () => {
    setQueryParams(buildQueryParams(true))
  }

  // 重置搜索
  const handleReset = () => {
    setSearchForm({
      orderNo: '',
      phone: '',
      paymentType: undefined,
      status: undefined,
      dateRange: null
    })
    setQueryParams({
      pageNum: 1,
      pageSize: 10
    })
  }

  const buildQueryParams = (includePagination: boolean): PaymentOrderQueryParams => {
    const params: PaymentOrderQueryParams = {
      orderNo: searchForm.orderNo || undefined,
      phone: searchForm.phone || undefined,
      paymentType: searchForm.paymentType,
      status: searchForm.status,
      startTime: searchForm.dateRange?.[0]
        ? dayjs(searchForm.dateRange[0]).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      endTime: searchForm.dateRange?.[1]
        ? dayjs(searchForm.dateRange[1]).format('YYYY-MM-DD HH:mm:ss')
        : undefined
    }

    if (includePagination) {
      params.pageNum = 1
      params.pageSize = queryParams.pageSize
    }

    return params
  }

  const parseFileName = (disposition?: string) => {
    if (!disposition) return null
    const utf8Match = disposition.match(/filename\*=utf-8''([^;]+)/i)
    if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1])
    const match = disposition.match(/filename="?([^\";]+)"?/i)
    return match?.[1] || null
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await exportPaymentOrders(buildQueryParams(false))
      const disposition = response.headers?.['content-disposition']
      const fileName = parseFileName(disposition) || `支付订单_${dayjs().format('YYYYMMDD')}.xlsx`
      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('导出成功')
    } catch (error: any) {
      message.error(error.message || '导出失败')
    } finally {
      setExporting(false)
    }
  }

  // 查看详情
  const handleViewDetail = async (orderId: number) => {
    try {
      const response = await getPaymentOrderDetail(orderId)
      if (response.code === 0) {
        setCurrentOrder(response.data)
        setDetailVisible(true)
      } else {
        message.error(response.msg || '查询订单详情失败')
      }
    } catch (error: any) {
      message.error(error.message || '查询订单详情失败')
    }
  }

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `¥${amount.toFixed(2)}`
  }

  // 获取状态标签
  const getStatusTag = (status: number) => {
    const statusMap: Record<number, { text: string; color: string }> = {
      0: { text: '待支付', color: 'warning' },
      1: { text: '已支付', color: 'success' },
      2: { text: '已退款', color: 'error' },
      3: { text: '已关闭', color: 'default' }
    }
    const config = statusMap[status] || { text: '未知', color: 'default' }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 获取支付类型标签
  const getPaymentTypeTag = (type: string) => {
    const typeMap: Record<string, { text: string; color: string }> = {
      wechat: { text: '微信支付', color: 'green' },
      alipay: { text: '支付宝', color: 'blue' }
    }
    const config = typeMap[type] || { text: type, color: 'default' }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 表格列定义
  const columns: ColumnsType<PaymentOrder> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 180,
      fixed: 'left'
    },
    {
      title: '用户信息',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.userNickname || '-'}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.userPhone || '-'}</div>
        </div>
      )
    },
    {
      title: '订单标题',
      dataIndex: 'subject',
      width: 200,
      ellipsis: true
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 100,
      render: (amount) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{formatAmount(amount)}</span>
    },
    {
      title: '支付方式',
      dataIndex: 'paymentType',
      width: 100,
      render: (type) => getPaymentTypeTag(type)
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160
    },
    {
      title: '支付时间',
      dataIndex: 'payTime',
      width: 160,
      render: (text) => text || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.orderId)}
        >
          详情
        </Button>
      )
    }
  ]

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">支付订单</div>
          <div className="aox-page-subtitle">订单流水与支付状态总览</div>
        </div>
        <Button onClick={handleExport} loading={exporting}>
          导出
        </Button>
      </div>

      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="订单总数"
                value={statistics.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#3f8600' }}
                suffix={`今日 ${statistics.todayOrders}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="订单总金额"
                value={statistics.totalAmount}
                precision={2}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#cf1322' }}
                suffix={`今日 ¥${statistics.todayAmount.toFixed(2)}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="支付成功率"
                value={statistics.successRate}
                precision={2}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                成功 {statistics.successOrders} / 待支付 {statistics.pendingOrders}
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="支付渠道分布"
                value={statistics.wechatOrders}
                prefix={<ClockCircleOutlined />}
                suffix={`/ ${statistics.alipayOrders}`}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                微信 / 支付宝
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* 搜索区域 */}
      <Card className="aox-filter-card" title="筛选条件">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap className="aox-search-stack">
            <Input
              placeholder="订单号"
              value={searchForm.orderNo}
              onChange={(e) => setSearchForm({ ...searchForm, orderNo: e.target.value })}
              style={{ width: 200 }}
              allowClear
            />
            <Input
              placeholder="用户手机号"
              value={searchForm.phone}
              onChange={(e) => setSearchForm({ ...searchForm, phone: e.target.value })}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="支付方式"
              value={searchForm.paymentType}
              onChange={(value) => setSearchForm({ ...searchForm, paymentType: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="wechat">微信支付</Select.Option>
              <Select.Option value="alipay">支付宝</Select.Option>
            </Select>
            <Select
              placeholder="订单状态"
              value={searchForm.status}
              onChange={(value) => setSearchForm({ ...searchForm, status: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value={0}>待支付</Select.Option>
              <Select.Option value={1}>已支付</Select.Option>
              <Select.Option value={2}>已退款</Select.Option>
              <Select.Option value={3}>已关闭</Select.Option>
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

      {/* 订单列表 */}
      <Card className="aox-table-card" title="订单列表">
        <Table
          columns={columns}
          dataSource={orderList}
          rowKey="orderId"
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 订单详情抽屉 */}
      <Drawer
        title="订单详情"
        placement="right"
        width={700}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
      >
        {currentOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="订单ID">{currentOrder.orderId}</Descriptions.Item>
            <Descriptions.Item label="订单号">{currentOrder.orderNo}</Descriptions.Item>
            <Descriptions.Item label="支付流水号">{currentOrder.paymentNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="订单标题">{currentOrder.subject}</Descriptions.Item>
            <Descriptions.Item label="订单描述">{currentOrder.body || '-'}</Descriptions.Item>
            <Descriptions.Item label="订单金额">
              <span style={{ color: '#f5222d', fontSize: '18px', fontWeight: 'bold' }}>
                {formatAmount(currentOrder.amount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="币种">{currentOrder.currency}</Descriptions.Item>
            <Descriptions.Item label="支付方式">{getPaymentTypeTag(currentOrder.paymentType)}</Descriptions.Item>
            <Descriptions.Item label="支付方法">{currentOrder.paymentMethod}</Descriptions.Item>
            <Descriptions.Item label="订单状态">{getStatusTag(currentOrder.status)}</Descriptions.Item>
            <Descriptions.Item label="用户信息">
              <div>昵称：{currentOrder.userNickname || '-'}</div>
              <div>手机号：{currentOrder.userPhone || '-'}</div>
              <div>用户ID：{currentOrder.userId}</div>
            </Descriptions.Item>
            <Descriptions.Item label="第三方交易号">{currentOrder.transactionId || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{currentOrder.createTime}</Descriptions.Item>
            <Descriptions.Item label="支付时间">{currentOrder.payTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{currentOrder.updateTime}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default PaymentOrder
