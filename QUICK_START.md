# 🚀 @ldesign/notification 快速开始

## 📦 安装

```bash
pnpm add @ldesign/notification
```

---

## ⚡ 最快上手 (5 分钟)

### 方式 1: 直接使用（无框架）

```typescript
import { notification } from '@ldesign/notification'
import '@ldesign/notification/styles'

// 显示成功提示
notification.toast.success('操作成功！')
```

### 方式 2: Vue 3

```vue
<!-- App.vue -->
<script setup>
import { useNotification } from '@ldesign/notification/vue'

const { toast } = useNotification()

toast.success('Hello Vue!')
</script>
```

### 方式 3: React 18

```tsx
// App.tsx
import { NotificationProvider, useNotification } from '@ldesign/notification/react'

function MyComponent() {
  const { toast } = useNotification()
  
  return (
    <button onClick={() => toast.success('Hello React!')}>
      点击我
    </button>
  )
}

// 包装 Provider
function App() {
  return (
    <NotificationProvider>
      <MyComponent />
    </NotificationProvider>
  )
}
```

---

## 🎯 核心功能示例

### 1. Toast（轻提示）

```typescript
import { notification } from '@ldesign/notification'

// 基础用法
notification.toast('这是一条消息')

// 不同类型
notification.toast.success('成功')
notification.toast.error('错误')
notification.toast.warning('警告')
notification.toast.info('信息')
notification.toast.loading('加载中...')

// 自定义位置
notification.toast.success('右上角', {
  position: 'top-right'
})

// 自定义持续时间
notification.toast('5秒后消失', {
  duration: 5000
})

// 不自动关闭
const id = notification.toast.loading('处理中...', {
  duration: 0
})

// 手动关闭
setTimeout(() => {
  notification.toast.dismiss(id)
  notification.toast.success('完成！')
}, 2000)
```

### 2. Promise API（最实用）

```typescript
// 自动处理加载/成功/失败状态
await notification.toast.promise(
  fetch('/api/data'),
  {
    loading: '加载中...',
    success: '加载成功！',
    error: '加载失败'
  }
)

// 动态消息
await notification.toast.promise(
  fetchUsers(),
  {
    loading: '正在获取用户...',
    success: (users) => `成功加载 ${users.length} 个用户`,
    error: (err) => `错误: ${err.message}`
  }
)
```

### 3. Message（消息条）

```typescript
// 顶部消息
notification.message('这是一条消息')
notification.message.success('保存成功')
notification.message.error('保存失败')

// 显示关闭按钮
notification.message('可关闭的消息', {
  showClose: true,
  duration: 0  // 不自动关闭
})
```

### 4. Notification（通知框）

```typescript
// 基础通知
notification.notification({
  title: '新消息',
  message: '您有一条新消息',
  type: 'info'
})

// 带操作按钮
notification.notification({
  title: '确认操作',
  message: '是否删除这条记录？',
  type: 'warning',
  actions: [
    {
      text: '确定',
      type: 'primary',
      onClick: (id) => {
        console.log('确定删除')
      }
    },
    {
      text: '取消',
      onClick: (id) => {
        console.log('取消删除')
      }
    }
  ]
})
```

### 5. Alert（警告框）

```typescript
// 简单警告
await notification.alert('这是警告消息')

// 确认框
const confirmed = await notification.alert.confirm('确定要删除吗？')
if (confirmed) {
  console.log('用户确认删除')
}

// 输入框
const name = await notification.alert.prompt('请输入您的名字')
if (name) {
  console.log('用户输入:', name)
}

// 完整配置
const result = await notification.alert({
  title: '删除确认',
  text: '此操作不可撤销，确定要继续吗？',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: '确定删除',
  cancelButtonText: '取消',
  input: 'text',
  inputPlaceholder: '输入 DELETE 确认',
  inputValidator: (value) => {
    if (value !== 'DELETE') {
      return '请输入 DELETE 确认删除'
    }
    return null
  }
})

if (result.isConfirmed) {
  notification.toast.success('已删除')
}
```

---

## 🎨 主题切换

```typescript
// 切换到深色主题
notification.setTheme('dark')

// 切换到浅色主题
notification.setTheme('light')

// 自动跟随系统
notification.setTheme('auto')
```

---

## 📍 9 个位置

```typescript
const positions = [
  'top',          // 顶部居中
  'top-left',     // 左上角
  'top-right',    // 右上角
  'top-center',   // 顶部居中（同 top）
  'bottom',       // 底部居中
  'bottom-left',  // 左下角
  'bottom-right', // 右下角
  'bottom-center',// 底部居中（同 bottom）
  'center'        // 屏幕中央
]

notification.toast('消息', { position: 'top-right' })
```

---

## 🔄 堆叠策略

```typescript
// 堆叠显示（默认）
notification.setStackStrategy('stack')

// 重叠显示
notification.setStackStrategy('overlap')

// 替换显示（只显示最新的）
notification.setStackStrategy('replace')

// 折叠显示（最多显示 3 个）
notification.setStackStrategy('collapse')
```

---

## 🎭 高级功能

### 浏览器原生通知

```typescript
import { browserNotificationManager } from '@ldesign/notification'

// 请求权限
const permission = await browserNotificationManager.requestPermission()

if (permission === 'granted') {
  // 发送浏览器通知
  browserNotificationManager.show({
    title: '新消息',
    body: '您有一条新消息',
    icon: '/icon.png'
  })
}
```

### 声音提示

```typescript
import { soundManager } from '@ldesign/notification'

// 播放成功声音
soundManager.play('success')

// 设置音量
soundManager.setVolume(0.5)

// 静音
soundManager.mute()
```

### 历史记录

```typescript
import { historyManager } from '@ldesign/notification'

// 获取所有历史
const allHistory = historyManager.getAll()

// 获取未读数量
const unreadCount = historyManager.getUnreadCount()

// 搜索
const results = historyManager.search('关键词')

// 标记为已读
historyManager.markAsRead(id)

// 清空历史
historyManager.clear()
```

---

## 🎯 Vue 3 完整示例

```vue
<template>
  <div class="app">
    <h1>通知系统演示</h1>
    
    <!-- Toast 按钮 -->
    <div class="section">
      <h2>Toast</h2>
      <button @click="toast.success('成功')">Success</button>
      <button @click="toast.error('错误')">Error</button>
      <button @click="toast.warning('警告')">Warning</button>
      <button @click="toast.info('信息')">Info</button>
      <button @click="showPromise">Promise</button>
    </div>
    
    <!-- Message 按钮 -->
    <div class="section">
      <h2>Message</h2>
      <button @click="message.success('保存成功')">Success</button>
      <button @click="message.error('保存失败')">Error</button>
    </div>
    
    <!-- Notification 按钮 -->
    <div class="section">
      <h2>Notification</h2>
      <button @click="showNotification">显示通知</button>
      <button @click="showNotificationWithActions">带操作按钮</button>
    </div>
    
    <!-- Alert 按钮 -->
    <div class="section">
      <h2>Alert</h2>
      <button @click="showAlert">警告</button>
      <button @click="showConfirm">确认</button>
      <button @click="showPrompt">输入</button>
    </div>
    
    <!-- 主题切换 -->
    <div class="section">
      <h2>主题</h2>
      <button @click="setTheme('light')">浅色</button>
      <button @click="setTheme('dark')">深色</button>
      <button @click="setTheme('auto')">自动</button>
    </div>
  </div>
</template>

<script setup>
import { useNotification } from '@ldesign/notification/vue'

const { toast, message, notification, alert, setTheme } = useNotification()

// Promise 示例
const showPromise = async () => {
  await toast.promise(
    new Promise((resolve) => setTimeout(resolve, 2000)),
    {
      loading: '处理中...',
      success: '处理成功！',
      error: '处理失败'
    }
  )
}

// Notification 示例
const showNotification = () => {
  notification({
    title: '新消息',
    message: '您有一条新消息',
    type: 'info'
  })
}

const showNotificationWithActions = () => {
  notification({
    title: '确认操作',
    message: '是否继续？',
    type: 'warning',
    actions: [
      { text: '确定', type: 'primary', onClick: () => toast.success('已确认') },
      { text: '取消', onClick: () => toast.info('已取消') }
    ]
  })
}

// Alert 示例
const showAlert = async () => {
  await alert('这是警告消息')
}

const showConfirm = async () => {
  const confirmed = await alert.confirm('确定要删除吗？')
  if (confirmed) {
    toast.success('已删除')
  }
}

const showPrompt = async () => {
  const name = await alert.prompt('请输入您的名字')
  if (name) {
    toast.success(`你好，${name}！`)
  }
}
</script>

<style scoped>
.app {
  padding: 20px;
}

.section {
  margin: 20px 0;
}

button {
  margin: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #1890ff;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #40a9ff;
}
</style>
```

---

## 🎯 React 18 完整示例

```tsx
import { NotificationProvider, useNotification } from '@ldesign/notification/react'

function Demo() {
  const { toast, message, notification, alert, setTheme } = useNotification()
  
  // Promise 示例
  const showPromise = async () => {
    await toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: '处理中...',
        success: '处理成功！',
        error: '处理失败'
      }
    )
  }
  
  // Notification 示例
  const showNotification = () => {
    notification({
      title: '新消息',
      message: '您有一条新消息',
      type: 'info'
    })
  }
  
  // Alert 示例
  const showConfirm = async () => {
    const confirmed = await alert.confirm('确定要删除吗？')
    if (confirmed) {
      toast.success('已删除')
    }
  }
  
  return (
    <div className="app">
      <h1>通知系统演示</h1>
      
      {/* Toast 按钮 */}
      <div className="section">
        <h2>Toast</h2>
        <button onClick={() => toast.success('成功')}>Success</button>
        <button onClick={() => toast.error('错误')}>Error</button>
        <button onClick={() => toast.warning('警告')}>Warning</button>
        <button onClick={() => toast.info('信息')}>Info</button>
        <button onClick={showPromise}>Promise</button>
      </div>
      
      {/* Message 按钮 */}
      <div className="section">
        <h2>Message</h2>
        <button onClick={() => message.success('保存成功')}>Success</button>
        <button onClick={() => message.error('保存失败')}>Error</button>
      </div>
      
      {/* Notification 按钮 */}
      <div className="section">
        <h2>Notification</h2>
        <button onClick={showNotification}>显示通知</button>
      </div>
      
      {/* Alert 按钮 */}
      <div className="section">
        <h2>Alert</h2>
        <button onClick={showConfirm}>确认</button>
      </div>
      
      {/* 主题切换 */}
      <div className="section">
        <h2>主题</h2>
        <button onClick={() => setTheme('light')}>浅色</button>
        <button onClick={() => setTheme('dark')}>深色</button>
        <button onClick={() => setTheme('auto')}>自动</button>
      </div>
    </div>
  )
}

// App 组件
export default function App() {
  return (
    <NotificationProvider>
      <Demo />
    </NotificationProvider>
  )
}
```

---

## 📚 更多文档

- [完整 README](./README.md)
- [API 文档](./README.md#api文档)
- [实施总结](./IMPLEMENTATION_SUMMARY.md)
- [更新日志](./CHANGELOG.md)

---

## 🎉 开始使用吧！

现在你已经掌握了 @ldesign/notification 的基本用法，可以开始在你的项目中使用了！

有问题？查看[完整文档](./README.md)或提交 [Issue](https://github.com/ldesign/ldesign/issues)。



