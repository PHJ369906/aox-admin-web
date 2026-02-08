import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Radio,
  InputNumber,
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
  SearchOutlined,
} from '@ant-design/icons';
import request from '@/utils/request';

const { TextArea } = Input;

/**
 * 部门管理页面
 */
const DeptManagePage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [deptTreeData, setDeptTreeData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  // 加载部门树
  const loadDeptTree = async (params?: any) => {
    try {
      setTableLoading(true);
      const searchValues = searchForm.getFieldsValue();
      const queryParams = {
        ...searchValues,
        ...params,
      };

      const res = await request.get('/v1/system/dept/tree', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data);
        // 构建树形选择数据（用于父部门选择）
        const treeData = buildTreeSelectData(res.data);
        setDeptTreeData([{ value: 0, title: '顶级部门', children: treeData }]);
      }
    } catch (error) {
      message.error('加载部门列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadDeptTree();
  }, []);

  // 构建树形选择数据
  const buildTreeSelectData = (data: any[]): any[] => {
    return data.map((item) => ({
      value: item.deptId,
      title: item.deptName,
      children: item.children && item.children.length > 0 ? buildTreeSelectData(item.children) : undefined,
    }));
  };

  // 搜索
  const handleSearch = () => {
    loadDeptTree();
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    loadDeptTree();
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
        parentId: 0,
        status: 0,
        orderNum: 0,
      });
    }
    setModalVisible(true);
  };

  // 保存部门
  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      setLoading(true);
      let res;
      if (currentRecord) {
        res = await request.put(`/v1/system/dept/${currentRecord.deptId}`, values);
      } else {
        res = await request.post('/v1/system/dept', values);
      }

      if ((res.code === 0 || res.code === 200)) {
        message.success(currentRecord ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadDeptTree();
      }
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除部门
  const handleDelete = async (deptId: number) => {
    try {
      const res = await request.delete(`/v1/system/dept/${deptId}`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('删除成功');
        loadDeptTree();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '部门名称',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 250,
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
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
      title: '负责人',
      dataIndex: 'leader',
      key: 'leader',
      width: 120,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
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
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="新增子部门">
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentRecord(null);
                form.resetFields();
                form.setFieldsValue({
                  parentId: record.deptId,
                  status: 0,
                  orderNum: 0,
                });
                setModalVisible(true);
              }}
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
          <Popconfirm
            title="确定删除此部门吗？"
            description="删除部门前请确保该部门下无子部门"
            onConfirm={() => handleDelete(record.deptId)}
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
          <div className="aox-page-title">部门管理</div>
          <div className="aox-page-subtitle">维护组织结构与部门信息</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          新增部门
        </Button>
      </div>

      <Card className="aox-filter-card" title="筛选条件">
        <Form form={searchForm} layout="inline" className="aox-search-form">
          <Form.Item name="deptName" label="部门名称">
            <Input placeholder="请输入部门名称" allowClear style={{ width: 200 }} />
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

      <Card className="aox-table-card" title="部门列表">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          rowKey="deptId"
          pagination={false}
          defaultExpandAllRows
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentRecord ? '编辑部门' : '新增部门'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="上级部门"
            name="parentId"
            rules={[{ required: true, message: '请选择上级部门' }]}
          >
            <TreeSelect
              treeData={deptTreeData}
              placeholder="请选择上级部门"
              treeDefaultExpandAll
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="部门名称"
            name="deptName"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" maxLength={50} />
          </Form.Item>

          <Form.Item
            label="排序"
            name="orderNum"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber placeholder="请输入排序" min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="负责人" name="leader">
            <Input placeholder="请输入负责人" maxLength={20} />
          </Form.Item>

          <Form.Item label="联系电话" name="phone">
            <Input placeholder="请输入联系电话" maxLength={11} />
          </Form.Item>

          <Form.Item label="邮箱" name="email">
            <Input placeholder="请输入邮箱" maxLength={50} type="email" />
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={0}>正常</Radio>
              <Radio value={1}>停用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeptManagePage;
