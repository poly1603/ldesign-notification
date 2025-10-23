# @ldesign/notification - 示例项目

本目录包含三个完整的示例项目，展示如何在不同框架中使用 @ldesign/notification。

## 📦 示例项目

### 1. Vanilla JavaScript 示例

纯 JavaScript 使用示例，无需任何框架。

```bash
cd vanilla-js
pnpm install
pnpm dev
```

**端口**: http://localhost:3000

### 2. Vue 3 示例

展示如何在 Vue 3 项目中使用。

```bash
cd vue-example
pnpm install
pnpm dev
```

**端口**: http://localhost:3001

### 3. React 18 示例

展示如何在 React 18 项目中使用。

```bash
cd react-example
pnpm install
pnpm dev
```

**端口**: http://localhost:3002

## 🎯 功能演示

所有示例都包含以下功能演示：

- ✅ Toast（4 种类型 + Loading + Promise）
- ✅ Toast 9 个位置
- ✅ Message 消息条
- ✅ Notification 桌面通知
- ✅ Alert 警告框（alert/confirm/prompt）
- ✅ 主题切换（Light/Dark/Auto）
- ✅ 高级功能（浏览器通知、声音、历史）

## 📚 快速开始

### Vanilla JavaScript

```javascript
import { notification } from '@ldesign/notification'
import '@ldesign/notification/styles'

notification.toast.success('操作成功！')
```

### Vue 3

```vue
<script setup>
import { useNotification } from '@ldesign/notification/vue'

const { toast } = useNotification()

toast.success('操作成功！')
</script>
```

### React 18

```jsx
import { NotificationProvider, useNotification } from '@ldesign/notification/react'

function App() {
  const { toast } = useNotification()
  
  return <button onClick={() => toast.success('操作成功！')}>Click</button>
}

// Wrap with Provider
<NotificationProvider>
  <App />
</NotificationProvider>
```

## 🔗 相关文档

- [完整文档](../README.md)
- [快速开始](../QUICK_START.md)
- [API 文档](../README.md#api文档)

## 💡 提示

- 每个示例项目都是独立的，可以单独运行
- 示例使用 Vite 作为构建工具
- 所有示例都包含完整的功能演示
- 可以直接复制代码到你的项目中使用

## 🤝 贡献

欢迎提交更多示例！如果你有好的使用案例，请提交 PR。

