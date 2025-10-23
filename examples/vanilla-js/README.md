# @ldesign/notification - Vanilla JS 示例

这是一个使用原生 JavaScript 的完整示例项目。

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

- ✅ Toast 四种类型（success/error/warning/info）
- ✅ Toast 9 个位置
- ✅ Promise API
- ✅ Message 消息条
- ✅ Notification 桌面通知
- ✅ Alert 警告框
- ✅ 主题切换
- ✅ 浏览器原生通知
- ✅ 声音系统
- ✅ 历史记录

## 代码示例

### 基础用法

```javascript
import { notification } from '@ldesign/notification'
import '@ldesign/notification/styles'

// Toast
notification.toast.success('操作成功！')

// Promise API
await notification.toast.promise(
  fetchData(),
  {
    loading: '加载中...',
    success: '加载成功',
    error: '加载失败'
  }
)

// Alert
const confirmed = await notification.alert.confirm('确定吗？')
```

查看 `main.js` 了解更多示例。

