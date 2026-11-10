
<template>
  <section class="holiday-container">
    <h2>🎉 今天放不放假？</h2>

    <div class="today-card">
      <p class="date">{{ todayDate }}</p>

      <div
        class="status"
        :class="isHoliday ? 'holiday' : 'workday'"
      >
        {{ isHoliday ? '今天放假' : '今天上班' }}
      </div>

      <p v-if="description" class="description">
        🎊 {{ description }}
      </p>
    </div>

    <h3>📅 查詢其他日期</h3>

    <div class="search-area">
      <input
        type="date"
        v-model="selectedDate"
      >
      <button @click="searchDate">查詢</button>
    </div>

    <p v-if="loading" class="loading">
      資料載入中...
    </p>

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <div v-if="queryResult" class="query-result">
      <strong>{{ queryResult.date }}</strong>
      <div
        class="status"
        :class="queryResult.isHoliday ? 'holiday' : 'workday'"
      >
        {{ queryResult.isHoliday ? '今天放假' : '今天上班' }}
      </div>
      <p>{{ queryResult.description }}</p>
    </div>

    <h3>🏖️ 接下來 5 個放假日</h3>

    <ul class="holiday-list">
      <li v-for="day in nextHolidays" :key="day.date">
        <div>
          <strong>{{ day.description || '例假日' }}</strong>
          <p>{{ formatDisplayDate(day.date) }}</p>
        </div>
        <span class="countdown">
          還有 {{ day.days }} 天
        </span>
      </li>
    </ul>

    <p class="source">
      資料來源：
      <a
        href="https://github.com/ruyut/TaiwanCalendar"
        target="_blank"
        rel="noopener noreferrer"
      >ruyut/TaiwanCalendar</a>
      <br>
      原始資料為行政院人事行政總處辦公日曆表
      （政府資料開放平臺）
    </p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const today = new Date()

const todayDate = ref('')
const isHoliday = ref(false)
const description = ref('')

const selectedDate = ref(formatInputDate(today))
const queryResult = ref(null)

const nextHolidays = ref([])
const loading = ref(false)
const error = ref('')

const cache = {}

function formatInputDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDate(date) {
  return formatInputDate(date).replaceAll('-', '')
}

function parseCalendarDate(value) {
  return new Date(
    Number(value.slice(0, 4)),
    Number(value.slice(4, 6)) - 1,
    Number(value.slice(6, 8))
  )
}

function formatDisplayDate(value) {
  return parseCalendarDate(value).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function daysBetween(a, b) {
  const first = Date.UTC(
    a.getFullYear(), a.getMonth(), a.getDate()
  )
  const second = Date.UTC(
    b.getFullYear(), b.getMonth(), b.getDate()
  )
  return Math.round((second - first) / 86400000)
}

async function loadCalendar(year) {
  if (cache[year]) return cache[year]

  const urls = [
    `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`,
    `https://raw.githubusercontent.com/ruyut/TaiwanCalendar/master/data/${year}.json`
  ]

  let lastError

  for (const url of urls) {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('日曆資料格式錯誤')
      }

      cache[year] = data
      return data
    } catch (e) {
      lastError = e
    }
  }

  throw new Error(
    `${year} 年資料載入失敗：${lastError?.message || '未知錯誤'}`
  )
}

async function searchDate() {
  loading.value = true
  error.value = ''
  queryResult.value = null

  try {
    if (!selectedDate.value) {
      throw new Error('請先選擇日期')
    }

    const [y, m, d] = selectedDate.value.split('-').map(Number)
    const date = new Date(y, m - 1, d)

    const data = await loadCalendar(y)
    const result = data.find(item => item.date === formatDate(date))

    if (!result) {
      throw new Error('查無該日期資料')
    }

    queryResult.value = {
      date: formatDisplayDate(result.date),
      isHoliday: result.isHoliday,
      description: result.description || ''
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadNextHolidays() {
  const currentYear = today.getFullYear()
  const todayString = formatDate(today)

  let holidays = []

  // 先取得今年及之後年度的資料，直到有足夠的五個假日
  for (let year = currentYear; holidays.length < 5 && year <= currentYear + 5; year++) {
    const data = await loadCalendar(year)

    const yearHolidays = data.filter(item =>
      item.isHoliday &&
      item.date > todayString
    )

    holidays.push(...yearHolidays)
    holidays.sort((a, b) => a.date.localeCompare(b.date))
  }

  nextHolidays.value = holidays.slice(0, 5).map(item => ({
    ...item,
    days: daysBetween(today, parseCalendarDate(item.date))
  }))
}

async function init() {
  loading.value = true
  error.value = ''

  try {
    const data = await loadCalendar(today.getFullYear())
    const todayData = data.find(item => item.date === formatDate(today))

    if (!todayData) {
      throw new Error('查無今天的日曆資料')
    }

    todayDate.value = formatDisplayDate(todayData.date)
    isHoliday.value = todayData.isHoliday
    description.value = todayData.description || ''

    await loadNextHolidays()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(init)
</script>

<style scoped>
.holiday-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 5px 25px rgba(0,0,0,.08);
}

.holiday-container h2,
.holiday-container h3 {
  text-align: center;
  color: #333;
}

.today-card {
  text-align: center;
  padding: 30px 15px;
  background: #f8f9fa;
  border-radius: 16px;
  margin: 20px 0;
}

.date {
  color: #777;
  font-size: 18px;
}

.status {
  font-size: clamp(38px, 8vw, 60px);
  font-weight: 900;
  margin: 15px 0;
}

.holiday {
  color: #f28c28;
}

.workday {
  color: #20a464;
}

.description {
  font-size: 20px;
  color: #666;
}

.search-area {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.search-area input,
.search-area button {
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
}

.search-area button {
  border: none;
  background: #3679d8;
  color: white;
  cursor: pointer;
}

.loading {
  text-align: center;
  color: #777;
}

.error {
  color: #d93025;
  background: #fff0f0;
  padding: 12px;
  border-radius: 8px;
}

.query-result {
  text-align: center;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 12px;
}

.holiday-list {
  list-style: none;
  padding: 0;
}

.holiday-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 15px;
  margin: 10px 0;
  background: #fff8ef;
  border-left: 5px solid #f28c28;
  border-radius: 8px;
}

.holiday-list p {
  margin: 5px 0 0;
  color: #777;
}

.countdown {
  color: #ed8420;
  font-weight: bold;
  white-space: nowrap;
}

.source {
  text-align: center;
  margin-top: 30px;
  color: #999;
  font-size: 13px;
  line-height: 1.8;
}

.source a {
  color: #3679d8;
}

@media (max-width: 480px) {
  .holiday-container {
    padding: 20px 14px;
  }
}
</style>
