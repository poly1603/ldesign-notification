# @ldesign/notification - React 18 示例

这是一个完整的 React 18 示例项目，展示如何使用 @ldesign/notification。

## 运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

## 功能演示

- ✅ NotificationProvider 集成
- ✅ useNotification Hook
- ✅ Toast 完整功能
- ✅ Message 消息条
- ✅ Notification 桌面通知
- ✅ Alert 警告框
- ✅ 主题切换
- ✅ 响应式状态管理

## 代码示例

### 1. 使用 Provider

```jsx
// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { NotificationProvider } from '@ldesign/notification/react'
import '@ldesign/notification/styles'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>
)
```

### 2. 使用 Hook

```jsx
// App.jsx
import { useNotification } from '@ldesign/notification/react'

function App() {
  const { toast, message, notification, alert } = useNotification()

  // Toast
  const handleClick = () => {
    toast.success('操作成功！')
  }

  // Promise API
  const handlePromise = async () => {
    await toast.promise(
      fetchData(),
      {
        loading: '加载中...',
        success: '加载成功',
        error: '加载失败'
      }
    )
  }

  // Alert
  const handleConfirm = async () => {
    const confirmed = await alert.confirm('确定吗？')
    if (confirmed) {
      toast.success('已确认')
    }
  }

  return (
    <div>
      <button onClick={handleClick}>Toast</button>
      <button onClick={handlePromise}>Promise</button>
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  )
}
```

查看 `src/App.jsx` 了解更多示例。

