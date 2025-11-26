(function(){
  const chatWindow = document.getElementById('chatWindow');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const resetBtn = document.getElementById('resetChat');
  const devSwitch = document.getElementById('devSwitch');
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());

  const STORAGE_KEY = 'localtrainer.chat.v1';
  const DEV_KEY = 'localtrainer.devMode';

  function loadState(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }
  function saveState(messages){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }
  function loadDev(){
    try { return localStorage.getItem(DEV_KEY) === '1'; } catch { return false; }
  }
  function saveDev(enabled){
    try { localStorage.setItem(DEV_KEY, enabled ? '1' : '0'); } catch {}
  }

  const messages = loadState();
  const initialIfEmpty = [
    { role: 'assistant', text: 'Hi, I\'m LocalTrainer. I run fully offline on your device. How can I help today?' }
  ];
  if (messages.length === 0) {
    messages.push(...initialIfEmpty);
  }

  devSwitch.checked = loadDev();

  function scrollToBottom(){
    requestAnimationFrame(() => { chatWindow.scrollTop = chatWindow.scrollHeight; });
  }

  function render(){
    chatWindow.innerHTML = '';
    for (const m of messages){
      const wrap = document.createElement('div');
      wrap.className = `mb-4`;
      const bubble = document.createElement('div');
      const isUser = m.role === 'user';
      bubble.className = [
        'max-w-[85%] rounded-lg px-3 py-2 text-sm shadow',
        isUser ? 'ml-auto bg-base-700 border border-slate-700' : 'mr-auto bg-base-900 border border-slate-800'
      ].join(' ');
      const name = document.createElement('div');
      name.className = 'mb-1 text-xs ' + (isUser ? 'text-slate-400 text-right' : 'text-neon-green');
      name.textContent = isUser ? 'You' : 'LocalTrainer';
      const text = document.createElement('div');
      text.className = 'text-slate-200 whitespace-pre-wrap';
      text.textContent = m.text;
      wrap.appendChild(name);
      bubble.appendChild(text);
      wrap.appendChild(bubble);
      chatWindow.appendChild(wrap);
    }
    scrollToBottom();
  }

  function fakeAssistantReply(input, devMode){
    const lower = input.trim();
    const isTrainCmd = lower.toUpperCase().startsWith('TRAIN:');

    if (devMode && isTrainCmd){
      const [cmdRaw, ...rest] = lower.split(/\s+/);
      const cmd = cmdRaw.toUpperCase();
      switch (cmd) {
        case 'TRAIN:ADD':
          return 'Staged samples added to buffer. PII redaction: ON. Use TRAIN:PREPARE to tokenize & split.';
        case 'TRAIN:PREPARE':
          return 'Prepared dataset (tokenized, balanced). Ready to fine-tune with LoRA/QLoRA.';
        case 'TRAIN:EVAL':
          return 'Evaluation complete: perplexity=5.3, exact_match=72%. Baseline improved by +6%.';
        case 'TRAIN:EXPORT_ADAPTER':
          return 'Adapter exported: ./adapters/domain-adapter-v1.safetensors';
        case 'TRAIN:LOAD_ADAPTER':
          return 'Adapter loaded. Active profile: domain-adapter-v1';
        case 'TRAIN:RESET_BUFFER':
          return 'Training buffer cleared. Persistent datasets unaffected.';
        case 'TRAIN:CONFIRM_PII':
          return 'PII-confirmation acknowledged. Redacted samples approved for training.';
        default:
          return 'Unknown TRAIN command. Supported: TRAIN:ADD, TRAIN:PREPARE, TRAIN:EVAL, TRAIN:EXPORT_ADAPTER, TRAIN:LOAD_ADAPTER, TRAIN:RESET_BUFFER, TRAIN:CONFIRM_PII';
      }
    }

    // Simple offline heuristics for demo purposes
    if (/hello|hi|hey/i.test(lower)) return 'Hello! I\'m running locally with no network access.';
    if (/offline|privacy|private/i.test(lower)) return 'Everything stays on-device. No cloud calls, telemetry, or tracking.';
    if (/lora|qlora|fine[- ]?tune/i.test(lower)) return 'Use adapter-based fine-tuning (LoRA/QLoRA) for efficient personalization on your hardware.';
    if (/dataset|data set/i.test(lower)) return 'You can import JSONL/CSV/TXT, tag samples, and manage buffers locally.';
    if (/help|commands/i.test(lower)) return 'Try toggling Developer mode and sending TRAIN:ADD or TRAIN:PREPARE.';

    const templates = [
      'Got it. Running locally, I can help summarize, plan, or prototype ideas offline.',
      'Acknowledged. Would you like a brief outline or a step-by-step plan?',
      'Processed. For training flows, check the Developer Mode section below.'
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = (chatInput.value || '').trim();
    if (!text) return;
    messages.push({ role: 'user', text });
    saveState(messages);
    render();

    // Simulate processing delay
    setTimeout(() => {
      const reply = fakeAssistantReply(text, devSwitch.checked);
      messages.push({ role: 'assistant', text: reply });
      saveState(messages);
      render();
    }, 300);

    chatInput.value = '';
    chatInput.focus();
  });

  devSwitch.addEventListener('change', () => {
    saveDev(devSwitch.checked);
  });

  resetBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    messages.length = 0;
    messages.push({ role: 'assistant', text: 'Chat reset. I\'m LocalTrainer ? offline and ready.' });
    saveState(messages);
    render();
  });

  render();
})();
