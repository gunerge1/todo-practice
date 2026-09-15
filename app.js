// ===== 待办清单核心逻辑 =====
// 数据目前存在浏览器的 localStorage 里（只存在于你这台电脑的浏览器中）
// Day 4 会把它换成云数据库 Supabase，到那时任何设备都能看到同一份数据

const STORAGE_KEY = "todos

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const count = document.getElementById("todo-count");

// 保存数据
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 把数据画到页面上
function render() {
  list.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = todo.done ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.onchange = () => toggle(index);

    const text = document.createElement("span");
    text.textContent = todo.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "删除";
    del.onclick = () => remove(index);

    li.append(checkbox, text, del);
    list.appendChild(li);
  });

  const left = todos.filter((t) => !t.done).length;
  count.textContent = `共 ${todos.length} 项，还有 ${left} 项没完成`;
}

// 添加一条待办
form.addEventListener("submit", (e) => {
  e.preventDefault(); // 阻止表单默认的刷新页面行为
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text: text, done: false, created_at: new Date().toISOString() });
  input.value = "";
  save();
  render();
});

// 勾选 / 取消勾选
function toggle(index) {
  todos[index].done = !todos[index].done;
  save();
  render();
}

// 删除一条待办
function remove(index) {
  todos.splice(index, 1);
  save();
  render();
}

// 页面打开时先渲染一次
render();
