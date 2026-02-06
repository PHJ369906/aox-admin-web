import React, { useState, useEffect } from 'react';
import {
  Modal,
  Transfer,
  message,
  Spin,
} from 'antd';
import request from '@/utils/request';

interface UserRoleAssignProps {
  visible: boolean;
  userId: Long | null;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 用户角色分配组件
 */
const UserRoleAssign: React.FC<UserRoleAssignProps> = ({
  visible,
  userId,
  userName,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 加载所有角色和用户已有角色
  useEffect(() => {
    if (visible && userId) {
      loadRolesAndUserRoles();
    }
  }, [visible, userId]);

  const loadRolesAndUserRoles = async () => {
    try {
      setLoading(true);

      // 并行加载所有角色和用户已有角色
      const [rolesRes, userRoleIdsRes] = await Promise.all([
        request.get('/v1/system/role/all'),
        request.get(`/v1/system/permission/user/${userId}/role-ids`),
      ]);

      if (rolesRes.code === 200) {
        setAllRoles(rolesRes.data);
      }

      if (userRoleIdsRes.code === 200) {
        setTargetKeys(userRoleIdsRes.data.map(String));
      }
    } catch (error) {
      message.error('加载角色数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存角色分配
  const handleSave = async () => {
    try {
      setLoading(true);
      const roleIds = targetKeys.map(Number);

      const res = await request.post(`/v1/system/permission/user/${userId}/roles`, roleIds);

      if ((res.code === 0 || res.code === 200)) {
        message.success('角色分配成功');
        onSuccess();
        onClose();
      }
    } catch (error) {
      message.error('角色分配失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`为用户 "${userName}" 分配角色`}
      open={visible}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={loading}
      width={700}
    >
      <Spin spinning={loading}>
        <Transfer
          dataSource={allRoles.map(role => ({
            key: String(role.roleId),
            title: role.roleName,
            description: role.roleKey,
          }))}
          titles={['可选角色', '已分配角色']}
          targetKeys={targetKeys}
          onChange={setTargetKeys}
          render={item => item.title}
          listStyle={{
            width: 300,
            height: 400,
          }}
          showSearch
          filterOption={(inputValue, option) =>
            option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
          }
        />
      </Spin>
    </Modal>
  );
};

export default UserRoleAssign;
