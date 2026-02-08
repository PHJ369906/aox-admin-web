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
  Radio,
  message,
  Popconfirm,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import request from '@/utils/request';

const { TextArea } = Input;

/**
 * 字典类型管理页面
 */
const DictTypeManagePage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 加载字典类型列表
  const loadDictTypeList = async (params?: any) => {
    try {
      setTableLoading(true);
      const searchValues = searchForm.getFieldsValue();
      const queryParams = {
        current: pagination.current,
        size: pagination.pageSize,
        ...searchValues,
        ...params,
      };

      const res = await request.get('/v1/system/dict/type', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data.records);
        setPagination({
          ...pagination,
          total: res.data.total,
          current: res.data.current,
        });
      }
    } catch (error) {
      message.error('加载字典类型列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadDictTypeList();
  }, []);

  // 搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadDictTypeList({ current: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination({ ...pagination, current: 1 });
    loadDictTypeList({ current: 1 });
  };

  // 打开新增/编辑弹窗
  const handleOpenModal = (record?: any) => {
    if (record) {
      setCurrentRecord(record);
      form.setFieldsValue(record);
    } else {
      setCurrentRecord(null);
      form.resetFields();
      form.setFieldsValue({ status: 0 });
    }
    setModalVisible(true);
  };

  // 保存字典类型
  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      setLoading(true);
      let res;
      if (currentRecord) {
        res = await request.put(`/v1/system/dict/type/${currentRecord.dictId}`, values);
      } else {
        res = await request.post('/v1/system/dict/type', values);
      }

      if ((res.code === 0 || res.code === 200)) {
        message.success(currentRecord ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadDictTypeList();
      }
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除字典类型
  const handleDelete = async (dictId: number) => {
    try {
      const res = await request.delete(`/v1/system/dict/type/${dictId}`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('删除成功');
        loadDictTypeList();
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
          const res = await request.delete('/v1/system/dict/type/batch', {
            data: selectedRowKeys,
          });
          if ((res.code === 0 || res.code === 200)) {
            message.success('批量删除成功');
            setSelectedRowKeys([]);
            loadDictTypeList();
          }
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '字典ID',
      dataIndex: 'dictId',
      key: 'dictId',
      width: 80,
    },
    {
      title: '字典名称',
      dataIndex: 'dictName',
      key: 'dictName',
      width: 200,
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      key: 'dictType',
      width: 200,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Badge
          status={status === 0 ? 'success' : 'default'}
          text={status === 0 ? '正常' : '停用'}
        />
      ),
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
      fixed: 'right' as const,
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
            title="确定删除此字典类型吗？"
            onConfirm={() => handleDelete(record.dictId)}
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
          <div className="aox-page-title">字典类型</div>
          <div className="aox-page-subtitle">维护字典类型与状态</div>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            新增字典类型
          </Button>
          <Button danger onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
            批量删除
          </Button>
        </Space>
      </div>

      <Card className="aox-filter-card" title="筛选条件">
        <Form form={searchForm} layout="inline" className="aox-search-form">
          <Form.Item name="dictName" label="字典名称">
            <Input placeholder="请输入字典名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="dictType" label="字典类型">
            <Input placeholder="请输入字典类型" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <div className="aox-filter-actions">
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </Form.Item>
        </Form>
      </Card>

      <Card className="aox-table-card" title="字典类型列表">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          rowKey="dictId"
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
            loadDictTypeList({ current: pagination.current, size: pagination.pageSize });
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentRecord ? '编辑字典类型' : '新增字典类型'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="字典名称"
            name="dictName"
            rules={[{ required: true, message: '请输入字典名称' }]}
          >
            <Input placeholder="请输入字典名称" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="字典类型"
            name="dictType"
            rules={[{ required: true, message: '请输入字典类型' }]}
          >
            <Input
              placeholder="请输入字典类型，如：sys_user_sex"
              maxLength={100}
              disabled={!!currentRecord}
            />
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={0}>正常</Radio>
              <Radio value={1}>停用</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <TextArea rows={4} placeholder="请输入备注" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DictTypeManagePage;
