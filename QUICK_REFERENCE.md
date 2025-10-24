# @ldesign/notification 快速参考

## 📦 安装

```bash
pnpm add @ldesign/notification
```

## 🚀 快速开始

### Vue 3
```typescript
// main.ts
import { createApp } from 'vue'
import { NotificationPlugin } from '@ldesign/notification/vue'
import '@ldesign/notification/styles'
import App from './App.vue'

const app = createApp(App)
app.use(NotificationPlugin)
app.mount('#app')

// Component.vue
<script setup>
import { useNotification } from '@ldesign/notification/vue'

const { toast, message, notification, alert } = useNotification()

const showToast = () => {
  toast.success('操作成功！')
}
</script>
```

### React 18
```tsx
// main.tsx
import { NotificationProvider } from '@ldesign/notification/react'
import '@ldesign/notification/styles'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
)

// Component.tsx
import { useNotification } from '@ldesign/notification/react'

function Component() {
  const { toast, message, notification, alert } = useNotification()
  
  return (
    <button onClick={() => toast.success('成功！')}>
      显示提示
    </button>
  )
}
```

### Vanilla JavaScript
```javascript
import { notification } from '@ldesign/notification'
import '@ldesign/notification/styles'

// Toast
notification.toast.success('操作成功！')
notification.toast.error('操作失败！')

// Message
notification.message.info('提示信息')

// Notification
notification.notification({
  title: '新消息',
  message: '您有一条新消息',
  type: 'info'
})

// Alert
const result = await notification.alert.confirm('确定要删除吗？')
if (result) {
  console.log('用户确认')
}
```

## 📚 API 速查

### Toast
```typescript
// 基础用法
toast.success('成功')
toast.error('错误')
toast.warning('警告')
toast.info('信息')
toast.loading('加载中...')

// 带配置
toast('自定义消息', {
  position: 'top-right',
  duration: 3000,
  closable: true
})

// Promise
await toast.promise(
  fetchData(),
  {
    loading: '加载中...',
    success: '成功！',
    error: '失败！'
  }
)

// 关闭
const id = toast.success('消息')
toast.dismiss(id)
```

### Message
```typescript
message.success('保存成功')
message.error('保存失败')
message.warning('请注意')
message.info('提示信息')

// 带配置
message('消息', {
  duration: 3000,
  closable: true
})
```

### Notification
```typescript
notification({
  title: '标题',
  message: '消息内容',
  type: 'info',
  duration: 5000,
  closable: true,
  actions: [
    {
      text: '确定',
      onClick: () => console.log('点击确定')
    }
  ]
})
```

### Alert
```typescript
// 简单警告
await alert('警告消息')

// 确认对话框
const confirmed = await alert.confirm('确定要删除吗？')

// 输入对话框
const input = await alert.prompt('请输入您的名字')
```

## 🎨 位置选项

```typescript
// 9 个位置
'top' | 'top-left' | 'top-right'
'bottom' | 'bottom-left' | 'bottom-right'
'center' | 'center-left' | 'center-right'

toast('消息', { position: 'top-right' })
```

## 🎭 主题

```typescript
import { setTheme } from '@ldesign/notification'

setTheme('light')  // 浅色主题
setTheme('dark')   // 深色主题
setTheme('auto')   // 跟随系统
```

## 🔧 配置

### Vue Plugin 配置
```typescript
app.use(NotificationPlugin, {
  config: {
    defaultPosition: 'top-right',
    defaultDuration: 3000,
    maxStack: 5
  }
})
```

### React Provider 配置
```tsx
<NotificationProvider
  config={{
    defaultPosition: 'top-right',
    defaultDuration: 3000,
    maxStack: 5
  }}
>
  <App />
</NotificationProvider>
```

## 📁 项目结构

```
packages/notification/
├── src/              # 源代码
│   ├── core/        # 核心功能
│   ├── vue/         # Vue 集成
│   ├── react/       # React 集成
│   ├── renderers/   # 渲染器
│   ├── styles/      # 样式
│   └── types/       # 类型定义
├── es/              # ESM 构建产物
├── lib/             # CJS 构建产物
├── dist/            # UMD 构建产物
└── examples/        # 示例项目
    ├── vue-example/
    ├── react-example/
    └── vanilla-js/
```

## 🛠️ 开发命令

```bash
# 构建
pnpm build

# 开发模式
pnpm dev

# 清理
pnpm clean

# Lint
pnpm lint
```

## 🌐 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 📦 包导出

```typescript
// 主入口
import { notification, toast, message, alert } from '@ldesign/notification'

// Vue
import { NotificationPlugin, useNotification } from '@ldesign/notification/vue'

// React
import { NotificationProvider, useNotification } from '@ldesign/notification/react'

// 样式
import '@ldesign/notification/styles'

// 类型
import type { ToastConfig, MessageConfig } from '@ldesign/notification'
```

## 🔍 常见问题

### Q: 样式未生效？
A: 确保导入了样式文件：
```typescript
import '@ldesign/notification/styles'
```

### Q: TypeScript 类型错误？
A: 确保安装了类型依赖并且 tsconfig.json 配置正确。

### Q: Vue/React 未找到？
A: 这些是 peerDependencies，需要在项目中安装：
```bash
pnpm add vue@^3.3.0  # Vue 项目
pnpm add react@^18.0.0 react-dom@^18.0.0  # React 项目
```

## 📚 更多文档

- [完整文档](./README.md)
- [使用指南](./USAGE_GUIDE.md)
- [项目概览](./PROJECT_OVERVIEW.md)
- [示例项目](./examples/README.md)

---

**需要帮助？** 查看 [README.md](./README.md) 或访问示例项目获取更多信息。

