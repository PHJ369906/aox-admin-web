import { Form, Input, Select, Button, Space } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'

interface UserSearchProps {
  onSearch: (values: any) => void
  onReset: () => void
}

/**
 * 用户搜索组件
 */
const UserSearch: React.FC<UserSearchProps> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm()

  const handleSearch = () => {
    const values = form.getFieldsValue()
    onSearch(values)
  }

  const handleReset = () => {
    form.resetFields()
    onReset()
  }

  return (
    <Form
      form={form}
      layout="inline"
      className="aox-search-form"
    >
      <Form.Item name="username">
        <Input placeholder="用户名" allowClear style={{ width: 150 }} />
      </Form.Item>

      <Form.Item name="nickname">
        <Input placeholder="昵称" allowClear style={{ width: 150 }} />
      </Form.Item>

      <Form.Item name="phone">
        <Input placeholder="手机号" allowClear style={{ width: 150 }} />
      </Form.Item>

      <Form.Item name="status">
        <Select placeholder="状态" allowClear style={{ width: 120 }}>
          <Select.Option value={0}>正常</Select.Option>
          <Select.Option value={1}>禁用</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default UserSearch
