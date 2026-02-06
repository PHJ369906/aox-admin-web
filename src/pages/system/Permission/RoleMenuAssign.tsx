import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tree,
  message,
  Spin,
  Alert,
} from 'antd';
import request from '@/utils/request';

interface RoleMenuAssignProps {
  visible: boolean;
  roleId: number | null;
  roleName: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 角色菜单权限配置组件
 */
const RoleMenuAssign: React.FC<RoleMenuAssignProps> = ({
  visible,
  roleId,
  roleName,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [menuTree, setMenuTree] = useState<any[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);

  // 加载菜单树和角色已有权限
  useEffect(() => {
    if (visible && roleId) {
      loadMenuTreeAndRoleMenus();
    }
  }, [visible, roleId]);

  const loadMenuTreeAndRoleMenus = async () => {
    try {
      setLoading(true);

      // 并行加载菜单树和角色已有菜单
      const [menuTreeRes, roleMenuIdsRes] = await Promise.all([
        request.get('/v1/system/menu/tree'),
        request.get(`/v1/system/permission/role/${roleId}/menu-ids`),
      ]);

      if (menuTreeRes.code === 200) {
        const treeData = buildTreeData(menuTreeRes.data);
        setMenuTree(treeData);
        // 默认展开所有节点
        const allKeys = getAllKeys(menuTreeRes.data);
        setExpandedKeys(allKeys);
      }

      if (roleMenuIdsRes.code === 200) {
        setCheckedKeys(roleMenuIdsRes.data);
      }
    } catch (error) {
      message.error('加载菜单数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 构建树形数据
  const buildTreeData = (menus: any[]): any[] => {
    return menus.map(menu => ({
      title: menu.menuName,
      key: menu.menuId,
      children: menu.children && menu.children.length > 0 ? buildTreeData(menu.children) : undefined,
    }));
  };

  // 获取所有节点的key（用于展开）
  const getAllKeys = (menus: any[]): number[] => {
    let keys: number[] = [];
    menus.forEach(menu => {
      keys.push(menu.menuId);
      if (menu.children && menu.children.length > 0) {
        keys = keys.concat(getAllKeys(menu.children));
      }
    });
    return keys;
  };

  // 保存菜单权限
  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await request.post(
        `/v1/system/permission/role/${roleId}/menus`,
        checkedKeys
      );

      if ((res.code === 0 || res.code === 200)) {
        message.success('菜单权限配置成功');
        onSuccess();
        onClose();
      }
    } catch (error) {
      message.error('菜单权限配置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`为角色 "${roleName}" 配置菜单权限`}
      open={visible}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={loading}
      width={600}
    >
      <Spin spinning={loading}>
        <Alert
          message="提示"
          description="勾选菜单项后，该角色将拥有对应的菜单访问权限和操作权限。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Tree
          checkable
          treeData={menuTree}
          checkedKeys={checkedKeys}
          expandedKeys={expandedKeys}
          onCheck={(checkedKeys: any) => setCheckedKeys(checkedKeys)}
          onExpand={(expandedKeys: any) => setExpandedKeys(expandedKeys)}
          style={{ maxHeight: 400, overflow: 'auto' }}
        />
      </Spin>
    </Modal>
  );
};

export default RoleMenuAssign;
