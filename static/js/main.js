/* ── Dev Dashboard — main.js ─────────────────────────────────────────────── */

// ── State ──────────────────────────────────────────────────────────────────
let todos = [];
let nextId = 100;
let quotesRead = 0;

// ── Clock ──────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById("live-clock").textContent =
    now.toLocaleTimeString("en-US", { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// Footer date
document.getElementById("footer-date").textContent =
  new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// ── Weather ────────────────────────────────────────────────────────────────
const WEATHER_ICONS = {
  clear: "☀️", cloudy: "☁️", partly: "⛅", rain: "🌧️",
  snow: "❄️", thunder: "⛈️", fog: "🌫️", night: "🌙",
};

function weatherCodeToIcon(code, isDay) {
  if (!isDay) return WEATHER_ICONS.night;
  if (code === 0) return WEATHER_ICONS.clear;
  if (code <= 2) return WEATHER_ICONS.partly;
  if (code === 3) return WEATHER_ICONS.cloudy;
  if (code <= 49) return WEATHER_ICONS.fog;
  if (code <= 67) return WEATHER_ICONS.rain;
  if (code <= 77) return WEATHER_ICONS.snow;
  if (code <= 82) return WEATHER_ICONS.rain;
  return WEATHER_ICONS.thunder;
}

async function loadWeather() {
  try {
    const res = await fetch("/api/weather");
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    document.getElementById("weather-temp").textContent  = `${data.temp_f}°F`;
    document.getElementById("weather-city").textContent  = data.city;
    document.getElementById("weather-wind").textContent  = `${data.windspeed} km/h`;
    document.getElementById("weather-humidity").textContent = `${data.humidity}%`;
    document.getElementById("weather-icon").textContent  =
      weatherCodeToIcon(data.weather_code, data.is_day);
  } catch (e) {
    document.getElementById("weather-city").textContent = "Couldn't load weather";
    console.error("Weather error:", e);
  }
}

loadWeather();
// Refresh weather every 10 minutes
setInterval(loadWeather, 10 * 60 * 1000);

// ── Quote ──────────────────────────────────────────────────────────────────
async function loadQuote() {
  document.getElementById("quote-text").textContent   = "Loading...";
  document.getElementById("quote-author").textContent = "—";
  try {
    const res  = await fetch("/api/quote");
    const data = await res.json();
    document.getElementById("quote-text").textContent   = `"${data.text}"`;
    document.getElementById("quote-author").textContent = `— ${data.author}`;
    quotesRead++;
    document.getElementById("stat-quotes").textContent = quotesRead;
  } catch (e) {
    document.getElementById("quote-text").textContent = "Couldn't load quote.";
  }
}

document.getElementById("refresh-quote").addEventListener("click", loadQuote);
loadQuote();

// ── Todo helpers ───────────────────────────────────────────────────────────
function renderTodos() {
  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  if (todos.length === 0) {
    list.innerHTML = `<li class="todo-loading">No tasks yet — add one below!</li>`;
  } else {
    todos.forEach(todo => {
      const li = document.createElement("li");
      li.className = `todo-item${todo.done ? " done" : ""}`;
      li.dataset.id = todo.id;
      li.innerHTML = `
        <div class="todo-check">${todo.done ? "✓" : ""}</div>
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="todo-delete" title="Delete">✕</button>
      `;

      // Toggle done
      li.querySelector(".todo-check").addEventListener("click", () => toggleTodo(todo.id));
      li.querySelector(".todo-text").addEventListener("click",  () => toggleTodo(todo.id));

      // Delete
      li.querySelector(".todo-delete").addEventListener("click", e => {
        e.stopPropagation();
        deleteTodo(todo.id);
      });

      list.appendChild(li);
    });
  }

  updateStats();
}

function updateStats() {
  const done  = todos.filter(t => t.done).length;
  const left  = todos.filter(t => !t.done).length;
  document.getElementById("stat-tasks").textContent = left;
  document.getElementById("stat-done").textContent  = done;
}

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  renderTodos();
}

function addTodo(text) {
  if (!text.trim()) return;
  todos.push({ id: nextId++, text: text.trim(), done: false });
  renderTodos();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// ── Load initial todos from backend ───────────────────────────────────────
async function loadTodos() {
  try {
    const res  = await fetch("/api/todos");
    const data = await res.json();
    todos = data;
    renderTodos();
  } catch (e) {
    document.getElementById("todo-list").innerHTML =
      `<li class="todo-loading">Couldn't load tasks.</li>`;
  }
}

loadTodos();

// ── Add todo via button & Enter key ───────────────────────────────────────
document.getElementById("add-todo-btn").addEventListener("click", () => {
  const input = document.getElementById("new-todo");
  addTodo(input.value);
  input.value = "";
});

document.getElementById("new-todo").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    addTodo(e.target.value);
    e.target.value = "";
  }
});
