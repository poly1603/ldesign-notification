# @ldesign/notification 完整项目计划书

<div align="center">

# 🔔 @ldesign/notification v0.1.0

**通知系统 - Toast/Message/Notification/Alert，支持 React/Vue**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](./tsconfig.json)
[![Frameworks](https://img.shields.io/badge/frameworks-Vue%203%20%2B%20React%2018-blue.svg)](#技术栈)
[![Types](https://img.shields.io/badge/types-4%20types-green.svg)](#功能清单)
[![Bundle](https://img.shields.io/badge/bundle-<15KB-success.svg)](#性能目标)

</div>

---

## 🚀 快速导航

| 想要... | 查看章节 | 预计时间 |
|---------|---------|---------|
| 📖 了解通知系统 | [项目概览](#项目概览) | 3 分钟 |
| 🔍 查看参考项目 | [参考项目分析](#参考项目深度分析) | 15 分钟 |
| ✨ 查看功能清单 | [功能清单](#功能清单) | 18 分钟 |
| 🏗️ 了解架构 | [架构设计](#架构设计) | 12 分钟 |
| 🗺️ 查看路线图 | [开发路线图](#开发路线图) | 10 分钟 |
| 📋 查看任务 | [任务分解](#详细任务分解) | 20 分钟 |

---

## 📊 项目全景图

```
┌──────────────────────────────────────────────────────────────┐
│          @ldesign/notification - 通知系统全景                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 四大通知类型                                              │
│  ├─ 🍞 Toast（轻提示）                                       │
│  │   ├─ 简短消息                                             │
│  │   ├─ 自动消失                                             │
│  │   ├─ 9个位置                                              │
│  │   └─ 手势关闭                                             │
│  ├─ 💬 Message（消息）                                       │
│  │   ├─ 顶部消息条                                           │
│  │   ├─ 类型图标                                             │
│  │   ├─ 手动关闭                                             │
│  │   └─ 进度条                                               │
│  ├─ 📢 Notification（通知）                                  │
│  │   ├─ 桌面样式                                             │
│  │   ├─ 标题+内容                                            │
│  │   ├─ 操作按钮                                             │
│  │   └─ 浏览器通知                                           │
│  └─ ⚠️  Alert（警告框）                                      │
│      ├─ 模态对话框                                            │
│      ├─ 确认/取消                                            │
│      ├─ 输入框                                               │
│      └─ 自定义按钮                                            │
│                                                              │
│  ⚡ 核心能力                                                  │
│  ├─ 📦 队列管理（无限制/限制数量）                            │
│  ├─ 📍 位置系统（top/bottom/left/right + 9组合）             │
│  ├─ 🎨 主题系统（light/dark + 自定义）                       │
│  ├─ 🔄 堆叠管理（overlap/stack/replace）                    │
│  ├─ ⏱️ 时间控制（duration/pauseOnHover）                     │
│  └─ 🎭 动画系统（30+预设动画）                               │
│                                                              │
│  🔧 高级功能                                                  │
│  ├─ 📱 响应式设计（桌面/移动适配）                            │
│  ├─ ♿ 无障碍支持（ARIA/键盘导航）                            │
│  ├─ 🎨 自定义渲染（Headless UI）                            │
│  ├─ 🔊 声音提示（可选）                                      │
│  ├─ 📊 通知中心（历史记录）                                  │
│  └─ 🌐 浏览器原生通知                                        │
│                                                              │
│  🛠️ 框架集成                                                 │
│  ├─ ⚛️ React 组件 + Hooks                                   │
│  ├─ 💚 Vue 3 组件 + Composables                             │
│  ├─ 🎯 TypeScript 完整类型                                   │
│  └─ 📦 按需导入（Tree-shaking）                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 项目概览

### 核心价值主张

@ldesign/notification 是一个**全功能通知系统**，提供：

1. **四大通知类型** - Toast/Message/Notification/Alert 覆盖所有场景
2. **极致体验** - 美观设计、流畅动画、手势支持
3. **灵活强大** - Headless UI、自定义渲染、主题系统
4. **框架集成** - Vue 3 + React 18 深度集成
5. **高性能** - 轻量级（<15KB）、虚拟化渲染
6. **开发者友好** - 简洁 API、完整类型、丰富示例

### 解决的问题

- ❌ **通知组件分散** - Toast/Message/Alert 来自不同库
- ❌ **样式不统一** - 各组件样式不一致
- ❌ **功能单一** - 大多数库只提供一种通知类型
- ❌ **定制困难** - 自定义样式和行为困难
- ❌ **性能问题** - 大量通知时性能下降
- ❌ **框架绑定** - Vue/React 需要不同的库

### 我们的解决方案

- ✅ **统一通知中心** - 一个库搞定所有通知
- ✅ **统一设计语言** - 一致的视觉和交互
- ✅ **四合一** - Toast + Message + Notification + Alert
- ✅ **高度可定制** - Headless UI + 主题系统
- ✅ **性能优化** - 虚拟化、懒渲染、动画优化
- ✅ **框架无关** - 核心独立，适配 Vue/React

---

## 📚 参考项目深度分析

### 1. react-hot-toast (★★★★★)

**项目信息**:
- GitHub: https://github.com/timolins/react-hot-toast
- Stars: 10,000+
- NPM: react-hot-toast
- 下载量: 2M+/week

**核心特点**:
- ✅ 极简 API（toast('Hello')）
- ✅ Headless UI 架构
- ✅ 美观的默认样式
- ✅ 流畅的动画
- ✅ Promise API（toast.promise）
- ✅ TypeScript 支持
- ✅ 极小体积（5KB）

**借鉴要点**:
1. **简洁 API** - toast(message, options)
2. **Headless UI** - 自定义渲染器
3. **Promise Toast** - toast.promise(promise, { loading, success, error })
4. **动画系统** - 进入/退出动画
5. **位置系统** - top/bottom/top-left/top-right 等
6. **持续时间** - duration + pauseOnHover

**功能借鉴**:
- [x] toast() API（已实现基础）
- [ ] Headless UI
- [ ] Promise Toast
- [ ] 流畅动画
- [x] 位置系统（已规划）
- [ ] pauseOnHover

**改进方向**:
- ➕ 增加 Message/Notification/Alert 类型
- ➕ Vue 3 支持（react-hot-toast 仅 React）
- ➕ 更多动画预设
- ➕ 浏览器原生通知

### 2. vue-toastification (★★★★★)

**项目信息**:
- GitHub: https://github.com/Maronato/vue-toastification
- Stars: 2,000+
- NPM: vue-toastification
- 定位: Vue 3 Toast 库

**核心特点**:
- ✅ Vue 3 Composition API
- ✅ Teleport 支持
- ✅ 通知容器管理
- ✅ 队列系统
- ✅ 过渡动画
- ✅ 可访问性（ARIA）
- ✅ TypeScript

**借鉴要点**:
1. **Vue Plugin** - app.use(Toast)
2. **useToast Composable** - const toast = useToast()
3. **容器管理** - Vue Teleport 渲染
4. **队列限制** - maxToasts 配置
5. **过渡组件** - <TransitionGroup>
6. **ARIA** - role="alert" aria-live="polite"

**功能借鉴**:
- [ ] Vue Plugin API
- [ ] useToast composable
- [ ] Teleport 渲染
- [x] 队列系统（已实现）
- [ ] 过渡动画
- [ ] ARIA 支持

**改进方向**:
- ➕ React 支持
- ➕ 更多通知类型
- ➕ 更丰富的配置

### 3. notistack (★★★★☆)

**项目信息**:
- GitHub: https://github.com/iamhosseindhv/notistack
- Stars: 3,800+
- 定位: React 通知堆叠库
- 特色: Material-UI 风格

**核心特点**:
- ✅ 通知堆叠（多个同时显示）
- ✅ 最大数量控制
- ✅ 自动折叠
- ✅ 操作按钮
- ✅ 关闭所有功能
- ✅ Provider 模式
- ✅ ref 控制

**借鉴要点**:
1. **<SnackbarProvider>** - Context 提供者
2. **maxSnack** - 最大显示数量
3. **preventDuplicate** - 防重复
4. **anchorOrigin** - 位置配置
5. **action** - 自定义操作按钮
6. **autoHideDuration** - 自动隐藏

**功能借鉴**:
- [ ] Provider 模式
- [ ] 最大数量控制
- [ ] 防重复
- [ ] 操作按钮
- [ ] 自动折叠

**改进方向**:
- ➕ Vue 支持
- ➕ 更灵活的堆叠策略
- ➕ 更多动画

### 4. notyf (★★★★☆)

**项目信息**:
- GitHub: https://github.com/caroso1222/notyf
- Stars: 1,500+
- 定位: 极简通知库
- 特色: 无依赖、纯 JS

**核心特点**:
- ✅ 极简 API
- ✅ 零依赖
- ✅ 轻量级（3KB）
- ✅ 流畅动画
- ✅ 响应式设计
- ✅ 可自定义图标

**借鉴要点**:
1. **简洁创建** - new Notyf()
2. **success/error** - 两种快捷方法
3. **ripple 动画** - 波纹效果
4. **dismiss() API** - 手动关闭
5. **零依赖** - 纯原生实现

**功能借鉴**:
- [x] success/error 快捷方法（已实现）
- [ ] ripple 动画
- [ ] dismiss() API
- [x] 零运行时依赖

**改进方向**:
- ➕ 更多通知类型
- ➕ 框架组件封装
- ➕ 更丰富的配置

### 5. sweetalert2 (★★★★★)

**项目信息**:
- GitHub: https://github.com/sweetalert2/sweetalert2
- Stars: 17,000+
- NPM: sweetalert2
- 下载量: 1.5M+/week

**核心特点**:
- ✅ 美观的弹窗设计
- ✅ 丰富的配置选项（100+）
- ✅ 输入框支持
- ✅ 自定义按钮
- ✅ 进度条
- ✅ 定时器
- ✅ 队列系统
- ✅ 无依赖

**借鉴要点**:
1. **Swal.fire()** - 统一 API
2. **输入框** - input: 'text'/'email'/'password'
3. **确认对话框** - showCancelButton
4. **进度条** - timerProgressBar
5. **队列** - Swal.queue()
6. **回调** - preConfirm/preDeny/preOpen

**功能借鉴**:
- [ ] 统一 API
- [ ] 输入框支持
- [ ] 确认对话框
- [ ] 进度条
- [ ] 队列系统
- [ ] 生命周期钩子

**改进方向**:
- ➕ 更轻量（sweetalert2 较重）
- ➕ Toast/Message 类型
- ➕ React/Vue 组件

### 参考项目功能对比

| 功能 | react-hot-toast | vue-toastification | notistack | notyf | sweetalert2 | **@ldesign/notification** |
|------|-----------------|-------------------|-----------|-------|-------------|--------------------------|
| Toast | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Message | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 🎯 |
| Notification | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ 🎯 |
| Alert | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ 🎯 |
| Vue 支持 | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ 🎯 |
| React 支持 | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ 🎯 |
| Headless | ✅ | ❌ | ❌ | ❌ | ⚠️ | ✅ 🎯 |
| 位置数量 | 6 | 9 | 9 | 2 | 1 | **9** ✅ |
| 堆叠管理 | ⚠️ | ✅ | ✅ | ❌ | ⚠️ | ✅ 🎯 |
| 浏览器通知 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 计划 🎯 |
| 进度条 | ⚠️ | ⚠️ | ⚠️ | ❌ | ✅ | ✅ 🎯 |
| 输入框 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ 计划 🎯 |
| Bundle 大小 | 5KB | 18KB | 25KB | 3KB | 40KB | **<15KB** 🎯 |
| TypeScript | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |

**总结**: @ldesign/notification 是唯一支持 4 种通知类型 + Vue + React 的统一通知系统。

---

## ✨ 功能清单

### P0 核心功能（25项）

#### Toast 轻提示

- [x] **基础 Toast**（参考: react-hot-toast）
  - ✅ toast(message) - 基础调用
  - ✅ toast.success(message) - 成功提示
  - ✅ toast.error(message) - 错误提示
  - ✅ toast.warning(message) - 警告提示
  - ✅ toast.info(message) - 信息提示

- [ ] **Toast 配置**（参考: 所有）
  - duration - 显示时长（默认 3000ms）
  - position - 显示位置（9个位置）
  - icon - 自定义图标
  - className - 自定义类名
  - style - 自定义样式
  - id - 唯一标识

- [ ] **Toast 控制**（参考: react-hot-toast）
  - toast.dismiss(id) - 关闭指定 toast
  - toast.remove(id) - 移除指定 toast
  - toast.dismissAll() - 关闭所有
  - toast.loading(message) - 加载提示
  - toast.promise(promise) - Promise 绑定

#### Message 消息提示

- [ ] **基础 Message**（参考: Ant Design Message）
  - message(content) - 基础消息
  - message.success/error/warning/info
  - 顶部居中显示
  - 类型图标
  - 自动关闭

- [ ] **Message 配置**（参考: Element Plus）
  - duration - 持续时间
  - showClose - 显示关闭按钮
  - center - 文字居中
  - dangerouslyUseHTMLString - HTML 内容
  - offset - 偏移量

- [ ] **Message 操作**
  - message.close(id)
  - message.closeAll()

#### Notification 通知框

- [ ] **基础 Notification**（参考: Ant Design）
  - notification.open(config)
  - notification.success/error/warning/info
  - 标题 + 内容
  - 右上角显示（可配置）

- [ ] **Notification 配置**（参考: Element Plus）
  - title - 标题
  - message - 内容
  - duration - 持续时间
  - position - 位置（4个角）
  - showClose - 关闭按钮
  - onClick - 点击回调
  - onClose - 关闭回调

- [ ] **Notification 操作**
  - notification.close(key)
  - notification.destroy() - 销毁所有

#### Alert 警告框

- [ ] **基础 Alert**（参考: sweetalert2）
  - alert(message) - 简单警告
  - alert.confirm(message) - 确认框
  - alert.prompt(message) - 输入框
  - alert.custom(config) - 自定义

- [ ] **Alert 配置**（参考: sweetalert2）
  - title - 标题
  - text - 内容
  - icon - 图标（success/error/warning/info/question）
  - confirmButtonText - 确认按钮文本
  - cancelButtonText - 取消按钮文本
  - showCancelButton - 显示取消按钮
  - showDenyButton - 显示拒绝按钮

- [ ] **Alert 输入**（参考: sweetalert2）
  - input: 'text'/'email'/'password'/'number'/'tel'/'url'
  - inputPlaceholder - 输入框占位符
  - inputValue - 默认值
  - inputValidator - 验证器

#### 通知管理

- [x] **NotificationManager 核心**（参考: 所有）
  - ✅ 通知队列管理
  - ✅ 通知 ID 生成
  - [ ] 通知生命周期管理
  - [ ] 通知状态跟踪

- [ ] **队列系统**（参考: notistack）
  - maxNotifications - 最大通知数（默认 无限制）
  - newestOnTop - 新通知在上方
  - preventDuplicate - 防止重复
  - autoQueue - 自动排队

- [x] **位置系统**（参考: vue-toastification）
  - ✅ top - 顶部居中
  - ✅ bottom - 底部居中
  - ✅ top-left - 左上角
  - ✅ top-right - 右上角
  - ✅ bottom-left - 左下角
  - ✅ bottom-right - 右下角
  - ✅ top-center - 顶部居中（同 top）
  - ✅ bottom-center - 底部居中（同 bottom）
  - ✅ center - 屏幕中央

- [ ] **堆叠策略**（参考: notistack）
  - overlap - 重叠显示
  - stack - 堆叠显示
  - replace - 替换显示
  - collapse - 折叠显示

### P1 高级功能（20项）

#### 动画系统

- [ ] **进入动画**（参考: react-hot-toast）
  - fadeIn - 淡入
  - slideIn - 滑入（4个方向）
  - zoomIn - 缩放进入
  - bounceIn - 弹跳进入
  - flipIn - 翻转进入

- [ ] **退出动画**（参考: react-hot-toast）
  - fadeOut - 淡出
  - slideOut - 滑出（4个方向）
  - zoomOut - 缩放退出
  - bounceOut - 弹跳退出
  - flipOut - 翻转退出

- [ ] **过渡动画**（参考: vue-toastification）
  - Vue <Transition> 集成
  - React Framer Motion 集成（可选）
  - 自定义过渡类名
  - 过渡持续时间控制

#### 交互增强

- [ ] **手势支持**（参考: react-hot-toast）
  - 拖拽关闭（移动端）
  - 滑动关闭
  - 长按操作
  - 双击操作

- [ ] **键盘导航**（参考: vue-toastification）
  - Esc 关闭当前通知
  - Ctrl+Shift+C 关闭所有
  - Tab 焦点切换
  - Enter 确认操作

- [ ] **鼠标交互**（参考: 所有）
  - pauseOnHover - 悬停暂停
  - pauseOnFocusLoss - 失焦暂停
  - resumeOnHover - 离开恢复
  - onClick - 点击事件

#### 样式定制

- [ ] **主题系统**（参考: react-hot-toast）
  - light - 浅色主题
  - dark - 深色主题
  - auto - 自动跟随系统
  - custom - 自定义主题

- [ ] **CSS Variables**（参考: @ldesign/color）
  - --notification-bg
  - --notification-text
  - --notification-border
  - --notification-shadow
  - 支持主题切换

- [ ] **自定义渲染**（参考: react-hot-toast）
  - Headless UI 模式
  - 完全自定义 HTML
  - 自定义组件（Vue/React）
  - Render 函数

#### 进度和状态

- [ ] **进度条**（参考: sweetalert2）
  - 线性进度条
  - 圆形进度条
  - 自定义进度显示
  - 进度回调

- [ ] **状态管理**（参考: notistack）
  - 通知状态（visible/entering/exiting）
  - 状态订阅
  - 状态回调

#### 浏览器通知

- [ ] **Notification API**（参考: Web API）
  - 请求权限
  - 发送原生通知
  - 通知点击
  - 通知关闭
  - Fallback 机制

#### 声音提示

- [ ] **声音系统**（参考: sweetalert2）
  - 成功声音
  - 错误声音
  - 警告声音
  - 自定义声音
  - 音量控制
  - 静音模式

### P2 扩展功能（15项）

#### 通知中心

- [ ] **通知历史**（独家功能）
  - 历史记录存储
  - 历史查看
  - 历史搜索
  - 历史清空
  - 未读标记

- [ ] **通知中心 UI**（独家功能）
  - 通知列表
  - 通知分组
  - 通知筛选
  - 通知详情
  - 一键清空

#### 高级管理

- [ ] **通知分组**（独家功能）
  - 按类型分组
  - 按来源分组
  - 自定义分组
  - 分组折叠

- [ ] **通知优先级**（独家功能）
  - high/normal/low 优先级
  - 优先级排序
  - 高优先级置顶
  - 低优先级延迟

- [ ] **批量操作**（独家功能）
  - 批量关闭
  - 批量标记已读
  - 批量删除
  - 批量操作 UI

#### 高级特性

- [ ] **通知模板**（独家功能）
  - 预定义模板
  - 模板变量
  - 模板库
  - 自定义模板

- [ ] **通知规则**（独家功能）
  - 免打扰模式
  - 时间规则
  - 条件规则
  - 规则配置

- [ ] **通知统计**（独家功能）
  - 通知数量统计
  - 类型分布
  - 时间分布
  - 统计图表

#### 集成功能

- [ ] **邮件通知集成**（扩展）
  - SMTP 集成
  - 邮件模板
  - 邮件队列

- [ ] **第三方集成**（扩展）
  - 钉钉
  - 企业微信
  - 飞书
  - Slack

---

## 🏗️ 架构设计

### 整体架构

```
┌────────────────────────────────────────────────────────┐
│            @ldesign/notification                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │NotificationManager│ ────▶│  Queue System   │       │
│  │                  │      │                  │       │
│  │ - toast()        │      │ - enqueue()      │       │
│  │ - message()      │      │ - dequeue()      │       │
│  │ - notification() │      │ - max control    │       │
│  │ - alert()        │      │ - priority       │       │
│  └──────────────────┘      └──────────────────┘       │
│         │                           │                  │
│         ▼                           ▼                  │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │Position Manager  │      │Animation Engine │       │
│  │                  │      │                  │       │
│  │ - 9 positions    │      │ - enter         │       │
│  │ - calculate      │      │ - exit          │       │
│  │ - stack/overlap  │      │ - transition    │       │
│  └──────────────────┘      └──────────────────┘       │
│                                                        │
│  ┌────────────────────────────────────────────┐      │
│  │           Renderer Layer                   │      │
│  ├─ ToastRenderer（Toast 渲染器）              │      │
│  ├─ MessageRenderer（Message 渲染器）          │      │
│  ├─ NotificationRenderer（Notification 渲染器）│      │
│  └─ AlertRenderer（Alert 渲染器）              │      │
│  └────────────────────────────────────────────┘      │
│                                                        │
│  ┌────────────────────────────────────────────┐      │
│  │          Framework Adapters                │      │
│  ├─ Vue Plugin + Composables                   │      │
│  ├─ React Provider + Hooks                     │      │
│  └─ Web Components（可选）                     │      │
│  └────────────────────────────────────────────┘      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 核心类设计

#### NotificationManager 类

```typescript
class NotificationManager {
  private queue: NotificationQueue
  private containers: Map<Position, Container>
  
  // Toast API
  toast(message: string, options?: ToastOptions): string
  success(message: string, options?: ToastOptions): string
  error(message: string, options?: ToastOptions): string
  warning(message: string, options?: ToastOptions): string
  info(message: string, options?: ToastOptions): string
  loading(message: string, options?: ToastOptions): string
  promise<T>(promise: Promise<T>, messages: PromiseMessages): Promise<T>
  
  // Message API
  message(content: string, options?: MessageOptions): string
  
  // Notification API
  notification(config: NotificationConfig): string
  
  // Alert API
  alert(message: string, options?: AlertOptions): Promise<AlertResult>
  confirm(message: string, options?: AlertOptions): Promise<boolean>
  prompt(message: string, options?: PromptOptions): Promise<string | null>
  
  // 控制方法
  dismiss(id: string): void
  dismissAll(): void
  update(id: string, options: Partial<NotificationOptions>): void
  
  // 订阅
  on(event: 'created' | 'updated' | 'dismissed', callback: Function): void
  off(event: string, callback: Function): void
}
```

#### NotificationQueue 类

```typescript
class NotificationQueue {
  private items: NotificationItem[] = []
  private maxSize?: number
  
  enqueue(item: NotificationItem): void
  dequeue(): NotificationItem | undefined
  remove(id: string): void
  clear(): void
  getAll(): NotificationItem[]
  getByPosition(position: Position): NotificationItem[]
}
```

#### PositionManager 类

```typescript
class PositionManager {
  private containers: Map<Position, HTMLElement>
  
  getContainer(position: Position): HTMLElement
  calculateOffset(items: NotificationItem[]): number[]
  applyStackStrategy(strategy: StackStrategy, items: NotificationItem[]): void
}
```

#### AnimationEngine 类

```typescript
class AnimationEngine {
  enter(element: HTMLElement, animation: Animation): Promise<void>
  exit(element: HTMLElement, animation: Animation): Promise<void>
  transition(element: HTMLElement, from: State, to: State): Promise<void>
}
```

### 数据模型

```typescript
// 通知项
interface NotificationItem {
  id: string
  type: 'toast' | 'message' | 'notification' | 'alert'
  variant: 'success' | 'error' | 'warning' | 'info' | 'loading'
  message: string
  title?: string
  duration: number
  position: Position
  createdAt: number
  updatedAt: number
  dismissible: boolean
  pauseOnHover: boolean
  data?: any
}

// 位置
type Position = 
  | 'top' | 'top-left' | 'top-right'
  | 'bottom' | 'bottom-left' | 'bottom-right'
  | 'top-center' | 'bottom-center' | 'center'

// Toast 选项
interface ToastOptions {
  id?: string
  duration?: number
  position?: Position
  icon?: ReactNode | VNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  onDismiss?: () => void
}

// Alert 结果
interface AlertResult {
  isConfirmed: boolean
  isDenied: boolean
  isDismissed: boolean
  value?: any
}
```

### 组件设计

#### Vue 组件

```vue
<!-- ToastContainer.vue -->
<template>
  <Teleport to="body">
    <div 
      v-for="position in positions" 
      :key="position"
      :class="getContainerClass(position)"
    >
      <TransitionGroup :name="getTransitionName(position)">
        <ToastItem
          v-for="item in getItemsByPosition(position)"
          :key="item.id"
          :item="item"
          @dismiss="dismiss(item.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>
```

#### React 组件

```tsx
// ToastContainer.tsx
function ToastContainer() {
  const { toasts, positions } = useNotifications()
  
  return createPortal(
    <>
      {positions.map(position => (
        <div key={position} className={getContainerClass(position)}>
          <AnimatePresence>
            {getToastsByPosition(position).map(toast => (
              <ToastItem 
                key={toast.id} 
                toast={toast}
                onDismiss={() => dismiss(toast.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </>,
    document.body
  )
}
```

### 数据流

```
用户调用 API
  │
  ▼
notification.success('操作成功')
  │
  ▼
NotificationManager
  ├─→ 创建 NotificationItem
  ├─→ 分配 ID 和位置
  ├─→ 加入队列
  │
  ▼
Queue System
  ├─→ 检查最大数量
  ├─→ 检查重复
  ├─→ 优先级排序
  │
  ▼
Position Manager
  ├─→ 获取容器
  ├─→ 计算偏移
  ├─→ 应用堆叠策略
  │
  ▼
Renderer
  ├─→ 创建 DOM
  ├─→ 应用样式
  ├─→ 绑定事件
  │
  ▼
Animation Engine
  ├─→ 执行进入动画
  │
  ▼
显示通知
  │
  ▼
（等待 duration 或用户关闭）
  │
  ▼
Animation Engine
  ├─→ 执行退出动画
  │
  ▼
移除 DOM，从队列删除
```

---

## 🛠️ 技术栈

### 核心技术

- **TypeScript 5.7+** - 类型安全
- **CSS Transitions/Animations** - CSS 动画
- **Web Animations API** - JS 动画（可选）
- **Notification API** - 浏览器原生通知
- **Intersection Observer** - 视口检测（可选）

### 内部依赖

```json
{
  "dependencies": {
    "@ldesign/shared": "workspace:*"
  }
}
```

**使用的功能**:
- 工具函数（generateId, debounce）
- TypeScript 类型
- 无其他依赖

### 外部依赖

**运行时依赖**: 无 ✅

**开发依赖**:
```json
{
  "devDependencies": {
    "@ldesign/builder": "workspace:*",
    "typescript": "^5.7.3",
    "vue": "^3.4.15",
    "react": "^18.2.0",
    "@vitejs/plugin-vue": "^5.2.4",
    "@vitejs/plugin-react": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

### Peer Dependencies

```json
{
  "peerDependencies": {
    "vue": "^3.3.0",
    "react": "^18.0.0"
  },
  "peerDependenciesMeta": {
    "vue": { "optional": true },
    "react": { "optional": true }
  }
}
```

---

## 🗺️ 开发路线图

### v0.1.0 - MVP（当前版本）✅

**时间**: 已完成基础框架  
**目标**: Toast 基础功能

**已完成**:
- [x] NotificationManager 类
- [x] success/error/warning/info 方法
- [x] 基础类型定义
- [x] 简单队列系统

**待完成**:
- [ ] 完整的 Toast 渲染
- [ ] 位置系统完整实现
- [ ] 动画系统
- [ ] Vue/React 组件

**Bundle 大小**: ~8KB（未优化）

### v0.2.0 - Toast 完整（2-3周）

**目标**: Toast 全功能 + 基础 Message

**功能清单**:
- [ ] Toast 完整功能（15项）
  - 所有 Toast API
  - 9 个位置支持
  - 进入/退出动画（10种）
  - 手势关闭
  - 键盘导航
  - pauseOnHover
  - 自定义样式
  - Headless UI

- [ ] Message 基础功能（8项）
  - message() API
  - success/error/warning/info
  - 顶部显示
  - 自动关闭
  - 手动关闭

- [ ] Vue 3 集成（6项）
  - Vue Plugin
  - Composable API（useNotification）
  - Toast 组件
  - Message 组件
  - Teleport 渲染

- [ ] React 集成（6项）
  - NotificationProvider
  - useNotification Hook
  - Toast 组件
  - Message 组件
  - Portal 渲染

**测试**:
- 单元测试覆盖率 >70%
- E2E 测试（基础场景）

**文档**:
- README 完善
- API 文档
- 使用指南（Vue + React）

**Bundle 大小**: <12KB

### v0.3.0 - Notification + Alert（3-4周）

**目标**: 四大类型完整

**功能清单**:
- [ ] Notification 完整（10项）
  - notification.open() API
  - 标题 + 内容
  - 操作按钮
  - 4 个角位置
  - 自定义图标
  - onClick 回调
  - 关闭按钮
  - 持续时间控制

- [ ] Alert 完整（12项）
  - alert() 简单警告
  - confirm() 确认框
  - prompt() 输入框
  - 自定义按钮
  - 输入验证
  - 进度条
  - 定时器
  - 回调钩子

- [ ] 动画增强（8项）
  - 20+ 进入动画
  - 20+ 退出动画
  - 自定义动画
  - 动画配置

- [ ] 堆叠管理（5项）
  - 堆叠策略
  - 最大数量
  - 自动折叠
  - 防重复

**测试**:
- 单元测试覆盖率 >85%
- E2E 测试（所有类型）
- 视觉回归测试

**文档**:
- 完整 API 文档
- 所有类型文档
- 高级用法文档

**Bundle 大小**: <15KB

### v1.0.0 - 生产就绪（6-8周）

**目标**: 所有功能 + 通知中心

**功能清单**:
- [ ] 浏览器原生通知（5项）
  - Notification API 集成
  - 权限请求
  - 通知点击处理
  - Fallback 机制
  - 通知图标

- [ ] 声音系统（5项）
  - 成功/错误/警告声音
  - 自定义声音
  - 音量控制
  - 静音开关

- [ ] 通知中心（12项）
  - 历史记录
  - 通知列表 UI
  - 搜索和过滤
  - 分组显示
  - 未读标记
  - 一键清空
  - 通知详情
  - 导出功能

- [ ] 高级特性（10项）
  - 通知优先级
  - 通知模板
  - 免打扰模式
  - 通知规则
  - 通知统计
  - 批量操作

- [ ] 第三方集成（4项）
  - 钉钉集成
  - 企业微信集成
  - 飞书集成
  - 邮件通知

**性能优化**:
- 虚拟化渲染（100+ 通知）
- 懒加载动画
- 防抖优化
- 内存优化

**测试**:
- 单元测试覆盖率 >90%
- 完整 E2E 测试
- 性能测试
- 压力测试（1000+ 通知）

**文档**:
- 完整文档网站
- 所有示例
- 最佳实践
- 性能优化指南

**Bundle 大小**: <15KB（核心），<25KB（全功能）

---

## 📋 详细任务分解

### Week 1-3: v0.2.0 开发

#### Week 1: Toast 完整实现

**Day 1-2**: Toast 核心（16h）
- [ ] 完善 NotificationManager
  - toast() 方法完整实现
  - success/error/warning/info
  - loading() 加载提示
  - promise() Promise 绑定
  - dismiss/dismissAll
  
- [ ] 测试
  - API 单元测试
  - 核心逻辑测试

**Day 3-4**: 位置和队列（16h）
- [ ] Position Manager 实现
  - 9 个位置计算
  - 容器创建
  - 偏移计算
  - 堆叠策略

- [ ] Queue System 完善
  - 优先级队列
  - 最大数量控制
  - 防重复逻辑

- [ ] 测试
  - 位置测试
  - 队列测试

**Day 5**: 动画系统（8h）
- [ ] Animation Engine 基础
  - fadeIn/fadeOut
  - slideIn/slideOut（4方向）
  - zoomIn/zoomOut
  - CSS Transition 控制

- [ ] 测试
  - 动画测试

#### Week 2: Vue 集成

**Day 1-2**: Vue Plugin（16h）
- [ ] Vue Plugin 开发
  - install() 方法
  - 全局属性（$notification）
  - 组件注册

- [ ] Composable API
  - useNotification()
  - useToast()
  - 响应式状态

**Day 3-4**: Vue 组件（16h）
- [ ] ToastContainer 组件
  - Teleport 渲染
  - TransitionGroup
  - 位置容器

- [ ] ToastItem 组件
  - 样式实现
  - 交互处理
  - 动画集成

**Day 5**: Vue 测试和文档（8h）
- [ ] Vue 集成测试
- [ ] Vue 使用文档

#### Week 3: React 集成 + Message

**Day 1-2**: React 集成（16h）
- [ ] NotificationProvider
  - Context API
  - Portal 渲染

- [ ] useNotification Hook
  - Hook 实现
  - 类型定义

- [ ] React 组件
  - ToastContainer
  - ToastItem

**Day 3-4**: Message 组件（16h）
- [ ] Message API 实现
  - message() 核心方法
  - success/error/warning/info
  - close/closeAll

- [ ] Message 组件（Vue + React）
  - MessageContainer
  - MessageItem
  - 顶部定位
  - 进入/退出动画

**Day 5**: 测试和文档（8h）
- [ ] React 集成测试
- [ ] Message 测试
- [ ] 文档更新

### Week 4-7: v0.3.0 开发

#### Week 4: Notification 类型

**Day 1-3**: Notification API（24h）
- [ ] notification.open() 实现
  - 配置解析
  - 通知创建
  - 通知渲染

- [ ] Notification 特性
  - 标题 + 内容
  - 操作按钮
  - 关闭按钮
  - onClick 回调

**Day 4-5**: Notification 组件（16h）
- [ ] Vue Notification 组件
- [ ] React Notification 组件
- [ ] 样式实现
- [ ] 测试

#### Week 5: Alert 类型

**Day 1-3**: Alert 核心（24h）
- [ ] alert() 简单警告
  - 模态遮罩
  - 警告框
  - 确认按钮

- [ ] confirm() 确认框
  - 确认 + 取消按钮
  - Promise 返回
  - 结果处理

- [ ] prompt() 输入框
  - 输入框组件
  - 验证器集成
  - 返回输入值

**Day 4-5**: Alert 组件（16h）
- [ ] Vue Alert 组件
- [ ] React Alert 组件
- [ ] 模态遮罩
- [ ] 测试

#### Week 6: 动画和堆叠

**Day 1-3**: 动画扩展（24h）
- [ ] 补充 20+ 进入动画
  - bounce 系列
  - rotate 系列
  - flip 系列
  - custom 自定义

- [ ] 补充 20+ 退出动画
- [ ] 动画配置系统
- [ ] 测试

**Day 4-5**: 堆叠管理（16h）
- [ ] 堆叠策略实现
  - overlap - 重叠
  - stack - 堆叠
  - replace - 替换
  - collapse - 折叠

- [ ] 最大数量控制
- [ ] 自动折叠
- [ ] 测试

#### Week 7: 测试和文档

**Day 1-3**: 完整测试（24h）
- [ ] 单元测试补充
- [ ] E2E 测试（所有类型）
- [ ] 视觉回归测试
- [ ] 性能测试

**Day 4-5**: 完整文档（16h）
- [ ] API 文档（Toast/Message/Notification/Alert）
- [ ] Vue 集成文档
- [ ] React 集成文档
- [ ] 高级用法
- [ ] 最佳实践

### Week 8-14: v1.0.0 开发

#### Week 8-9: 浏览器通知

**任务 8.1**: Notification API 集成（40h）
- [ ] 权限请求流程
- [ ] 原生通知发送
- [ ] 通知点击处理
- [ ] 通知关闭处理
- [ ] Fallback 到 Web 通知
- [ ] 通知图标支持
- [ ] 测试

**任务 9.1**: 声音系统（40h）
- [ ] 声音资源
  - success.mp3
  - error.mp3
  - warning.mp3
  - info.mp3

- [ ] 声音播放
  - Web Audio API
  - 音量控制
  - 静音开关

- [ ] 声音配置
  - 自定义声音
  - 音效库

- [ ] 测试

#### Week 10-12: 通知中心

**任务 10.1**: 历史记录（40h）
- [ ] 历史存储（LocalStorage/IndexedDB）
- [ ] 历史查询 API
- [ ] 历史清空
- [ ] 未读标记
- [ ] 测试

**任务 11.1**: 通知中心 UI（40h）
- [ ] 通知列表组件（Vue）
- [ ] 通知列表组件（React）
- [ ] 搜索和过滤
- [ ] 分组显示
- [ ] 详情查看
- [ ] 测试

**任务 12.1**: 高级管理（40h）
- [ ] 通知分组
- [ ] 通知优先级
- [ ] 批量操作
- [ ] 导出功能
- [ ] 测试

#### Week 13: 高级特性

**任务 13.1**: 模板和规则（40h）
- [ ] 通知模板系统
- [ ] 免打扰模式
- [ ] 通知规则引擎
- [ ] 通知统计
- [ ] 测试

#### Week 14: 集成和发布

**任务 14.1**: 第三方集成（20h）
- [ ] 钉钉 Webhook
- [ ] 企业微信 Webhook
- [ ] 飞书 Webhook
- [ ] 邮件通知（集成 @ldesign/http）

**任务 14.2**: 性能优化（10h）
- [ ] 虚拟化渲染
- [ ] 懒加载
- [ ] 动画优化
- [ ] 内存优化
- [ ] 性能测试

**任务 14.3**: 发布准备（10h）
- [ ] 完整文档
- [ ] 示例补充
- [ ] 版本发布
- [ ] NPM 发布

---

## 🧪 测试策略

### 单元测试

**覆盖率目标**: >90%

**测试内容**:
- NotificationManager 所有方法
- Queue 系统
- Position Manager
- Animation Engine
- Vue 组件
- React 组件

**测试框架**: Vitest

**示例**:
```typescript
describe('NotificationManager', () => {
  it('creates toast notification', () => {
    const manager = new NotificationManager()
    const id = manager.toast('Test message')
    
    expect(id).toBeDefined()
    expect(manager.getAll()).toHaveLength(1)
  })
  
  it('dismisses notification', () => {
    const manager = new NotificationManager()
    const id = manager.toast('Test')
    
    manager.dismiss(id)
    expect(manager.getAll()).toHaveLength(0)
  })
  
  it('prevents duplicate', () => {
    const manager = new NotificationManager({ preventDuplicate: true })
    const id1 = manager.toast('Same message')
    const id2 = manager.toast('Same message')
    
    expect(id1).toBe(id2)
    expect(manager.getAll()).toHaveLength(1)
  })
})
```

### 集成测试

**测试场景**:
- Vue 项目集成
- React 项目集成
- SSR 兼容性
- 多实例管理

### E2E 测试

**工具**: Playwright

**测试场景**:
- Toast 显示和关闭
- Message 顶部显示
- Notification 桌面通知
- Alert 确认对话框
- 动画流畅性
- 手势交互
- 键盘导航
- 浏览器通知

### 性能测试

**基准**:
- 单个通知渲染: <5ms
- 100 个通知同时: <100ms
- 动画帧率: 60fps
- 内存占用: <50bytes/notification

### 可访问性测试

- ARIA 属性正确
- 键盘导航完整
- 屏幕阅读器兼容
- 对比度达标（WCAG AA）

---

## 📊 性能目标

### Bundle 大小

| 版本 | 核心 | Toast | Message | Notification | Alert | 全部 |
|------|------|-------|---------|--------------|-------|------|
| v0.1.0 | 5KB | - | - | - | - | ~8KB |
| v0.2.0 | 6KB | 3KB | 2KB | - | - | <12KB |
| v0.3.0 | 6KB | 3KB | 2KB | 2KB | 3KB | <15KB |
| v1.0.0 | 7KB | 3KB | 2KB | 2KB | 3KB | **<15KB** 🎯 |

### 运行性能

| 指标 | 目标 | 测量 |
|------|------|------|
| 创建通知 | <2ms | performance.measure() |
| 渲染通知 | <5ms | performance.measure() |
| 动画帧率 | 60fps | DevTools FPS |
| 100 个通知 | <100ms | 压力测试 |
| 内存占用 | <5MB | heap snapshot |

### 优化策略

1. **虚拟化渲染** - 只渲染可见通知
2. **懒加载** - 动画按需加载
3. **防抖** - 频繁调用防抖
4. **对象池** - 复用通知对象
5. **RAF 优化** - 批量 DOM 操作

---

## 💻 API 设计详解

### Toast API

```typescript
// 基础用法
import { notification } from '@ldesign/notification'

notification.toast('操作成功')
notification.success('保存成功')
notification.error('操作失败')
notification.warning('请注意')
notification.info('提示信息')

// 配置选项
notification.toast('消息', {
  duration: 5000,
  position: 'top-right',
  icon: '✅',
  className: 'my-toast',
  onClick: () => console.log('clicked'),
  onDismiss: () => console.log('dismissed')
})

// 加载提示
const id = notification.loading('正在处理...')
// 处理完成后
notification.dismiss(id)
notification.success('处理完成')

// Promise 绑定
notification.promise(
  fetchData(),
  {
    loading: '加载中...',
    success: '加载成功',
    error: '加载失败'
  }
)

// 手动控制
const id = notification.toast('消息')
notification.update(id, { message: '更新的消息' })
notification.dismiss(id)
```

### Message API

```typescript
import { notification } from '@ldesign/notification'

// 基础用法
notification.message('这是一条消息')

// 类型方法
notification.message.success('成功')
notification.message.error('错误')
notification.message.warning('警告')
notification.message.info('信息')

// 配置
notification.message('消息', {
  duration: 3000,
  showClose: true,
  center: false,
  offset: 20,
  onClose: () => {}
})

// 关闭
notification.message.close(id)
notification.message.closeAll()
```

### Notification API

```typescript
import { notification } from '@ldesign/notification'

// 基础用法
notification.notification({
  title: '通知标题',
  message: '通知内容'
})

// 完整配置
notification.notification({
  title: '新消息',
  message: '您有一条新消息',
  type: 'info',
  duration: 4500,
  position: 'top-right',
  showClose: true,
  onClick: () => console.log('notification clicked'),
  onClose: () => console.log('notification closed'),
  customClass: 'my-notification',
  offset: 0,
  appendTo: document.body
})

// 操作按钮
notification.notification({
  title: '确认操作',
  message: '是否继续？',
  actions: [
    { text: '确定', onClick: () => {} },
    { text: '取消', onClick: () => {} }
  ]
})
```

### Alert API

```typescript
import { notification } from '@ldesign/notification'

// 简单警告
await notification.alert('这是警告消息')

// 确认框
const confirmed = await notification.confirm('确定要删除吗？')
if (confirmed) {
  // 执行删除
}

// 输入框
const value = await notification.prompt('请输入您的名字')
if (value) {
  console.log('输入:', value)
}

// 完整配置
const result = await notification.alert({
  title: '警告',
  text: '此操作不可撤销',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  timer: 5000,
  timerProgressBar: true,
  input: 'text',
  inputPlaceholder: '请输入...',
  inputValidator: (value) => {
    if (!value) return '不能为空'
  }
})

if (result.isConfirmed) {
  // 确认操作
}
```

### Vue 集成 API

```vue
<template>
  <div>
    <!-- 使用 Composable -->
    <button @click="showToast">显示 Toast</button>
    <button @click="showMessage">显示 Message</button>
    <button @click="showNotification">显示 Notification</button>
    <button @click="showAlert">显示 Alert</button>
  </div>
</template>

<script setup>
import { useNotification } from '@ldesign/notification/vue'

const notification = useNotification()

const showToast = () => {
  notification.toast('Toast 消息')
}

const showMessage = () => {
  notification.message('Message 消息')
}

const showNotification = () => {
  notification.notification({
    title: '通知',
    message: '这是通知内容'
  })
}

const showAlert = async () => {
  const confirmed = await notification.confirm('确定吗？')
  if (confirmed) {
    notification.success('已确认')
  }
}
</script>
```

### React 集成 API

```tsx
import { useNotification } from '@ldesign/notification/react'

function App() {
  const notification = useNotification()
  
  return (
    <div>
      <button onClick={() => notification.toast('Toast')}>
        Toast
      </button>
      <button onClick={() => notification.message('Message')}>
        Message
      </button>
      <button onClick={async () => {
        const result = await notification.confirm('确定？')
        if (result) notification.success('已确认')
      }}>
        Confirm
      </button>
    </div>
  )
}

// 使用 Provider
function Root() {
  return (
    <NotificationProvider>
      <App />
    </NotificationProvider>
  )
}
```

---

## ✅ 开发检查清单

### 功能完成度

**v0.1.0** (当前):
- [x] 基础框架: 5/5 (100%)
- [x] Toast 基础: 3/15 (20%)
- [ ] Message: 0/8 (0%)
- [ ] Notification: 0/10 (0%)
- [ ] Alert: 0/12 (0%)

**v0.2.0** (目标):
- [ ] Toast: 0/15 (100%)
- [ ] Message: 0/8 (100%)
- [ ] Vue 集成: 0/6 (100%)
- [ ] React 集成: 0/6 (100%)
- [ ] 测试: 0/70%

**v0.3.0** (目标):
- [ ] Notification: 0/10 (100%)
- [ ] Alert: 0/12 (100%)
- [ ] 动画: 0/40+
- [ ] 堆叠: 0/5
- [ ] 测试: 0/85%

**v1.0.0** (目标):
- [ ] 浏览器通知: 0/5
- [ ] 声音系统: 0/5
- [ ] 通知中心: 0/12
- [ ] 高级特性: 0/10
- [ ] 测试: 0/90%

### 质量指标

- [ ] 测试覆盖率: 0% / >90%
- [ ] Bundle 大小: ~8KB / <15KB
- [ ] 文档完整性: 30% / 100%
- [ ] 性能达标: 0/5

### 发布准备

- [x] package.json ✅
- [x] tsconfig.json ✅
- [x] README.md ✅
- [ ] CHANGELOG.md（详细）
- [x] LICENSE ✅
- [ ] API 文档（完整）
- [ ] 使用示例（50+）

---

## 📦 发布计划

### v0.1.0 - Alpha（当前）

**时间**: 2025-10-22  
**状态**: ✅ 基础框架完成

**内容**:
- 基础框架
- Toast 骨架
- 简单 API

**发布**: 内部测试

### v0.2.0 - Beta

**时间**: Week 3  
**状态**: ⏳ 计划中

**内容**:
- Toast 完整功能
- Message 基础功能
- Vue + React 集成
- 基础动画
- 测试 >70%

**发布**: Beta 测试

### v0.3.0 - RC

**时间**: Week 7  
**状态**: ⏳ 计划中

**内容**:
- 四大类型完整
- 40+ 动画
- 堆叠管理
- 测试 >85%
- 完整文档

**发布**: Release Candidate

### v1.0.0 - Stable

**时间**: Week 14  
**状态**: ⏳ 计划中

**内容**:
- 所有功能完整
- 浏览器通知
- 通知中心
- 第三方集成
- 测试 >90%
- 生产级文档

**发布**: 正式发布 NPM

---

## 🎯 成功指标

### 技术指标

- ✅ TypeScript 类型覆盖率: 100%
- ⏳ 测试覆盖率: >90%
- ⏳ Bundle 大小: <15KB
- ⏳ 性能基准: 所有指标达标
- ⏳ 无障碍性: WCAG AA

### 用户指标

- ⏳ NPM 周下载量: >5000
- ⏳ GitHub Stars: >500
- ⏳ 文档完整性: 100%
- ⏳ 用户满意度: >4.5/5

---

**文档版本**: 2.0（详细完整版）  
**创建时间**: 2025-10-22  
**最后更新**: 2025-10-22  
**作者**: LDesign Team  
**页数**: 约 25 页

