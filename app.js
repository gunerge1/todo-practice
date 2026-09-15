// ===== 待办清单核心逻辑（云数据库版） =====
// 数据存储在 Supabase 云数据库：任何设备、任何浏览器，访问的都是同一份数据
// （之前 localStorage 里的旧练习数据不迁移，反正是测试数据）
// 出问题时：按 F12 看 Console 的红色报错 —— 老规矩，报错是地址不是乱码

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

// 从云数据库读取全部待办
async function load() {
  const { data, error } = await client.from("todos").select("*").order("id", { ascending: true });
  if (error) {
    console.error("读取数据库失败:", error.message);
    count.textContent = "⚠️ 读取数据库失败，按F12看Console报错";
    return;
  }
  render(data);
}

// 添加一条待办（写进云端）
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // 阻止表单默认的刷新页面行为
  const text = input.value.trim();
  if (!text) return;
  const { error } = await client.from("todos").insert({ text: text, done: false });
  if (error) {
    console.error("写入失败:", error.message);
    return;
  }
  input.value = "";
  load();
});

// 勾选 / 取消勾选（更新云端）
async function toggle(todo) {
  const { error } = await client.from("todos").update({ done: !todo.done }).eq("id", todo.id);
  if (error) {
    console.error("更新失败:", error.message);
    return;
  }
  load();
}

// 删除一条待办（从云端删）
async function remove(todo) {
  const { error } = await client.from("todos").delete().eq("id", todo.id);
  if (error) {
    console.error("删除失败:", error.message);
    return;
  }
  load();
}

// 页面打开时从云端加载
load();
