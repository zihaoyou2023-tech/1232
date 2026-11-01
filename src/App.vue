
<script setup>
import { ref, computed, nextTick } from 'vue'

import MenuCard from './components/MenuCard.vue'
import InfoCard from './components/InfoCard.vue'
import SectionLayout from './components/SectionLayout.vue'

// =====================================
// 1. 原本的六道餐點
// =====================================
const menuItems = [
  {
    title: '義式披薩',
    content: '香濃起司搭配新鮮配料。',
    price: 250,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '日式拉麵',
    content: '濃郁湯頭搭配彈牙麵條。',
    price: 180,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '健康沙拉',
    content: '新鮮蔬菜搭配特製醬汁。',
    price: 150,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '經典漢堡',
    content: '多汁肉排搭配新鮮生菜。',
    price: 160,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '義大利麵',
    content: '濃郁醬汁與香氣十足的麵條。',
    price: 200,
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: '甜甜圈',
    content: '香甜鬆軟，為用餐畫下完美句點。',
    price: 80,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80'
  }
]

// =====================================
// 2. 原本的三筆營業資訊
// =====================================
const infoItems = [
  {
    title: '營業時間',
    content: '星期二至星期日\n上午 11:00－晚上 21:00\n最後點餐時間：20:30'
  },
  {
    title: '公休日',
    content: '每星期一公休\n特殊節日營業時間將另行公告。'
  },
  {
    title: '餐廳地址',
    content: '請在此填入餐廳實際地址。\n歡迎蒞臨幸福食光餐廳！'
  }
]

const aboutText =
  '幸福食光餐廳希望透過新鮮食材與用心料理，為每一位顧客帶來溫暖又美好的用餐體驗。不論是與家人聚餐、和朋友相聚，都能在這裡享受屬於自己的幸福時光。'

// =====================================
// 3. 購物車
// =====================================
const cart = ref([])
const cartMessage = ref('')

const totalPrice = computed(() =>
  cart.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
)

function formatPrice(value) {
  return `NT$ ${value.toLocaleString('zh-TW')}`
}

function addToCart(item) {
  if (
    !item.name ||
    !Number.isFinite(item.price) ||
    item.price < 0
  ) {
    cartMessage.value = '餐點資料有誤，請聯繫店家。'
    return
  }

  const existingItem = cart.value.find(
    current =>
      current.name === item.name &&
      current.price === item.price
  )

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.value.push({
      name: item.name,
      price: item.price,
      quantity: 1
    })
  }

  cartMessage.value = `已將「${item.name}」加入購物車！`
}

function removeFromCart(index) {
  cart.value.splice(index, 1)
  cartMessage.value = '已移除餐點。'
}

function clearCart() {
  cart.value = []
  cartMessage.value = '購物車已清空。'
}

function checkout() {
  if (cart.value.length === 0) {
    cartMessage.value = '請先選擇至少一項餐點。'
    return
  }

  const details = cart.value
    .map(item =>
      `${item.name} × ${item.quantity}：${formatPrice(item.price * item.quantity)}`
    )
    .join('\n')

  alert(
    `訂購內容：\n${details}\n\n` +
    `總金額：${formatPrice(totalPrice.value)}\n\n` +
    '這是前端示範，尚未真正建立或送出訂單。'
  )
}

// =====================================
// 4. Gmail 聯絡表單
// =====================================

// 請修改成餐廳真正使用的 Gmail
const restaurantEmail = 'zihaoyou2023@gmail.com'

const customerName = ref('')
const customerEmail = ref('')
const customerMessage = ref('')
const emailMessage = ref('')
const contactMessage = ref('')

const gmailPattern =
  /^[a-zA-Z0-9._%+-]+@gmail\.com$/i

function checkGmail() {
  const email = customerEmail.value.trim()

  if (!email) {
    emailMessage.value = ''
    return false
  }

  if (!gmailPattern.test(email)) {
    emailMessage.value =
      '請輸入正確的 Gmail 信箱，例如 example@gmail.com。'
    return false
  }

  emailMessage.value = 'Gmail 格式正確。'
  return true
}

function submitContact() {
  const name = customerName.value.trim()
  const email = customerEmail.value.trim()
  const message = customerMessage.value.trim()

  if (!name || !email || !message) {
    contactMessage.value = '請填寫所有欄位。'
    return
  }

  if (!checkGmail()) {
    contactMessage.value = '請先修正 Gmail 信箱格式。'
    return
  }

  if (restaurantEmail === 'yourrestaurant@gmail.com') {
    contactMessage.value =
      '請先在 App.vue 設定餐廳真正使用的 Gmail。'
    return
  }

  const subject = '幸福食光餐廳－顧客留言'

  const body =
    `顧客姓名：${name}\n` +
    `顧客 Gmail：${email}\n\n` +
    `留言內容：\n${message}`

  const gmailUrl =
    'https://mail.google.com/mail/?view=cm&fs=1' +
    `&to=${encodeURIComponent(restaurantEmail)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`

  window.open(gmailUrl, '_blank', 'noopener,noreferrer')

  contactMessage.value =
    '已開啟 Gmail 寄信頁面，請確認內容後按下寄送。'
}

// =====================================
// 5. LM Studio AI 點餐助理
// =====================================

const LM_STUDIO_URL = 'http://localhost:1234/v1'

// 如果 LM Studio 設定了 API Token，填在這裡
const LM_STUDIO_API_KEY = ''

const FALLBACK_ANSWER =
  '目前幸福食光網站資料不足，請聯繫業主確認。'

const aiInput = ref('')
const aiBusy = ref(false)
const aiStatus = ref('')
const aiChatBox = ref(null)

const aiMessages = ref([
  {
    type: 'assistant-message',
    text: 'AI：你好！我是幸福食光 AI 助理，可以幫你查詢網站上提供的餐點、價格及營業資訊。'
  }
])

let aiHistory = []

function buildKnowledgeContext() {
  const menuText = menuItems
    .map(item =>
      `- ${item.title}：NT$ ${item.price}；介紹：${item.content}`
    )
    .join('\n')

  const infoText = infoItems
    .map(item =>
      `- ${item.title}：${item.content.replace(/\n/g, '；')}`
    )
    .join('\n')

  return `
【幸福食光網站目前提供的資料】

餐廳介紹：
${aboutText}

菜單：
${menuText}

營業資訊：
${infoText}

【回答限制】
1. 只能把上述資料當作幸福食光餐廳的事實依據。
2. 不得自行增加菜色、價格、折扣、食材、過敏原、地址、電話、付款方式、外送方式或訂位規則。
3. 若顧客詢問的內容在資料中沒有明確答案，必須直接回答：「${FALLBACK_ANSWER}」
4. 餐廳地址尚未設定時，不可把提示文字當成實際地址。
5. 可以根據已知菜單價格計算預算組合，必須正確列出餐點及總額。
6. 不可聲稱已完成訂餐、付款、訂位或送出訂單。
7. 使用繁體中文，親切、簡潔回答。
`
}

function getHeaders(includeJson = false) {
  const headers = {}

  if (includeJson) {
    headers['Content-Type'] = 'application/json'
  }

  if (LM_STUDIO_API_KEY) {
    headers.Authorization = `Bearer ${LM_STUDIO_API_KEY}`
  }

  return headers
}

async function getLMStudioModel() {
  const response = await fetch(
    `${LM_STUDIO_URL}/models`,
    { headers: getHeaders() }
  )

  if (!response.ok) {
    throw new Error('無法取得模型，請檢查 LM Studio API 設定。')
  }

  const data = await response.json()

  if (!data.data || data.data.length === 0) {
    throw new Error('LM Studio 尚未載入模型。')
  }

  return data.data[0].id
}

async function scrollChatToBottom() {
  await nextTick()

  if (aiChatBox.value) {
    aiChatBox.value.scrollTop =
      aiChatBox.value.scrollHeight
  }
}

async function sendAIMessage() {
  const question = aiInput.value.trim()

  if (!question || aiBusy.value) return

  aiBusy.value = true
  aiStatus.value = '幸福食光 AI 正在查詢網站資料…'

  aiMessages.value.push({
    type: 'user-message',
    text: `你：${question}`
  })

  aiInput.value = ''

  const loadingMessage = {
    type: 'assistant-message',
    text: 'AI：正在整理網站資料…'
  }

  aiMessages.value.push(loadingMessage)
  await scrollChatToBottom()

  try {
    const model = await getLMStudioModel()

    const response = await fetch(
      `${LM_STUDIO_URL}/chat/completions`,
      {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                '你是幸福食光餐廳的官方 AI 客服與點餐助理。\n' +
                buildKnowledgeContext()
            },
            ...aiHistory,
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.1,
          max_tokens: 800,
          stream: false
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error?.message || 'LM Studio 回應錯誤。'
      )
    }

    const answer =
      data.choices?.[0]?.message?.content?.trim()

    if (!answer) {
      throw new Error('AI 沒有產生回答。')
    }

    loadingMessage.text = `AI：${answer}`

    aiHistory.push(
      { role: 'user', content: question },
      { role: 'assistant', content: answer }
    )

    aiHistory = aiHistory.slice(-10)

    aiStatus.value = '幸福食光 AI 已準備好繼續服務！'
  } catch (error) {
    loadingMessage.text =
      `AI 連線失敗：${error.message}`

    aiStatus.value =
      '請確認 LM Studio 已啟動、模型已載入，且 Local Server 已開啟。'
  } finally {
    aiBusy.value = false
    await scrollChatToBottom()
  }
}
</script>

<template>
  <div>
    <!-- 導覽列 -->
    <header class="header">
      <div class="logo">幸福食光餐廳</div>

      <nav>
        <a href="#home">首頁</a>
        <a href="#about">關於我們</a>
        <a href="#menu">美味菜單</a>
        <a href="#cart">購物車</a>
        <a href="#info">營業資訊</a>
        <a href="#contact">聯絡我們</a>
      </nav>
    </header>

    <main>
      <!-- 首頁 -->
      <section id="home" class="hero">
        <div class="hero-content">
          <p>用美食，收藏生活中的幸福</p>

          <h1>幸福食光餐廳</h1>

          <p>每一口美味，都是幸福的開始。</p>

          <a href="#menu" class="btn">
            看看美味菜單
          </a>
        </div>
      </section>

      <!-- 關於我們 -->
      <SectionLayout
        section-id="about"
        extra-class="about"
        title="關於我們"
      >
        <p>{{ aboutText }}</p>
      </SectionLayout>

      <!-- 美味菜單 -->
      <SectionLayout
        section-id="menu"
        title="美味菜單"
        content="挑選喜歡的餐點，加入購物車吧！"
      >
        <div class="menu-container">
          <MenuCard
            v-for="item in menuItems"
            :key="item.title"
            :title="item.title"
            :content="item.content"
            :image="item.image"
            :price="item.price"
            @add-to-cart="addToCart"
          />
        </div>
      </SectionLayout>

      <!-- 購物車 -->
      <SectionLayout
        section-id="cart"
        extra-class="cart-section"
        title="我的購物車"
      >
        <div class="cart-box">
          <ul id="cart-items">
            <li
              v-if="cart.length === 0"
              class="empty-cart"
            >
              目前還沒有選擇餐點。
            </li>

            <li
              v-for="(item, index) in cart"
              :key="`${item.name}-${item.price}`"
            >
              <span class="cart-item-name">
                {{ item.name }} × {{ item.quantity }}
              </span>

              <span class="cart-item-price">
                {{ formatPrice(item.price * item.quantity) }}
              </span>

              <button
                type="button"
                class="remove-item"
                @click="removeFromCart(index)"
              >
                移除
              </button>
            </li>
          </ul>

          <div class="cart-total">
            總金額：
            <span id="total-price">
              {{ formatPrice(totalPrice) }}
            </span>
          </div>

          <div class="cart-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="clearCart"
            >
              清空購物車
            </button>

            <button
              type="button"
              class="btn"
              @click="checkout"
            >
              確認訂購
            </button>
          </div>

          <p class="message" aria-live="polite">
            {{ cartMessage }}
          </p>
        </div>
      </SectionLayout>

      <!-- 營業資訊 -->
      <SectionLayout
        section-id="info"
        extra-class="info-section"
        title="營業資訊"
      >
        <div class="info-container">
          <InfoCard
            v-for="info in infoItems"
            :key="info.title"
            :title="info.title"
            :content="info.content"
          />
        </div>
      </SectionLayout>

      <!-- 聯絡我們 -->
      <SectionLayout
        section-id="contact"
        extra-class="contact-section"
        title="聯絡我們"
        content="有任何問題或建議，歡迎填寫以下表單。"
      >
        <form
          id="contact-form"
          @submit.prevent="submitContact"
        >
          <label for="customer-name">姓名</label>

          <input
            id="customer-name"
            v-model="customerName"
            type="text"
            placeholder="請輸入姓名"
            required
          >

          <label for="customer-email">
            Gmail 信箱
          </label>

          <input
            id="customer-email"
            v-model="customerEmail"
            type="email"
            placeholder="example@gmail.com"
            required
            @input="checkGmail"
          >

          <small
            :class="{
              'email-valid':
                emailMessage === 'Gmail 格式正確。'
            }"
            aria-live="polite"
          >
            {{ emailMessage }}
          </small>

          <label for="customer-message">
            留言內容
          </label>

          <textarea
            id="customer-message"
            v-model="customerMessage"
            rows="5"
            placeholder="請輸入您的問題或建議"
            required
          ></textarea>

          <button type="submit" class="btn">
            使用 Gmail 寄送
          </button>

          <p class="message" aria-live="polite">
            {{ contactMessage }}
          </p>
        </form>
      </SectionLayout>

      <!-- AI 點餐助理 -->
      <section id="ai-assistant">
        <h2>🤖 幸福食光 AI 點餐助理</h2>

        <p>
          不知道吃什麼嗎？讓 AI 根據本網站的菜單與營業資訊幫你推薦！
        </p>

        <div
          id="ai-chat-box"
          ref="aiChatBox"
          aria-live="polite"
        >
          <p
            v-for="(message, index) in aiMessages"
            :key="index"
            :class="message.type"
          >
            {{ message.text }}
          </p>
        </div>

        <form
          id="ai-chat-form"
          @submit.prevent="sendAIMessage"
        >
          <input
            id="ai-user-input"
            v-model="aiInput"
            type="text"
            placeholder="例如：推薦我 200 元以內的餐點"
            :disabled="aiBusy"
            required
          >

          <button
            id="ai-send-button"
            type="submit"
            :disabled="aiBusy"
          >
            {{ aiBusy ? '查詢中…' : '詢問 AI' }}
          </button>
        </form>

        <p id="ai-status" aria-live="polite">
          {{ aiStatus }}
        </p>
      </section>
    </main>

    <!-- 頁尾 -->
    <footer class="footer">
      <p>
        © 2026 幸福食光餐廳｜用心料理，分享幸福
      </p>
    </footer>
  </div>
</template>
