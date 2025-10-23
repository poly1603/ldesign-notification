# @ldesign/notification - Vue 3 示例

这是一个完整的 Vue 3 示例项目，展示如何使用 @ldesign/notification。

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

- ✅ Vue Plugin 集成
- ✅ useNotification Composable
- ✅ Toast 完整功能
- ✅ Message 消息条
- ✅ Notification 桌面通知
- ✅ Alert 警告框
- ✅ 主题切换
- ✅ 响应式状态管理

## 代码示例

### 1. 注册 Plugin

```javascript
// main.js
import { createApp } from 'vue'
import { NotificationPlugin } from '@ldesign/notification/vue'
import '@ldesign/notification/styles'

const app = createApp(App)
app.use(NotificationPlugin)
app.mount('#app')
```

### 2. 使用 Composable

```vue
<script setup>
import { useNotification } from '@ldesign/notification/vue'

const { toast, message, notification, alert } = useNotification()

// Toast
toast.success('操作成功！')

// Promise API
await toast.promise(
  fetchData(),
  {
    loading: '加载中...',
    success: '加载成功',
    error: '加载失败'
  }
)

// Alert
const confirmed = await alert.confirm('确定吗？')
if (confirmed) {
  toast.success('已确认')
}
</script>
```

查看 `src/App.vue` 了解更多示例。

