// ===== CONFIG =====
// Groq API - free & fast!
const API_KEY = 'YOUR_GROQ_API_KEY_HERE';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL   = 'llama-3.3-70b-versatile'; // Free Groq model - very fast

// ===== EXAMPLES =====
const EXAMPLES = {
  js: {
    lang: 'JavaScript',
    code: `TypeError: Cannot read properties of undefined (reading 'map')

const users = undefined;
const names = users.map(u => u.name);
console.log(names);`
  },
  py: {
    lang: 'Python',
    code: `AttributeError: 'NoneType' object has no attribute 'split'

def get_first_name(full_name):
    return full_name.split(' ')[0]

user_input = None
print(get_first_name(user_input))`
  },
  react: {
    lang: 'React / JSX',
    code: `Warning: Each child in a list should have a unique "key" prop.

function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li>{todo.text}</li>
      ))}
    </ul>
  );
}`
  },
  async: {
    lang: 'JavaScript',
    code: `UnhandledPromiseRejectionWarning: TypeError: Cannot destructure property 'data' of undefined

async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  const { data } = response.json();  // forgot await!
  return data.name;
}

fetchUser(1);`
  }
};

const LOADING_MESSAGES = [
  'Analyzing your error...',
  'Identifying the root cause...',
  'Generating the fix...',
  'Almost done...'
];

// ===== STATE =====
let currentFix = '';
let loadingInterval = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCharCounter();
  initLangFileSync();
});

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const reveals = document.querySelectorAll('.step-card, .solver-card, h2');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        e.target.classList.add('reveal');
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// ===== CHAR COUNTER =====
function initCharCounter() {
  const input = document.getElementById('code-input');
  const counter = document.getElementById('char-count');
  input.addEventListener('input', () => {
    const len = input.value.length;
    counter.textContent = `${len.toLocaleString()} character${len !== 1 ? 's' : ''}`;
  });
}

// ===== SYNC LANGUAGE TO FILENAME =====
function initLangFileSync() {
  const select = document.getElementById('lang-select');
  const filename = document.getElementById('editor-filename');
  const extMap = {
    'JavaScript': 'buggy-code.js',
    'Python': 'buggy-code.py',
    'TypeScript': 'buggy-code.ts',
    'React / JSX': 'buggy-code.jsx',
    'CSS': 'buggy-styles.css',
    'SQL': 'buggy-query.sql',
    'Node.js': 'buggy-server.js',
    'PHP': 'buggy-code.php',
    'any language': 'buggy-code.txt',
  };
  select.addEventListener('change', () => {
    filename.textContent = extMap[select.value] || 'buggy-code.txt';
  });
}

// ===== LOAD EXAMPLE =====
function loadExample(key) {
  const ex = EXAMPLES[key];
  if (!ex) return;
  document.getElementById('code-input').value = ex.code;
  document.getElementById('lang-select').value = ex.lang;
  document.getElementById('lang-select').dispatchEvent(new Event('change'));
  document.getElementById('code-input').dispatchEvent(new Event('input'));
  document.getElementById('code-input').focus();
  document.getElementById('solver').scrollIntoView({ behavior: 'smooth' });
}

// ===== CLEAR =====
function clearAll() {
  document.getElementById('code-input').value = '';
  document.getElementById('code-input').dispatchEvent(new Event('input'));
  hideResult();
  hideError();
  hideLoading();
  document.getElementById('code-input').focus();
}

// ===== TAB SWITCH =====
function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tab-${name}`).classList.add('active');
}

// ===== COPY FIX =====
function copyFix() {
  if (!currentFix) return;
  navigator.clipboard.writeText(currentFix).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
  }).catch(() => {
    // fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = currentFix;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

// ===== SHOW / HIDE UI STATES =====
function showLoading() {
  document.getElementById('loading-state').style.display = 'flex';
  let i = 0;
  loadingInterval = setInterval(() => {
    i = (i + 1) % LOADING_MESSAGES.length;
    document.getElementById('loading-msgs').textContent = LOADING_MESSAGES[i];
  }, 1200);
}
function hideLoading() {
  document.getElementById('loading-state').style.display = 'none';
  if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null; }
  document.getElementById('loading-msgs').textContent = LOADING_MESSAGES[0];
}
function showResult() { document.getElementById('result-wrap').style.display = 'block'; }
function hideResult() { document.getElementById('result-wrap').style.display = 'none'; }
function showError(msg) {
  const el = document.getElementById('error-state');
  document.getElementById('error-msg').textContent = msg;
  el.style.display = 'flex';
}
function hideError() { document.getElementById('error-state').style.display = 'none'; }

// ===== MAIN: SOLVE ERROR =====
async function solveError() {
  const code = document.getElementById('code-input').value.trim();
  const lang = document.getElementById('lang-select').value;

  if (!code) {
    document.getElementById('code-input').focus();
    document.getElementById('code-input').style.outline = '2px solid #ef4444';
    setTimeout(() => { document.getElementById('code-input').style.outline = 'none'; }, 1000);
    return;
  }

  // Reset UI
  const btn = document.getElementById('solve-btn');
  btn.disabled = true;
  document.getElementById('btn-text').textContent = 'Analyzing...';
  hideResult();
  hideError();
  showLoading();

  // Reset tab to Fix tab
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.tab-panel').forEach((p, i) => p.classList.toggle('active', i === 0));

  const prompt = `You are an expert ${lang} debugger. Your job is to fix the code/error below.

Respond ONLY with a valid JSON object. No markdown, no backticks, no extra text outside the JSON.

The "fix" field is REQUIRED — it must contain the complete corrected working code. Do not leave it empty or say "see explanation". Write the actual fixed code.

JSON format:
{
  "errorType": "e.g. NameError, TypeError, SyntaxError",
  "cause": "1-2 sentences: what caused the error",
  "fix": "the full corrected code goes here",
  "explanation": "2-3 sentences: what you changed and why",
  "tip": "one pro tip to avoid this error type"
}

Code or error to fix:
${code}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are an expert debugger. Always respond ONLY with a valid JSON object. No markdown, no backticks, no extra text — pure JSON only.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices[0]?.message?.content || '';

    let parsed;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: show raw response
      parsed = {
        errorType: 'Analysis',
        cause: 'Could not parse structured response.',
        fix: rawText,
        explanation: '',
        tip: ''
      };
    }

    renderResult(parsed);

  } catch (err) {
    console.error('Error:', err);
    if (err.message.includes('API key')) {
      showError('Invalid API key. Please add your Anthropic API key in script.js');
    } else if (err.message.includes('Failed to fetch')) {
      showError('Network error. Check your internet connection and API key in script.js.');
    } else {
      showError(err.message || 'Something went wrong. Please try again.');
    }
  } finally {
    hideLoading();
    btn.disabled = false;
    document.getElementById('btn-text').textContent = '⚡ Fix my error';
  }
}

// ===== RENDER RESULT =====
function renderResult(parsed) {
  // Badge
  document.getElementById('error-badge').textContent = parsed.errorType || 'Error';

  // Fixed code
  currentFix = parsed.fix || '';
  document.getElementById('result-code').textContent = currentFix;

  // Explanation tab
  let explainHTML = '';
  if (parsed.explanation) {
    explainHTML += `
      <div class="explain-block">
        <div class="explain-title">What was changed</div>
        <div class="explain-body">${escapeHtml(parsed.explanation)}</div>
      </div>`;
  }
  if (parsed.tip) {
    explainHTML += `
      <div class="explain-block">
        <div class="explain-title">💡 Pro tip</div>
        <div class="explain-body">${escapeHtml(parsed.tip)}</div>
      </div>`;
  }
  document.getElementById('explain-content').innerHTML = explainHTML || '<p style="color:var(--muted);font-size:.875rem;">No explanation available.</p>';

  // Root cause tab
  let causeHTML = '';
  if (parsed.cause) {
    causeHTML += `
      <div class="cause-block">
        <div class="explain-title">Root cause</div>
        <div class="explain-body">${escapeHtml(parsed.cause)}</div>
      </div>`;
  }
  document.getElementById('cause-content').innerHTML = causeHTML || '<p style="color:var(--muted);font-size:.875rem;">No root cause details available.</p>';

  showResult();
  document.getElementById('result-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== HELPERS =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Allow Ctrl+Enter to submit
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    solveError();
  }
});
