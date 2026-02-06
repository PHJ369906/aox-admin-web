import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Drawer, Descriptions, Statistic, Row, Col, message, Modal } from 'antd'
import { ReloadOutlined, PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getJobList, getJobExecutionLogs, triggerJob, getJobStatistics } from '../../api/scheduledJob'
import type { ScheduledJob, JobExecutionLog, JobStatistics } from '../../api/scheduledJob'

/**
 * 定时任务监控页面
 */
const ScheduledJobMonitor: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [jobList, setJobList] = useState<ScheduledJob[]>([])
  const [statistics, setStatistics] = useState<JobStatistics | null>(null)
  const [logVisible, setLogVisible] = useState(false)
  const [currentJob, setCurrentJob] = useState<string>('')
  const [executionLogs, setExecutionLogs] = useState<JobExecutionLog[]>([])

  // 加载任务列表
  const loadJobList = async () => {
    setLoading(true)
    try {
      const response = await getJobList()
      if (response.code === 0) {
        setJobList(response.data)
      } else {
        message.error(response.msg || '加载任务列表失败')
      }
    } catch (error: any) {
      message.error(error.message || '加载任务列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const response = await getJobStatistics()
      if (response.code === 0) {
        setStatistics(response.data)
      }
    } catch (error: any) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 加载执行日志
  const loadExecutionLogs = async (jobName: string) => {
    try {
      const response = await getJobExecutionLogs(jobName, 10)
      if (response.code === 0) {
        setExecutionLogs(response.data)
      } else {
        message.error(response.msg || '加载执行日志失败')
      }
    } catch (error: any) {
      message.error(error.message || '加载执行日志失败')
    }
  }

  // 初始加载
  useEffect(() => {
    loadJobList()
    loadStatistics()
  }, [])

  // 查看执行日志
  const handleViewLogs = (jobName: string) => {
    setCurrentJob(jobName)
    loadExecutionLogs(jobName)
    setLogVisible(true)
  }

  // 手动触发任务
  const handleTriggerJob = (jobName: string) => {
    Modal.confirm({
      title: '确认触发任务？',
      content: `确定要手动执行"${jobName}"吗？`,
      onOk: async () => {
        try {
          const response = await triggerJob(jobName)
          if (response.code === 0) {
            message.success('任务触发成功')
            loadJobList()
          } else {
            message.error(response.msg || '任务触发失败')
          }
        } catch (error: any) {
          message.error(error.message || '任务触发失败')
        }
      }
    })
  }

  // 任务列表表格列定义
  const jobColumns: ColumnsType<ScheduledJob> = [
    {
      title: '任务名称',
      dataIndex: 'jobName',
      width: 150
    },
    {
      title: '任务描述',
      dataIndex: 'jobDescription',
      width: 200,
      ellipsis: true
    },
    {
      title: 'Cron表达式',
      dataIndex: 'cronExpression',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'success' : 'default'}>
          {status === 1 ? '运行中' : '已停止'}
        </Tag>
      )
    },
    {
      title: '最后执行时间',
      dataIndex: 'lastExecutionTime',
      width: 160
    },
    {
      title: '下次执行时间',
      dataIndex: 'nextExecutionTime',
      width: 160
    },
    {
      title: '执行统计',
      width: 150,
      render: (_, record) => (
        <div>
          <div>总计: {record.executionCount}</div>
          <div style={{ fontSize: '12px', color: '#52c41a' }}>成功: {record.successCount}</div>
          <div style={{ fontSize: '12px', color: '#ff4d4f' }}>失败: {record.failCount}</div>
        </div>
      )
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
            icon={<PlayCircleOutlined />}
            onClick={() => handleTriggerJob(record.jobName)}
          >
            触发
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewLogs(record.jobName)}
          >
            日志
          </Button>
        </Space>
      )
    }
  ]

  // 执行日志表格列定义
  const logColumns: ColumnsType<JobExecutionLog> = [
    {
      title: '执行时间',
      dataIndex: 'executionTime',
      width: 160
    },
    {
      title: '执行时长',
      dataIndex: 'executionDuration',
      width: 100,
      render: (duration) => `${duration}ms`
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 1 ? 'success' : 'error'}>
          {status === 1 ? '成功' : '失败'}
        </Tag>
      )
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      width: 100
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      width: 200,
      ellipsis: true,
      render: (text) => text || '-'
    }
  ]

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">定时任务</div>
          <div className="aox-page-subtitle">任务运行状态与执行日志</div>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadJobList}>
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="任务总数"
                value={statistics.totalJobs}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="运行中任务"
                value={statistics.runningJobs}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix={`/ ${statistics.stoppedJobs} 已停止`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日执行次数"
                value={statistics.todayExecutions}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                成功 {statistics.todaySuccessCount} / 失败 {statistics.todayFailCount}
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="成功率"
                value={statistics.successRate}
                precision={2}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 任务列表 */}
      <Card className="aox-table-card" title="定时任务列表">
        <Table
          columns={jobColumns}
          dataSource={jobList}
          rowKey="jobName"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 执行日志抽屉 */}
      <Drawer
        title={`执行日志 - ${currentJob}`}
        placement="right"
        width={800}
        onClose={() => setLogVisible(false)}
        open={logVisible}
      >
        <Table
          columns={logColumns}
          dataSource={executionLogs}
          rowKey="logId"
          pagination={false}
          size="small"
        />
      </Drawer>
    </div>
  )
}

export default ScheduledJobMonitor
