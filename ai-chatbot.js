/**
 * ai-chatbot.js
 * Beilleszthető AI chatbot widget a szavazós oldalhoz.
 *
 * Használat: <script src="ai-chatbot.js"></script>
 * Opcionálisan: window.AIChatConfig = { qid: 5 };  // aktuális kérdés ID
 */

(function () {
  'use strict';

  // ── Konfiguráció ──
  const CONFIG = {
    apiUrl: './api/ai_chat.php',
    qid: (window.AIChatConfig && window.AIChatConfig.qid) || null,
    maxHistory: 20,       // mennyi üzenetet küld vissza kontextusként
    welcomeMsg: '⚜ Üdvözöllek, derék vándor! Miben segíthetek a szavazással kapcsolatban?',
  };

  let history = [];   // { role, content }
  let open    = false;

  // ════════════════════════════════════
  //  DOM FELÉPÍTÉS
  // ════════════════════════════════════
  function buildWidget() {
    // Stíluslap betöltése
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = './style/ai-chatbot.css';
    document.head.appendChild(link);

    // Toggle gomb
    const btn = document.createElement('button');
    btn.id        = 'ai-chat-toggle';
    btn.className = 'ai-chat-toggle';
    btn.setAttribute('aria-label', 'AI Segítő megnyitása');
    btn.innerHTML = `
      <span class="ai-chat-toggle-icon">🦾🥷🕵️‍♀️👨‍🎓🕵️‍♂️🕵️🧙‍♂️</span>
      <span class="ai-chat-toggle-label">AI Segítő</span>
      <span class="ai-chat-unread" id="ai-unread" style="display:none">1</span>
    `;
    document.body.appendChild(btn);

    // Chat ablak
    const panel = document.createElement('div');
    panel.id        = 'ai-chat-panel';
    panel.className = 'ai-chat-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="ai-chat-header">
        <div class="ai-chat-header-info">
          <span class="ai-chat-avatar">⚜</span>
          <div>
            <div class="ai-chat-title">AI Tanácsadó</div>
            <div class="ai-chat-subtitle" id="ai-status">Online</div>
          </div>
        </div>
        <button class="ai-chat-close" id="ai-chat-close" aria-label="Bezárás">✕</button>
      </div>

      <div class="ai-chat-messages" id="ai-chat-messages" role="log" aria-live="polite"></div>

      <div class="ai-chat-suggestions" id="ai-suggestions">
        <button class="ai-suggestion-chip" data-msg="Hogyan szavazhatok?">Hogyan szavazhatok?</button>
        <button class="ai-suggestion-chip" data-msg="Mik az aktuális eredmények?">Eredmények</button>
        <button class="ai-suggestion-chip" data-msg="Hogyan adhatok hozzá új kérdést?">Új kérdés</button>
      </div>

      <div class="ai-chat-input-row">
        <textarea
          id="ai-chat-input"
          class="ai-chat-input"
          placeholder="Írj üzenetet…"
          rows="1"
          maxlength="500"
          aria-label="Üzenet írása"
        ></textarea>
        <button class="ai-chat-send" id="ai-chat-send" aria-label="Küldés">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(panel);

    // Eseménykezelők
    btn.addEventListener('click', toggleChat);
    document.getElementById('ai-chat-close').addEventListener('click', closeChat);
    document.getElementById('ai-chat-send').addEventListener('click', sendMessage);

    const input = document.getElementById('ai-chat-input');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    input.addEventListener('input', autoResize);

    document.getElementById('ai-suggestions').addEventListener('click', e => {
      const chip = e.target.closest('.ai-suggestion-chip');
      if (chip) sendMessage(chip.dataset.msg);
    });

    // Üdvözlő üzenet megjelenítése
    appendMessage('ai', CONFIG.welcomeMsg);
  }

  // ════════════════════════════════════
  //  CHAT VEZÉRLŐK
  // ════════════════════════════════════
  function toggleChat() {
    open ? closeChat() : openChat();
  }

  function openChat() {
    open = true;
    document.getElementById('ai-chat-panel').classList.add('open');
    document.getElementById('ai-chat-panel').setAttribute('aria-hidden', 'false');
    document.getElementById('ai-chat-toggle').classList.add('active');
    document.getElementById('ai-unread').style.display = 'none';
    document.getElementById('ai-chat-input').focus();
  }

  function closeChat() {
    open = false;
    document.getElementById('ai-chat-panel').classList.remove('open');
    document.getElementById('ai-chat-panel').setAttribute('aria-hidden', 'true');
    document.getElementById('ai-chat-toggle').classList.remove('active');
  }

  // ════════════════════════════════════
  //  ÜZENETKÜLDÉS
  // ════════════════════════════════════
  async function sendMessage(overrideText) {
    const input = document.getElementById('ai-chat-input');
    const text  = (overrideText || input.value).trim();
    if (!text) return;

    input.value = '';
    autoResize.call(input);
    hideSuggestions();
    appendMessage('user', text);

    history.push({ role: 'user', content: text });
    if (history.length > CONFIG.maxHistory) history.splice(0, 2);

    // Typing indikátor
    const typingId = showTyping();
    setStatus('Gondolkodik…');
    document.getElementById('ai-chat-send').disabled = true;

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          qid:     CONFIG.qid,
          history: history.slice(0, -1),   // az utolsó (aktuális) user msg nélkül
        }),
      });

      removeTyping(typingId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      appendMessage('ai', data.reply);
      history.push({ role: 'assistant', content: data.reply });
      setStatus('Online');

    } catch (err) {
      removeTyping(typingId);
      appendMessage('ai', `⚠ Hiba: ${err.message}`);
      setStatus('Hiba történt');
    } finally {
      document.getElementById('ai-chat-send').disabled = false;
    }
  }

  // ════════════════════════════════════
  //  DOM SEGÉDEK
  // ════════════════════════════════════
  function appendMessage(role, text) {
    const container = document.getElementById('ai-chat-messages');
    const wrap = document.createElement('div');
    wrap.className = `ai-msg ai-msg-${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'ai-msg-bubble';
    bubble.innerHTML = escHtml(text).replace(/\n/g, '<br>');

    const time = document.createElement('div');
    time.className = 'ai-msg-time';
    time.textContent = now();

    wrap.appendChild(bubble);
    wrap.appendChild(time);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;

    // Ha zárva van, unread badge
    if (!open && role === 'ai') {
      document.getElementById('ai-unread').style.display = 'flex';
    }
  }

  let typingCounter = 0;
  function showTyping() {
    const id = ++typingCounter;
    const container = document.getElementById('ai-chat-messages');
    const wrap = document.createElement('div');
    wrap.id        = `ai-typing-${id}`;
    wrap.className = 'ai-msg ai-msg-ai ai-typing';
    wrap.innerHTML = `
      <div class="ai-msg-bubble">
        <span class="ai-dot"></span>
        <span class="ai-dot"></span>
        <span class="ai-dot"></span>
      </div>`;
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
    return id;
  }

  function removeTyping(id) {
    const el = document.getElementById(`ai-typing-${id}`);
    if (el) el.remove();
  }

  function hideSuggestions() {
    const s = document.getElementById('ai-suggestions');
    if (s) s.style.display = 'none';
  }

  function setStatus(msg) {
    const el = document.getElementById('ai-status');
    if (el) el.textContent = msg;
  }

  function autoResize() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  }

  function now() {
    return new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ════════════════════════════════════
  //  INDÍTÁS
  // ════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }

})();
