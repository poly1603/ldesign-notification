<div align="center">

# 🔔 @ldesign/notification

**现代化通知系统 - Toast / Message / Notification / Modal / Drawer**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](./tsconfig.json)
[![Vue 3](https://img.shields.io/badge/Vue-3.4+-42b883.svg)](https://vuejs.org/)
[![Bundle Size](https://img.shields.io/badge/bundle-<15KB-success.svg)](#特性)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

**[特性](#-特性)** • **[安装](#-安装)** • **[快速开始](#-快速开始)** • **[API 文档](#-api-文档)** • **[示例](#-示例)**

</div>

---

## ✨ 特性

### 🎯 五大通知类型

| 类型 | 描述 | 使用场景 |
|------|------|----------|
| **Toast** | 轻量级提示，深色简洁风格 | 操作反馈、状态提示 |
| **Message** | 白色卡片 + 彩色图标 | 系统消息、表单验证 |
| **Notification** | 桌面风格通知卡片 | 新消息、更新提醒 |
| **Modal** | 模态对话框 | 确认操作、表单弹窗 |
| **Drawer** | 侧边抽屉 | 设置面板、详情页 |

### ⚡ 核心能力

- ✅ **Vue 3 深度集成** - Composables + Components + Plugin
- ✅ **TypeScript** - 100% 类型安全，完整的类型导出
- ✅ **主题系统** - Light/Dark 自动切换 + CSS 变量定制
- ✅ **动画系统** - 8 种 Modal 动画 + 各组件平滑过渡
- ✅ **位置控制** - 7 个位置选择
- ✅ **Promise API** - 自动 loading → success/error
- ✅ **PauseOnHover** - 鼠标悬停时暂停计时器
- ✅ **无障碍** - ARIA 属性、焦点管理、键盘导航
- ✅ **响应式** - 自适应桌面/移动端
- ✅ **减少动态偏好** - 支持 `prefers-reduced-motion`
- ✅ **独立使用** - CSS 变量有回退值，无需全局样式

### 🎨 高级功能

- 🎭 **Modal 拖拽** - 可拖动、可调整大小、可最大化
- 📁 **Drawer 调整** - 拖动调整宽度/高度
- 🔄 **批量操作** - `closeMultiple` 批量关闭
- 🧹 **资源清理** - `dispose()` 完全销毁管理器
- 🌐 **SSR 兼容** - 支持服务端渲染

---

## 📦 安装

```bash
# pnpm (推荐)
pnpm add @ldesign/notification

# npm
npm install @ldesign/notification

# yarn
yarn add @ldesign/notification
```

**子包独立安装（可选）：**

```bash
# 仅核心功能（框架无关）
pnpm add @ldesign/notification-core

# Vue 3 集成
pnpm add @ldesign/notification-vue
```

---

## 🚀 快速开始

### Vue 3 基础用法

```vue
<script setup lang="ts">
import { useToast, useMessage, useModal, useDrawer } from '@ldesign/notification-vue'
// 样式自动包含，无需单独导入

const toast = useToast()
const message = useMessage()
const modal = useModal()
const drawer = useDrawer()

// Toast 提示
const showToast = () => {
  toast.success('保存成功')
  toast.error('保存失败')
  toast.warning('请注意')
  toast.info('提示信息')
}

// Message 消息
const showMessage = () => {
  message.success('操作成功')
  message.error('操作失败')
}

// Modal 弹窗
const showConfirm = async () => {
  const confirmed = await modal.confirm({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    confirmText: '删除',
    confirmType: 'danger'
  })
  if (confirmed) {
    toast.success('删除成功')
  }
}

// Drawer 抽屉
const openDrawer = async () => {
  await drawer.open({
    title: '设置',
    content: '抽屉内容',
    placement: 'right',
    width: 400
  })
}
</script>

<template>
  <!-- 添加组件到根节点 -->
  <LToast />
  <LMessage />
  <LNotification />
  <LModal />
  <LDrawer />
</template>
```

### 全局注册（可选）

```ts
// main.ts
import { createApp } from 'vue'
import NotificationPlugin from '@ldesign/notification-vue'
import App from './App.vue'

const app = createApp(App)
app.use(NotificationPlugin)
app.mount('#app')
```

### Promise 绑定（推荐）

```ts
const toast = useToast()

// 自动处理 loading → success/error
const saveData = async () => {
  await toast.promise(
    fetch('/api/save', { method: 'POST' }),
    {
      loading: '保存中...',
      success: '保存成功',
      error: (err) => `保存失败: ${err.message}`
    }
  )
}

// 动态成功消息
await toast.promise(
  fetchData(),
  {
    loading: '加载数据...',
    success: (data) => `成功加载 ${data.count} 条记录`,
    error: '加载失败'
  }
)
```

### 不使用 Composable（全局 API）

```ts
import { toast, message, modal, drawer } from '@ldesign/notification-vue'

// 直接调用，无需组件上下文
toast.success('保存成功')
message.error('操作失败')
modal.confirm({ title: '确认', content: '确定吗？' })
```

---

## 📖 API 文档

### Toast API

```typescript
// 基础用法
toast(message: string, options?: ToastOptions): string
toast.success(message: string, options?: ToastOptions): string
toast.error(message: string, options?: ToastOptions): string
toast.warning(message: string, options?: ToastOptions): string
toast.info(message: string, options?: ToastOptions): string
toast.loading(message: string, options?: ToastOptions): string

// Promise 绑定
toast.promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: any) => string)
  },
  options?: ToastOptions
): Promise<T>

// 控制方法
toast.dismiss(id: string): void
toast.dismissAll(): void
toast.update(id: string, options: Partial<ToastOptions>): void
```

### ToastOptions

```typescript
interface ToastOptions {
  id?: string
  position?: Position  // 9 个位置
  duration?: number    // 显示时长，0 = 不自动关闭
  icon?: any          // 自定义图标
  className?: string
  style?: CSSProperties
  dismissible?: boolean
  pauseOnHover?: boolean
  onClick?: (id: string) => void
  onClose?: (id: string) => void
}
```

### Position 类型

```typescript
type Position =
  | 'top' | 'top-left' | 'top-right' | 'top-center'
  | 'bottom' | 'bottom-left' | 'bottom-right' | 'bottom-center'
  | 'center'
```

---

### Message API

```typescript
// 基础用法
message(content: string, options?: MessageOptions): string
message.success(content: string, options?: MessageOptions): string
message.error(content: string, options?: MessageOptions): string
message.warning(content: string, options?: MessageOptions): string
message.info(content: string, options?: MessageOptions): string
message.loading(content: string, options?: MessageOptions): string

// 控制方法
message.close(id: string): void
message.closeAll(): void
message.update(id: string, content: string, options?: MessageOptions): void
```

### MessageOptions

```typescript
interface MessageOptions {
  id?: string
  duration?: number       // 默认 3000ms
  showClose?: boolean     // 显示关闭按钮
  center?: boolean        // 居中布局
  icon?: any
  grouping?: boolean      // 相同内容合并
  offset?: number         // 顶部偏移
  onClose?: (id: string) => void
}
```

---

### Notification API

```typescript
// 基础用法
notification(options: NotificationOptions): string
notification.success(options: NotificationOptions): string
notification.error(options: NotificationOptions): string
notification.warning(options: NotificationOptions): string
notification.info(options: NotificationOptions): string

// 控制方法
notification.close(id: string): void
notification.closeAll(): void
```

### NotificationOptions

```typescript
interface NotificationOptions {
  id?: string
  title: string           // 标题
  message?: string        // 内容
  type?: NotificationType
  position?: Position     // 默认 'top-right'
  duration?: number       // 默认 4500ms
  showClose?: boolean
  icon?: any
  onClick?: () => void
  onClose?: () => void
}
```

---

### Modal API

```typescript
// 基础用法
modal.open(options: ModalOptions): Promise<void>
modal.close(id?: string): void
modal.closeAll(): void

// 快捷方法
modal.confirm(options: ConfirmOptions): Promise<boolean>
modal.alert(options: AlertOptions): Promise<void>
modal.prompt(options: PromptOptions): Promise<string | null>
```

### ModalOptions

```typescript
interface ModalOptions {
  id?: string
  title?: string
  content?: string | VNode | Component
  width?: number | string // 默认 520px
  closable?: boolean      // 显示关闭按钮
  mask?: boolean          // 显示遮罩
  maskClosable?: boolean  // 点击遮罩关闭
  keyboard?: boolean      // ESC 关闭
  centered?: boolean      // 垂直居中
  draggable?: boolean     // 可拖动
  resizable?: boolean     // 可调整大小
  fullscreen?: boolean    // 全屏模式
  animation?: ModalAnimation
  zIndex?: number
  onOk?: () => void | Promise<void>
  onCancel?: () => void
  onClose?: () => void
}

type ModalAnimation =
  | 'fade' | 'zoom' | 'slide-up' | 'slide-down'
  | 'slide-left' | 'slide-right' | 'flip' | 'rotate'
```

---

### Drawer API

```typescript
// 基础用法
drawer.open(options: DrawerOptions): Promise<void>
drawer.close(id?: string): void
drawer.closeAll(): void
```

### DrawerOptions

```typescript
interface DrawerOptions {
  id?: string
  title?: string
  content?: string | VNode | Component
  placement?: 'left' | 'right' | 'top' | 'bottom'
  width?: number | string  // 左右位置时有效
  height?: number | string // 上下位置时有效
  closable?: boolean
  mask?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  resizable?: boolean     // 拖动调整宽度/高度
  zIndex?: number
  onClose?: () => void
}
```

---

### 类型守卫（Type Guards）

```typescript
import {
  isNotificationType,
  isNotificationPosition,
  isDrawerPlacement,
  isRenderFunction,
  isNotificationStatus
} from '@ldesign/notification-core'

// 安全类型检查
if (isNotificationType(type)) {
  // type is 'success' | 'error' | 'warning' | 'info' | 'loading'
}

if (isNotificationPosition(pos)) {
  // pos is Position
}
```

---

## 🎨 主题定制

### CSS 变量

```css
:root {
  /* 颜色 */
  --ldn-color-success: #52c41a;
  --ldn-color-error: #ff4d4f;
  --ldn-color-warning: #faad14;
  --ldn-color-info: #1890ff;
  
  /* 圆角 */
  --ldn-radius-md: 8px;
  
  /* 阴影 */
  --ldn-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  
  /* 更多变量... */
}
```

### 深色主题

```typescript
// 方式 1: 程序切换
notification.setTheme('dark')

// 方式 2: 自动跟随系统
notification.setTheme('auto')

// 方式 3: CSS 类
<html data-notification-theme="dark">
```

---

## 🎯 高级用法

### Promise Toast

```typescript
const fetchData = async () => {
  // 模拟 API 调用
  return await fetch('/api/data').then(res => res.json())
}

// 自动显示 loading/success/error
await toast.promise(
  fetchData(),
  {
    loading: '加载中...',
    success: (data) => `成功加载 ${data.count} 条数据`,
    error: '加载失败，请重试'
  }
)
```

### 自定义渲染

```typescript
toast({
  message: 'Custom Toast',
  render: (item) => {
    // 完全自定义 HTML
    return `
      <div class="my-custom-toast">
        <strong>${item.message}</strong>
      </div>
    `
  }
})
```

### 堆叠策略

```typescript
notification.setStackStrategy('collapse')  // 折叠模式
notification.setStackStrategy('overlap')   // 重叠模式
notification.setStackStrategy('stack')     // 堆叠模式
notification.setStackStrategy('replace')   // 替换模式
```

---

## 🔧 配置

### 全局配置

```typescript
import { NotificationManager } from '@ldesign/notification'

const manager = new NotificationManager({
  maxNotifications: 5,        // 最大通知数
  defaultPosition: 'top-right',
  defaultDuration: 3000,
  preventDuplicate: true,     // 防重复
  theme: 'auto',              // light/dark/auto
  stackStrategy: 'stack',
  enableSound: false,
  enableHistory: true
})
```

---

## 📊 当前实现状态

### ✅ 已完成 (85%)

#### 核心功能 (100%)
- [x] 完整的 TypeScript 类型系统
- [x] NotificationManager 核心类
- [x] Toast/Message/Notification/Alert 四大类型
- [x] 队列系统（优先级、防重复、最大数量控制）
- [x] 位置管理器（9 个位置）
- [x] 动画引擎（40+ 动画）
- [x] 堆叠管理器（4 种策略）
- [x] 完整的 CSS 主题系统（Light/Dark）
- [x] 所有渲染器（Toast/Message/Notification/Alert）

#### 框架集成 (100%)
- [x] Vue 3 完整集成（Plugin + Composables + Components）
- [x] React 18 完整集成（Provider + Hooks + Components）

#### 高级功能 (75%)
- [x] Promise API
- [x] 主题切换
- [x] 无障碍支持（ARIA）
- [x] 浏览器原生通知（Notification API）
- [x] 声音系统（Web Audio API）
- [x] 历史记录（LocalStorage/IndexedDB）

### ⏳ 进行中 (15%)

- [ ] 通知中心 UI 组件
- [ ] 第三方集成（钉钉/企业微信/飞书）
- [ ] 完整的单元测试（目标 >90%）
- [ ] E2E 测试
- [ ] 完整的示例项目
- [ ] 在线演示站点

### 📈 进度统计

- **总文件数**: 51 个文件
- **总代码量**: ~6,250 行
- **核心完成度**: 100%
- **总体完成度**: 85%

---

## 🎨 示例项目

我们提供了三个完整的示例项目，展示如何在不同框架中使用：

### 1. Vanilla JavaScript 示例

纯 JavaScript 使用，无需框架。

```bash
cd examples/vanilla-js
pnpm install && pnpm dev
```

**端口**: http://localhost:3000

### 2. Vue 3 示例

完整的 Vue 3 集成示例。

```bash
cd examples/vue-example
pnpm install && pnpm dev
```

**端口**: http://localhost:3001

### 3. React 18 示例

完整的 React 18 集成示例。

```bash
cd examples/react-example
pnpm install && pnpm dev
```

**端口**: http://localhost:3002

### 示例功能

所有示例都包含：
- ✅ Toast 完整功能（4 种类型 + Loading + Promise）
- ✅ Toast 9 个位置演示
- ✅ Message 消息条
- ✅ Notification 桌面通知（含操作按钮）
- ✅ Alert 警告框（alert/confirm/prompt）
- ✅ 主题切换（Light/Dark/Auto）
- ✅ 高级功能演示

查看 [examples/README.md](./examples/README.md) 了解更多。

---

## 📝 许可证

MIT License © 2025 LDesign Team

---

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📮 联系

- Issues: [GitHub Issues](https://github.com/ldesign/ldesign/issues)
- Discussions: [GitHub Discussions](https://github.com/ldesign/ldesign/discussions)






