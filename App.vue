<script setup>
import { ref, computed, watch } from 'vue'

// ref：響應式資料
const newTodo = ref('')
const filter = ref('all')
const todos = ref(JSON.parse(localStorage.getItem('todos') || '[]'))

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'done', label: '已完成' },
]

// computed：統計數字
const doneCount = computed(() => todos.value.filter(t => t.done).length)
const remaining = computed(() => todos.value.length - doneCount.value)
const percent = computed(() =>
  todos.value.length ? Math.round((doneCount.value / todos.value.length) * 100) : 0
)

// computed：依篩選條件顯示清單
const filteredTodos = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.done)
  if (filter.value === 'done') return todos.value.filter(t => t.done)
  return todos.value
})

const emptyText = computed(() =>
  todos.value.length ? '這個分類沒有項目。' : '還沒有待辦事項，先新增一件吧。'
)

function addTodo() {
  const text = newTodo.value.trim()
  if (!text) return
  todos.value.push({ id: Date.now(), text, done: false })
  newTodo.value = ''
}

function removeTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}

function clearDone() {
  todos.value = todos.value.filter(t => !t.done)
}

// 資料變動時存進瀏覽器，重新整理後不會消失
watch(todos, v => localStorage.setItem('todos', JSON.stringify(v)), { deep: true })
</script>

<template>
  <main class="page">
    <section class="card">
      <header class="head">
        <div>
          <h1>待辦清單</h1>
          <p class="sub">寫下要做的事，完成就打勾。</p>
        </div>
        <div class="percent">{{ percent }}<small>%</small></div>
      </header>

      <!-- 進度條 -->
      <div class="track" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
        <div class="fill" :style="{ width: percent + '%' }"></div>
      </div>
      <p class="count">已完成 {{ doneCount }} / {{ todos.length }} 件</p>

      <!-- v-model 綁定輸入欄位 -->
      <div class="add">
        <input v-model="newTodo" @keyup.enter="addTodo" placeholder="輸入待辦事項後按 Enter" />
        <button class="primary" @click="addTodo">新增</button>
      </div>

      <div class="filters">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          :class="{ active: filter === f.value }"
          @click="filter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <ul v-if="filteredTodos.length">
        <li v-for="todo in filteredTodos" :key="todo.id" :class="{ done: todo.done }">
          <input type="checkbox" v-model="todo.done" :aria-label="'完成：' + todo.text" />
          <span>{{ todo.text }}</span>
          <button class="del" @click="removeTodo(todo.id)" aria-label="刪除">✕</button>
        </li>
      </ul>
      <div v-else class="empty">{{ emptyText }}</div>

      <footer class="footer">
        <span>還剩 {{ remaining }} 件未完成</span>
        <button v-if="doneCount" class="ghost" @click="clearDone">清除已完成</button>
      </footer>
    </section>
  </main>
</template>

<!-- 全域樣式：深色背景，並覆蓋 Vite 預設的版面設定 -->
<style>
body {
  display: block;
  margin: 0;
  min-height: 100vh;
  background: #16342d;
}
#app {
  max-width: none;
  margin: 0;
  padding: 0;
  display: block;
}
</style>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding: 56px 20px;
  background:
    radial-gradient(circle at 15% 10%, #21493f 0, transparent 45%),
    radial-gradient(circle at 90% 90%, #0f2621 0, transparent 50%),
    #16342d;
}

.card {
  width: min(500px, 100%);
  padding: 32px;
  background: #fbf7ee;
  border-radius: 22px;
  color: #1f2a26;
  font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
}

.head { display: flex; justify-content: space-between; align-items: flex-start; }
h1 { margin: 0; font-size: 1.7rem; letter-spacing: 0.02em; }
.sub { margin: 6px 0 0; color: #6f7a74; font-size: 0.9rem; }
.percent { font-size: 2.8rem; font-weight: 700; line-height: 1; color: #e2703a; }
.percent small { font-size: 1.1rem; margin-left: 2px; }

.track { height: 12px; margin-top: 22px; background: #e8e1d0; border-radius: 6px; overflow: hidden; }
.fill { height: 100%; background: linear-gradient(90deg, #f0a35c, #e2703a); border-radius: 6px; transition: width 0.35s ease; }
.count { margin: 8px 0 0; font-size: 0.85rem; color: #6f7a74; }

.add { display: flex; gap: 10px; margin: 24px 0 16px; }
.add input {
  flex: 1;
  padding: 12px 14px;
  font-size: 1rem;
  color: #1f2a26;
  background: #fff;
  border: 2px solid #e3dcc9;
  border-radius: 12px;
  transition: border-color 0.2s;
}
.add input:focus-visible { outline: none; border-color: #e2703a; }

button { font-family: inherit; cursor: pointer; }
button:focus-visible { outline: 3px solid #f0a35c; outline-offset: 2px; }

.primary {
  padding: 12px 22px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: #e2703a;
  border: none;
  border-radius: 12px;
  transition: background 0.2s;
}
.primary:hover { background: #c95a27; }

.filters { display: flex; gap: 8px; margin-bottom: 8px; }
.filters button {
  padding: 6px 14px;
  font-size: 0.85rem;
  color: #6f7a74;
  background: transparent;
  border: 1.5px solid #e3dcc9;
  border-radius: 999px;
}
.filters button:hover { border-color: #16342d; color: #16342d; }
.filters button.active { color: #fff; background: #16342d; border-color: #16342d; }

ul { list-style: none; margin: 0; padding: 0; }
li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 4px;
  border-bottom: 1px solid #ece5d4;
}
li input[type='checkbox'] { width: 20px; height: 20px; accent-color: #e2703a; cursor: pointer; }
li span { flex: 1; word-break: break-all; }
li.done span { color: #a2a89f; text-decoration: line-through; }

.del {
  width: 30px;
  height: 30px;
  color: #b6b09f;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: background 0.2s, color 0.2s;
}
.del:hover { color: #c4472f; background: #f6e3dc; }

.empty { padding: 28px 0; text-align: center; color: #8b948d; }

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
  font-size: 0.85rem;
  color: #6f7a74;
}
.ghost {
  padding: 6px 14px;
  font-size: 0.85rem;
  color: #6f7a74;
  background: transparent;
  border: 1.5px solid #e3dcc9;
  border-radius: 999px;
}
.ghost:hover { color: #c4472f; border-color: #c4472f; }

@media (prefers-reduced-motion: reduce) {
  .fill, .primary, .add input, .del { transition: none; }
}
</style>