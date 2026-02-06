import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tag,
  Space,
  Button,
  Divider,
  Empty,
} from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  LoginOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Line, Column, Pie, Heatmap } from '@ant-design/charts'
import {
  getStatistics,
  getUserTrend,
  getPaymentTrend,
  getPaymentMethods,
  type DashboardStatistics,
  type UserTrend,
  type PaymentTrend,
  type PaymentMethod,
} from '@/api/dashboard'
import './Dashboard.css'

const { Title, Text } = Typography

const numberFormatter = new Intl.NumberFormat('zh-CN')
const currencyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 2,
})

const formatNumber = (value?: number | null) => numberFormatter.format(value ?? 0)
const formatAmount = (value?: number | null) => currencyFormatter.format(value ?? 0)

const renderGrowthTag = (value?: number) => {
  const safeValue = value ?? 0
  const isUp = safeValue >= 0
  const color = isUp ? 'green' : 'red'
  const symbol = isUp ? '↑' : '↓'
  return (
    <Tag color={color}>
      {symbol} {Math.abs(safeValue).toFixed(1)}%
    </Tag>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null)
  const [userTrend, setUserTrend] = useState<UserTrend[]>([])
  const [paymentTrend, setPaymentTrend] = useState<PaymentTrend[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const [statisticsRes, userTrendRes, paymentTrendRes, paymentMethodsRes] =
        await Promise.all([
          getStatistics(),
          getUserTrend(),
          getPaymentTrend(),
          getPaymentMethods(),
        ])
      setStatistics(statisticsRes.data || null)
      setUserTrend(userTrendRes.data || [])
      setPaymentTrend(paymentTrendRes.data || [])
      setPaymentMethods(paymentMethodsRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchDashboard()
  }, [])

  const userTrendData = useMemo(
    () =>
      userTrend.flatMap((item) => [
        { date: item.date, value: item.newUsers, type: '新增用户' },
        { date: item.date, value: item.activeUsers, type: '活跃用户' },
      ]),
    [userTrend]
  )

  const paymentTrendData = useMemo(
    () =>
      paymentTrend.map((item) => ({
        date: item.date,
        amount: Number(item.amount) || 0,
        orderCount: item.orderCount ?? 0,
      })),
    [paymentTrend]
  )

  const paymentMethodData = useMemo(
    () =>
      paymentMethods.map((item) => ({
        method: item.method,
        count: item.count,
        percentage: item.percentage,
      })),
    [paymentMethods]
  )

  const heatmapData = useMemo(() => {
    if (!userTrend.length) {
      return []
    }
    const startDate = dayjs().subtract(userTrend.length - 1, 'day')
    return userTrend.map((item, index) => {
      const date = startDate.add(index, 'day')
      return {
        week: `W${Math.floor(index / 7) + 1}`,
        weekday: ['日', '一', '二', '三', '四', '五', '六'][date.day()],
        value: item.activeUsers ?? 0,
        date: date.format('YYYY-MM-DD'),
      }
    })
  }, [userTrend])

  const quickActions = [
    { label: '小程序用户', path: '/miniapp/users' },
    { label: '支付订单', path: '/payment/orders' },
    { label: 'Banner管理', path: '/miniapp/banners' },
    { label: '系统用户', path: '/system/user' },
    { label: '登录日志', path: '/system/logs/login' },
    { label: '操作日志', path: '/system/logs/operation' },
  ]

  return (
    <div className="dashboard-page aox-page">
      <div className="dashboard-header">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            仪表盘
          </Title>
          <Text type="secondary">运营数据总览与关键指标监控</Text>
        </div>
        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchDashboard} loading={loading}>
          刷新数据
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="kpi-card">
            <Space direction="vertical" size={8}>
              <Space align="center">
                <span className="kpi-icon kpi-icon--user">
                  <UserOutlined />
                </span>
                <Text type="secondary">用户总数</Text>
              </Space>
              <Statistic value={statistics?.totalUsers ?? 0} formatter={(v) => formatNumber(Number(v))} />
              <Space size={8} wrap>
                <Text type="secondary">今日新增</Text>
                <Text strong>{formatNumber(statistics?.todayNewUsers)}</Text>
                {renderGrowthTag(statistics?.userGrowthRate)}
              </Space>
              <Text type="secondary">近7天活跃：{formatNumber(statistics?.activeUsers)}</Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="kpi-card">
            <Space direction="vertical" size={8}>
              <Space align="center">
                <span className="kpi-icon kpi-icon--order">
                  <ShoppingOutlined />
                </span>
                <Text type="secondary">订单总数</Text>
              </Space>
              <Statistic value={statistics?.totalOrders ?? 0} formatter={(v) => formatNumber(Number(v))} />
              <Space size={8} wrap>
                <Text type="secondary">今日订单</Text>
                <Text strong>{formatNumber(statistics?.todayOrders)}</Text>
                {renderGrowthTag(statistics?.orderGrowthRate)}
              </Space>
              <Text type="secondary">订单增长率为环比昨日</Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="kpi-card">
            <Space direction="vertical" size={8}>
              <Space align="center">
                <span className="kpi-icon kpi-icon--amount">
                  <DollarOutlined />
                </span>
                <Text type="secondary">支付金额</Text>
              </Space>
              <Statistic value={statistics?.totalAmount ?? 0} formatter={(v) => formatAmount(Number(v))} />
              <Space size={8} wrap>
                <Text type="secondary">今日金额</Text>
                <Text strong>{formatAmount(Number(statistics?.todayAmount ?? 0))}</Text>
                {renderGrowthTag(statistics?.amountGrowthRate)}
              </Space>
              <Text type="secondary">金额增长率为环比昨日</Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="kpi-card">
            <Space direction="vertical" size={8}>
              <Space align="center">
                <span className="kpi-icon kpi-icon--login">
                  <LoginOutlined />
                </span>
                <Text type="secondary">登录次数</Text>
              </Space>
              <Statistic value={statistics?.totalLogins ?? 0} formatter={(v) => formatNumber(Number(v))} />
              <Space size={8} wrap>
                <Text type="secondary">今日登录</Text>
                <Text strong>{formatNumber(statistics?.todayLogins)}</Text>
              </Space>
              <Text type="secondary">登录数据基于成功登录记录</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card className="quick-actions-card">
        <Space direction="vertical" size={12}>
          <Text type="secondary">快捷入口</Text>
          <Space wrap className="quick-actions">
            {quickActions.map((action) => (
              <Button key={action.path} onClick={() => navigate(action.path)}>
                {action.label}
              </Button>
            ))}
          </Space>
        </Space>
      </Card>

      <Divider className="dashboard-divider" />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="用户增长趋势" loading={loading} className="chart-card">
            {userTrendData.length ? (
              <Line
                data={userTrendData}
                xField="date"
                yField="value"
                seriesField="type"
                height={280}
                smooth
                xAxis={{ label: { autoHide: true } }}
                tooltip={{ shared: true }}
                legend={{ position: 'top' }}
                color={['#0891B2', '#22C55E']}
              />
            ) : (
              <Empty description="暂无趋势数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="支付方式占比" loading={loading} className="chart-card">
            {paymentMethodData.length ? (
              <Pie
                data={paymentMethodData}
                angleField="count"
                colorField="method"
                radius={0.9}
                innerRadius={0.6}
                height={280}
                label={{
                  type: 'spider',
                  content: (data) =>
                    `${data.method} ${Number(data.percentage || 0).toFixed(1)}%`,
                }}
                legend={{ position: 'bottom' }}
                color={['#0891B2', '#22D3EE', '#38BDF8', '#22C55E']}
              />
            ) : (
              <Empty description="暂无支付方式数据" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="订单金额趋势" loading={loading} className="chart-card">
            {paymentTrendData.length ? (
              <Column
                data={paymentTrendData}
                xField="date"
                yField="amount"
                height={280}
                columnWidthRatio={0.6}
                tooltip={{
                  formatter: (data) => ({
                    name: '金额',
                    value: formatAmount(Number(data.amount)),
                  }),
                }}
                meta={{
                  amount: { alias: '金额' },
                }}
                color="#0891B2"
              />
            ) : (
              <Empty description="暂无订单趋势数据" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="用户活跃度热力图" loading={loading} className="chart-card">
            {heatmapData.length ? (
              <Heatmap
                data={heatmapData}
                xField="week"
                yField="weekday"
                colorField="value"
                height={280}
                xAxis={{ position: 'top' }}
                tooltip={{
                  formatter: (data) => ({
                    name: data.date,
                    value: `${formatNumber(Number(data.value))} 活跃用户`,
                  }),
                }}
                legend={{
                  position: 'bottom',
                }}
                color={['#F8FAFC', '#67E8F9', '#0891B2']}
              />
            ) : (
              <Empty description="暂无活跃度数据" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
