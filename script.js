// ============================================
// 幸福食光餐廳 script.js
// 購物車 + Gmail 聯絡表單 + 讀取 HTML 的 AI 客服
// ============================================

// ---------- 1. 購物車 ----------
let cart = [];

const cartItems = document.getElementById("cart-items");
const totalPrice = document.getElementById("total-price");
const cartMessage = document.getElementById("cart-message");
const clearCartButton = document.getElementById("clear-cart");
const checkoutButton = document.getElementById("checkout");

function updateCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-cart";
        emptyMessage.textContent = "目前還沒有選擇餐點。";
        cartItems.appendChild(emptyMessage);
    } else {
        cart.forEach((item, index) => {
            const li = document.createElement("li");

            const name = document.createElement("span");
            name.className = "cart-item-name";
            name.textContent = `${item.name} × ${item.quantity}`;

            const price = document.createElement("span");
            price.className = "cart-item-price";
            price.textContent = `NT$ ${(item.price * item.quantity).toLocaleString("zh-TW")}`;

            const removeButton = document.createElement("button");
            removeButton.className = "remove-item";
            removeButton.type = "button";
            removeButton.textContent = "移除";
            removeButton.addEventListener("click", () => {
                cart.splice(index, 1);
                updateCart();
                cartMessage.textContent = "已移除餐點。";
            });

            li.append(name, price, removeButton);
            cartItems.appendChild(li);
        });
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPrice.textContent = `NT$ ${total.toLocaleString("zh-TW")}`;
}

document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        if (!name || !Number.isFinite(price) || price < 0) {
            cartMessage.textContent = "餐點資料有誤，請聯繫店家。";
            return;
        }

        const existingItem = cart.find(item => item.name === name && item.price === price);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        updateCart();
        cartMessage.textContent = `已將「${name}」加入購物車！`;
    });
});

clearCartButton.addEventListener("click", () => {
    cart = [];
    updateCart();
    cartMessage.textContent = "購物車已清空。";
});

checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
        cartMessage.textContent = "請先選擇至少一項餐點。";
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const details = cart.map(item =>
        `${item.name} × ${item.quantity}：NT$ ${(item.price * item.quantity).toLocaleString("zh-TW")}`
    ).join("\n");

    alert(
        `訂購內容：\n${details}\n\n總金額：NT$ ${total.toLocaleString("zh-TW")}` +
        "\n\n這是前端示範，尚未真正建立或送出訂單。"
    );
});

// ---------- 2. Gmail 聯絡表單 ----------
const emailInput = document.getElementById("customer-email");
const emailMessage = document.getElementById("email-message");
const contactForm = document.getElementById("contact-form");
const contactMessage = document.getElementById("contact-message");

// 請改成餐廳實際收件 Gmail
const restaurantEmail = "yourrestaurant@gmail.com";

function checkGmail() {
    const email = emailInput.value.trim();

    if (!email) {
        emailMessage.textContent = "";
        return false;
    }

    // 修正原始程式碼中被 HTML/Markdown 破壞的正規表示式
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

    if (!gmailPattern.test(email)) {
        emailMessage.textContent = "請輸入正確的 Gmail 信箱，例如 example@gmail.com。";
        emailMessage.style.color = "#b33c32";
        return false;
    }

    emailMessage.textContent = "Gmail 格式正確。";
    emailMessage.style.color = "#397345";
    return true;
}

emailInput.addEventListener("input", checkGmail);

contactForm.addEventListener("submit", event => {
    event.preventDefault();

    const customerName = document.getElementById("customer-name").value.trim();
    const customerEmail = emailInput.value.trim();
    const customerText = document.getElementById("customer-message").value.trim();

    if (!customerName || !customerEmail || !customerText) {
        contactMessage.textContent = "請填寫所有欄位。";
        return;
    }

    if (!checkGmail()) {
        contactMessage.textContent = "請先修正 Gmail 信箱格式。";
        return;
    }

    if (restaurantEmail === "yourrestaurant@gmail.com") {
        contactMessage.textContent = "請先在 script.js 設定餐廳真正使用的 Gmail。";
        return;
    }

    const subject = "幸福食光餐廳－顧客留言";
    const body =
        `顧客姓名：${customerName}\n` +
        `顧客 Gmail：${customerEmail}\n\n` +
        `留言內容：\n${customerText}`;

    const gmailUrl =
        "https://mail.google.com/mail/?view=cm&fs=1" +
        `&to=${encodeURIComponent(restaurantEmail)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    contactMessage.textContent = "已開啟 Gmail 寄信頁面，請確認內容後按下寄送。";
});

// ---------- 3. LM Studio AI 客服 ----------
const LM_STUDIO_URL = "http://localhost:1234/v1";
const LM_STUDIO_API_KEY = ""; // 若 LM Studio 有設定 API Token，請填入

const aiForm = document.getElementById("ai-chat-form");
const aiInput = document.getElementById("ai-user-input");
const aiChatBox = document.getElementById("ai-chat-box");
const aiSendButton = document.getElementById("ai-send-button");
const aiStatus = document.getElementById("ai-status");

let aiHistory = [];
let aiBusy = false;

const FALLBACK_ANSWER = "目前幸福食光網站資料不足，請聯繫業主確認。";

function addAIMessage(message, type) {
    const p = document.createElement("p");
    p.textContent = message;
    p.className = type;
    aiChatBox.appendChild(p);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
    return p;
}

// 每次提問時，直接從目前 HTML 擷取網站資料
function getWebsiteKnowledge() {
    const about = document.querySelector("#about")?.innerText.trim() || "";

    const menu = [...document.querySelectorAll("#menu .menu-card")].map(card => {
        const name = card.querySelector("h3")?.innerText.trim() || "";
        const description = card.querySelector(".menu-content p")?.innerText.trim() || "";
        const button = card.querySelector(".add-to-cart");
        const price = Number(button?.dataset.price);
        const buttonName = button?.dataset.name?.trim() || "";

        // 菜名、價格或按鈕資料不完整時，不把該項列為有效菜單
        if (!name || !buttonName || name !== buttonName || !Number.isFinite(price)) {
            return null;
        }

        return { name, description, price };
    }).filter(Boolean);

    const info = [...document.querySelectorAll("#info .info-card")].map(card => ({
        title: card.querySelector("h3")?.innerText.trim() || "",
        content: [...card.querySelectorAll("p")]
            .map(p => p.innerText.trim())
            .filter(Boolean)
            .join("；")
    })).filter(item => item.title && item.content);

    return { about, menu, info };
}

function buildKnowledgeContext() {
    const knowledge = getWebsiteKnowledge();

    const menuText = knowledge.menu.length
        ? knowledge.menu.map(item =>
            `- ${item.name}：NT$ ${item.price}；介紹：${item.description || "網站未提供介紹"}`
        ).join("\n")
        : "網站目前沒有可確認的有效菜單資料。";

    const infoText = knowledge.info.length
        ? knowledge.info.map(item => `- ${item.title}：${item.content}`).join("\n")
        : "網站目前沒有營業資訊資料。";

    return `
【幸福食光網站目前提供的資料】
餐廳介紹：
${knowledge.about || "網站未提供餐廳介紹。"}

菜單：
${menuText}

營業及聯絡資訊：
${infoText}

【回答限制】
1. 只能把上述資料當作幸福食光餐廳的事實依據。
2. 不得自行增加菜色、價格、折扣、食材、過敏原、地址、電話、付款方式、外送方式或訂位規則。
3. 若顧客詢問的內容在資料中沒有明確答案，必須直接回答：「${FALLBACK_ANSWER}」
4. 餐廳地址若顯示「請在此填入餐廳實際地址」，代表地址尚未設定，不能把這句當成實際地址。
5. 可以根據已知菜單價格計算預算組合；計算時必須正確列出餐點與總額。
6. 不可聲稱已經完成訂餐、付款、訂位或送出訂單。網站目前只有前端購物車示範。
7. 使用繁體中文，親切、簡潔回答。
`;
}

async function getLMStudioModel() {
    const headers = {};
    if (LM_STUDIO_API_KEY) {
        headers.Authorization = `Bearer ${LM_STUDIO_API_KEY}`;
    }

    const response = await fetch(`${LM_STUDIO_URL}/models`, { headers });

    if (!response.ok) {
        throw new Error("無法取得模型，請檢查 LM Studio API 設定。");
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
        throw new Error("LM Studio 尚未載入模型。");
    }

    return data.data[0].id;
}

aiForm.addEventListener("submit", async event => {
    event.preventDefault();

    const question = aiInput.value.trim();
    if (!question || aiBusy) return;

    aiBusy = true;
    aiSendButton.disabled = true;
    aiStatus.textContent = "幸福食光 AI 正在查詢網站資料…";

    addAIMessage(`你：${question}`, "user-message");
    aiInput.value = "";

    const loading = addAIMessage("AI：正在整理網站資料…", "assistant-message");

    try {
        const knowledgeContext = buildKnowledgeContext();
        const model = await getLMStudioModel();

        const headers = { "Content-Type": "application/json" };
        if (LM_STUDIO_API_KEY) {
            headers.Authorization = `Bearer ${LM_STUDIO_API_KEY}`;
        }

        const response = await fetch(`${LM_STUDIO_URL}/chat/completions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "system",
                        content: `你是幸福食光餐廳的官方 AI 客服與點餐助理。\n${knowledgeContext}`
                    },
                    ...aiHistory,
                    { role: "user", content: question }
                ],
                temperature: 0.1,
                max_tokens: 800,
                stream: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "LM Studio 回應錯誤。");
        }

        const answer = data.choices?.[0]?.message?.content?.trim();
        if (!answer) throw new Error("AI 沒有產生回答。");

        loading.textContent = `AI：${answer}`;

        aiHistory.push(
            { role: "user", content: question },
            { role: "assistant", content: answer }
        );
        aiHistory = aiHistory.slice(-10);

        aiStatus.textContent = "幸福食光 AI 已準備好繼續服務！";
    } catch (error) {
        loading.textContent = `AI 連線失敗：${error.message}`;
        aiStatus.textContent = "請確認 LM Studio 已啟動、模型已載入，且 Local Server 已開啟。";
    } finally {
        aiBusy = false;
        aiSendButton.disabled = false;
        aiInput.focus();
    }
});
