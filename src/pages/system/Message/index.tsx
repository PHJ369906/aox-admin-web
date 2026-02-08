import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Tag,
  Popconfirm,
  Badge,
  Tooltip,
  Tabs,
} from 'antd';
import {
  DeleteOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import request from '@/utils/request';

const { TabPane } = Tabs;

/**
 * 消息中心页面
 */
const MessageCenterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeTab, setActiveTab] = useState('0'); // 0:未读 1:已读
  const [unreadCount, setUnreadCount] = useState(0);

  // 加载消息列表
  const loadMessageList = async (isRead?: number) => {
    try {
      setLoading(true);
      const res = await request.get('/v1/system/messages', {
        params: {
          current: pagination.current,
          size: pagination.pageSize,
          isRead: isRead !== undefined ? isRead : (activeTab === '0' ? 0 : 1),
        },
      });

      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data.records);
        setPagination({
          ...pagination,
          total: res.data.total,
          current: res.data.current,
        });
      }
    } catch (error) {
      message.error('加载消息列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载未读消息数量
  const loadUnreadCount = async () => {
    try {
      const res = await request.get('/v1/system/messages/unread/count');
      if ((res.code === 0 || res.code === 200)) {
        setUnreadCount(res.data);
      }
    } catch (error) {
      console.error('加载未读数量失败', error);
    }
  };

  useEffect(() => {
    loadMessageList();
    loadUnreadCount();
  }, [activeTab]);

  // 标记为已读
  const handleMarkAsRead = async (messageId: number) => {
    try {
      const res = await request.post(`/v1/system/messages/${messageId}/read`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('已标记为已读');
        loadMessageList();
        loadUnreadCount();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 批量标记为已读
  const handleBatchMarkAsRead = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要标记的消息');
      return;
    }

    try {
      const res = await request.post('/v1/system/messages/read/batch', selectedRowKeys);
      if ((res.code === 0 || res.code === 200)) {
        message.success('批量标记成功');
        setSelectedRowKeys([]);
        loadMessageList();
        loadUnreadCount();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 全部标记为已读
  const handleMarkAllAsRead = async () => {
    try {
      const res = await request.post('/v1/system/messages/read/all');
      if ((res.code === 0 || res.code === 200)) {
        message.success('全部标记为已读');
        loadMessageList();
        loadUnreadCount();
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 删除消息
  const handleDelete = async (messageId: number) => {
    try {
      const res = await request.delete(`/v1/system/messages/${messageId}`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('删除成功');
        loadMessageList();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的消息');
      return;
    }

    try {
      const res = await request.delete('/v1/system/messages/batch', {
        data: selectedRowKeys,
      });
      if ((res.code === 0 || res.code === 200)) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        loadMessageList();
      }
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '消息类型',
      dataIndex: 'messageType',
      key: 'messageType',
      width: 100,
      render: (type: number) => {
        const config: any = {
          1: { text: '系统消息', color: 'blue' },
          2: { text: '业务消息', color: 'green' },
          3: { text: '提醒消息', color: 'orange' },
        };
        return <Tag color={config[type]?.color}>{config[type]?.text}</Tag>;
      },
    },
    {
      title: '消息标题',
      dataIndex: 'messageTitle',
      key: 'messageTitle',
      width: 250,
      render: (text: string, record: any) => (
        <Space>
          {record.isRead === 0 && <Badge status="processing" />}
          <span style={{ fontWeight: record.isRead === 0 ? 'bold' : 'normal' }}>
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: '消息内容',
      dataIndex: 'messageContent',
      key: 'messageContent',
      ellipsis: true,
    },
    {
      title: '发送人',
      dataIndex: 'fromUserName',
      key: 'fromUserName',
      width: 120,
      render: (text: string) => text || '系统',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          {record.isRead === 0 && (
            <Tooltip title="标记已读">
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleMarkAsRead(record.messageId)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定删除此消息吗？"
            onConfirm={() => handleDelete(record.messageId)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">消息中心</div>
          <div className="aox-page-subtitle">统一处理系统消息与提醒</div>
        </div>
        <Space>
          {activeTab === '0' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleBatchMarkAsRead}
                disabled={selectedRowKeys.length === 0}
              >
                批量标记已读
              </Button>
              <Button onClick={handleMarkAllAsRead}>全部标记已读</Button>
            </>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => loadMessageList()}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className="aox-table-card" title="消息列表">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setSelectedRowKeys([]);
          }}
        >
          <TabPane tab={<Badge count={unreadCount} offset={[10, 0]}>未读消息</Badge>} key="0">
            <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              rowKey="messageId"
              rowSelection={rowSelection}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
              onChange={(pagination) => {
                setPagination(pagination as any);
                loadMessageList(0);
              }}
            />
          </TabPane>

          <TabPane tab="已读消息" key="1">
            <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              rowKey="messageId"
              rowSelection={rowSelection}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
              onChange={(pagination) => {
                setPagination(pagination as any);
                loadMessageList(1);
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default MessageCenterPage;
