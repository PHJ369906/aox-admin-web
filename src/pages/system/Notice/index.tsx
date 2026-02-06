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
  Radio,
  message,
  Popconfirm,
  Badge,
  Tooltip,
  TreeSelect,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  NotificationOutlined,
  PushpinOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import request from '@/utils/request';

const { TextArea } = Input;
const { Option } = Select;

/**
 * 系统公告管理页面
 */
const NoticeManagePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentNotice, setCurrentNotice] = useState<any>(null);
  const [searchParams, setSearchParams] = useState<any>({});
  const [roleOptions, setRoleOptions] = useState<any[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [deptTreeData, setDeptTreeData] = useState<any[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  const targetType = Form.useWatch('targetType', form);

  // 加载公告列表
  const loadNoticeList = async (params?: any) => {
    try {
      setTableLoading(true);
      const queryParams = {
        current: pagination.current,
        size: pagination.pageSize,
        ...searchParams,
        ...params,
      };

      const res = await request.get('/v1/system/notices', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data.records);
        setPagination({
          ...pagination,
          total: res.data.total,
          current: res.data.current,
        });
      }
    } catch (error) {
      message.error('加载公告列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadNoticeList();
  }, []);

  // 打开新增/编辑弹窗
  const handleOpenModal = (record?: any) => {
    if (record) {
      const targetIds = Array.isArray(record.targetIds)
        ? record.targetIds
        : record.targetIds
          ? record.targetIds.split(',').filter(Boolean).map((id: string) => Number(id))
          : [];
      setCurrentNotice(record);
      form.setFieldsValue({
        ...record,
        targetIds,
      });
    } else {
      setCurrentNotice(null);
      form.resetFields();
      form.setFieldsValue({
        noticeType: 1,
        noticeLevel: 1,
        status: 0,
        targetType: 0,
        targetIds: [],
        isTop: 0,
      });
    }
    setModalVisible(true);
  };

  // 保存公告
  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const formattedValues = {
        ...values,
        targetIds: values.targetType === 0 ? [] : values.targetIds || [],
      };

      setLoading(true);
      let res;
      if (currentNotice) {
        res = await request.put(`/v1/system/notices/${currentNotice.noticeId}`, formattedValues);
      } else {
        res = await request.post('/v1/system/notices', formattedValues);
      }

      if ((res.code === 0 || res.code === 200)) {
        message.success(currentNotice ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadNoticeList();
      }
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 发布公告
  const handlePublish = async (noticeId: number) => {
    try {
      const res = await request.post(`/v1/system/notices/${noticeId}/publish`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('发布成功');
        loadNoticeList();
      }
    } catch (error) {
      message.error('发布失败');
    }
  };

  // 撤回公告
  const handleRevoke = async (noticeId: number) => {
    try {
      const res = await request.post(`/v1/system/notices/${noticeId}/revoke`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('撤回成功');
        loadNoticeList();
      }
    } catch (error) {
      message.error('撤回失败');
    }
  };

  // 置顶公告
  const handleTop = async (noticeId: number) => {
    try {
      const res = await request.post(`/v1/system/notices/${noticeId}/top`, {
        topOrder: 100,
      });
      if ((res.code === 0 || res.code === 200)) {
        message.success('置顶成功');
        loadNoticeList();
      }
    } catch (error) {
      message.error('置顶失败');
    }
  };

  // 取消置顶
  const handleCancelTop = async (noticeId: number) => {
    try {
      const res = await request.post(`/v1/system/notices/${noticeId}/cancel-top`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('取消置顶成功');
        loadNoticeList();
      }
    } catch (error) {
      message.error('取消置顶失败');
    }
  };

  // 删除公告
  const handleDelete = async (noticeId: number) => {
    try {
      const res = await request.delete(`/v1/system/notices/${noticeId}`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('删除成功');
        loadNoticeList();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 查看详情
  const handleViewDetail = (record: any) => {
    setCurrentNotice(record);
    setDetailModalVisible(true);
  };

  // 构建树形选择数据
  const buildTreeSelectData = (data: any[]): any[] => {
    return data.map((item) => ({
      value: item.deptId,
      title: item.deptName,
      children: item.children && item.children.length > 0 ? buildTreeSelectData(item.children) : undefined,
    }));
  };

  // 加载角色列表
  const loadRoles = async () => {
    if (roleLoading) return;
    try {
      setRoleLoading(true);
      const res = await request.get('/v1/system/roles', {
        params: {
          pageNum: 1,
          pageSize: 1000,
        },
      });
      if ((res.code === 0 || res.code === 200)) {
        setRoleOptions(res.data.list || []);
      }
    } catch (error) {
      message.error('加载角色列表失败');
    } finally {
      setRoleLoading(false);
    }
  };

  // 加载部门树
  const loadDeptTree = async () => {
    if (deptLoading) return;
    try {
      setDeptLoading(true);
      const res = await request.get('/v1/system/dept/tree');
      if ((res.code === 0 || res.code === 200)) {
        const treeData = buildTreeSelectData(res.data || []);
        setDeptTreeData(treeData);
      }
    } catch (error) {
      message.error('加载部门列表失败');
    } finally {
      setDeptLoading(false);
    }
  };

  // 加载用户（支持搜索）
  const loadUsers = async (keyword?: string) => {
    if (userLoading) return;
    try {
      setUserLoading(true);
      const res = await request.get('/v1/system/users', {
        params: {
          pageNum: 1,
          pageSize: 20,
          keyword: keyword || undefined,
        },
      });
      if ((res.code === 0 || res.code === 200)) {
        setUserOptions(res.data.list || []);
      }
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (!modalVisible) return;
    if (targetType === 1 && userOptions.length === 0) {
      loadUsers();
    }
    if (targetType === 2 && roleOptions.length === 0) {
      loadRoles();
    }
    if (targetType === 3 && deptTreeData.length === 0) {
      loadDeptTree();
    }
  }, [modalVisible, targetType]);

  // 表格列定义
  const columns = [
    {
      title: '公告标题',
      dataIndex: 'noticeTitle',
      key: 'noticeTitle',
      width: 250,
      render: (text: string, record: any) => (
        <Space>
          {record.isTop === 1 && <Tag color="red">置顶</Tag>}
          <a onClick={() => handleViewDetail(record)}>{text}</a>
        </Space>
      ),
    },
    {
      title: '公告类型',
      dataIndex: 'noticeType',
      key: 'noticeType',
      width: 100,
      render: (type: number) => (
        <Tag color={type === 1 ? 'blue' : 'green'}>
          {type === 1 ? '通知' : '公告'}
        </Tag>
      ),
    },
    {
      title: '级别',
      dataIndex: 'noticeLevel',
      key: 'noticeLevel',
      width: 100,
      render: (level: number) => {
        const config: any = {
          1: { text: '普通', color: 'default' },
          2: { text: '重要', color: 'orange' },
          3: { text: '紧急', color: 'red' },
        };
        return <Tag color={config[level]?.color}>{config[level]?.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const config: any = {
          0: { text: '草稿', color: 'default' },
          1: { text: '已发布', color: 'success' },
          2: { text: '已撤回', color: 'warning' },
        };
        return <Badge status={config[status]?.color as any} text={config[status]?.text} />;
      },
    },
    {
      title: '发布人',
      dataIndex: 'publishUserName',
      key: 'publishUserName',
      width: 120,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 180,
    },
    {
      title: '阅读次数',
      dataIndex: 'readCount',
      key: 'readCount',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as 'right',
      width: 280,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          {record.status === 0 && (
            <Tooltip title="发布">
              <Button
                type="link"
                size="small"
                icon={<NotificationOutlined />}
                onClick={() => handlePublish(record.noticeId)}
              />
            </Tooltip>
          )}
          {record.status === 1 && (
            <Tooltip title="撤回">
              <Button
                type="link"
                size="small"
                icon={<RollbackOutlined />}
                onClick={() => handleRevoke(record.noticeId)}
              />
            </Tooltip>
          )}
          {record.isTop === 0 ? (
            <Tooltip title="置顶">
              <Button
                type="link"
                size="small"
                icon={<PushpinOutlined />}
                onClick={() => handleTop(record.noticeId)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="取消置顶">
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleCancelTop(record.noticeId)}
              >
                取消置顶
              </Button>
            </Tooltip>
          )}
          <Popconfirm
            title="确定删除此公告吗？"
            onConfirm={() => handleDelete(record.noticeId)}
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

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">系统公告</div>
          <div className="aox-page-subtitle">统一管理公告内容与发布状态</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          新增公告
        </Button>
      </div>

      <Card className="aox-table-card" title="公告列表">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          rowKey="noticeId"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(pagination) => {
            setPagination(pagination as any);
            loadNoticeList({ current: pagination.current, size: pagination.pageSize });
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentNotice ? '编辑公告' : '新增公告'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="公告标题"
            name="noticeTitle"
            rules={[{ required: true, message: '请输入公告标题' }]}
          >
            <Input placeholder="请输入公告标题" maxLength={200} />
          </Form.Item>

          <Form.Item label="公告类型" name="noticeType" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={1}>通知</Radio>
              <Radio value={2}>公告</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="公告级别" name="noticeLevel" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={1}>普通</Radio>
              <Radio value={2}>重要</Radio>
              <Radio value={3}>紧急</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="公告内容"
            name="noticeContent"
            rules={[{ required: true, message: '请输入公告内容' }]}
          >
            <TextArea rows={6} placeholder="请输入公告内容" maxLength={2000} showCount />
          </Form.Item>

          <Form.Item label="目标类型" name="targetType" rules={[{ required: true }]}>
            <Select
              placeholder="请选择目标类型"
              onChange={() => form.setFieldsValue({ targetIds: [] })}
            >
              <Option value={0}>全部用户</Option>
              <Option value={1}>指定用户</Option>
              <Option value={2}>指定角色</Option>
              <Option value={3}>指定部门</Option>
            </Select>
          </Form.Item>

          {targetType === 1 && (
            <Form.Item
              label="指定用户"
              name="targetIds"
              rules={[{ required: true, message: '请选择用户' }]}
              preserve={false}
            >
              <Select
                mode="multiple"
                showSearch
                allowClear
                placeholder="请输入用户名或昵称搜索"
                filterOption={false}
                onSearch={(value) => loadUsers(value)}
                loading={userLoading}
              >
                {userOptions.map((user) => (
                  <Option key={user.userId} value={user.userId}>
                    {user.nickname ? `${user.nickname}（${user.username}）` : user.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {targetType === 2 && (
            <Form.Item
              label="指定角色"
              name="targetIds"
              rules={[{ required: true, message: '请选择角色' }]}
              preserve={false}
            >
              <Select
                mode="multiple"
                allowClear
                placeholder="请选择角色"
                loading={roleLoading}
              >
                {roleOptions.map((role) => (
                  <Option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {targetType === 3 && (
            <Form.Item
              label="指定部门"
              name="targetIds"
              rules={[{ required: true, message: '请选择部门' }]}
              preserve={false}
            >
              <TreeSelect
                treeData={deptTreeData}
                placeholder="请选择部门"
                allowClear
                multiple
                treeCheckable
                showCheckedStrategy={TreeSelect.SHOW_PARENT}
              />
            </Form.Item>
          )}

          <Form.Item label="附件URL" name="attachmentUrl">
            <Input placeholder="请输入附件URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="公告详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentNotice && (
          <div>
            <h3>{currentNotice.noticeTitle}</h3>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={currentNotice.noticeType === 1 ? 'blue' : 'green'}>
                {currentNotice.noticeType === 1 ? '通知' : '公告'}
              </Tag>
              <Tag>发布人: {currentNotice.publishUserName}</Tag>
              <Tag>发布时间: {currentNotice.publishTime}</Tag>
              <Tag>阅读次数: {currentNotice.readCount}</Tag>
            </Space>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {currentNotice.noticeContent}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NoticeManagePage;
