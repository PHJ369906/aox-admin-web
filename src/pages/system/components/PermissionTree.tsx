import { Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import type { PermissionTreeNode } from '../../../types/role'

interface PermissionTreeProps {
  treeData: PermissionTreeNode[]
  checkedKeys: number[]
  onCheck: (checkedKeys: number[]) => void
}

/**
 * 权限树选择器组件
 */
const PermissionTree: React.FC<PermissionTreeProps> = ({
  treeData,
  checkedKeys,
  onCheck
}) => {
  /**
   * 转换权限树数据为 Ant Design Tree 组件所需格式
   */
  const convertToTreeData = (nodes: PermissionTreeNode[]): DataNode[] => {
    return nodes.map(node => ({
      key: node.permissionId,
      title: node.permissionName,
      children: node.children ? convertToTreeData(node.children) : undefined
    }))
  }

  const handleCheck = (checkedKeysValue: any) => {
    // checkedKeysValue 可能是数组或对象，统一处理为数组
    const keys = Array.isArray(checkedKeysValue)
      ? checkedKeysValue
      : checkedKeysValue.checked
    onCheck(keys as number[])
  }

  return (
    <Tree
      checkable
      defaultExpandAll
      checkedKeys={checkedKeys}
      onCheck={handleCheck}
      treeData={convertToTreeData(treeData)}
    />
  )
}

export default PermissionTree
