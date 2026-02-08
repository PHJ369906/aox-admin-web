import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  ClearOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import request from '@/utils/request';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * 登录日志管理页面
 */
const LoginLogPage: React.FC = () => {
  const [searchForm] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [statistics, setStatistics] = useState<any>({});

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const res = await request.get('/v1/system/logs/login/statistics');
      if ((res.code === 0 || res.code === 200)) {
        setStatistics(res.data);
      }
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  };

  // 加载登录日志列表
  const loadLogList = async (params?: any) => {
    try {
      setTableLoading(true);
      const searchValues = searchForm.getFieldsValue();
      const queryParams = {
        current: pagination.current,
        size: pagination.pageSize,
        ...searchValues,
        ...params,
      };

      // 处理时间范围
      if (searchValues.timeRange && searchValues.timeRange.length === 2) {
        queryParams.startTime = searchValues.timeRange[0].format('YYYY-MM-DD HH:mm:ss');
        queryParams.endTime = searchValues.timeRange[1].format('YYYY-MM-DD HH:mm:ss');
        delete queryParams.timeRange;
      }

      const res = await request.get('/v1/system/logs/login', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data.records);
        setPagination({
          ...pagination,
          total: res.data.total,
          current: res.data.current,
        });
      }
    } catch (error) {
      message.error('加载登录日志列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadLogList();
    loadStatistics();
  }, []);

  // 搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadLogList({ current: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination({ ...pagination, current: 1 });
    loadLogList({ current: 1 });
  };

  // 查看详情
  const handleViewDetail = async (loginLogId: number) => {
    try {
      const res = await request.get(`/v1/system/logs/login/${loginLogId}`);
      if ((res.code === 0 || res.code === 200)) {
        setCurrentLog(res.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      message.error('获取日志详情失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一条记录');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: async () => {
        try {
          const res = await request.delete('/v1/system/logs/login', {
            data: selectedRowKeys,
          });
          if ((res.code === 0 || res.code === 200)) {
            message.success('批量删除成功');
            setSelectedRowKeys([]);
            loadLogList();
          }
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 清空日志
  const handleClearLogs = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有登录日志吗？此操作不可恢复！',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await request.delete('/v1/system/logs/login/clear');
          if ((res.code === 0 || res.code === 200)) {
            message.success('清空成功');
            loadLogList();
            loadStatistics();
          }
        } catch (error) {
          message.error('清空失败');
        }
      },
    });
  };

  // 导出日志
  const handleExport = () => {
    const searchValues = searchForm.getFieldsValue();
    const params = new URLSearchParams();

    Object.keys(searchValues).forEach((key) => {
      if (searchValues[key]) {
        if (key === 'timeRange' && searchValues[key].length === 2) {
          params.append('startTime', searchValues[key][0].format('YYYY-MM-DD HH:mm:ss'));
          params.append('endTime', searchValues[key][1].format('YYYY-MM-DD HH:mm:ss'));
        } else if (key !== 'timeRange') {
          params.append(key, searchValues[key]);
        }
      }
    });

    window.open(`/api/v1/system/logs/login/export?${params.toString()}`, '_blank');
    message.success('导出任务已提交');
  };

  // 表格列定义
  const columns = [
    {
      title: '日志ID',
      dataIndex: 'loginLogId',
      key: 'loginLogId',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '登录类型',
      dataIndex: 'loginType',
      key: 'loginType',
      width: 120,
      render: (type: number) => {
        const config: any = {
          0: { text: '账号密码', color: 'blue' },
          1: { text: '手机验证码', color: 'green' },
          2: { text: '第三方登录', color: 'orange' },
        };
        return <Tag color={config[type]?.color}>{config[type]?.text || '未知'}</Tag>;
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
    },
    {
      title: '地理位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
      ellipsis: true,
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 120,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Badge
          status={status === 0 ? 'success' : 'error'}
          text={status === 0 ? '成功' : '失败'}
        />
      ),
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 100,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.loginLogId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">登录日志</div>
          <div className="aox-page-subtitle">安全审计与登录分析</div>
        </div>
        <Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
          <Popconfirm
            title="确定要清空所有登录日志吗？"
            description="此操作不可恢复！"
            onConfirm={handleClearLogs}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<ClearOutlined />}>
              清空日志
            </Button>
          </Popconfirm>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日登录总数"
              value={statistics.todayTotal || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日成功数"
              value={statistics.todaySuccess || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日失败数"
              value={statistics.todayFail || 0}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总记录数"
              value={statistics.totalCount || 0}
            />
          </Card>
        </Col>
      </Row>

      <Card className="aox-filter-card" title="筛选条件">
        <Form form={searchForm} layout="inline" className="aox-search-form">
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="loginType" label="登录类型">
            <Select placeholder="请选择登录类型" allowClear style={{ width: 150 }}>
              <Option value={0}>账号密码</Option>
              <Option value={1}>手机验证码</Option>
              <Option value={2}>第三方登录</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              <Option value={0}>成功</Option>
              <Option value={1}>失败</Option>
            </Select>
          </Form.Item>
          <Form.Item name="ip" label="IP地址">
            <Input placeholder="请输入IP地址" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker showTime style={{ width: 350 }} />
          </Form.Item>
          <Form.Item>
            <div className="aox-filter-actions">
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Card className="aox-table-card" title="登录日志列表">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          rowKey="loginLogId"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(pagination) => {
            setPagination(pagination as any);
            loadLogList({ current: pagination.current, size: pagination.pageSize });
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="登录日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentLog && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>日志ID：</strong>{currentLog.loginLogId}
              </Col>
              <Col span={12}>
                <strong>用户名：</strong>{currentLog.username}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>登录类型：</strong>
                {currentLog.loginType === 0 && <Tag color="blue">账号密码</Tag>}
                {currentLog.loginType === 1 && <Tag color="green">手机验证码</Tag>}
                {currentLog.loginType === 2 && <Tag color="orange">第三方登录</Tag>}
              </Col>
              <Col span={12}>
                <strong>状态：</strong>
                <Badge
                  status={currentLog.status === 0 ? 'success' : 'error'}
                  text={currentLog.status === 0 ? '成功' : '失败'}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>IP地址：</strong>{currentLog.ip}
              </Col>
              <Col span={12}>
                <strong>地理位置：</strong>{currentLog.location || '-'}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>浏览器：</strong>{currentLog.browser || '-'}
              </Col>
              <Col span={12}>
                <strong>操作系统：</strong>{currentLog.os || '-'}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <strong>User-Agent：</strong>
                <div style={{ wordBreak: 'break-all', marginTop: 8 }}>
                  {currentLog.userAgent || '-'}
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>登录时间：</strong>{currentLog.loginTime}
              </Col>
              <Col span={12}>
                <strong>登出时间：</strong>{currentLog.logoutTime || '-'}
              </Col>
            </Row>
            {currentLog.message && (
              <Row gutter={16}>
                <Col span={24}>
                  <strong>提示信息：</strong>
                  <pre style={{
                    background: currentLog.status === 0 ? '#f6ffed' : '#fff2f0',
                    padding: 10,
                    borderRadius: 4,
                    marginTop: 8
                  }}>
                    {currentLog.message}
                  </pre>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoginLogPage;
