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
  message,
  Popconfirm,
  Tooltip,
  Tabs,
  Descriptions,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  SyncOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import request from '@/utils/request';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * 系统配置管理页面
 */
const ConfigManagePage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [groupList, setGroupList] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [groupConfigs, setGroupConfigs] = useState<any>({});
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupFormValues, setGroupFormValues] = useState<any>({});

  // 加载配置分组列表
  const loadGroupList = async () => {
    try {
      const res = await request.get('/v1/system/config/groups');
      if ((res.code === 0 || res.code === 200)) {
        setGroupList(res.data);
        // 加载每个分组的配置
        res.data.forEach((group: string) => {
          loadGroupConfigs(group);
        });
      }
    } catch (error) {
      console.error('加载分组列表失败', error);
    }
  };

  // 加载分组配置
  const loadGroupConfigs = async (group: string) => {
    try {
      const res = await request.get(`/v1/system/config/group/${group}`);
      if ((res.code === 0 || res.code === 200)) {
        setGroupConfigs((prev: any) => ({
          ...prev,
          [group]: res.data,
        }));
      }
    } catch (error) {
      console.error(`加载分组 ${group} 配置失败`, error);
    }
  };

  // 加载配置列表
  const loadConfigList = async (params?: any) => {
    try {
      setTableLoading(true);
      const searchValues = searchForm.getFieldsValue();
      const queryParams = {
        current: pagination.current,
        size: pagination.pageSize,
        ...searchValues,
        ...params,
      };

      const res = await request.get('/v1/system/config', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data.records);
        setPagination({
          ...pagination,
          total: res.data.total,
          current: res.data.current,
        });
      }
    } catch (error) {
      message.error('加载配置列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadConfigList();
    loadGroupList();
  }, []);

  // 搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadConfigList({ current: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination({ ...pagination, current: 1 });
    loadConfigList({ current: 1 });
  };

  // 打开新增/编辑弹窗
  const handleOpenModal = (record?: any) => {
    if (record) {
      setCurrentRecord(record);
      form.setFieldsValue(record);
    } else {
      setCurrentRecord(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 保存配置
  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      let res;
      if (currentRecord) {
        res = await request.put(`/v1/system/config/${currentRecord.configId}`, values);
      } else {
        res = await request.post('/v1/system/config', values);
      }

      if ((res.code === 0 || res.code === 200)) {
        message.success(currentRecord ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadConfigList();
        loadGroupList();
      }
    } catch (error: any) {
      message.error(error.message || '保存失败');
    }
  };

  // 删除配置
  const handleDelete = async (configId: number) => {
    try {
      const res = await request.delete(`/v1/system/config/${configId}`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('删除成功');
        loadConfigList();
      }
    } catch (error) {
      message.error('删除失败');
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
          const res = await request.delete('/v1/system/config/batch', {
            data: selectedRowKeys,
          });
          if ((res.code === 0 || res.code === 200)) {
            message.success('批量删除成功');
            setSelectedRowKeys([]);
            loadConfigList();
          }
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 刷新缓存
  const handleRefreshCache = async () => {
    try {
      const res = await request.post('/v1/system/config/refresh');
      if ((res.code === 0 || res.code === 200)) {
        message.success('缓存刷新成功');
      }
    } catch (error) {
      message.error('缓存刷新失败');
    }
  };

  // 开始编辑分组配置
  const handleEditGroup = (group: string) => {
    setEditingGroup(group);
    const configs = groupConfigs[group] || [];
    const values: any = {};
    configs.forEach((config: any) => {
      values[config.configKey] = config.configValue;
    });
    setGroupFormValues(values);
  };

  // 保存分组配置
  const handleSaveGroupConfig = async (group: string) => {
    try {
      const res = await request.put('/v1/system/config/batch', groupFormValues);
      if ((res.code === 0 || res.code === 200)) {
        message.success('配置保存成功');
        setEditingGroup(null);
        loadGroupConfigs(group);
        loadConfigList();
      }
    } catch (error) {
      message.error('配置保存失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '配置ID',
      dataIndex: 'configId',
      key: 'configId',
      width: 80,
    },
    {
      title: '配置名称',
      dataIndex: 'configName',
      key: 'configName',
      width: 200,
    },
    {
      title: '配置键',
      dataIndex: 'configKey',
      key: 'configKey',
      width: 250,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '配置值',
      dataIndex: 'configValue',
      key: 'configValue',
      width: 250,
      ellipsis: true,
    },
    {
      title: '配置分组',
      dataIndex: 'configGroup',
      key: 'configGroup',
      width: 150,
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
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
      fixed: 'right' as 'right',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此配置吗？"
            onConfirm={() => handleDelete(record.configId)}
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

  // 渲染分组配置面板
  const renderGroupPanel = (group: string) => {
    const configs = groupConfigs[group] || [];
    const isEditing = editingGroup === group;

    return (
      <Card
        title={`${group} 配置`}
        extra={
          isEditing ? (
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => handleSaveGroupConfig(group)}
              >
                保存
              </Button>
              <Button onClick={() => setEditingGroup(null)}>取消</Button>
            </Space>
          ) : (
            <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditGroup(group)}>
              编辑
            </Button>
          )
        }
      >
        <Descriptions bordered column={1}>
          {configs.map((config: any) => (
            <Descriptions.Item key={config.configKey} label={config.configName}>
              {isEditing ? (
                <Input
                  value={groupFormValues[config.configKey]}
                  onChange={(e) =>
                    setGroupFormValues({
                      ...groupFormValues,
                      [config.configKey]: e.target.value,
                    })
                  }
                  placeholder={config.remark}
                />
              ) : (
                <div>
                  <div>{config.configValue}</div>
                  {config.remark && (
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {config.remark}
                    </div>
                  )}
                </div>
              )}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
    );
  };

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">系统配置</div>
          <div className="aox-page-subtitle">集中维护系统配置与缓存</div>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            新增配置
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>
          <Button icon={<SyncOutlined />} onClick={handleRefreshCache}>
            刷新缓存
          </Button>
        </Space>
      </div>

      <Alert
        message="系统配置管理"
        description="在此可以管理系统的各项配置参数，修改配置后可能需要刷新缓存才能生效。"
        type="info"
        showIcon
      />

      <Tabs activeKey={activeGroup} onChange={setActiveGroup}>
        {/* 全部配置 */}
        <TabPane tab="全部配置" key="all">
          <Card className="aox-filter-card" title="筛选条件">
            <Form form={searchForm} layout="inline" className="aox-search-form">
              <Form.Item name="configKey" label="配置键">
                <Input placeholder="请输入配置键" allowClear style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="configName" label="配置名称">
                <Input placeholder="请输入配置名称" allowClear style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="configGroup" label="配置分组">
                <Select placeholder="请选择配置分组" allowClear style={{ width: 150 }}>
                  {groupList.map((group) => (
                    <Option key={group} value={group}>
                      {group}
                    </Option>
                  ))}
                </Select>
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

          <Card className="aox-table-card" title="配置列表">
            <Table
              columns={columns}
              dataSource={dataSource}
              loading={tableLoading}
              rowKey="configId"
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
                loadConfigList({ current: pagination.current, size: pagination.pageSize });
              }}
              scroll={{ x: 1400 }}
            />
          </Card>
        </TabPane>

        {/* 分组配置 */}
        {groupList.map((group) => (
          <TabPane tab={group} key={group}>
            {renderGroupPanel(group)}
          </TabPane>
        ))}
      </Tabs>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentRecord ? '编辑配置' : '新增配置'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="配置名称"
            name="configName"
            rules={[{ required: true, message: '请输入配置名称' }]}
          >
            <Input placeholder="请输入配置名称" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="配置键"
            name="configKey"
            rules={[{ required: true, message: '请输入配置键' }]}
          >
            <Input
              placeholder="请输入配置键，如：system.user.initPassword"
              maxLength={100}
              disabled={!!currentRecord}
            />
          </Form.Item>

          <Form.Item
            label="配置值"
            name="configValue"
            rules={[{ required: true, message: '请输入配置值' }]}
          >
            <TextArea rows={4} placeholder="请输入配置值" maxLength={2000} showCount />
          </Form.Item>

          <Form.Item
            label="配置分组"
            name="configGroup"
            rules={[{ required: true, message: '请输入配置分组' }]}
          >
            <Select placeholder="请选择或输入配置分组" allowClear showSearch>
              {groupList.map((group) => (
                <Option key={group} value={group}>
                  {group}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConfigManagePage;
