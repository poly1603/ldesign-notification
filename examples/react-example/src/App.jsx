import React from 'react'
import { useNotification } from '@ldesign/notification/react'
import Section from './components/Section'

function App() {
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

  return (
    <div className="app">
      <div className="header">
        <h1>🔔 @ldesign/notification</h1>
        <p>React 18 示例 - 功能完整的通知系统</p>
      </div>

      <div className="content">
        {/* Toast 示例 */}
        <Section title="Toast 轻提示" description="简短的消息提示，自动消失">
          <button className="btn btn-success" onClick={() => toast.success('操作成功！')}>Success</button>
          <button className="btn btn-error" onClick={() => toast.error('操作失败！')}>Error</button>
          <button className="btn btn-warning" onClick={() => toast.warning('警告信息')}>Warning</button>
          <button className="btn btn-info" onClick={() => toast.info('提示信息')}>Info</button>
          <button className="btn btn-default" onClick={showLoading}>Loading</button>
          <button className="btn btn-info" onClick={showPromise}>Promise</button>
        </Section>

        {/* 位置示例 */}
        <Section title="Toast 位置" description="支持 9 个位置选择">
          <button className="btn btn-info" onClick={() => showPosition('top')}>Top</button>
          <button className="btn btn-info" onClick={() => showPosition('top-left')}>Top Left</button>
          <button className="btn btn-info" onClick={() => showPosition('top-right')}>Top Right</button>
          <button className="btn btn-info" onClick={() => showPosition('bottom')}>Bottom</button>
          <button className="btn btn-info" onClick={() => showPosition('bottom-left')}>Bottom Left</button>
          <button className="btn btn-info" onClick={() => showPosition('bottom-right')}>Bottom Right</button>
          <button className="btn btn-info" onClick={() => showPosition('center')}>Center</button>
        </Section>

        {/* Message 示例 */}
        <Section title="Message 消息" description="顶部消息条">
          <button className="btn btn-success" onClick={() => message.success('保存成功')}>Success</button>
          <button className="btn btn-error" onClick={() => message.error('保存失败')}>Error</button>
          <button className="btn btn-warning" onClick={() => message.warning('请注意')}>Warning</button>
          <button className="btn btn-info" onClick={() => message.info('提示信息')}>Info</button>
        </Section>

        {/* Notification 示例 */}
        <Section title="Notification 通知" description="桌面风格通知">
          <button className="btn btn-success" onClick={showNotificationSuccess}>Success</button>
          <button className="btn btn-error" onClick={showNotificationError}>Error</button>
          <button className="btn btn-warning" onClick={showNotificationWithActions}>With Actions</button>
        </Section>

        {/* Alert 示例 */}
        <Section title="Alert 警告框" description="模态对话框">
          <button className="btn btn-default" onClick={showAlert}>Simple Alert</button>
          <button className="btn btn-warning" onClick={showConfirm}>Confirm</button>
          <button className="btn btn-info" onClick={showPrompt}>Prompt</button>
        </Section>

        {/* 主题切换 */}
        <Section title="主题切换" description="支持 Light / Dark 主题">
          <div className="theme-switcher">
            <button className="btn btn-default" onClick={() => setTheme('light')}>Light</button>
            <button className="btn btn-default" onClick={() => setTheme('dark')}>Dark</button>
            <button className="btn btn-default" onClick={() => setTheme('auto')}>Auto</button>
          </div>
        </Section>

        {/* 统计信息 */}
        <Section title="通知统计" description="当前通知数量和状态">
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">{notifications.length}</div>
              <div className="stat-label">当前通知</div>
            </div>
          </div>
        </Section>
      </div>

      <div className="footer">
        <p>Made with ❤️ by LDesign Team</p>
      </div>
    </div>
  )
}

export default App

