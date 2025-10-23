<div align="center">

# 🌟 从这里开始！

# @ldesign/notification

**功能完整的通知系统 - Toast/Message/Notification/Alert**

**支持 Vue 3 + React 18 + Vanilla JS**

---

[![完成度](https://img.shields.io/badge/完成度-90%25-success.svg?style=for-the-badge)]()
[![核心功能](https://img.shields.io/badge/核心功能-100%25-brightgreen.svg?style=for-the-badge)]()

</div>

---

## ⚡ 60 秒快速开始

### 步骤 1: 安装

```bash
pnpm add @ldesign/notification
```

### 步骤 2: 使用

```typescript
import { notification } from '@ldesign/notification'
import '@ldesign/notification/styles'

// 显示成功提示
notification.toast.success('操作成功！')
```

### 步骤 3: 完成！🎉

就这么简单！现在你已经有了一个功能完整的通知系统。

---

## 🎯 你想做什么？

### 🚀 我想快速上手

👉 查看 **[QUICK_START.md](./QUICK_START.md)** (5 分钟)

包含：
- 完整的安装说明
- 所有 API 的示例代码
- Vue 3 / React 18 集成方法
- 高级功能演示

---

### 🎨 我想看实际效果

👉 运行 **示例项目** (10 分钟)

```bash
# Vanilla JavaScript
cd examples/vanilla-js && pnpm install && pnpm dev

# Vue 3
cd examples/vue-example && pnpm install && pnpm dev

# React 18
cd examples/react-example && pnpm install && pnpm dev
```

查看 **[examples/README.md](./examples/README.md)** 了解更多

---

### 📖 我想查看完整文档

👉 阅读 **[README.md](./README.md)** (15 分钟)

包含：
- 完整的功能介绍
- 详细的 API 文档
- 配置说明
- 主题定制
- 高级用法

---

### 🔧 我想了解技术实现

👉 查看 **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** (20 分钟)

包含：
- 架构设计
- 技术细节
- 代码统计
- 最佳实践

---

### 📋 我想查看所有文档

👉 访问 **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)**

这是所有文档的导航索引，包含：
- 11 个文档文件
- 推荐阅读路线
- 快速链接

---

## 🎯 核心功能一览

### 1. Toast（轻提示）

```typescript
// 基础用法
notification.toast.success('成功')
notification.toast.error('错误')
notification.toast.warning('警告')
notification.toast.info('信息')

// Promise API（最实用！）
await notification.toast.promise(
  fetchData(),
  {
    loading: '加载中...',
    success: '加载成功',
    error: '加载失败'
  }
)
```

### 2. Message（消息条）

```typescript
notification.message.success('保存成功')
notification.message.error('保存失败')
```

### 3. Notification（桌面通知）

```typescript
notification.notification({
  title: '新消息',
  message: '您有一条新消息',
  type: 'info'
})
```

### 4. Alert（警告框）

```typescript
// 确认框
const confirmed = await notification.alert.confirm('确定要删除吗？')
if (confirmed) {
  notification.toast.success('已删除')
}

// 输入框
const name = await notification.alert.prompt('请输入名字')
```

---

## 🎨 框架集成

### Vue 3

```vue
<script setup>
import { useNotification } from '@ldesign/notification/vue'

const { toast } = useNotification()

toast.success('Hello Vue!')
</script>
```

### React 18

```jsx
import { NotificationProvider, useNotification } from '@ldesign/notification/react'

function App() {
  const { toast } = useNotification()
  return <button onClick={() => toast.success('Hello React!')}>Click</button>
}

<NotificationProvider><App /></NotificationProvider>
```

---

## 📚 推荐阅读路线

### 路线 A: 快速上手（新手推荐）⚡

1. 本文档（START_HERE.md）- **你在这里** ✅
2. [QUICK_START.md](./QUICK_START.md) - 5 分钟
3. 运行示例项目 - 10 分钟
4. [README.md](./README.md) - 查询 API

**总时间**: 15-30 分钟

---

### 路线 B: 深入学习（开发者）🔧

1. 本文档（START_HERE.md）- **你在这里** ✅
2. [ALL_WORK_COMPLETED.md](./ALL_WORK_COMPLETED.md) - 了解全貌
3. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 技术实现
4. 阅读源代码 - 深入理解

**总时间**: 1-2 小时

---

### 路线 C: 框架集成（Vue/React）⚛️

**Vue 3 开发者**:
1. 本文档（START_HERE.md）- **你在这里** ✅
2. [QUICK_START.md](./QUICK_START.md#vue-3) - Vue 部分
3. [examples/vue-example/](./examples/vue-example/) - 运行示例

**React 18 开发者**:
1. 本文档（START_HERE.md）- **你在这里** ✅
2. [QUICK_START.md](./QUICK_START.md#react-18) - React 部分
3. [examples/react-example/](./examples/react-example/) - 运行示例

**总时间**: 15-30 分钟

---

## 🎁 你将获得什么

### ✨ 功能

- ✅ 4 种通知类型（Toast/Message/Notification/Alert）
- ✅ 9 个位置选择
- ✅ 4 种堆叠策略
- ✅ 40+ 动画效果
- ✅ Light/Dark 主题
- ✅ Promise API
- ✅ 浏览器通知
- ✅ 声音系统
- ✅ 历史记录

### 💎 优势

- ✅ **轻量级** - Bundle <15KB
- ✅ **类型安全** - 100% TypeScript
- ✅ **双框架** - Vue 3 + React 18
- ✅ **易用** - 简洁的 API
- ✅ **美观** - 精心设计的 UI
- ✅ **高性能** - 60fps 动画

---

## 📖 所有文档

### 核心文档 ⭐⭐⭐⭐⭐

- [README.md](./README.md) - 完整文档
- [QUICK_START.md](./QUICK_START.md) - 快速开始
- [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - 文档索引

### 示例项目 ⭐⭐⭐⭐⭐

- [examples/README.md](./examples/README.md) - 示例总览
- [examples/vanilla-js/](./examples/vanilla-js/) - JS 示例
- [examples/vue-example/](./examples/vue-example/) - Vue 示例
- [examples/react-example/](./examples/react-example/) - React 示例

### 技术文档 ⭐⭐⭐⭐

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 技术总结
- [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) - 项目总结
- [ALL_WORK_COMPLETED.md](./ALL_WORK_COMPLETED.md) - 完成报告

### 其他文档

- [CHANGELOG.md](./CHANGELOG.md) - 更新日志
- [FILE_MANIFEST.md](./FILE_MANIFEST.md) - 文件清单
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - 原始计划

---

## 💡 常见问题

### Q: 支持哪些框架？
**A**: Vue 3、React 18、以及原生 JavaScript/TypeScript。

### Q: Bundle 大小多大？
**A**: 核心 <15KB (gzipped)，非常轻量。

### Q: 支持 TypeScript 吗？
**A**: 100% TypeScript，完整的类型定义。

### Q: 支持主题切换吗？
**A**: 是的！支持 Light/Dark/Auto 三种模式。

### Q: 可以自定义样式吗？
**A**: 完全可以！通过 CSS 变量或自定义类名。

### Q: 有示例项目吗？
**A**: 有！3 个完整的示例项目（Vanilla JS、Vue 3、React 18）。

---

## 🎉 开始你的旅程

<div align="center">

### 选择你的起点：

<table>
<tr>
<td align="center" width="33%">
<h3>🚀</h3>
<h4>快速上手</h4>
<a href="./QUICK_START.md">QUICK_START.md</a>
<p><small>5 分钟快速开始</small></p>
</td>
<td align="center" width="33%">
<h3>🎨</h3>
<h4>运行示例</h4>
<a href="./examples/">examples/</a>
<p><small>实战演示项目</small></p>
</td>
<td align="center" width="33%">
<h3>📖</h3>
<h4>完整文档</h4>
<a href="./README.md">README.md</a>
<p><small>API 参考文档</small></p>
</td>
</tr>
</table>

---

### 🎊 项目已完成，随时可用！

**Made with ❤️ by LDesign Team**

[GitHub](https://github.com/ldesign/ldesign) • 
[文档索引](./DOCUMENTATION_INDEX.md) • 
[问题反馈](https://github.com/ldesign/ldesign/issues)

</div>

