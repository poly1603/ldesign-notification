# 📖 @ldesign/notification - 完整使用指南

本指南详细介绍如何在各种场景下使用 @ldesign/notification。

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

---

## 🎯 基础用法

### Vanilla JavaScript / TypeScript

```typescript
import { notification } from '@ldesign/notification'
import '@ldesign/notification/styles'

// Toast
notification.toast.success('操作成功！')
notification.toast.error('操作失败！')
notification.toast.warning('警告信息')
notification.toast.info('提示信息')

// Message
notification.message.success('保存成功')

// Notification
notification.notification({
  title: '新消息',
  message: '您有一条新消息'
})

// Alert
const confirmed = await notification.alert.confirm('确定要删除吗？')
```

---

## ⚛️ Vue 3 集成

### 方式 1: 使用 Plugin（推荐）

```javascript
// main.js
import { createApp } from 'vue'
import { NotificationPlugin } from '@ldesign/notification/vue'
import '@ldesign/notification/styles'
import App from './App.vue'

const app = createApp(App)

app.use(NotificationPlugin, {
  config: {
    defaultPosition: 'top-right',
    defaultDuration: 3000,
    maxNotifications: 5
  }
})

app.mount('#app')
```

```vue
<!-- 在任何组件中使用 -->
<script setup>
import { useNotification } from '@ldesign/notification/vue'

const { toast, message, notification, alert } = useNotification()

const handleClick = () => {
  toast.success('操作成功！')
}
</script>
```

### 方式 2: 直接使用 Composable

```vue
<script setup>
import { useNotification } from '@ldesign/notification/vue'

const notification = useNotification()

// 使用
notification.toast.success('成功')
</script>
```

### 方式 3: 使用全局属性

```vue
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const $notification = instance?.appContext.config.globalProperties.$notification

// 使用
$notification.toast.success('成功')
</script>
```

---

## ⚛️ React 18 集成

### 步骤 1: 包装 Provider

```jsx
// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { NotificationProvider } from '@ldesign/notification/react'
import '@ldesign/notification/styles'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider
      config={{
        defaultPosition: 'top-right',
        defaultDuration: 3000
      }}
    >
      <App />
    </NotificationProvider>
  </React.StrictMode>
)
```

### 步骤 2: 使用 Hook

```jsx
// App.jsx
import { useNotification } from '@ldesign/notification/react'

function App() {
  const { toast, message, notification, alert } = useNotification()

  const handleClick = () => {
    toast.success('操作成功！')
  }

  return <button onClick={handleClick}>Click Me</button>
}
```

---

## 🎯 Toast API 详解

### 基础用法

```typescript
// 简单消息
notification.toast('这是一条消息')

// 不同类型
notification.toast.success('成功')
notification.toast.error('错误')
notification.toast.warning('警告')
notification.toast.info('信息')
notification.toast.loading('加载中...')
```

### 配置选项

```typescript
notification.toast('自定义 Toast', {
  // 位置
  position: 'top-right',  // top, bottom, center, top-left, etc.
  
  // 持续时间（毫秒），0 表示不自动关闭
  duration: 5000,
  
  // 自定义图标
  icon: '🎉',
  
  // 自定义类名
  className: 'my-toast',
  
  // 自定义样式
  style: {
    background: 'linear-gradient(to right, #00b09b, #96c93d)'
  },
  
  // 是否可关闭
  dismissible: true,
  
  // 鼠标悬停时暂停
  pauseOnHover: true,
  
  // 点击回调
  onClick: (id) => {
    console.log('Toast clicked:', id)
  },
  
  // 关闭回调
  onClose: (id) => {
    console.log('Toast closed:', id)
  }
})
```

### Promise API

```typescript
// 自动处理 loading/success/error
const fetchUsers = async () => {
  const response = await fetch('/api/users')
  return response.json()
}

await notification.toast.promise(
  fetchUsers(),
  {
    loading: '正在加载用户...',
    success: (users) => `成功加载 ${users.length} 个用户`,
    error: (err) => `错误: ${err.message}`
  }
)
```

### 手动控制

```typescript
// 显示 loading
const id = notification.toast.loading('处理中...')

// 执行异步操作
try {
  await doSomething()
  
  // 更新为成功
  notification.toast.update(id, {
    message: '处理完成！',
    variant: 'success',
    duration: 2000
  })
} catch (error) {
  // 更新为失败
  notification.toast.update(id, {
    message: '处理失败',
    variant: 'error',
    duration: 2000
  })
}

// 或者手动关闭
notification.toast.dismiss(id)
```

---

## 💬 Message API 详解

### 基础用法

```typescript
notification.message('这是一条消息')
notification.message.success('保存成功')
notification.message.error('保存失败')
notification.message.warning('请注意')
notification.message.info('提示信息')
```

### 配置选项

```typescript
notification.message('自定义 Message', {
  // 显示关闭按钮
  showClose: true,
  
  // 文字居中
  center: true,
  
  // 偏移量（像素）
  offset: 20,
  
  // 持续时间
  duration: 3000,
  
  // 关闭回调
  onClose: (id) => {
    console.log('Message closed')
  }
})
```

---

## 📢 Notification API 详解

### 基础用法

```typescript
notification.notification({
  title: '通知标题',
  message: '通知内容'
})

// 带类型
notification.notification({
  title: '成功',
  message: '操作成功',
  type: 'success'
})
```

### 带操作按钮

```typescript
notification.notification({
  title: '确认操作',
  message: '是否删除这条记录？',
  type: 'warning',
  actions: [
    {
      text: '确定',
      type: 'primary',
      onClick: (id) => {
        console.log('用户点击确定')
        // 执行删除操作
        deleteRecord()
      },
      closeOnClick: true  // 点击后关闭通知
    },
    {
      text: '取消',
      onClick: (id) => {
        console.log('用户点击取消')
      }
    }
  ]
})
```

### 位置和持续时间

```typescript
notification.notification({
  title: '通知',
  message: '这是一条通知',
  position: 'bottom-right',  // 右下角
  duration: 5000,            // 5 秒后自动关闭
  showClose: true            // 显示关闭按钮
})
```

---

## ⚠️ Alert API 详解

### 简单警告

```typescript
await notification.alert('这是警告消息')
```

### 确认框

```typescript
const confirmed = await notification.alert.confirm('确定要删除吗？')

if (confirmed) {
  // 用户点击确定
  console.log('执行删除')
} else {
  // 用户点击取消
  console.log('取消删除')
}
```

### 输入框

```typescript
const name = await notification.alert.prompt('请输入您的名字')

if (name) {
  console.log('用户输入:', name)
  notification.toast.success(`你好，${name}！`)
}
```

### 完整配置

```typescript
const result = await notification.alert({
  // 标题和内容
  title: '删除确认',
  text: '此操作不可撤销，确定要继续吗？',
  
  // 图标
  icon: 'warning',  // success, error, warning, info, question
  
  // 按钮配置
  showCancelButton: true,
  confirmButtonText: '确定删除',
  cancelButtonText: '取消',
  confirmButtonColor: '#d33',
  
  // 输入框
  input: 'text',
  inputPlaceholder: '输入 DELETE 确认',
  inputValidator: (value) => {
    if (value !== 'DELETE') {
      return '请输入 DELETE 确认删除'
    }
    return null
  },
  
  // 生命周期钩子
  willOpen: () => {
    console.log('对话框即将打开')
  },
  didOpen: () => {
    console.log('对话框已打开')
  },
  willClose: () => {
    console.log('对话框即将关闭')
  },
  didClose: () => {
    console.log('对话框已关闭')
  }
})

// 处理结果
if (result.isConfirmed) {
  console.log('用户确认，输入值:', result.value)
  // 执行操作
} else if (result.isDismissed) {
  console.log('用户取消，原因:', result.dismiss)
}
```

---

## 🎨 主题定制

### 切换主题

```typescript
// 浅色主题
notification.setTheme('light')

// 深色主题
notification.setTheme('dark')

// 自动跟随系统
notification.setTheme('auto')
```

### 自定义 CSS 变量

```css
/* 在你的 CSS 文件中 */
:root {
  /* 修改成功颜色 */
  --ldn-color-success: #00b96b;
  
  /* 修改错误颜色 */
  --ldn-color-error: #ff4d4f;
  
  /* 修改圆角 */
  --ldn-radius-md: 12px;
  
  /* 修改阴影 */
  --ldn-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.15);
}
```

### 自定义类名

```typescript
notification.toast('自定义样式', {
  className: 'my-custom-toast'
})
```

```css
/* 在你的 CSS 文件中 */
.my-custom-toast {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  border: none;
}
```

---

## 🎭 高级功能

### 1. 浏览器原生通知

```typescript
import { browserNotificationManager } from '@ldesign/notification'

// 请求权限
const permission = await browserNotificationManager.requestPermission()

if (permission === 'granted') {
  // 发送浏览器通知
  browserNotificationManager.show({
    title: '新消息',
    body: '您有一条新消息',
    icon: '/logo.png',
    onClick: () => {
      console.log('用户点击了通知')
      window.focus()
    }
  })
}
```

### 2. 声音系统

```typescript
import { soundManager } from '@ldesign/notification'

// 设置声音文件
soundManager.setSounds({
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  info: '/sounds/info.mp3'
})

// 播放声音
soundManager.play('success')

// 设置音量 (0-1)
soundManager.setVolume(0.5)

// 静音
soundManager.mute()

// 取消静音
soundManager.unmute()
```

### 3. 历史记录

```typescript
import { historyManager } from '@ldesign/notification'

// 获取所有历史
const allHistory = historyManager.getAll()

// 获取未读数量
const unreadCount = historyManager.getUnreadCount()

// 搜索历史
const results = historyManager.search('关键词')

// 按类型过滤
const toasts = historyManager.filterByType('toast')

// 标记为已读
historyManager.markAsRead(id)

// 标记所有为已读
historyManager.markAllAsRead()

// 清空历史
historyManager.clear()

// 获取统计信息
const stats = historyManager.getStats()
console.log('总数:', stats.total)
console.log('未读:', stats.unread)
console.log('按类型:', stats.byType)
```

---

## 🎨 样式定制

### 位置选择

```typescript
const positions = [
  'top',           // 顶部居中
  'top-left',      // 左上角
  'top-right',     // 右上角
  'top-center',    // 顶部居中（同 top）
  'bottom',        // 底部居中
  'bottom-left',   // 左下角
  'bottom-right',  // 右下角
  'bottom-center', // 底部居中（同 bottom）
  'center'         // 屏幕中央
]

notification.toast('消息', {
  position: 'bottom-right'
})
```

### 堆叠策略

```typescript
// 设置全局堆叠策略
notification.setStackStrategy('collapse')

// 策略说明：
// - 'stack': 堆叠显示（默认）
// - 'overlap': 重叠显示
// - 'replace': 只显示最新的
// - 'collapse': 折叠多余的（最多显示 3 个）
```

### 动画自定义

```typescript
notification.toast('自定义动画', {
  enterAnimation: 'bounceIn',
  exitAnimation: 'fadeOut',
  animationDuration: 500
})

// 可用动画：
// fadeIn, fadeOut
// slideInTop, slideOutTop
// slideInBottom, slideOutBottom
// slideInLeft, slideOutLeft
// slideInRight, slideOutRight
// zoomIn, zoomOut
// bounceIn, bounceOut
// flipIn, flipOut
// rotateIn, rotateOut
```

---

## 💡 实用示例

### 场景 1: 表单保存

```typescript
async function saveForm(data) {
  await notification.toast.promise(
    api.saveForm(data),
    {
      loading: '正在保存...',
      success: '保存成功！',
      error: '保存失败，请重试'
    }
  )
}
```

### 场景 2: 批量操作

```typescript
async function batchDelete(ids) {
  const confirmed = await notification.alert.confirm(
    `确定要删除这 ${ids.length} 条记录吗？`
  )
  
  if (confirmed) {
    await notification.toast.promise(
      api.batchDelete(ids),
      {
        loading: '正在删除...',
        success: `成功删除 ${ids.length} 条记录`,
        error: '删除失败'
      }
    )
  }
}
```

### 场景 3: 文件上传

```typescript
async function uploadFile(file) {
  const id = notification.toast.loading('上传中 0%')
  
  try {
    await api.uploadFile(file, {
      onProgress: (progress) => {
        notification.toast.update(id, {
          message: `上传中 ${progress}%`
        })
      }
    })
    
    notification.toast.update(id, {
      message: '上传成功！',
      variant: 'success',
      duration: 2000
    })
  } catch (error) {
    notification.toast.update(id, {
      message: '上传失败',
      variant: 'error',
      duration: 2000
    })
  }
}
```

### 场景 4: 多步骤操作

```typescript
async function multiStepProcess() {
  // 步骤 1
  const step1 = notification.toast.loading('步骤 1: 验证数据...')
  await validateData()
  notification.toast.dismiss(step1)
  
  // 步骤 2
  const step2 = notification.toast.loading('步骤 2: 处理数据...')
  await processData()
  notification.toast.dismiss(step2)
  
  // 步骤 3
  const step3 = notification.toast.loading('步骤 3: 保存数据...')
  await saveData()
  notification.toast.dismiss(step3)
  
  // 完成
  notification.toast.success('所有步骤已完成！')
}
```

### 场景 5: 表单验证

```typescript
async function submitForm(form) {
  // 验证输入
  const username = await notification.alert.prompt('请输入用户名', {
    inputValidator: (value) => {
      if (!value) return '用户名不能为空'
      if (value.length < 3) return '用户名至少 3 个字符'
      if (!/^[a-zA-Z0-9]+$/.test(value)) return '只能包含字母和数字'
      return null
    }
  })
  
  if (username) {
    // 提交表单
    await notification.toast.promise(
      api.submitForm({ ...form, username }),
      {
        loading: '提交中...',
        success: '提交成功！',
        error: '提交失败'
      }
    )
  }
}
```

---

## 🔧 全局配置

### 创建自定义实例

```typescript
import { NotificationManager } from '@ldesign/notification'

const customNotification = new NotificationManager({
  // 最大通知数量
  maxNotifications: 5,
  
  // 新通知是否在顶部
  newestOnTop: true,
  
  // 防止重复通知
  preventDuplicate: true,
  
  // 默认位置
  defaultPosition: 'top-right',
  
  // 默认持续时间
  defaultDuration: 3000,
  
  // 堆叠策略
  stackStrategy: 'collapse',
  
  // 主题
  theme: 'auto',
  
  // 启用声音
  enableSound: true,
  
  // 启用浏览器通知
  enableBrowserNotification: true,
  
  // 启用历史记录
  enableHistory: true,
  
  // 偏移量
  offset: 16
})

// 使用自定义实例
customNotification.toast.success('成功')
```

---

## 🎯 最佳实践

### 1. 使用 Promise API

✅ **推荐**:
```typescript
await notification.toast.promise(fetchData(), messages)
```

❌ **不推荐**:
```typescript
const id = notification.toast.loading('加载中...')
try {
  await fetchData()
  notification.toast.dismiss(id)
  notification.toast.success('成功')
} catch {
  notification.toast.dismiss(id)
  notification.toast.error('失败')
}
```

### 2. 防重复通知

```typescript
// 创建实例时启用
const notification = new NotificationManager({
  preventDuplicate: true
})

// 或者手动检查
const existing = notification.getAll().find(
  item => item.message === '同样的消息'
)
if (!existing) {
  notification.toast('同样的消息')
}
```

### 3. 合理使用持续时间

```typescript
// 成功/信息 - 短时间
notification.toast.success('保存成功', { duration: 2000 })

// 警告 - 中等时间
notification.toast.warning('请注意', { duration: 4000 })

// 错误 - 较长时间
notification.toast.error('操作失败', { duration: 5000 })

// 重要信息 - 不自动关闭
notification.toast.error('严重错误', { duration: 0 })
```

### 4. 适当的位置选择

```typescript
// Toast - 右上角（不遮挡主要内容）
notification.toast.success('成功', { position: 'top-right' })

// Message - 顶部居中（重要消息）
notification.message.warning('警告', { position: 'top' })

// Alert - 屏幕中央（需要用户操作）
notification.alert.confirm('确定吗？')  // 自动居中
```

---

## 🎓 进阶技巧

### 1. 自定义渲染（Headless UI）

```typescript
notification.toast({
  message: '自定义内容',
  render: (item) => {
    return `
      <div class="my-custom-notification">
        <strong>${item.message}</strong>
        <p>这是完全自定义的内容</p>
      </div>
    `
  }
})
```

### 2. 事件监听

```typescript
// 监听通知创建
const unsubscribe = notification.on('created', (item) => {
  console.log('新通知:', item)
})

// 监听通知关闭
notification.on('dismissed', (item) => {
  console.log('通知已关闭:', item)
})

// 取消监听
unsubscribe()
```

### 3. 批量操作

```typescript
// 获取所有通知
const all = notification.getAll()

// 获取指定位置的通知
const topRight = notification.getByPosition('top-right')

// 关闭所有 Toast
notification.toast.dismissAll()

// 关闭所有通知
notification.dismissAll()
```

---

## 📱 响应式适配

### 移动端优化

```typescript
// 检测设备类型
const isMobile = window.innerWidth < 768

notification.toast('消息', {
  // 移动端使用底部位置
  position: isMobile ? 'bottom' : 'top-right',
  
  // 移动端更长的持续时间
  duration: isMobile ? 4000 : 3000
})
```

### 手势支持

Toast 在移动端自动支持滑动关闭：
- 向左/右滑动可关闭 Toast
- 滑动距离超过 100px 时触发关闭

---

## ♿ 无障碍支持

### ARIA 属性

所有通知组件自动包含：
- `role="alert"` - 标识为警告
- `aria-live="polite"` - 屏幕阅读器支持
- `tabindex="0"` - 键盘焦点

### 键盘导航

- `Tab` - 切换焦点
- `Enter` - 确认操作
- `Esc` - 关闭 Alert（如果允许）

---

## 🐛 常见问题

### Q: 通知不显示？

**A**: 确保已导入样式：
```typescript
import '@ldesign/notification/styles'
```

### Q: Vue 提示 manager not provided？

**A**: 确保已注册 Plugin：
```javascript
app.use(NotificationPlugin)
```

### Q: React 提示 context error？

**A**: 确保使用了 Provider：
```jsx
<NotificationProvider>
  <App />
</NotificationProvider>
```

### Q: 如何自定义样式？

**A**: 三种方式：
1. 修改 CSS 变量
2. 使用自定义类名
3. 传入 style 对象

### Q: 支持服务端渲染（SSR）吗？

**A**: 核心代码支持，但需要确保在浏览器环境中调用 API。

---

## 📚 更多资源

- [完整 API 文档](./README.md)
- [快速开始](./QUICK_START.md)
- [示例项目](./examples/)
- [文档索引](./DOCUMENTATION_INDEX.md)

---

## 🤝 获取帮助

- 查看文档: [README.md](./README.md)
- 运行示例: [examples/](./examples/)
- 提交问题: [GitHub Issues](https://github.com/ldesign/ldesign/issues)
- 参与讨论: [GitHub Discussions](https://github.com/ldesign/ldesign/discussions)

---

<div align="center">

**Made with ❤️ by LDesign Team**

[GitHub](https://github.com/ldesign/ldesign) • [文档](./README.md) • [示例](./examples/)

</div>

