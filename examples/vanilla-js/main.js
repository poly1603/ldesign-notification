import { notification, browserNotificationManager, soundManager, historyManager } from '@ldesign/notification'
import '@ldesign/notification/styles'

// ========== Toast 示例 ==========

document.getElementById('toast-success').addEventListener('click', () => {
  notification.toast.success('操作成功！')
})

document.getElementById('toast-error').addEventListener('click', () => {
  notification.toast.error('操作失败！')
})

document.getElementById('toast-warning').addEventListener('click', () => {
  notification.toast.warning('警告信息')
})

document.getElementById('toast-info').addEventListener('click', () => {
  notification.toast.info('提示信息')
})

document.getElementById('toast-loading').addEventListener('click', () => {
  const id = notification.toast.loading('加载中...')

  // 2 秒后关闭
  setTimeout(() => {
    notification.toast.dismiss(id)
    notification.toast.success('加载完成！')
  }, 2000)
})

document.getElementById('toast-promise').addEventListener('click', async () => {
  // 模拟异步操作
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
    await notification.toast.promise(
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
})

// ========== 位置示例 ==========

document.getElementById('pos-top').addEventListener('click', () => {
  notification.toast('顶部居中', { position: 'top' })
})

document.getElementById('pos-top-left').addEventListener('click', () => {
  notification.toast('左上角', { position: 'top-left' })
})

document.getElementById('pos-top-right').addEventListener('click', () => {
  notification.toast('右上角', { position: 'top-right' })
})

document.getElementById('pos-bottom').addEventListener('click', () => {
  notification.toast('底部居中', { position: 'bottom' })
})

document.getElementById('pos-bottom-left').addEventListener('click', () => {
  notification.toast('左下角', { position: 'bottom-left' })
})

document.getElementById('pos-bottom-right').addEventListener('click', () => {
  notification.toast('右下角', { position: 'bottom-right' })
})

document.getElementById('pos-center').addEventListener('click', () => {
  notification.toast('屏幕中央', { position: 'center' })
})

// ========== Message 示例 ==========

document.getElementById('message-success').addEventListener('click', () => {
  notification.message.success('保存成功')
})

document.getElementById('message-error').addEventListener('click', () => {
  notification.message.error('保存失败')
})

document.getElementById('message-warning').addEventListener('click', () => {
  notification.message.warning('请注意')
})

document.getElementById('message-info').addEventListener('click', () => {
  notification.message.info('提示信息')
})

// ========== Notification 示例 ==========

document.getElementById('notif-success').addEventListener('click', () => {
  notification.notification({
    title: '成功',
    message: '您的操作已成功完成',
    type: 'success'
  })
})

document.getElementById('notif-error').addEventListener('click', () => {
  notification.notification({
    title: '错误',
    message: '发生了一个错误，请稍后重试',
    type: 'error'
  })
})

document.getElementById('notif-with-actions').addEventListener('click', () => {
  notification.notification({
    title: '确认操作',
    message: '是否删除这条记录？此操作不可撤销。',
    type: 'warning',
    actions: [
      {
        text: '确定',
        type: 'primary',
        onClick: () => {
          notification.toast.success('已删除')
        }
      },
      {
        text: '取消',
        onClick: () => {
          notification.toast.info('已取消')
        }
      }
    ]
  })
})

// ========== Alert 示例 ==========

document.getElementById('alert-simple').addEventListener('click', async () => {
  await notification.alert('这是一个简单的警告消息')
})

document.getElementById('alert-confirm').addEventListener('click', async () => {
  const confirmed = await notification.alert.confirm('确定要删除这条记录吗？')

  if (confirmed) {
    notification.toast.success('已删除')
  } else {
    notification.toast.info('已取消')
  }
})

document.getElementById('alert-prompt').addEventListener('click', async () => {
  const name = await notification.alert.prompt('请输入您的名字')

  if (name) {
    notification.toast.success(`你好，${name}！`)
  }
})

// ========== 主题切换 ==========

document.getElementById('theme-light').addEventListener('click', () => {
  notification.setTheme('light')
  notification.toast.success('已切换到浅色主题')
})

document.getElementById('theme-dark').addEventListener('click', () => {
  notification.setTheme('dark')
  notification.toast.success('已切换到深色主题')
})

document.getElementById('theme-auto').addEventListener('click', () => {
  notification.setTheme('auto')
  notification.toast.success('已设置为自动跟随系统')
})

// ========== 高级功能 ==========

document.getElementById('browser-notification').addEventListener('click', async () => {
  if (!browserNotificationManager.isSupported()) {
    notification.toast.error('您的浏览器不支持原生通知')
    return
  }

  const permission = await browserNotificationManager.requestPermission()

  if (permission === 'granted') {
    browserNotificationManager.show({
      title: '浏览器通知',
      body: '这是一条浏览器原生通知',
      icon: '/favicon.ico',
      onClick: () => {
        notification.toast.info('您点击了通知')
      }
    })
  } else {
    notification.toast.warning('通知权限被拒绝')
  }
})

document.getElementById('play-sound').addEventListener('click', () => {
  if (!soundManager.isSupported()) {
    notification.toast.error('您的浏览器不支持音频播放')
    return
  }

  // 这里只是演示，实际需要设置真实的音频文件
  notification.toast.info('声音功能演示（需要配置音频文件）')
})

document.getElementById('view-history').addEventListener('click', () => {
  const history = historyManager.getAll()
  const unreadCount = historyManager.getUnreadCount()
  const stats = historyManager.getStats()

  notification.notification({
    title: '通知历史',
    message: `共 ${stats.total} 条通知，${unreadCount} 条未读`,
    type: 'info'
  })

  console.log('通知历史:', history)
  console.log('统计信息:', stats)
})

// ========== 页面加载完成 ==========

window.addEventListener('DOMContentLoaded', () => {
  notification.toast.success('欢迎使用 @ldesign/notification！', {
    duration: 2000
  })
})

