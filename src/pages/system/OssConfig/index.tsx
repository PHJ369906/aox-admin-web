import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Descriptions,
  Badge,
  Modal,
  Table,
  Tag,
  Tooltip,
  Alert,
} from 'antd';
import {
  CloudUploadOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import request from '@/utils/request';


/**
 * OSS 云存储配置管理页面
 */
const OssConfigPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentType, setCurrentType] = useState<string>('');
  const [configs, setConfigs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadConfigList();
  }, []);

  const loadConfigList = async () => {
    try {
      const res = await request.get('/v1/system/oss/config/list');
      if ((res.code === 0 || res.code === 200)) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.list || []);
        setConfigs(list);
        const current = list.find((item: any) => item.isCurrent === 1);
        setCurrentType(current?.storageType || '');
      }
    } catch (error) {
      message.error('加载配置列表失败');
    }
  };

  // 加载指定云存储的配置
  const loadStorageConfig = async (storageType: string) => {
    try {
      const res = await request.get(`/v1/system/oss/config/${storageType}`);
      if ((res.code === 0 || res.code === 200)) {
        form.setFieldsValue({
          storageType,
          ...(res.data || {}),
        });
      }
    } catch (error) {
      message.error('加载配置详情失败');
    }
  };

  const handleEdit = async (record: any) => {
    setEditing(record);
    setModalVisible(true);
    form.resetFields();
    await loadStorageConfig(record.storageType);
  };

  // 切换云存储类型
  const handleSwitchType = async (storageType: string) => {
    Modal.confirm({
      title: '确认切换',
      icon: <ExclamationCircleOutlined />,
      content: `确定要切换到 ${getSupportedTypeName(storageType)} 吗？`,
      onOk: async () => {
        try {
          setLoading(true);
          const res = await request.post('/v1/system/oss/config/switch', {
            storageType,
          });

          if ((res.code === 0 || res.code === 200)) {
            message.success('云存储类型切换成功');
            setCurrentType(storageType);
            await loadConfigList();
          } else {
            message.error(res.message || '切换失败');
          }
        } catch (error: any) {
          message.error(error.message || '切换失败');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 更新云存储配置
  const handleUpdateConfig = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const config = pickConfigByType(values, values.storageType);

      setLoading(true);
      const res = await request.put(`/v1/system/oss/config/${values.storageType}`, {
        ...config,
      });

      if ((res.code === 0 || res.code === 200)) {
        message.success('配置更新成功');
        await loadConfigList();
        setModalVisible(false);
      } else {
        message.error(res.message || '配置更新失败');
      }
    } catch (error: any) {
      message.error(error.message || '配置更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试连接
  const handleTestConnection = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const config = pickConfigByType(values, values.storageType);

      setTestingConnection(true);
      const res = await request.post('/v1/system/oss/config/test', {
        ...config,
      });

      if ((res.code === 0 || res.code === 200) && res.data.success) {
        message.success('连接测试成功');
      } else {
        message.error(res.data?.message || '连接测试失败');
      }
    } catch (error: any) {
      message.error(error.message || '连接测试失败');
    } finally {
      setTestingConnection(false);
    }
  };

  // 清除缓存
  const handleClearCache = async () => {
    try {
      const res = await request.delete('/v1/system/oss/config/cache');
      if ((res.code === 0 || res.code === 200)) {
        message.success('缓存清除成功');
        await loadConfigList();
      } else {
        message.error(res.message || '缓存清除失败');
      }
    } catch (error) {
      message.error('缓存清除失败');
    }
  };

  // 获取云存储类型名称
  const getSupportedTypeName = (type: string) => {
    const list = Array.isArray(configs) ? configs : [];
    const found = list.find((t) => t.storageType === type);
    return found ? found.label : type;
  };

  // 配置模板
  const getConfigTemplate = (storageType: string) => {
    const templates: Record<string, any> = {
      minio: {
        endpoint: 'http://localhost:9000',
        accessKey: 'minioadmin',
        secretKey: 'minioadmin',
        bucketName: 'aox-files',
      },
      aliyun: {
        endpoint: 'oss-cn-hangzhou.aliyuncs.com',
        accessKeyId: 'LTAI5tXXXXXXXXXX',
        accessKeySecret: 'your-access-key-secret',
        bucketName: 'aox-prod-files',
      },
      tencent: {
        region: 'ap-guangzhou',
        secretId: 'AKIDxxxxxxxxxxxxxxxx',
        secretKey: 'your-secret-key',
        bucketName: 'aox-1234567890',
      },
      qiniu: {
        accessKey: 'your-access-key',
        secretKey: 'your-secret-key',
        bucketName: 'aox-files',
        domain: 'https://cdn.yourdomain.com',
      },
    };

    return templates[storageType] || {};
  };

  const fieldDefs: Record<string, Array<{ name: string; label: string; required?: boolean; inputType?: 'password' }>> = {
    minio: [
      { name: 'endpoint', label: 'Endpoint', required: true },
      { name: 'accessKey', label: 'AccessKey', required: true },
      { name: 'secretKey', label: 'SecretKey', required: true, inputType: 'password' },
      { name: 'bucketName', label: 'BucketName', required: true },
    ],
    aliyun: [
      { name: 'endpoint', label: 'Endpoint', required: true },
      { name: 'accessKeyId', label: 'AccessKeyId', required: true },
      { name: 'accessKeySecret', label: 'AccessKeySecret', required: true, inputType: 'password' },
      { name: 'bucketName', label: 'BucketName', required: true },
    ],
    tencent: [
      { name: 'region', label: 'Region', required: true },
      { name: 'secretId', label: 'SecretId', required: true },
      { name: 'secretKey', label: 'SecretKey', required: true, inputType: 'password' },
      { name: 'bucketName', label: 'BucketName', required: true },
    ],
    qiniu: [
      { name: 'accessKey', label: 'AccessKey', required: true },
      { name: 'secretKey', label: 'SecretKey', required: true, inputType: 'password' },
      { name: 'bucketName', label: 'BucketName', required: true },
      { name: 'domain', label: 'Domain', required: true },
    ],
  };

  const pickConfigByType = (values: any, storageType: string) => {
    const defs = fieldDefs[storageType] || [];
    const config: Record<string, any> = {};
    defs.forEach((def) => {
      config[def.name] = values[def.name];
    });
    return config;
  };

  const columns = [
    {
      title: '存储类型',
      dataIndex: 'label',
      key: 'label',
      render: (_: string, record: any) => (
        <Space>
          <Tooltip title={record.description || record.label}>
            <span>{record.label}</span>
          </Tooltip>
          {record.isCurrent === 1 && <Tag color="blue">当前</Tag>}
          {record.enabled === false && <Tag>未实现</Tag>}
        </Space>
      ),
    },
    {
      title: 'Endpoint/Region',
      key: 'endpoint',
      render: (_: string, record: any) => record.endpoint || record.region || '-',
    },
    {
      title: 'Bucket',
      dataIndex: 'bucketName',
      key: 'bucketName',
      render: (value: string) => value || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: number) => (
        <Tag color={value === 0 ? 'green' : 'red'}>{value === 0 ? '正常' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: string, record: any) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            size="small"
            type="link"
            disabled={!record.enabled || record.isCurrent === 1}
            onClick={() => handleSwitchType(record.storageType)}
          >
            设为当前
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <CloudUploadOutlined />
            云存储配置管理
          </Space>
        }
        extra={
          <Button icon={<ReloadOutlined />} onClick={loadConfigList}>
            刷新
          </Button>
        }
      >
        {/* 当前状态 */}
        <Alert
          message="当前云存储服务"
          description={
            <Descriptions column={2}>
              <Descriptions.Item label="存储类型">
                <Badge status="processing" text={getSupportedTypeName(currentType)} />
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status="success" text="运行中" />
              </Descriptions.Item>
            </Descriptions>
          }
          type="info"
          style={{ marginBottom: 24 }}
        />

        <Card type="inner" title="云存储配置列表" style={{ marginBottom: 24 }}>
          <Table
            rowKey="storageType"
            dataSource={configs}
            columns={columns}
            pagination={false}
          />
        </Card>

        <Modal
          title={`编辑配置 - ${editing ? getSupportedTypeName(editing.storageType) : ''}`}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={
            <Space>
              <Button onClick={handleClearCache}>清除缓存</Button>
              <Button
                onClick={() => {
                  const template = getConfigTemplate(editing?.storageType || currentType);
                  form.setFieldsValue(template);
                  message.info('已加载配置模板');
                }}
              >
                加载模板
              </Button>
              <Button onClick={handleTestConnection} loading={testingConnection}>
                测试连接
              </Button>
              <Button
                type="primary"
                onClick={handleUpdateConfig}
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                保存配置
              </Button>
            </Space>
          }
        >
          <Form form={form} layout="vertical">
            <Form.Item label="存储类型" name="storageType">
              <Input disabled value={editing?.storageType || currentType} />
            </Form.Item>

            {(fieldDefs[editing?.storageType || currentType] || []).map((field) => (
              <Form.Item
                key={field.name}
                label={field.label}
                name={field.name}
                rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
              >
                {field.inputType === 'password' ? <Input.Password /> : <Input />}
              </Form.Item>
            ))}
          </Form>
        </Modal>

        {/* 使用说明 */}
        <Card type="inner" title="使用说明" style={{ marginTop: 24 }}>
          <ul>
            <li>在列表中点击“设为当前”可切换存储服务</li>
            <li>点击“编辑”修改配置后保存即可生效</li>
            <li>配置更新后会自动清除缓存，立即生效</li>
            <li>建议先使用"测试连接"验证配置是否正确</li>
            <li>支持多租户独立配置，不同租户可使用不同的云存储服务</li>
          </ul>
        </Card>
      </Card>
    </div>
  );
};

export default OssConfigPage;
