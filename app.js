// ===== 待办清单核心逻辑（云数据库版·零依赖直连） =====
// 不加载任何外部库：直接用浏览器原生的 fetch 和 Supabase 的 REST API 对话
// 好处：不怕CDN抽风、不怕预览沙箱限制storage、少一个依赖少一个故障点
// 出问题时：F12 看 Console 红字 + Network 标签看请求状态码

const API = SUPABASE_URL + "/rest/v1/todos";
const HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": "Bearer " + SUPABASE_KEY,
  "Content-Type": "application/json",
};

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const count = document.getElementById("todo-count");

// 把数据画到页面上
function render(todos) {
  list.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = todo.done ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.onchange = () => toggle(todo);

    const text = document.createElement("span");
    text.textContent = todo.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "删除";
    del.onclick = () => remove(todo);

    li.append(checkbox, text, del);
    list.appendChild(li);
  });

  const left = todos.filter((t) => !t.done).length;
  count.textContent = `共 ${todos.length} 项，还有 ${left} 项没完成`;
}

// 统一处理响应：出问题就把服务器的话打到Console
async function request(url, options) {
  const resp = await fetch(url, options);
  if (!resp.ok) {
    const body = await resp.text();
    console.error(`数据库操作失败 HTTP ${resp.status}:`, body);
    count.textContent = `⚠️ 数据库操作失败(HTTP ${resp.status})，按F12看Console`;
    return null;
  }
  return resp;
}

// 读取：GET /todos?select=*&order=id.asc
async function load() {
  const resp = await request(API + "?select=*&order=id.asc", { headers: HEADERS });
  if (!resp) return;
  render(await resp.json());
}

// 添加：POST，请求体是新待办的JSON
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // 阻止表单默认的刷新页面行为
  const text = input.value.trim();
  if (!text) return;
  const resp = await request(API, {
    method: "POST",
    headers: { ...HEADERS, "Prefer": "return=minimal" },
    body: JSON.stringify({ text: text, done: false }),
  });
  if (!resp) return;
  input.value = "";
  load();
});

// 勾选/取消：PATCH ?id=eq.编号，请求体是新的done值
async function toggle(todo) {
  const resp = await request(API + "?id=eq." + todo.id, {
    method: "PATCH",
    headers: { ...HEADERS, "Prefer": "return=minimal" },
    body: JSON.stringify({ done: !todo.done }),
  });
  if (!resp) return;
  load();
}

// 删除：DELETE ?id=eq.编号
async function remove(todo) {
  const resp = await request(API + "?id=eq." + todo.id, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (!resp) return;
  load();
}

// 页面打开时从云端加载
load();
