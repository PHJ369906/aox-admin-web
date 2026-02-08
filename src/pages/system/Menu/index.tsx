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
  TreeSelect,
  Select,
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
 * 菜单管理页面
 */
const MenuManagePage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [menuTreeData, setMenuTreeData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  // 加载菜单树
  const loadMenuTree = async (params?: any) => {
    try {
      setTableLoading(true);
      const searchValues = searchForm.getFieldsValue();
      const queryParams = {
        ...searchValues,
        ...params,
      };

      const res = await request.get('/v1/system/menu/tree', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data);
        // 构建树形选择数据（用于父菜单选择）
        const treeData = buildTreeSelectData(res.data);
        setMenuTreeData([{ value: 0, title: '顶级菜单', children: treeData }]);
      }
    } catch (error) {
      message.error('加载菜单列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadMenuTree();
  }, []);

  // 构建树形选择数据
  const buildTreeSelectData = (data: any[]): any[] => {
    return data.map((item) => ({
      value: item.menuId,
      title: item.menuName,
      children: item.children && item.children.length > 0 ? buildTreeSelectData(item.children) : undefined,
    }));
  };

  // 搜索
  const handleSearch = () => {
    loadMenuTree();
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    loadMenuTree();
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
        menuType: 1,
        status: 0,
        visible: 0,
        isCache: 0,
        isFrame: 1,
        orderNum: 0,
      });
    }
    setModalVisible(true);
  };

  // 保存菜单
  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      setLoading(true);
      let res;
      if (currentRecord) {
        res = await request.put(`/v1/system/menu/${currentRecord.menuId}`, values);
      } else {
        res = await request.post('/v1/system/menu', values);
      }

      if ((res.code === 0 || res.code === 200)) {
        message.success(currentRecord ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadMenuTree();
      }
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除菜单
  const handleDelete = async (menuId: number) => {
    try {
      const res = await request.delete(`/v1/system/menu/${menuId}`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('删除成功');
        loadMenuTree();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'menuName',
      key: 'menuName',
      width: 200,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 100,
      render: (icon: string) => icon ? <span className={`anticon ${icon}`}>{icon}</span> : '-',
    },
    {
      title: '类型',
      dataIndex: 'menuType',
      key: 'menuType',
      width: 100,
      render: (type: number) => {
        const config: any = {
          1: { text: '目录', color: 'blue' },
          2: { text: '菜单', color: 'green' },
          3: { text: '按钮', color: 'orange' },
        };
        return <Tag color={config[type]?.color}>{config[type]?.text}</Tag>;
      },
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 80,
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      key: 'permission',
      width: 180,
      render: (text: string) => text ? <Tag>{text}</Tag> : '-',
    },
    {
      title: '路由地址',
      dataIndex: 'path',
      key: 'path',
      width: 150,
      ellipsis: true,
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      key: 'component',
      width: 180,
      ellipsis: true,
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
          <Tooltip title="新增子菜单">
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentRecord(null);
                form.resetFields();
                form.setFieldsValue({
                  parentId: record.menuId,
                  menuType: 2,
                  status: 0,
                  visible: 0,
                  isCache: 0,
                  isFrame: 1,
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
            title="确定删除此菜单吗？"
            description="删除菜单前请确保该菜单下无子菜单"
            onConfirm={() => handleDelete(record.menuId)}
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
          <div className="aox-page-title">菜单管理</div>
          <div className="aox-page-subtitle">维护菜单与路由结构</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          新增菜单
        </Button>
      </div>

      <Card className="aox-filter-card" title="筛选条件">
        <Form form={searchForm} layout="inline" className="aox-search-form">
          <Form.Item name="menuName" label="菜单名称">
            <Input placeholder="请输入菜单名称" allowClear style={{ width: 200 }} />
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

      <Card className="aox-table-card" title="菜单列表">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          rowKey="menuId"
          pagination={false}
          defaultExpandAllRows
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentRecord ? '编辑菜单' : '新增菜单'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="上级菜单"
            name="parentId"
            rules={[{ required: true, message: '请选择上级菜单' }]}
          >
            <TreeSelect
              treeData={menuTreeData}
              placeholder="请选择上级菜单"
              treeDefaultExpandAll
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="菜单类型"
            name="menuType"
            rules={[{ required: true, message: '请选择菜单类型' }]}
          >
            <Radio.Group>
              <Radio value={1}>目录</Radio>
              <Radio value={2}>菜单</Radio>
              <Radio value={3}>按钮</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="菜单名称"
            name="menuName"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" maxLength={50} />
          </Form.Item>

          <Form.Item label="菜单图标" name="icon">
            <Input placeholder="请输入图标类名，如：UserOutlined" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="排序"
            name="orderNum"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber placeholder="请输入排序" min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="路由地址" name="path">
            <Input placeholder="请输入路由地址，如：/system/user" maxLength={200} />
          </Form.Item>

          <Form.Item label="组件路径" name="component">
            <Input placeholder="请输入组件路径，如：system/user/index" maxLength={255} />
          </Form.Item>

          <Form.Item label="权限标识" name="permission">
            <Input placeholder="请输入权限标识，如：system:user:list" maxLength={100} />
          </Form.Item>

          <Form.Item label="路由参数" name="query">
            <Input placeholder="请输入路由参数" maxLength={255} />
          </Form.Item>

          <Form.Item label="是否外链" name="isFrame" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={0}>是</Radio>
              <Radio value={1}>否</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="是否缓存" name="isCache" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={0}>缓存</Radio>
              <Radio value={1}>不缓存</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="显示状态" name="visible" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={0}>显示</Radio>
              <Radio value={1}>隐藏</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="菜单状态" name="status" rules={[{ required: true }]}>
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

export default MenuManagePage;
