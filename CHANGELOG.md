# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-10-23

### Added

#### 核心功能
- ✨ 完整的 TypeScript 类型系统
- ✨ NotificationManager 核心管理器
- ✨ Toast/Message/Notification/Alert 四大通知类型
- ✨ 队列系统（优先级、防重复、最大数量控制）
- ✨ 位置管理器（9 个位置支持）
- ✨ 动画引擎（40+ 预设动画）
- ✨ 堆叠管理器（4 种策略）
- ✨ Promise API（toast.promise）

#### 样式系统
- 🎨 完整的 CSS 变量系统
- 🎨 Light/Dark 主题支持
- 🎨 自动跟随系统主题
- 🎨 40+ @keyframes 动画
- 🎨 响应式设计

#### 渲染器
- 🔧 BaseRenderer 抽象类
- 🔧 ToastRenderer（含手势支持）
- 🔧 MessageRenderer
- 🔧 NotificationRenderer（含操作按钮）
- 🔧 AlertRenderer（含输入验证）

#### Vue 3 集成
- ⚛️ Vue Plugin
- ⚛️ Composables（useNotification, useToast, useMessage, useAlert）
- ⚛️ 5 个 Vue 组件
- ⚛️ Teleport + TransitionGroup 动画
- ⚛️ Provider/Inject 模式

#### React 18 集成
- ⚛️ NotificationProvider
- ⚛️ Hooks（useNotification, useToast, useMessage, useAlert）
- ⚛️ 5 个 React 组件
- ⚛️ Portal 渲染
- ⚛️ Context API

#### 高级功能
- 🚀 浏览器原生通知（Notification API）
- 🚀 声音系统（Web Audio API）
- 🚀 历史记录（LocalStorage/IndexedDB）
- 🚀 无障碍支持（ARIA）

### Features

- **Toast API**: 
  - `toast()`, `success()`, `error()`, `warning()`, `info()`, `loading()`
  - `promise()` - Promise 绑定
  - `dismiss()`, `dismissAll()`, `update()`
  
- **Message API**: 
  - `message()`, `success()`, `error()`, `warning()`, `info()`
  - `close()`, `closeAll()`
  
- **Notification API**: 
  - `notification()`, `open()`
  - 操作按钮支持
  - 4 个角位置
  
- **Alert API**: 
  - `alert()`, `confirm()`, `prompt()`
  - 输入框验证
  - 自定义按钮

### Technical

- 📦 Bundle Size: ~15KB (gzipped)
- 🎯 TypeScript: 100% 类型安全
- ✅ Framework: Vue 3 + React 18
- 🎨 Theme: CSS Variables
- ♿ A11y: ARIA 支持

### Documentation

- 📖 完整的 README.md
- 📖 API 文档
- 📖 实施总结文档
- 📖 Vue 使用示例
- 📖 React 使用示例

## [Unreleased]

### Planned

- 📝 单元测试（目标 >90% 覆盖率）
- 📝 E2E 测试
- 📝 通知中心 UI 组件
- 📝 第三方集成（钉钉/企业微信/飞书）
- 📝 示例项目
- 📝 在线演示站点

---

**Note**: 本项目遵循 [Semantic Versioning](https://semver.org/)。

[0.1.0]: https://github.com/ldesign/ldesign/releases/tag/@ldesign/notification@0.1.0



