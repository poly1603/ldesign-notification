<template>
  <div class="app">
    <div class="header">
      <h1>🔔 @ldesign/notification</h1>
      <p>Vue 3 示例 - 功能完整的通知系统</p>
    </div>

    <div class="content">
      <!-- Toast 示例 -->
      <Section title="Toast 轻提示" description="简短的消息提示，自动消失">
        <button class="btn btn-success" @click="toast.success('操作成功！')">Success</button>
        <button class="btn btn-error" @click="toast.error('操作失败！')">Error</button>
        <button class="btn btn-warning" @click="toast.warning('警告信息')">Warning</button>
        <button class="btn btn-info" @click="toast.info('提示信息')">Info</button>
        <button class="btn btn-default" @click="showLoading">Loading</button>
        <button class="btn btn-info" @click="showPromise">Promise</button>
      </Section>

      <!-- 位置示例 -->
      <Section title="Toast 位置" description="支持 9 个位置选择">
        <button class="btn btn-info" @click="showPosition('top')">Top</button>
        <button class="btn btn-info" @click="showPosition('top-left')">Top Left</button>
        <button class="btn btn-info" @click="showPosition('top-right')">Top Right</button>
        <button class="btn btn-info" @click="showPosition('bottom')">Bottom</button>
        <button class="btn btn-info" @click="showPosition('bottom-left')">Bottom Left</button>
        <button class="btn btn-info" @click="showPosition('bottom-right')">Bottom Right</button>
        <button class="btn btn-info" @click="showPosition('center')">Center</button>
      </Section>

      <!-- Message 示例 -->
      <Section title="Message 消息" description="顶部消息条">
        <button class="btn btn-success" @click="message.success('保存成功')">Success</button>
        <button class="btn btn-error" @click="message.error('保存失败')">Error</button>
        <button class="btn btn-warning" @click="message.warning('请注意')">Warning</button>
        <button class="btn btn-info" @click="message.info('提示信息')">Info</button>
      </Section>

      <!-- Notification 示例 -->
      <Section title="Notification 通知" description="桌面风格通知">
        <button class="btn btn-success" @click="showNotificationSuccess">Success</button>
        <button class="btn btn-error" @click="showNotificationError">Error</button>
        <button class="btn btn-warning" @click="showNotificationWithActions">With Actions</button>
      </Section>

      <!-- Alert 示例 -->
      <Section title="Alert 警告框" description="模态对话框">
        <button class="btn btn-default" @click="showAlert">Simple Alert</button>
        <button class="btn btn-warning" @click="showConfirm">Confirm</button>
        <button class="btn btn-info" @click="showPrompt">Prompt</button>
      </Section>

      <!-- 主题切换 -->
      <Section title="主题切换" description="支持 Light / Dark 主题">
        <div class="theme-switcher">
          <button class="btn btn-default" @click="setTheme('light')">Light</button>
          <button class="btn btn-default" @click="setTheme('dark')">Dark</button>
          <button class="btn btn-default" @click="setTheme('auto')">Auto</button>
        </div>
      </Section>

      <!-- 统计信息 -->
      <Section title="通知统计" description="当前通知数量和状态">
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">{{ notifications.length }}</div>
            <div class="stat-label">当前通知</div>
          </div>
        </div>
      </Section>
    </div>

    <div class="footer">
      <p>Made with ❤️ by LDesign Team</p>
    </div>
  </div>
</template>

<script setup>
import { useNotification } from '@ldesign/notification/vue'
import Section from './components/Section.vue'

const { toast, message, notification, alert, notifications, setTheme } = useNotification()

// Toast Loading 示例
const showLoading = () => {
  const id = toast.loading('加载中...')
  
  setTimeout(() => {
    toast.dismiss(id)
    toast.success('加载完成！')
  }, 2000)
}

// Promise 示例
const showPromise = async () => {
  const fetchData = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve({ count: 42 })
        } else {
          reject(new Error('网络错误'))
        }
      }, 2000)
    })
  }

  try {
    await toast.promise(
      fetchData(),
      {
        loading: '正在加载数据...',
        success: (data) => `成功加载 ${data.count} 条数据`,
        error: '加载失败，请重试'
      }
    )
  } catch (error) {
    console.error(error)
  }
}

// 位置示例
const showPosition = (position) => {
  toast(`位置: ${position}`, { position })
}

// Notification 示例
const showNotificationSuccess = () => {
  notification({
    title: '成功',
    message: '您的操作已成功完成',
    type: 'success'
  })
}

const showNotificationError = () => {
  notification({
    title: '错误',
    message: '发生了一个错误，请稍后重试',
    type: 'error'
  })
}

const showNotificationWithActions = () => {
  notification({
    title: '确认操作',
    message: '是否删除这条记录？此操作不可撤销。',
    type: 'warning',
    actions: [
      {
        text: '确定',
        type: 'primary',
        onClick: () => {
          toast.success('已删除')
        }
      },
      {
        text: '取消',
        onClick: () => {
          toast.info('已取消')
        }
      }
    ]
  })
}

// Alert 示例
const showAlert = async () => {
  await alert('这是一个简单的警告消息')
}

const showConfirm = async () => {
  const confirmed = await alert.confirm('确定要删除这条记录吗？')
  
  if (confirmed) {
    toast.success('已删除')
  } else {
    toast.info('已取消')
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
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  text-align: center;
  color: white;
  padding: 60px 20px;
}

.header h1 {
  font-size: 48px;
  margin-bottom: 10px;
  font-weight: 700;
}

.header p {
  font-size: 18px;
  opacity: 0.9;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
}

.theme-switcher {
  display: flex;
  gap: 12px;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 120px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.footer {
  text-align: center;
  color: white;
  padding: 40px 20px;
  font-size: 14px;
  opacity: 0.9;
}
</style>

