/**
 * YAP - Mobile AI Studio (Free API Edition)
 * Autonomous App Builder & Hyper-Interactive Mascot Engine
 * Powered by Google Gemini & Groq Free Tier APIs
 */

document.addEventListener('DOMContentLoaded', () => {

  // ================= 1. STATE & CONFIGURATION =================
  const STATE = {
    activeTab: 'chat', // 'chat' | 'preview' | 'code'
    previewDevice: 'mobile', // 'mobile' | 'desktop'
    currentHtmlCode: '',
    apiProvider: localStorage.getItem('yap_api_provider') || localStorage.getItem('tap_api_provider') || 'gemini',
    geminiKey: localStorage.getItem('yap_gemini_key') || localStorage.getItem('tap_gemini_key') || '',
    geminiModel: localStorage.getItem('yap_gemini_model') || 'gemini-2.0-flash',
    groqKey: localStorage.getItem('yap_groq_key') || localStorage.getItem('tap_groq_key') || '',
    groqModel: localStorage.getItem('yap_groq_model') || 'llama-3.3-70b-versatile',
    pollinationsModel: localStorage.getItem('yap_pollinations_model') || 'openai',
    soundEnabled: localStorage.getItem('yap_sound_enabled') !== 'false',
    messages: JSON.parse(localStorage.getItem('yap_messages') || localStorage.getItem('tap_messages') || '[]'),
    mascotMood: 'normal',
    isGenerating: false,
    tapCombo: 0,
    tapComboTimer: null
  };

  // Mascot quotes
  const MASCOT_QUOTES = [
    'Hai! Mau rancang aplikasi apa hari ini? ✨',
    'Ketuk aku untuk interaksi gemas! 🐾',
    'Aku terhubung langsung ke Google Gemini & Groq Free Tier! 🌐',
    'Coba ketik: "Buatkan jam digital estetik dengan alarm dan stopwatch" ⏰',
    'Bisa buat game, dashboard, form, dan utilitas interaktif! 💡',
    'Kode langsung bisa dites di tab Live Preview! 📱',
    'Semangat ngoding bareng YAP! 💙'
  ];

  let currentQuoteIndex = 0;

  // DOM Elements
  const chatScroll = document.getElementById('chat-scroll');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('btn-send');
  const previewIframe = document.getElementById('preview-iframe');
  const codeEditor = document.getElementById('code-editor');
  const previewFrameWrapper = document.getElementById('preview-frame-wrapper');
  const mascotBox = document.getElementById('mascot-interactive-box');
  const mascotSpeechText = document.getElementById('mascot-bubble-text');
  const particlesContainer = document.getElementById('mascot-particles');
  const settingsModal = document.getElementById('settings-modal');
  const toastContainer = document.getElementById('toast-msg');
  const headerApiBadge = document.getElementById('header-api-badge');

  // Initialize Header Badge
  updateHeaderBadge();

  // ================= 2. PROCEDURAL SOUND SYNTHESIZER (WEB AUDIO API) =================
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function playChime(type = 'pop') {
    if (!STATE.soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'pop') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'happy') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'boba') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'spark') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      // Audio not permitted or unsupported
    }
  }

  // ================= 3. HYPER-INTERACTIVE MASCOT ENGINE =================
  const eyeNormal = document.getElementById('mascot-eyes-normal');
  const eyeHappy = document.getElementById('mascot-eyes-happy');
  const eyeLove = document.getElementById('mascot-eyes-love');
  const pupilLeft = document.getElementById('mascot-pupil-left');
  const pupilRight = document.getElementById('mascot-pupil-right');
  const mouthNormal = document.getElementById('mascot-mouth-normal');
  const mouthHappy = document.getElementById('mascot-mouth-happy');
  const mouthSurprised = document.getElementById('mascot-mouth-surprised');
  const cheekLeft = document.getElementById('mascot-cheek-left');
  const cheekRight = document.getElementById('mascot-cheek-right');
  const mascotSvg = document.getElementById('mascot-svg-wrap');

  function setMascotExpression(expr) {
    STATE.mascotMood = expr;

    if (eyeNormal) eyeNormal.style.display = 'none';
    if (eyeHappy) eyeHappy.style.display = 'none';
    if (eyeLove) eyeLove.style.display = 'none';

    if (mouthNormal) mouthNormal.style.display = 'none';
    if (mouthHappy) mouthHappy.style.display = 'none';
    if (mouthSurprised) mouthSurprised.style.display = 'none';

    if (cheekLeft && cheekRight) {
      cheekLeft.setAttribute('fill', '#60A5FA');
      cheekRight.setAttribute('fill', '#60A5FA');
    }

    if (expr === 'happy' || expr === 'laugh') {
      if (eyeHappy) eyeHappy.style.display = 'block';
      if (mouthHappy) mouthHappy.style.display = 'block';
      if (cheekLeft && cheekRight) {
        cheekLeft.setAttribute('fill', '#FB7185');
        cheekRight.setAttribute('fill', '#FB7185');
      }
    } else if (expr === 'love') {
      if (eyeLove) eyeLove.style.display = 'block';
      if (mouthHappy) mouthHappy.style.display = 'block';
      if (cheekLeft && cheekRight) {
        cheekLeft.setAttribute('fill', '#F43F5E');
        cheekRight.setAttribute('fill', '#F43F5E');
      }
    } else if (expr === 'surprised' || expr === 'thinking') {
      if (eyeNormal) eyeNormal.style.display = 'block';
      if (mouthSurprised) mouthSurprised.style.display = 'block';
    } else {
      if (eyeNormal) eyeNormal.style.display = 'block';
      if (mouthNormal) mouthNormal.style.display = 'block';
    }
  }

  function setMascotQuote(text) {
    if (mascotSpeechText) {
      mascotSpeechText.style.opacity = '0';
      mascotSpeechText.style.transform = 'translateY(4px)';
      setTimeout(() => {
        mascotSpeechText.textContent = text;
        mascotSpeechText.style.opacity = '1';
        mascotSpeechText.style.transform = 'translateY(0)';
      }, 150);
    }
  }

  function spawnParticles(emojis = ['✨', '💙', '⭐', '🚀', '🌟']) {
    if (!particlesContainer) return;
    for (let i = 0; i < 7; i++) {
      const p = document.createElement('div');
      p.className = 'particle-item';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = `${45 + (Math.random() * 30 - 15)}%`;
      p.style.top = `${45 + (Math.random() * 20 - 10)}%`;
      p.style.setProperty('--dx', `${(Math.random() - 0.5) * 140}px`);
      p.style.setProperty('--dy', `${-40 - Math.random() * 90}px`);
      p.style.setProperty('--rot', `${(Math.random() - 0.5) * 90}deg`);
      particlesContainer.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  if (mascotBox) {
    mascotBox.addEventListener('click', () => {
      STATE.tapCombo++;
      clearTimeout(STATE.tapComboTimer);
      STATE.tapComboTimer = setTimeout(() => { STATE.tapCombo = 0; }, 1800);

      if (mascotSvg) {
        mascotSvg.classList.remove('squish-bounce', 'wiggle-anim', 'spin-anim');
        void mascotSvg.offsetWidth;
      }

      if (STATE.tapCombo >= 5) {
        setMascotExpression('love');
        if (mascotSvg) mascotSvg.classList.add('spin-anim');
        setMascotQuote('Waaaa! Kamu luar biasa! Combo 5x! 💖✨');
        spawnParticles(['💖', '✨', '🐾', '🔥', '🎉']);
        playChime('spark');
        STATE.tapCombo = 0;
      } else if (STATE.tapCombo === 3) {
        setMascotExpression('happy');
        if (mascotSvg) mascotSvg.classList.add('wiggle-anim');
        setMascotQuote('Hehehe geli! Ayo buat aplikasi keren! 😄');
        spawnParticles(['⭐', '✨', '🐾']);
        playChime('happy');
      } else {
        setMascotExpression('happy');
        if (mascotSvg) mascotSvg.classList.add('squish-bounce');
        currentQuoteIndex = (currentQuoteIndex + 1) % MASCOT_QUOTES.length;
        setMascotQuote(MASCOT_QUOTES[currentQuoteIndex]);
        spawnParticles(['✨', '💙']);
        playChime('boba');
      }

      setTimeout(() => {
        if (!STATE.isGenerating) setMascotExpression('normal');
      }, 1600);
    });

    // Eye Tracking
    window.addEventListener('mousemove', (e) => {
      if (STATE.mascotMood !== 'normal' && STATE.mascotMood !== 'thinking') return;
      if (!pupilLeft || !pupilRight || !mascotBox) return;

      const rect = mascotBox.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - mascotCenterX;
      const deltaY = e.clientY - mascotCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(Math.hypot(deltaX, deltaY) / 50, 4.5);

      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;

      pupilLeft.setAttribute('cx', 72 + offsetX);
      pupilLeft.setAttribute('cy', 84 + offsetY);
      pupilRight.setAttribute('cx', 128 + offsetX);
      pupilRight.setAttribute('cy', 84 + offsetY);
    });
  }

  // ================= 4. TAB NAVIGATION & VIEW CONTROL =================
  window.switchTab = function(tabName) {
    STATE.activeTab = tabName;

    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));

    const btn = document.getElementById(`btn-tab-${tabName}`);
    const view = document.getElementById(`tab-${tabName}`);
    if (btn) btn.classList.add('active');
    if (view) view.classList.add('active');

    if (tabName === 'preview') {
      if (STATE.currentHtmlCode) {
        updateLivePreview(STATE.currentHtmlCode);
      }
      playChime('pop');
    } else if (tabName === 'code') {
      if (codeEditor) codeEditor.value = STATE.currentHtmlCode;
      playChime('pop');
    }
  };

  window.setDevicePreview = function(device) {
    STATE.previewDevice = device;
    const btnMobile = document.getElementById('btn-device-mobile');
    const btnDesktop = document.getElementById('btn-device-desktop');

    if (btnMobile && btnDesktop && previewFrameWrapper) {
      if (device === 'mobile') {
        btnMobile.classList.add('active');
        btnDesktop.classList.remove('active');
        previewFrameWrapper.className = 'preview-frame-wrapper mobile';
      } else {
        btnDesktop.classList.add('active');
        btnMobile.classList.remove('active');
        previewFrameWrapper.className = 'preview-frame-wrapper desktop';
      }
    }
    playChime('pop');
  };

  window.reloadPreview = function() {
    if (STATE.currentHtmlCode) {
      updateLivePreview(STATE.currentHtmlCode);
      showToast('🔄 Preview dimuat ulang');
      playChime('pop');
    }
  };

  // Mascot Quick Action Bar Buttons
  window.mascotAction = function(action) {
    if (mascotSvg) {
      mascotSvg.classList.remove('squish-bounce', 'wiggle-anim', 'spin-anim');
      void mascotSvg.offsetWidth;
    }

    if (action === 'pet') {
      setMascotExpression('love');
      if (mascotSvg) mascotSvg.classList.add('squish-bounce');
      setMascotQuote('Aww, terima kasih sudah mengelusku! Aku jadi makin semangat! 🥰💖');
      spawnParticles(['💖', '✨', '🐾', '🥰', '💕']);
      playChime('happy');
    } else if (action === 'boba') {
      setMascotExpression('happy');
      if (mascotSvg) mascotSvg.classList.add('squish-bounce');
      setMascotQuote('Slurp! Boba-nya enak banget! Energi ngoding terisi penuh! 🧋✨');
      spawnParticles(['🧋', '✨', '😋', '🥤', '💙']);
      playChime('boba');
    } else if (action === 'boost') {
      setMascotExpression('happy');
      if (mascotSvg) mascotSvg.classList.add('wiggle-anim');
      setMascotQuote('Super Boost Aktif! Siap membangun aplikasi impianmu secepat kilat! ⚡🚀');
      spawnParticles(['⚡', '🔥', '🚀', '🌟', '💥']);
      playChime('spark');
    } else if (action === 'sound') {
      STATE.soundEnabled = !STATE.soundEnabled;
      localStorage.setItem('yap_sound_enabled', STATE.soundEnabled);
      if (STATE.soundEnabled) {
        playChime('pop');
        showToast('🔊 Efek suara diaktifkan!');
      } else {
        showToast('🔇 Efek suara dinonaktifkan.');
      }
    }

    setTimeout(() => {
      if (!STATE.isGenerating) setMascotExpression('normal');
    }, 2400);
  };

  // Aliases for HTML event handlers
  window.setPreviewDevice = window.setDevicePreview;
  window.openExternalPreview = window.openPreviewExternal;

  window.copyCode = function() {
    if (!STATE.currentHtmlCode) {
      showToast('Belum ada kode yang dihasilkan.');
      return;
    }
    navigator.clipboard.writeText(STATE.currentHtmlCode).then(() => {
      showToast('📋 Kode berhasil disalin ke clipboard!');
      playChime('spark');
    });
  };

  window.downloadCode = function() {
    if (!STATE.currentHtmlCode) {
      showToast('Belum ada kode yang dihasilkan.');
      return;
    }
    const blob = new Blob([STATE.currentHtmlCode], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `yap_app_${Date.now()}.html`;
    a.click();
    showToast('💾 Berkas HTML berhasil diunduh!');
    playChime('spark');
  };

  // ================= 5. LIVE CODE INJECTION SANDBOX =================
  function updateLivePreview(htmlString) {
    if (!previewIframe) return;
    previewIframe.srcdoc = htmlString;
  }

  function extractHtmlFromMarkdown(raw) {
    if (!raw) return '';
    // Look for ```html ... ```
    const match = raw.match(/```html\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Fallback: look for <!DOCTYPE html> or <html>
    const docIdx = raw.indexOf('<!DOCTYPE html>');
    if (docIdx !== -1) {
      const end = raw.lastIndexOf('</html>');
      if (end !== -1) {
        return raw.substring(docIdx, end + 7).trim();
      }
    }
    const idx = raw.indexOf('<html');
    if (idx !== -1) {
      const end = raw.lastIndexOf('</html>');
      if (end !== -1) {
        return raw.substring(idx, end + 7).trim();
      }
    }
    if (raw.includes('<div') || raw.includes('<body') || raw.includes('<style')) {
      return raw.trim();
    }
    return '';
  }

  // ================= 6. REAL AI API ENGINE (NO HARDCODED FALLBACKS) =================
  async function callFreeAiApi(userPrompt) {
    const systemPrompt = `You are YAP, an elite AI Autonomous Web App Builder.
Task: Create a 100% COMPLETE, BEAUTIFUL, PRODUCTION-GRADE, READY-TO-RUN single-file HTML application based on the user's request.
Requirements:
1. Include all CSS inside <style> and JavaScript inside <script>. No external CSS files.
2. Beautiful, modern, aesthetic UI (Plus Jakarta Sans Google Font, FontAwesome 6 CDN, smooth transitions, mobile-responsive, elegant glassmorphism/cards).
3. Rich interactivity: Add functional sound effects via Web Audio API, state management, animations, and zero dummy/unimplemented buttons.
4. Output your answer with a friendly Indonesian explanation first, followed by the complete code enclosed in \`\`\`html ... \`\`\`.
5. Strictly adhere to the requested features (e.g. if the user asks for a Clock/Jam, build a full-featured Clock with Analog, Digital, Timezones, and Alarm. Never substitute with another app).`;

    // --- Provider 1: Google Gemini Free Tier ---
    if (STATE.apiProvider === 'gemini') {
      if (!STATE.geminiKey) {
        throw new Error('API Key Google Gemini belum diatur. Dapatkan gratis di aistudio.google.com tanpa kartu kredit lalu masukkan di menu Pengaturan ⚙️ (kanan atas).');
      }

      const modelsToTry = [STATE.geminiModel || 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let lastError = null;

      for (const model of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(STATE.geminiKey)}`;
          const payload = {
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nPermintaan pengguna: ${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192
            }
          };

          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await resp.json();
          if (resp.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
          }

          const errMsg = data.error?.message || `HTTP ${resp.status} ${resp.statusText}`;
          lastError = new Error(`Gemini (${model}): ${errMsg}`);
          
          // If quota exceeded or 429, try next model or failover to Groq if key exists
          if (resp.status === 429 && STATE.groqKey) {
            console.warn('Gemini 429 rate limit hit, auto-switching to Groq...');
            break;
          }
        } catch (e) {
          lastError = e;
        }
      }

      // If user also has Groq Key configured, try Groq as seamless real-AI failover
      if (STATE.groqKey) {
        try {
          return await callGroqApi(userPrompt, systemPrompt);
        } catch (groqErr) {
          throw new Error(`${lastError?.message || 'Gemini gagal'}. Percobaan failover Groq juga terkendala: ${groqErr.message}`);
        }
      }

      throw lastError || new Error('Gagal menerima respon dari Google Gemini.');
    }

    // --- Provider 2: Groq Cloud Free Tier ---
    if (STATE.apiProvider === 'groq') {
      if (!STATE.groqKey) {
        throw new Error('API Key Groq Cloud belum diatur. Dapatkan gratis di console.groq.com lalu masukkan di menu Pengaturan ⚙️ (kanan atas).');
      }

      try {
        return await callGroqApi(userPrompt, systemPrompt);
      } catch (err) {
        // If user also has Gemini Key configured, try Gemini as failover
        if (STATE.geminiKey) {
          console.warn('Groq failed, attempting Gemini failover...');
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(STATE.geminiKey)}`;
            const resp = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nPermintaan pengguna: ${userPrompt}` }] }]
              })
            });
            const data = await resp.json();
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
              return data.candidates[0].content.parts[0].text;
            }
          } catch (e) {}
        }
        throw err;
      }
    }

    // --- Provider 3: Pollinations.ai (Direct) ---
    if (STATE.apiProvider === 'pollinations') {
      const candidateModels = Array.from(new Set([STATE.pollinationsModel || 'openai', 'mistral', 'qwen-coder']));
      const endpoint = 'https://text.pollinations.ai/';
      let lastErr = null;

      for (const mdl of candidateModels) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                { role: 'system', content: systemPrompt },
                ...STATE.messages.slice(-3).map(m => ({ role: m.role, content: m.text })),
                { role: 'user', content: userPrompt }
              ],
              model: mdl,
              seed: Math.floor(Math.random() * 99999)
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (resp.ok) {
            const text = await resp.text();
            if (text && text.trim().length > 30) {
              return text;
            }
          }
          lastErr = `Model ${mdl} HTTP ${resp.status}`;
        } catch (e) {
          lastErr = e.message;
        }
      }

      throw new Error(`Server Pollinations sedang antre/sibuk (${lastErr}). Sangat disarankan beralih ke Google Gemini Free API atau Groq di menu Pengaturan ⚙️.`);
    }

    throw new Error('Penyedia API tidak valid.');
  }

  // Helper for Groq API
  async function callGroqApi(userPrompt, systemPrompt) {
    const modelsToTry = [STATE.groqModel || 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    let lastErr = null;

    for (const mdl of modelsToTry) {
      try {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STATE.groqKey}`
          },
          body: JSON.stringify({
            model: mdl,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 8000
          })
        });

        const data = await resp.json();
        if (resp.ok && data.choices && data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        }

        const msg = data.error?.message || `HTTP ${resp.status}`;
        lastErr = new Error(`Groq (${mdl}): ${msg}`);
      } catch (e) {
        lastErr = e;
      }
    }

    throw lastErr || new Error('Gagal menerima respon dari Groq.');
  }

  // ================= 7. CHAT & MESSAGE RENDERING =================
  function appendMessage(role, text, codeHtml = '', isError = false) {
    const wrap = document.createElement('div');
    wrap.className = `message-bubble-wrap ${role}`;

    let innerHtml = '';
    if (role === 'ai') {
      innerHtml += `<div class="ai-header-tag"><i class="fa-solid fa-wand-magic-sparkles"></i> YAP AI Studio</div>`;
    }

    if (isError) {
      innerHtml += `
        <div class="message-bubble" style="background:#fee2e2;border:1.5px solid #f87171;color:#991b1b;">
          <div style="font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            <i class="fa-solid fa-triangle-exclamation"></i> Kendala Permintaan AI
          </div>
          <div style="font-size:13.5px;line-height:1.5;margin-bottom:12px;">${text.replace(/\n/g, '<br>')}</div>
          <button class="card-btn primary" onclick="openSettingsModal()" style="font-size:12px;padding:8px 14px;background:#b91c1c;">
            <i class="fa-solid fa-gear"></i> Buka Pengaturan API Key Gratis
          </button>
        </div>
      `;
    } else {
      const formattedText = text
        .replace(/```html[\s\S]*?```/gi, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      innerHtml += `<div class="message-bubble">${formattedText || 'Aplikasi telah berhasil dibuat!'}</div>`;
    }

    if (codeHtml) {
      const isApkReq = (text || '').toLowerCase().includes('apk');
      innerHtml += `
        <div class="app-ready-card">
          <h4><i class="fa-solid fa-circle-check" style="color:#10b981;"></i> Aplikasi Siap Digunakan!</h4>
          <p style="font-size:12px;color:#475569;">Kode aplikasi web interaktif telah berhasil disusun dan diinjeksi ke Live Sandbox.</p>
          <div class="card-actions">
            <button class="card-btn primary" onclick="switchTab('preview')"><i class="fa-solid fa-play"></i> Buka Live Preview</button>
            <button class="card-btn secondary" onclick="switchTab('code')"><i class="fa-solid fa-code"></i> Periksa Kode</button>
            <button class="card-btn secondary" onclick="downloadCode()"><i class="fa-solid fa-download"></i> Unduh .html</button>
            ${isApkReq ? `<a href="yap.apk" download="yap.apk" class="card-btn primary" style="background:#10b981;text-decoration:none;"><i class="fa-brands fa-android"></i> Unduh APK Mobile (41.9 MB)</a>` : ''}
          </div>
        </div>
      `;
    }

    wrap.innerHTML = innerHtml;
    chatScroll.appendChild(wrap);
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }

  async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text || STATE.isGenerating) return;

    // Check if key is missing for selected provider
    if (STATE.apiProvider === 'gemini' && !STATE.geminiKey) {
      appendMessage('user', text);
      appendMessage('ai', 'Google Gemini API Key belum dimasukkan.\n\nKamu dapat membuat API Key gratis tanpa kartu kredit di Google AI Studio (aistudio.google.com). Buka menu Pengaturan ⚙️ untuk memasukkannya.', '', true);
      openSettingsModal();
      return;
    }

    if (STATE.apiProvider === 'groq' && !STATE.groqKey) {
      appendMessage('user', text);
      appendMessage('ai', 'Groq Cloud API Key belum dimasukkan.\n\nKamu dapat membuat API Key gratis di console.groq.com. Buka menu Pengaturan ⚙️ untuk memasukkannya.', '', true);
      openSettingsModal();
      return;
    }

    chatInput.value = '';
    chatInput.style.height = 'auto';

    appendMessage('user', text);
    STATE.messages.push({ role: 'user', text });

    STATE.isGenerating = true;
    setMascotExpression('thinking');
    setMascotQuote('Sedang merancang kode aplikasi kamu langsung lewat API AI... Mohon tunggu sebentar! ⚡');
    playChime('pop');

    // Loading indicator
    const loadingWrap = document.createElement('div');
    loadingWrap.className = 'message-bubble-wrap ai';
    loadingWrap.id = 'loading-indicator';
    loadingWrap.innerHTML = `
      <div class="ai-header-tag"><i class="fa-solid fa-wand-magic-sparkles"></i> YAP AI Studio</div>
      <div class="message-bubble" style="display:flex;align-items:center;gap:8px;color:#64748b;">
        <i class="fa-solid fa-spinner fa-spin"></i> Menghubungi ${getProviderDisplayName()} untuk menghasilkan aplikasi...
      </div>
    `;
    chatScroll.appendChild(loadingWrap);
    chatScroll.scrollTop = chatScroll.scrollHeight;

    try {
      // Call AI directly - NO hardcoded fake templates
      const aiResponseText = await callFreeAiApi(text);

      if (loadingWrap) loadingWrap.remove();

      const extractedHtml = extractHtmlFromMarkdown(aiResponseText);
      if (extractedHtml) {
        STATE.currentHtmlCode = extractedHtml;
        codeEditor.value = extractedHtml;
        updateLivePreview(extractedHtml);
      }

      appendMessage('ai', aiResponseText, extractedHtml);
      STATE.messages.push({ role: 'model', text: aiResponseText, code: extractedHtml });
      localStorage.setItem('yap_messages', JSON.stringify(STATE.messages.slice(-20)));

      setMascotExpression('happy');
      setMascotQuote('Hore! Aplikasimu sudah siap di tab Live Preview! Buka dan coba sekarang! 🎉');
      playChime('happy');
      spawnParticles(['🎉', '🌟', '📱', '✨']);

    } catch (err) {
      if (loadingWrap) loadingWrap.remove();
      console.error('AI Request Error:', err);
      appendMessage('ai', err.message, '', true);
      setMascotExpression('surprised');
      setMascotQuote('Ups, terjadi kendala saat memproses permintaan AI. Cek pesan di atas ya! 🛠️');
      showToast(`Kendala API: ${err.message}`);
    } finally {
      STATE.isGenerating = false;
    }
  }

  // Quick Chips
  window.useChip = function(promptText) {
    if (chatInput) {
      chatInput.value = promptText;
      handleSendMessage();
    }
  };

  sendBtn.addEventListener('click', handleSendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });

  // ================= 8. SETTINGS MODAL & PROVIDERS =================
  window.openSettingsModal = function() {
    if (settingsModal) settingsModal.classList.add('active');
    const provSelect = document.getElementById('select-provider');
    const polModel = document.getElementById('select-pollinations-model');
    const gemInput = document.getElementById('input-gemini-key');
    const gemModel = document.getElementById('select-gemini-model');
    const groqInput = document.getElementById('input-groq-key');
    const groqModel = document.getElementById('select-groq-model');

    if (provSelect) provSelect.value = STATE.apiProvider;
    if (polModel) polModel.value = STATE.pollinationsModel;
    if (gemInput) gemInput.value = STATE.geminiKey;
    if (gemModel) gemModel.value = STATE.geminiModel;
    if (groqInput) groqInput.value = STATE.groqKey;
    if (groqModel) groqModel.value = STATE.groqModel;

    updateSettingsFields();
  };

  window.closeSettingsModal = function() {
    if (settingsModal) settingsModal.classList.remove('active');
  };

  window.updateSettingsFields = function() {
    const prov = document.getElementById('select-provider')?.value;
    const polGroup = document.getElementById('group-pollinations');
    const gemGroup = document.getElementById('group-gemini');
    const groqGroup = document.getElementById('group-groq');
    const hint = document.getElementById('provider-hint');

    if (polGroup) polGroup.style.display = prov === 'pollinations' ? 'flex' : 'none';
    if (gemGroup) gemGroup.style.display = prov === 'gemini' ? 'flex' : 'none';
    if (groqGroup) groqGroup.style.display = prov === 'groq' ? 'flex' : 'none';

    if (hint) {
      if (prov === 'gemini') {
        hint.textContent = 'Google Gemini 2.0 Flash / 1.5 Flash gratis via Google AI Studio. Sangat pintar & stabil.';
      } else if (prov === 'groq') {
        hint.textContent = 'Groq Cloud menyediakan free inference super kilat (<1 detik) dengan Llama 3.3 70B.';
      } else {
        hint.textContent = 'Pollinations bekerja tanpa key, tetapi kecepatan tergantung trafik server publik.';
      }
    }
  };

  window.saveSettings = function() {
    const prov = document.getElementById('select-provider')?.value || 'gemini';
    const polModel = document.getElementById('select-pollinations-model')?.value || 'openai';
    const gemKey = document.getElementById('input-gemini-key')?.value.trim() || '';
    const gemModel = document.getElementById('select-gemini-model')?.value || 'gemini-2.0-flash';
    const groqKey = document.getElementById('input-groq-key')?.value.trim() || '';
    const groqModel = document.getElementById('select-groq-model')?.value || 'llama-3.3-70b-versatile';

    STATE.apiProvider = prov;
    STATE.pollinationsModel = polModel;
    STATE.geminiKey = gemKey;
    STATE.geminiModel = gemModel;
    STATE.groqKey = groqKey;
    STATE.groqModel = groqModel;

    localStorage.setItem('yap_api_provider', prov);
    localStorage.setItem('yap_pollinations_model', polModel);
    localStorage.setItem('yap_gemini_key', gemKey);
    localStorage.setItem('yap_gemini_model', gemModel);
    localStorage.setItem('yap_groq_key', groqKey);
    localStorage.setItem('yap_groq_model', groqModel);

    updateHeaderBadge();
    closeSettingsModal();
    showToast('✅ Pengaturan API berhasil disimpan!');
    playChime('pop');
  };

  function getProviderDisplayName() {
    if (STATE.apiProvider === 'gemini') {
      return `Google Gemini (${STATE.geminiModel})`;
    } else if (STATE.apiProvider === 'groq') {
      return `Groq (${STATE.groqModel})`;
    } else {
      return `Pollinations (${STATE.pollinationsModel})`;
    }
  }

  function updateHeaderBadge() {
    if (!headerApiBadge) return;
    if (STATE.apiProvider === 'gemini') {
      headerApiBadge.textContent = STATE.geminiKey ? `Gemini (${STATE.geminiModel})` : 'Gemini (Key Diperlukan)';
    } else if (STATE.apiProvider === 'groq') {
      headerApiBadge.textContent = STATE.groqKey ? `Groq (${STATE.groqModel})` : 'Groq (Key Diperlukan)';
    } else {
      headerApiBadge.textContent = `Pollinations (${STATE.pollinationsModel})`;
    }
  }

  window.clearChatHistory = function() {
    if (confirm('Hapus semua riwayat percakapan?')) {
      STATE.messages = [];
      localStorage.removeItem('yap_messages');
      localStorage.removeItem('tap_messages');
      const bubbles = chatScroll.querySelectorAll('.message-bubble-wrap');
      bubbles.forEach(b => b.remove());
      showToast('🗑️ Riwayat obrolan dibersihkan.');
    }
  };

  function showToast(msg) {
    if (!toastContainer) return;
    toastContainer.textContent = msg;
    toastContainer.classList.add('show');
    setTimeout(() => {
      toastContainer.classList.remove('show');
    }, 2800);
  }

  // Restore previous messages if any
  if (STATE.messages.length > 0) {
    STATE.messages.forEach(m => {
      appendMessage(m.role === 'user' ? 'user' : 'ai', m.text, m.code || '');
      if (m.code) {
        STATE.currentHtmlCode = m.code;
        codeEditor.value = m.code;
      }
    });
  }
});
