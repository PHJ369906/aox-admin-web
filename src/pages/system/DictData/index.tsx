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
  Select,
  InputNumber,
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
const { Option } = Select;

/**
 * 字典数据管理页面
 */
const DictDataManagePage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [dictTypeList, setDictTypeList] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 加载字典类型列表（用于下拉框）
  const loadDictTypeList = async () => {
    try {
      const res = await request.get('/v1/system/dict/type/all');
      if ((res.code === 0 || res.code === 200)) {
        setDictTypeList(res.data);
      }
    } catch (error) {
      console.error('加载字典类型列表失败', error);
    }
  };

  // 加载字典数据列表
  const loadDictDataList = async (params?: any) => {
    try {
      setTableLoading(true);
      const searchValues = searchForm.getFieldsValue();
      const queryParams = {
        current: pagination.current,
        size: pagination.pageSize,
        ...searchValues,
        ...params,
      };

      const res = await request.get('/v1/system/dict/data', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data.records);
        setPagination({
          ...pagination,
          total: res.data.total,
          current: res.data.current,
        });
      }
    } catch (error) {
      message.error('加载字典数据列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadDictTypeList();
    loadDictDataList();
  }, []);

  // 搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadDictDataList({ current: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination({ ...pagination, current: 1 });
    loadDictDataList({ current: 1 });
  };

  // 打开新增/编辑弹窗
  const handleOpenModal = (record?: any) => {
    if (record) {
      setCurrentRecord(record);
      form.setFieldsValue(record);
    } else {
      setCurrentRecord(null);
      form.resetFields();
      form.setFieldsValue({
        status: 0,
        isDefault: 0,
        dictSort: 0,
      });
    }
    setModalVisible(true);
  };

  // 保存字典数据
  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      setLoading(true);
      let res;
      if (currentRecord) {
        res = await request.put(`/v1/system/dict/data/${currentRecord.dictCode}`, values);
      } else {
        res = await request.post('/v1/system/dict/data', values);
      }

      if ((res.code === 0 || res.code === 200)) {
        message.success(currentRecord ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadDictDataList();
      }
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除字典数据
  const handleDelete = async (dictCode: number) => {
    try {
      const res = await request.delete(`/v1/system/dict/data/${dictCode}`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('删除成功');
        loadDictDataList();
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
          const res = await request.delete('/v1/system/dict/data/batch', {
            data: selectedRowKeys,
          });
          if ((res.code === 0 || res.code === 200)) {
            message.success('批量删除成功');
            setSelectedRowKeys([]);
            loadDictDataList();
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
      title: '字典编码',
      dataIndex: 'dictCode',
      key: 'dictCode',
      width: 100,
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      key: 'dictType',
      width: 150,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '字典标签',
      dataIndex: 'dictLabel',
      key: 'dictLabel',
      width: 150,
      render: (text: string, record: any) => {
        const colorClass = record.listClass || 'default';
        return <Tag color={colorClass}>{text}</Tag>;
      },
    },
    {
      title: '字典值',
      dataIndex: 'dictValue',
      key: 'dictValue',
      width: 150,
    },
    {
      title: '排序',
      dataIndex: 'dictSort',
      key: 'dictSort',
      width: 80,
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
      title: '默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 80,
      render: (isDefault: number) => (
        <Tag color={isDefault === 1 ? 'green' : 'default'}>
          {isDefault === 1 ? '是' : '否'}
        </Tag>
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
            title="确定删除此字典数据吗？"
            onConfirm={() => handleDelete(record.dictCode)}
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
          <div className="aox-page-title">字典数据</div>
          <div className="aox-page-subtitle">维护字典值与枚举数据</div>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            新增字典数据
          </Button>
          <Button danger onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
            批量删除
          </Button>
        </Space>
      </div>

      <Card className="aox-filter-card" title="筛选条件">
        <Form form={searchForm} layout="inline" className="aox-search-form">
          <Form.Item name="dictType" label="字典类型">
            <Select
              placeholder="请选择字典类型"
              allowClear
              style={{ width: 200 }}
              showSearch
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {dictTypeList.map((item) => (
                <Option key={item.dictType} value={item.dictType}>
                  {item.dictName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dictLabel" label="字典标签">
            <Input placeholder="请输入字典标签" allowClear style={{ width: 200 }} />
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

      <Card className="aox-table-card" title="字典数据列表">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          rowKey="dictCode"
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
            loadDictDataList({ current: pagination.current, size: pagination.pageSize });
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentRecord ? '编辑字典数据' : '新增字典数据'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="字典类型"
            name="dictType"
            rules={[{ required: true, message: '请选择字典类型' }]}
          >
            <Select
              placeholder="请选择字典类型"
              showSearch
              disabled={!!currentRecord}
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {dictTypeList.map((item) => (
                <Option key={item.dictType} value={item.dictType}>
                  {item.dictName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="字典标签"
            name="dictLabel"
            rules={[{ required: true, message: '请输入字典标签' }]}
          >
            <Input placeholder="请输入字典标签，如：男" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="字典值"
            name="dictValue"
            rules={[{ required: true, message: '请输入字典值' }]}
          >
            <Input placeholder="请输入字典值，如：0" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="排序"
            name="dictSort"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber placeholder="请输入排序" min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="CSS 样式" name="cssClass">
            <Input placeholder="CSS 样式类名" maxLength={100} />
          </Form.Item>

          <Form.Item label="列表样式" name="listClass">
            <Select placeholder="请选择列表样式" allowClear>
              <Option value="default">默认</Option>
              <Option value="primary">主要</Option>
              <Option value="success">成功</Option>
              <Option value="info">信息</Option>
              <Option value="warning">警告</Option>
              <Option value="danger">危险</Option>
            </Select>
          </Form.Item>

          <Form.Item label="是否默认" name="isDefault" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={1}>是</Radio>
              <Radio value={0}>否</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={0}>正常</Radio>
              <Radio value={1}>停用</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DictDataManagePage;
