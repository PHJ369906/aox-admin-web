import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Upload,
  message,
  Popconfirm,
  Tag,
  Image,
  Tooltip,
  Modal,
  Descriptions,
  Progress,
  Statistic,
  Row,
  Col,
  Input,
  Select,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FileOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import request from '@/utils/request';
import type { UploadFile } from 'antd/es/upload/interface';

const { Search } = Input;
const { Option } = Select;

/**
 * 文件管理页面
 */
const FileManagePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>({});
  const [searchParams, setSearchParams] = useState<any>({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 加载文件列表
  const loadFileList = async (params?: any) => {
    try {
      setTableLoading(true);
      const queryParams = {
        current: pagination.current,
        size: pagination.pageSize,
        ...searchParams,
        ...params,
      };

      const res = await request.get('/v1/system/files', { params: queryParams });
      if ((res.code === 0 || res.code === 200)) {
        setDataSource(res.data.records);
        setPagination({
          ...pagination,
          total: res.data.total,
          current: res.data.current,
        });
      }
    } catch (error) {
      message.error('加载文件列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  // 加载统计信息
  const loadStatistics = async () => {
    try {
      const res = await request.get('/v1/system/files/statistics');
      if ((res.code === 0 || res.code === 200)) {
        setStatistics(res.data);
      }
    } catch (error) {
      console.error('加载统计信息失败', error);
    }
  };

  useEffect(() => {
    loadFileList();
    loadStatistics();
  }, []);

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    action: '/api/v1/system/files/upload',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    fileList,
    onChange(info: any) {
      setFileList(info.fileList);

      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        loadFileList();
        loadStatistics();
        setFileList([]);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
    onRemove() {
      setFileList([]);
    },
  };

  // 删除文件
  const handleDelete = async (fileId: number) => {
    try {
      const res = await request.delete(`/v1/system/files/${fileId}`);
      if ((res.code === 0 || res.code === 200)) {
        message.success('删除成功');
        loadFileList();
        loadStatistics();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    try {
      const res = await request.delete('/v1/system/files/batch', {
        data: selectedRowKeys,
      });
      if ((res.code === 0 || res.code === 200)) {
        message.success('批量删除成功');
        setSelectedRowKeys([]);
        loadFileList();
        loadStatistics();
      }
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 查看详情
  const handleViewDetail = (record: any) => {
    setCurrentFile(record);
    setDetailModalVisible(true);
  };

  // 下载文件
  const handleDownload = (record: any) => {
    window.open(record.fileUrl, '_blank');
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    if (!fileType) return <FileOutlined style={{ fontSize: 24 }} />;

    if (fileType.includes('image')) {
      return <FileImageOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
    } else if (fileType.includes('pdf')) {
      return <FilePdfOutlined style={{ fontSize: 24, color: '#f5222d' }} />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileExcelOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return <FileZipOutlined style={{ fontSize: 24, color: '#faad14' }} />;
    } else {
      return <FileTextOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />;
    }
  };

  // 获取文件类型标签
  const getFileTypeTag = (fileType: string) => {
    if (!fileType) return <Tag>未知</Tag>;

    if (fileType.includes('image')) {
      return <Tag color="green">图片</Tag>;
    } else if (fileType.includes('pdf')) {
      return <Tag color="red">PDF</Tag>;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <Tag color="blue">Word</Tag>;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <Tag color="green">Excel</Tag>;
    } else if (fileType.includes('video')) {
      return <Tag color="purple">视频</Tag>;
    } else if (fileType.includes('audio')) {
      return <Tag color="orange">音频</Tag>;
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return <Tag color="gold">压缩包</Tag>;
    } else {
      return <Tag>其他</Tag>;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '文件预览',
      dataIndex: 'fileType',
      key: 'preview',
      width: 80,
      render: (fileType: string, record: any) => {
        if (fileType && fileType.includes('image')) {
          return (
            <Image
              src={record.fileUrl}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              preview={{
                mask: <EyeOutlined />,
              }}
            />
          );
        }
        return getFileIcon(fileType);
      },
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 250,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 120,
      render: (fileType: string) => getFileTypeTag(fileType),
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 120,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '存储类型',
      dataIndex: 'storageType',
      key: 'storageType',
      width: 100,
      render: (type: string) => {
        const config: any = {
          minio: { text: 'MinIO', color: 'blue' },
          aliyun: { text: '阿里云', color: 'orange' },
          tencent: { text: '腾讯云', color: 'green' },
        };
        return <Tag color={config[type]?.color}>{config[type]?.text || type}</Tag>;
      },
    },
    {
      title: '上传者',
      dataIndex: 'uploadUserName',
      key: 'uploadUserName',
      width: 120,
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as 'right',
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此文件吗？"
            onConfirm={() => handleDelete(record.fileId)}
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

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className="aox-page aox-page--list">
      <div className="aox-page-header">
        <div>
          <div className="aox-page-title">文件管理</div>
          <div className="aox-page-subtitle">统一管理上传文件与存储记录</div>
        </div>
        <Space>
          <Upload {...uploadProps} multiple maxCount={10}>
            <Button type="primary" icon={<UploadOutlined />}>
              上传文件
            </Button>
          </Upload>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => loadFileList()}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="我的文件数量"
              value={statistics.userFileCount || 0}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="我的文件大小"
              value={statistics.userTotalSizeMB?.toFixed(2) || 0}
              suffix="MB"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="租户文件数量"
              value={statistics.tenantFileCount || 0}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="租户文件大小"
              value={statistics.tenantTotalSizeMB?.toFixed(2) || 0}
              suffix="MB"
            />
          </Card>
        </Col>
      </Row>

      <Card className="aox-filter-card" title="筛选条件">
        <Space className="aox-search-stack">
          <Search
            placeholder="搜索文件名"
            allowClear
            style={{ width: 250 }}
            onSearch={(value) => {
              setSearchParams({ ...searchParams, fileName: value });
              loadFileList({ fileName: value });
            }}
          />
          <Select
            placeholder="选择文件类型"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => {
              setSearchParams({ ...searchParams, fileType: value });
              loadFileList({ fileType: value });
            }}
          >
            <Option value="image">图片</Option>
            <Option value="pdf">PDF</Option>
            <Option value="word">Word</Option>
            <Option value="excel">Excel</Option>
            <Option value="video">视频</Option>
            <Option value="audio">音频</Option>
          </Select>
        </Space>
      </Card>

      <Card className="aox-table-card" title="文件列表">
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          rowKey="fileId"
          rowSelection={rowSelection}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(pagination) => {
            setPagination(pagination as any);
            loadFileList({ current: pagination.current, size: pagination.pageSize });
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 文件详情弹窗 */}
      <Modal
        title="文件详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="download" type="primary" onClick={() => handleDownload(currentFile)}>
            下载文件
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {currentFile && (
          <>
            {/* 图片预览 */}
            {currentFile.fileType?.includes('image') && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Image
                  src={currentFile.fileUrl}
                  style={{ maxWidth: '100%', maxHeight: 400 }}
                />
              </div>
            )}

            {/* 文件信息 */}
            <Descriptions column={2} bordered>
              <Descriptions.Item label="文件名" span={2}>
                {currentFile.fileName}
              </Descriptions.Item>
              <Descriptions.Item label="文件类型">
                {getFileTypeTag(currentFile.fileType)}
              </Descriptions.Item>
              <Descriptions.Item label="文件大小">
                {formatFileSize(currentFile.fileSize)}
              </Descriptions.Item>
              <Descriptions.Item label="存储类型">
                {currentFile.storageType}
              </Descriptions.Item>
              <Descriptions.Item label="桶名称">
                {currentFile.bucketName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="MD5" span={2}>
                <code>{currentFile.md5}</code>
              </Descriptions.Item>
              <Descriptions.Item label="上传者">
                {currentFile.uploadUserName}
              </Descriptions.Item>
              <Descriptions.Item label="上传时间">
                {currentFile.createTime}
              </Descriptions.Item>
              <Descriptions.Item label="访问URL" span={2}>
                <a href={currentFile.fileUrl} target="_blank" rel="noopener noreferrer">
                  {currentFile.fileUrl}
                </a>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
};

export default FileManagePage;
