import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  MenuOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  BookOutlined,
  MonitorOutlined,
  FileTextOutlined,
  LoginOutlined,
  BellOutlined,
  NotificationOutlined,
  MessageOutlined,
  FolderOutlined,
  ToolOutlined,
  CloudOutlined,
  AppstoreOutlined,
  PictureOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { logout } from '@/api/auth'
import request from '@/utils/request'
import './MainLayout.css'

const { Header, Sider, Content } = Layout

interface SysMenu {
  menuId: number
  menuName: string
  parentId: number
  menuType: number
  path?: string
  component?: string
  permission?: string
  icon?: string
  sortOrder?: number
  visible?: number
  status?: number
  children?: SysMenu[]
}

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  SettingOutlined: <SettingOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  MenuOutlined: <MenuOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  SolutionOutlined: <SolutionOutlined />,
  BookOutlined: <BookOutlined />,
  MonitorOutlined: <MonitorOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  LoginOutlined: <LoginOutlined />,
  BellOutlined: <BellOutlined />,
  NotificationOutlined: <NotificationOutlined />,
  MessageOutlined: <MessageOutlined />,
  FolderOutlined: <FolderOutlined />,
  ToolOutlined: <ToolOutlined />,
  CloudOutlined: <CloudOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  PictureOutlined: <PictureOutlined />,
  DollarOutlined: <DollarOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
}

const isMenuVisible = (menu: SysMenu) => {
  const visible = menu.visible
  const status = menu.status
  const visibleOk = visible == null || visible === 1
  const statusOk = status == null || status === 0
  return visibleOk && statusOk
}

const buildMenuItems = (menus: SysMenu[], collapsed: boolean): MenuProps['items'] => {
  return menus
    .filter((menu) => menu.menuType !== 3)
    .filter(isMenuVisible)
    .map((menu) => {
      const key = menu.path || `menu-${menu.menuId}`
      const icon = menu.icon ? iconMap[menu.icon] : undefined
      const children = menu.children ? buildMenuItems(menu.children, collapsed) : undefined
      const label = collapsed ? (
        <Tooltip placement="right" title={menu.menuName}>
          <span>{menu.menuName}</span>
        </Tooltip>
      ) : (
        menu.menuName
      )

      if (children && children.length > 0) {
        return {
          key,
          icon,
          label,
          children,
        }
      }

      return {
        key,
        icon,
        label,
      }
    })
}

const findMenuPathKeys = (menus: SysMenu[], pathname: string) => {
  let best: { keys: string[]; matchLen: number } = { keys: [], matchLen: -1 }

  const dfs = (nodes: SysMenu[], ancestors: string[]) => {
    nodes.forEach((node) => {
      const key = node.path || `menu-${node.menuId}`
      const current = [...ancestors, key]
      const nodePath = node.path || ''

      if (nodePath) {
        const isMatch = pathname === nodePath || pathname.startsWith(`${nodePath}/`)
        if (isMatch && nodePath.length > best.matchLen) {
          best = { keys: current, matchLen: nodePath.length }
        }
      }

      if (node.children && node.children.length > 0) {
        dfs(node.children, current)
      }
    })
  }

  dfs(menus, [])
  return best.keys
}

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuTree, setMenuTree] = useState<SysMenu[]>([])
  const [menuItems, setMenuItems] = useState<MenuProps['items']>([])
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState(false)

  const loadMenuTree = async () => {
    try {
      const userStr = localStorage.getItem('user')
      let userId: number | null = null
      if (userStr) {
        try {
          userId = JSON.parse(userStr)?.userId ?? null
        } catch {
          userId = null
        }
      }

      let res
      if (userId) {
        res = await request.get<SysMenu[]>(`/v1/system/permission/user/${userId}/menu-tree`)
      } else {
        res = await request.get<SysMenu[]>('/v1/system/menu/tree')
      }

      let tree = (res.code === 0 || res.code === 200) && Array.isArray(res.data) ? res.data : []

      if (userId && tree.length === 0) {
        const fallback = await request.get<SysMenu[]>('/v1/system/menu/tree')
        if ((fallback.code === 0 || fallback.code === 200) && Array.isArray(fallback.data)) {
          tree = fallback.data
        }
      }

      setMenuTree(tree)
      setMenuItems(buildMenuItems(tree, collapsed))
    } catch (error) {
      console.error('加载菜单失败:', error)
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ]

  useEffect(() => {
    loadMenuTree()
  }, [])

  useEffect(() => {
    if (menuTree.length === 0) return
    setMenuItems(buildMenuItems(menuTree, collapsed))
  }, [collapsed, menuTree])

  useEffect(() => {
    if (menuTree.length === 0) return
    const keys = findMenuPathKeys(menuTree, location.pathname)
    setOpenKeys(keys.slice(0, -1))
  }, [location.pathname, menuTree])

  const selectedKeys = (() => {
    if (menuTree.length === 0) {
      return [location.pathname]
    }
    const keys = findMenuPathKeys(menuTree, location.pathname)
    if (keys.length === 0) {
      return [location.pathname]
    }
    return [keys[keys.length - 1]]
  })()

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key)
    }
  }

  const handleUserMenuClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      try {
        await logout()
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    }
  }

  return (
    <Layout className="aox-layout">
      <Sider
        width={220}
        collapsedWidth={80}
        collapsed={collapsed}
        collapsible
        trigger={null}
        theme="light"
        className={`aox-sider ${collapsed ? 'aox-sider--collapsed' : ''}`}
      >
        <div className="logo">
          <div className="logo-mark">A</div>
          <div className="logo-text">
            <span>Aox Admin</span>
            <small>运营管理台</small>
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          items={menuItems}
          onClick={handleMenuClick}
          className="aox-menu"
        />
      </Sider>
      <Layout className="aox-body">
        <Header className="aox-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
            />
          </div>
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
              <div className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="username">管理员</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="aox-content">
          <div className="aox-content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
