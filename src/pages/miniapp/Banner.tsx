import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Upload, message, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getBannerList, createBanner, updateBanner, deleteBanner, updateBannerStatus } from '../../api/banner'
import type { Banner, BannerDTO } from '../../api/banner'

/**
 * Banner轮播图管理页面
 */
const BannerManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [bannerList, setBannerList] = useState<Banner[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null)
  const [form] = Form.useForm()

  // 加载Banner列表
  const loadBannerList = async () => {
    setLoading(true)
    try {
      const response = await getBannerList(pageNum, pageSize, statusFilter)
      if (response.code === 0) {
        setBannerList(response.data.records)
        setTotal(response.data.total)
      } else {
        message.error(response.msg || '加载Banner列表失败')
      }
    } catch (error: any) {
      message.error(error.message || '加载Banner列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBannerList()
  }, [pageNum, pageSize, statusFilter])

  // 打开新增弹窗
  const handleAdd = () => {
    setModalMode('create')
    setCurrentBanner(null)
    form.resetFields()
    form.setFieldsValue({
      linkType: 0,
      sortOrder: 0,
      status: 1
    })
    setModalVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = (banner: Banner) => {
    setModalMode('edit')
    setCurrentBanner(banner)
    form.setFieldsValue({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      linkType: banner.linkType,
      sortOrder: banner.sortOrder,
      status: banner.status
    })
    setModalVisible(true)
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: BannerDTO = {
        title: values.title,
        imageUrl: values.imageUrl,
        linkUrl: values.linkUrl,
        linkType: values.linkType,
        sortOrder: values.sortOrder,
        status: values.status
      }

      if (modalMode === 'create') {
        const response = await createBanner(data)
        if (response.code === 0) {
          message.success('创建成功')
          setModalVisible(false)
          loadBannerList()
        } else {
          message.error(response.msg || '创建失败')
        }
      } else {
        const response = await updateBanner(currentBanner!.id, data)
        if (response.code === 0) {
          message.success('更新成功')
          setModalVisible(false)
          loadBannerList()
        } else {
          message.error(response.msg || '更新失败')
        }
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请填写完整信息')
      } else {
        message.error(error.message || '操作失败')
      }
    }
  }

  // 删除Banner
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除？',
      content: '删除后将无法恢复，确定要删除该Banner吗？',
      onOk: async () => {
        try {
          const response = await deleteBanner(id)
          if (response.code === 0) {
            message.success('删除成功')
            loadBannerList()
          } else {
            message.error(response.msg || '删除失败')
          }
        } catch (error: any) {
          message.error(error.message || '删除失败')
        }
      }
    })
  }

  // 更新状态
  const handleStatusChange = async (id: number, status: number) => {
    try {
      const response = await updateBannerStatus(id, status)
      if (response.code === 0) {
        message.success('状态更新成功')
        loadBannerList()
      } else {
        message.error(response.msg || '状态更新失败')
      }
    } catch (error: any) {
      message.error(error.message || '状态更新失败')
    }
  }

  // 表格列定义
  const columns: ColumnsType<Banner> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60
    },
    {
      title: '预览',
      dataIndex: 'imageUrl',
      width: 120,
      render: (url) => (
        <img src={url} alt="banner" style={{ width: '100px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 200,
      ellipsis: true
    },
    {
      title: '跳转链接',
      dataIndex: 'linkUrl',
      width: 200,
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '链接类型',
      dataIndex: 'linkType',
      width: 100,
      render: (type) => {
        const typeMap: Record<number, string> = {
          0: '无',
          1: '内部页面',
          2: '外部链接'
        }
        return typeMap[type] || '-'
      }
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 80,
      sorter: (a, b) => a.sortOrder - b.sortOrder
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status, record) => (
        <Switch
          checked={status === 1}
          checkedChildren="上架"
          unCheckedChildren="下架"
          onChange={(checked) => handleStatusChange(record.id, checked ? 1 : 0)}
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">Banner 管理</div>
          <div className="aox-page-subtitle">配置小程序轮播图与跳转</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增Banner
        </Button>
      </div>

      <Card className="aox-filter-card" title="筛选条件">
        <Space className="aox-search-stack">
          <Select
            placeholder="状态筛选"
            style={{ width: 160 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Select.Option value={1}>上架</Select.Option>
            <Select.Option value={0}>下架</Select.Option>
          </Select>
        </Space>
      </Card>

      <Card className="aox-table-card" title="Banner 列表">
        <Table
          columns={columns}
          dataSource={bannerList}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pageNum,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setPageNum(page)
              setPageSize(size || 10)
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={modalMode === 'create' ? '新增Banner' : '编辑Banner'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="title"
            label="Banner标题"
            rules={[{ required: true, message: '请输入Banner标题' }]}
          >
            <Input placeholder="请输入Banner标题" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="图片URL"
            rules={[{ required: true, message: '请输入图片URL' }]}
            extra="建议尺寸：750x375 (2:1比例)"
          >
            <Input placeholder="请输入图片URL" />
          </Form.Item>

          <Form.Item
            name="linkType"
            label="链接类型"
            rules={[{ required: true, message: '请选择链接类型' }]}
          >
            <Select>
              <Select.Option value={0}>无</Select.Option>
              <Select.Option value={1}>内部页面</Select.Option>
              <Select.Option value={2}>外部链接</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.linkType !== currentValues.linkType}
          >
            {({ getFieldValue }) =>
              getFieldValue('linkType') !== 0 ? (
                <Form.Item
                  name="linkUrl"
                  label="跳转链接"
                  rules={[{ required: true, message: '请输入跳转链接' }]}
                >
                  <Input placeholder="请输入跳转链接" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
            extra="数字越小越靠前"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value={1}>上架</Select.Option>
              <Select.Option value={0}>下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BannerManagement
