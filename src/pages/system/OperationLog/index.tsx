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
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * 操作日志管理页面
 */
const OperationLogPage: React.FC = () => {
  const [searchForm] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [moduleList, setModuleList] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>({});

  // 加载模块列表
  const loadModuleList = async () => {
    try {
      const res = await request.get('/v1/system/logs/operation/modules');
      if ((res.code === 0 || res.code === 200)) {
        setModuleList(res.data);
      }
    } catch (error) {
      console.error('加载模块列表失败', error);
    }
  };

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const res = await request.get('/v1/system/logs/operation/statistics');
      if ((res.code === 0 || res.code === 200)) {
        setStatistics(res.data);
      }
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  };

  // 加载操作日志列表
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

      const res = await request.get('/v1/system/logs/operation', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data.records);
        setPagination({
          ...pagination,
          total: res.data.total,
          current: res.data.current,
        });
      }
    } catch (error) {
      message.error('加载操作日志列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadLogList();
    loadModuleList();
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
  const handleViewDetail = async (logId: number) => {
    try {
      const res = await request.get(`/v1/system/logs/operation/${logId}`);
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
          const res = await request.delete('/v1/system/logs/operation', {
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
      content: '确定要清空所有操作日志吗？此操作不可恢复！',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await request.delete('/v1/system/logs/operation/clear');
          if ((res.code === 0 || res.code === 200)) {
            message.success('清空成功');
            loadLogList();
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

    window.open(`/api/v1/system/logs/operation/export?${params.toString()}`, '_blank');
    message.success('导出任务已提交');
  };

  // 表格列定义
  const columns = [
    {
      title: '日志ID',
      dataIndex: 'logId',
      key: 'logId',
      width: 80,
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 150,
    },
    {
      title: '操作人',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (text: string) => {
        const colors: any = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red',
        };
        return <Tag color={colors[text]}>{text}</Tag>;
      },
    },
    {
      title: '请求URI',
      dataIndex: 'requestUri',
      key: 'requestUri',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 130,
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
      title: '耗时(ms)',
      dataIndex: 'executionTime',
      key: 'executionTime',
      width: 100,
      render: (time: number) => {
        const color = time > 1000 ? 'red' : time > 500 ? 'orange' : 'green';
        return <Tag color={color}>{time}</Tag>;
      },
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as 'right',
      width: 100,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.logId)}
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
          <div className="aox-page-title">操作日志</div>
          <div className="aox-page-subtitle">关键操作审计与追踪</div>
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
            title="确定要清空所有操作日志吗？"
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
              title="今日操作总数"
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
          <Form.Item name="module" label="模块">
            <Select placeholder="请选择模块" allowClear style={{ width: 150 }}>
              {moduleList.map((module) => (
                <Option key={module} value={module}>
                  {module}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="operation" label="操作">
            <Input placeholder="请输入操作" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="username" label="操作人">
            <Input placeholder="请输入操作人" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              <Option value={0}>成功</Option>
              <Option value={1}>失败</Option>
            </Select>
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

      <Card className="aox-table-card" title="操作日志列表">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          rowKey="logId"
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
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="操作日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentLog && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>日志ID：</strong>{currentLog.logId}
              </Col>
              <Col span={12}>
                <strong>模块：</strong><Tag color="blue">{currentLog.module}</Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>操作：</strong>{currentLog.operation}
              </Col>
              <Col span={12}>
                <strong>操作人：</strong>{currentLog.username}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>请求方法：</strong><Tag color="blue">{currentLog.method}</Tag>
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
              <Col span={24}>
                <strong>请求URI：</strong>{currentLog.requestUri}
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
                <strong>耗时：</strong>
                <Tag color={currentLog.executionTime > 1000 ? 'red' : 'green'}>
                  {currentLog.executionTime} ms
                </Tag>
              </Col>
              <Col span={12}>
                <strong>操作时间：</strong>{currentLog.createTime}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <strong>请求参数：</strong>
                <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
                  {currentLog.requestParams || '-'}
                </pre>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <strong>返回结果：</strong>
                <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
                  {currentLog.responseResult || '-'}
                </pre>
              </Col>
            </Row>
            {currentLog.errorMsg && (
              <Row gutter={16}>
                <Col span={24}>
                  <strong>错误信息：</strong>
                  <pre style={{ background: '#fff2f0', padding: 10, borderRadius: 4, color: 'red' }}>
                    {currentLog.errorMsg}
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

export default OperationLogPage;
