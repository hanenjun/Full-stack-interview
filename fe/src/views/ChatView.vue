<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Message {
  role: 'bot' | 'user'
  content: string
  memoryAccess?: {
    type: 'create' | 'retrieve' | 'access'
    status?: 'pending' | 'approved' | 'rejected'
  }
}

const messages = ref<Message[]>([])
const loading = ref(false)
const newMessage = ref('')
const currentChatId = ref('')
const memoryAccessRejected = ref(false)
const route = useRoute()
const router = useRouter()

const fetchChatMessages = async () => {
  if (!currentChatId.value) return
  try {
    loading.value = true
    const response = await fetch(`http://localhost:3000/chat/${currentChatId.value}`)
    const data = await response.json()
    messages.value = data
    if(data.length > 1) {
      memoryAccessRejected.value = true
    }
  } catch (error) {
    console.error('Failed to fetch messages:', error)
  } finally {
    loading.value = false
  }
}

const walletAddress = ref('')
const isWalletConnected = ref(false)

const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    alert('请安装MetaMask钱包')
    return
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    walletAddress.value = accounts[0]
    isWalletConnected.value = true
  } catch (error) {
    console.error('Failed to connect wallet:', error)
  }
}

const signEIP712Message = async (chatId: string) => {
  if (!isWalletConnected.value) {
    await connectWallet()
  }

  const domain = {
    name: 'Memory Access Approval',
    version: '1',
    chainId: 1, // Ethereum Mainnet
    verifyingContract: '0x0000000000000000000000000000000000000000'
  }

  const types = {
    MemoryAccess: [
      { name: 'chatId', type: 'string' },
      { name: 'userAddress', type: 'address' },
      { name: 'timestamp', type: 'uint256' }
    ]
  }

  const value = {
    chatId: chatId,
    userAddress: walletAddress.value,
    timestamp: Math.floor(Date.now() / 1000)
  }

  try {
    const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [walletAddress.value, JSON.stringify({
        types,
        primaryType: 'MemoryAccess',
        domain,
        message: value
      })]
    })
    return signature
  } catch (error) {
    console.error('Failed to sign message:', error)
    return null
  }
}

const handleApprove = async () => {
  if (!currentChatId.value) return
  
  const signature = await signEIP712Message(currentChatId.value)
  if (!signature) return

  try {
    const response = await fetch(`http://localhost:3000/chat/${currentChatId.value}/memory/approve-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        signature,
        walletAddress: walletAddress.value
      })
    })
    const data = await response.json()
    memoryAccessRejected.value = true
    await fetchChatMessages()
  } catch (error) {
    console.error('Failed to approve access:', error)
  }
}

const handleReject = async () => {
  if (!currentChatId.value) return
  try {
    const response = await fetch(`http://localhost:3000/chat/${currentChatId.value}/memory/reject-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    memoryAccessRejected.value = true
    await fetchChatMessages()
  } catch (error) {
    console.error('Failed to reject access:', error)
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentChatId.value) return
  if (!memoryAccessRejected.value && messages.value[0]?.memoryAccess?.status === 'pending') return

  const message: Message = {
    role: 'user',
    content: newMessage.value.trim()
  }

  try {
    const response = await fetch(`http://localhost:3000/chat/${currentChatId.value}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: newMessage.value.trim() })
    })
    const data = await response.json()
    messages.value = data
    newMessage.value = ''
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const createConversation = async () => {
  try {
    const response = await fetch('http://localhost:3000/chat/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: '新对话' })
    })
    const data = await response.json()
    currentChatId.value = data.id
    router.push({ query: { id: data.id } })
    await fetchChatMessages()
    fetchConversations()
    memoryAccessRejected.value = false
  } catch (error) {
    console.error('Failed to create conversation:', error)
  }
}

// const sendMessage = async () => {
//   if (!newMessage.value.trim() || !currentChatId.value) return

//   const message: Message = {
//     role: 'user',
//     content: newMessage.value.trim()
//   }

//   try {
//     const response = await fetch(`http://localhost:3000/chat/${currentChatId.value}/messages`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ content: newMessage.value.trim() })
//     })
//     const data = await response.json()
//     messages.value = data
//     newMessage.value = ''
//   } catch (error) {
//     console.error('Failed to send message:', error)
//   }
// }

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

const conversations = ref<Conversation[]>([])

const fetchConversations = async () => {
  try {
    const response = await fetch('http://localhost:3000/chat/list/chats')
    const data = await response.json()
    conversations.value = data
    // 如果有查询参数，选择对应对话
    if (route.query.id) {
      currentChatId.value = route.query.id as string
    }
    // 否则选择第一个对话
    else if (data.length > 0) {
      currentChatId.value = data[0].id
    }

    if (currentChatId.value) {
      await fetchChatMessages()
    }
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
  }
}

const switchConversation = async (id: string) => {
  // 使用查询参数切换对话，这样可以将对话 ID 保存在 URL 中
  await router.push({ query: { id } })
}

// 监听查询参数变化
watch(
  () => route.query.id,
  async (newId) => {
    if (newId) {
      currentChatId.value = newId as string
      await fetchChatMessages()
    }
  }
)

onMounted(() => {
  fetchConversations()
})
</script>

<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>Chat</h1>
      </div>
      <nav class="sidebar-nav">
        <button class="new-chat-btn" @click="createConversation">
          <span class="icon">+</span>
          新对话
        </button>
        <div class="conversation-list">
          <div v-for="conv in conversations" :key="conv.id"
            :class="['conversation-item', { active: currentChatId === conv.id }]" @click="switchConversation(conv.id)">
            {{ conv.title }}
          </div>
        </div>
      </nav>
    </aside>

    <main class="main-content">
      <div class="chat-container">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else class="messages">
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
            <div class="message-content">
              <span class="avatar">{{ message.role === 'bot' ? 'AI' : 'You' }}</span>
              <div class="content">{{ message.content }}</div>
            </div>
            <div v-if="message.memoryAccess" class="memory-access">
              <div class="memory-type">
                Memory {{ message.memoryAccess.type }}
                <span v-if="message.memoryAccess.status" class="status">
                  ({{ message.memoryAccess.status }})
                </span>
              </div>
              <div v-if="message.memoryAccess.status === 'pending'" class="actions">
                <button @click="handleApprove" class="approve">Approve</button>
                <button @click="handleReject" class="reject">Reject</button>
              </div>
            </div>
          </div>
        </div>
        <div class="input-container" v-if="memoryAccessRejected">
          <textarea v-model="newMessage" @keydown.enter.prevent="sendMessage" placeholder="输入消息..." rows="1"
            class="message-input"></textarea>
          <button @click="sendMessage" class="send-button" :disabled="!newMessage.trim()">
            发送
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
}

.sidebar {
  height: 100vh;
  width: 260px;
  background-color: #202123;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  padding-bottom: 0;
  padding-bottom: 0;


}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #4a4b4d;
  padding-bottom: 0;
  padding-bottom: 0;
}

.sidebar-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.sidebar-nav {
  /* padding: 1rem 0.5rem; */
}

.new-chat-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #343541;
  border: 1px solid #565869;
  border-radius: 0.375rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-chat-btn:hover {
  background-color: #40414f;
}

.new-chat-btn .icon {
  font-size: 1.25rem;
}

.main-content {
  flex: 1;
  background-color: #343541;
  position: relative;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ececf1;
  gap: 1rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #ececf1;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.messages {
  overflow-y: auto;
  padding: 1rem 0;
  display: flex;
  height: 80vh;
  flex-direction: column;
  gap: 1.5rem;
}

.message {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  transition: background-color 0.2s;
}

.message:hover {
  background-color: #40414f;
}

.message-content {
  display: flex;
  gap: 1rem;
  color: #ececf1;
}

.avatar {
  width: 30px;
  height: 30px;
  background-color: #5436da;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.message.user .avatar {
  background-color: #10a37f;
}

.content {
  flex: 1;
  line-height: 1.5;
}

.memory-access {
  margin-top: 0.75rem;
  margin-left: 2.75rem;
  font-size: 0.875rem;
  color: #acacbe;
}

.memory-type {
  margin-bottom: 0.5rem;
}

.status {
  font-style: italic;
  color: #8e8ea0;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.approve,
.reject {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.approve {
  background-color: #10a37f;
  color: white;
}

.reject {
  background-color: #ef4444;
  color: white;
}

.approve:hover,
.reject:hover {
  opacity: 0.9;
}

.conversation-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  max-height: calc(100vh - 120px);
}

.conversation-item {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #ececf1;
  font-size: 0.875rem;
  line-height: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-item:hover {
  background-color: #343541;
}

.conversation-item.active {
  background-color: #343541;
  border: 1px solid #565869;
}

.input-container {
  border-top: 1px solid #40414f;
  padding: 1rem;
  position: relative;
  background-color: #343541;
}

.message-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  background-color: #40414f;
  border: 1px solid #565869;
  border-radius: 0.75rem;
  color: #ececf1;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #10a37f;
}

.send-button {
  position: absolute;
  right: 1.5rem;
  bottom: 1.75rem;
  background-color: transparent;
  border: none;
  color: #ececf1;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.send-button:hover {
  color: #10a37f;
}

.send-button:disabled {
  color: #565869;
  cursor: not-allowed;
}
</style>