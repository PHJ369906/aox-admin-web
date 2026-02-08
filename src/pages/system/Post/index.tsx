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

/**
 * 岗位管理页面
 */
const PostManagePage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 加载岗位列表
  const loadPostList = async (params?: any) => {
    try {
      setTableLoading(true);
      const searchValues = searchForm.getFieldsValue();
      const queryParams = {
        current: pagination.current,
        size: pagination.pageSize,
        ...searchValues,
        ...params,
      };

      const res = await request.get('/v1/system/post', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data.records);
        setPagination({
          ...pagination,
          total: res.data.total,
          current: res.data.current,
        });
      }
    } catch (error) {
      message.error('加载岗位列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadPostList();
  }, []);

  // 搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadPostList({ current: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination({ ...pagination, current: 1 });
    loadPostList({ current: 1 });
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
        postSort: 0,
      });
    }
    setModalVisible(true);
  };

  // 保存岗位
  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      setLoading(true);
      let res;
      if (currentRecord) {
        res = await request.put(`/v1/system/post/${currentRecord.postId}`, values);
      } else {
        res = await request.post('/v1/system/post', values);
      }

      if ((res.code === 0 || res.code === 200)) {
        message.success(currentRecord ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadPostList();
      }
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除岗位
  const handleDelete = async (postId: number) => {
    try {
      const res = await request.delete(`/v1/system/post/${postId}`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('删除成功');
        loadPostList();
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
          const res = await request.delete('/v1/system/post/batch', {
            data: selectedRowKeys,
          });
          if ((res.code === 0 || res.code === 200)) {
            message.success('批量删除成功');
            setSelectedRowKeys([]);
            loadPostList();
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
      title: '岗位ID',
      dataIndex: 'postId',
      key: 'postId',
      width: 80,
    },
    {
      title: '岗位编码',
      dataIndex: 'postCode',
      key: 'postCode',
      width: 150,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '岗位名称',
      dataIndex: 'postName',
      key: 'postName',
      width: 200,
    },
    {
      title: '排序',
      dataIndex: 'postSort',
      key: 'postSort',
      width: 100,
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
            title="确定删除此岗位吗？"
            onConfirm={() => handleDelete(record.postId)}
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
          <div className="aox-page-title">岗位管理</div>
          <div className="aox-page-subtitle">维护岗位与启停状态</div>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            新增岗位
          </Button>
          <Button danger onClick={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
            批量删除
          </Button>
        </Space>
      </div>

      <Card className="aox-filter-card" title="筛选条件">
        <Form form={searchForm} layout="inline" className="aox-search-form">
          <Form.Item name="postCode" label="岗位编码">
            <Input placeholder="请输入岗位编码" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="postName" label="岗位名称">
            <Input placeholder="请输入岗位名称" allowClear style={{ width: 200 }} />
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

      <Card className="aox-table-card" title="岗位列表">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          rowKey="postId"
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
            loadPostList({ current: pagination.current, size: pagination.pageSize });
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentRecord ? '编辑岗位' : '新增岗位'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="岗位编码"
            name="postCode"
            rules={[{ required: true, message: '请输入岗位编码' }]}
          >
            <Input
              placeholder="请输入岗位编码，如：CEO"
              maxLength={64}
              disabled={!!currentRecord}
            />
          </Form.Item>

          <Form.Item
            label="岗位名称"
            name="postName"
            rules={[{ required: true, message: '请输入岗位名称' }]}
          >
            <Input placeholder="请输入岗位名称，如：董事长" maxLength={50} />
          </Form.Item>

          <Form.Item
            label="排序"
            name="postSort"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber placeholder="请输入排序" min={0} style={{ width: '100%' }} />
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

export default PostManagePage;
