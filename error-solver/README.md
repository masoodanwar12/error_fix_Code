# ⚡ ErrorFix AI — Instant Bug Solver

An AI-powered error solver built with plain HTML, CSS, and JavaScript using the **Groq API (free!)**.

## 🚀 Setup (2 steps only)

### 1. Add your Groq API key
Open `script.js` and replace line 3:
```js
const API_KEY = 'your_groq_api_key_here';
```
Get your free key at: https://console.groq.com

### 2. Open in browser
Just open `index.html` in Chrome — no install, no terminal, no build step needed!

---

## 📁 File Structure
```
error-solver/
├── index.html   → Full page (navbar, hero, how-it-works, solver tool, footer)
├── style.css    → Dark theme, responsive design, animations
├── script.js    → Groq API calls, AI logic, tabs, copy, examples
└── README.md    → This file
```

---

## ✨ Features
- Paste any code or error message → get an instant AI fix
- Supports JS, Python, TypeScript, React, CSS, SQL, PHP, and more
- 3 result tabs: **Fixed Code · Explanation · Root Cause**
- One-click copy of the fixed code
- 4 built-in examples to try instantly
- `Ctrl+Enter` shortcut to submit
- Language selector with filename sync
- Character counter
- Fully responsive — works on mobile too

---

## 🛠️ Tech Used

| Tech | Purpose |
|------|---------|
| HTML5 | Page structure |
| CSS3 | Dark theme, animations, responsive layout |
| Vanilla JavaScript | All logic — no frameworks needed |
| Groq API (free) | AI that reads and fixes the error |
| LLaMA 3.3 70B | The AI model running on Groq |
| Google Fonts | Inter + JetBrains Mono |
| Fetch API | Sends requests to Groq |
| Clipboard API | Copy fix button |

---

## 🤖 How It Works

```
You paste error
      ↓
script.js builds a prompt
      ↓
Groq API (LLaMA 3.3) reads it
      ↓
Returns JSON: fix + explanation + root cause
      ↓
You see the result in 3 tabs
```

**No backend needed.** Groq's cloud server IS the backend. Your 3 files talk directly to it.

---

## ⚠️ Common Issues

| Problem | Fix |
|---------|-----|
| Model decommissioned error | Update `MODEL` in script.js to `llama-3.3-70b-versatile` |
| Fix field is empty | Already fixed in latest version — re-download |
| API key error | Regenerate key at console.groq.com |
| CORS error | Open via a local server (VS Code Live Server), not double-click |

---

## 🌐 Deploy Free

- **GitHub Pages** → Push to repo → Settings → Pages → Deploy from main
- **Vercel** → Drag folder into vercel.com → Live in 30 seconds
- **Netlify** → Drag folder into netlify.com/drop → Done

---

## 📌 Current Model
```js
const MODEL = 'llama-3.3-70b-versatile'; // Free on Groq
```
If this model gets deprecated, check https://console.groq.com/docs/models for the latest free model and update line 5 in script.js.
