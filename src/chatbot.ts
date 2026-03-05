// chatbot.ts — Hybrid AI + scripted chatbot widget (UI unchanged)

type IntentKey = 'estimate' | 'emergency' | 'solar' | 'areas' | 'licensed' | 'whychoose' | 'default';

interface BotResponse {
  text: string;
  delay?: number;
}

const RESPONSES: Record<IntentKey, BotResponse[]> = {
  estimate: [
    { text: "Want to know why Diamond in the Sky Roofing stands out? Here are some reasons:" },
    { text: "• Leak-free installs by true roofing experts (not just solar techs).\n• Licensed, insured, and local.\n• 24/7 emergency service.\n• Free estimates and honest advice.\n• Hundreds of 5-star reviews.\n• Owner-led team with decades of experience.", delay: 900 },
  ],
  emergency: [
    { text: "Emergency roofing is available **24/7**! ⚡" },
    {
      text: "Please call us immediately at **760-410-2340** for emergency service. Our team responds fast to protect your property from further damage.",
      delay: 900,
    },
  ],
  solar: [
    { text: "We do solar install + removal/reinstall — roofing experts first, solar second. ☀️", delay: 700 },
  ],
  areas: [
    { text: "We cover **San Diego County**, **Riverside County**, and **Orange County**. 🗺️", delay: 700 },
  ],
  licensed: [
    { text: "Yes — CA License #1117747. We're fully licensed and insured for your peace of mind.", delay: 700 },
  ],
  whychoose: [
    { text: "We're true roofing specialists, not just solar installers.", delay: 700 },
    { text: "• Leak-free installs guaranteed.\n• Local, licensed (CA #1117747), and owner-led.\n• 24/7 emergency service.\n• Free estimates and honest advice.\n• Hundreds of 5-star reviews.", delay: 900 },
  ],
  default: [
    { text: "Here are some common questions about our company:" },
    { text: "**Why choose Diamond in the Sky Roofing over others?**\n- We’re true roofing specialists, not just solar installers.\n- We guarantee leak-free work and stand behind every job.\n- We’re local, licensed, and owner-led.\n- 24/7 emergency service.\n- Free estimates and honest advice.\n- Hundreds of 5-star reviews.\n\n**Do you offer emergency service?**\n- Yes, 24/7 emergency roofing is available. Call/text 760-410-2340.\n\n**Are you licensed and insured?**\n- Yes, CA License #1117747. Fully insured.\n\n**Do you work with solar?**\n- Yes, we do solar install, removal, and re-install — always leak-free.\n\n**What areas do you serve?**\n- San Diego, Riverside, and Orange County.\n\nAsk anything else or type 'estimate' for a quote!", delay: 1200 }
  ],
};

const INTRO: BotResponse[] = [
  { text: "Hi! I'm Lisa from Diamond in the Sky Roofing. 👋", delay: 900 },
  { text: "How can we help you today?", delay: 1200 },
];

function formatText(text: string): string {
  // supports **bold** and paragraph breaks; also safe for our controlled HTML links
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function detectIntent(text: string): IntentKey {
  const lower = text.toLowerCase();
  if (/emergency|urgent|leak|storm|damage|asap/.test(lower)) return 'emergency';
  if (/estimate|quote|price|cost|free/.test(lower)) return 'estimate';
  if (/solar|panel|energy|sun|electric/.test(lower)) return 'solar';
  if (/area|location|cover|city|county|where/.test(lower)) return 'areas';
  return 'default';
}

// ---- AI call (backend) ----
async function getAIReply(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string> {
  try {
    const res = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    const data = await res.json();
    return (data.reply || "").toString();
  } catch {
    return "Sorry — I had trouble responding. Please call/text **760-410-2340** for help.";
  }
}

// ---- Lead Capture (Step 3) ----

type LeadService = 'Repair' | 'Replacement' | 'Inspection' | 'Emergency' | 'Solar' | 'Other';
type LeadProperty = 'Residential' | 'Commercial';

type LeadDraft = {
  service?: LeadService;
  property?: LeadProperty;
  cityOrZip?: string;
  address?: string;
  roofType?: string;     // shingle/tile/flat/metal/unknown
  approxSize?: string;   // sq ft or small/medium/large
  issue?: string;        // leak/storm/age/etc
  timeline?: string;     // asap/this month/1-3 months/planning
  name?: string;
  phone?: string;
  email?: string;
};

type LeadStepKey =
  | 'service'
  | 'property'
  | 'cityOrZip'
  | 'roofType'
  | 'approxSize'
  | 'issue'
  | 'timeline'
  | 'name'
  | 'phone'
  | 'email'
  | 'confirm';

const LEAD_STEPS: Array<{ key: LeadStepKey; question: string; optional?: boolean }> = [
  { key: 'service', question: "What do you need help with? (Repair / Replacement / Inspection / Emergency / Solar)" },
  { key: 'property', question: "Is this **Residential** or **Commercial**?" },
  { key: 'cityOrZip', question: "What city (or ZIP) is the property in?" },
  { key: 'roofType', question: "What roof type? (Shingle / Tile / Flat / Metal / Not sure)" },
  { key: 'approxSize', question: "Approx roof size? (sq ft if you know — or Small / Medium / Large)" },
  { key: 'issue', question: "What’s the main issue or goal? (leak, storm damage, aging roof, new install, etc.)" },
  { key: 'timeline', question: "When do you need service? (ASAP / This month / 1–3 months / Just planning)" },
  { key: 'name', question: "What’s your full name?" },
  { key: 'phone', question: "Best phone number to reach you?" },
  { key: 'email', question: "Email (optional) — you can type **skip** if you prefer.", optional: true },
  { key: 'confirm', question: "Perfect. Want me to submit this request to our team? (yes/no)" },
];

function normalizeYesNo(text: string): 'yes' | 'no' | null {
  const t = text.trim().toLowerCase();
  if (/^(y|yes|yeah|yep|sure|ok|okay)$/i.test(t)) return 'yes';
  if (/^(n|no|nope|nah)$/i.test(t)) return 'no';
  return null;
}

function isSkip(text: string) {
  const t = text.trim().toLowerCase();
  return t === 'skip' || t === 'pass';
}

export function initChatbot(): void {
  const trigger = document.getElementById('chatbotTrigger')!;
  const panel = document.getElementById('chatbotPanel')!;
  const closeBtn = document.getElementById('chatbotClose')!;
  const messages = document.getElementById('chatbotMessages')!;
  const input = document.getElementById('chatbotInput') as HTMLInputElement;
  const sendBtn = document.getElementById('chatbotSend')!;
  const quickReplies = document.getElementById('quickReplies')!;

    // Simple mobile scroll lock when input is focused
    input.addEventListener('focus', () => {
      if (window.innerWidth <= 600) {
        document.body.classList.add('chatbot-lock-scroll');
      }
    });
    input.addEventListener('blur', () => {
      document.body.classList.remove('chatbot-lock-scroll');
    });

  let isOpen = false;
  let hasOpened = false;
  let sequenceId = 0;

  // Chat history for AI context
  const chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Lead flow state
  let leadActive = false;
  let leadStepIndex = 0;
  let leadDraft: LeadDraft = {};

  // ---- Message helpers (unified) ----
  function addMessage(role: 'user' | 'bot', html: string) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.innerHTML = role === 'bot'
      ? `<div class="msg-avatar">◆</div><div class="msg-bubble">${html}</div>`
      : `<div class="msg-bubble">${html}</div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTypingIndicator(): HTMLElement {
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot typing-msg';
    typing.innerHTML = `
      <div class="msg-avatar">◆</div>
      <div class="msg-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  async function runSequence(responses: BotResponse[], myId: number) {
    for (const response of responses) {
      if (myId !== sequenceId) return;
      const typingEl = showTypingIndicator();
      await wait(response.delay ?? 800);
      typingEl.remove();
      if (myId !== sequenceId) return;
      addMessage('bot', formatText(response.text));
    }
  }

  function openChat() {
    isOpen = true;
    panel.style.display = 'flex';
    requestAnimationFrame(() => panel.classList.add('open'));

    if (!hasOpened) {
      hasOpened = true;
      const myId = ++sequenceId;
      wait(500).then(() => runSequence(INTRO, myId));
    }
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('open');
    setTimeout(() => { if (!isOpen) panel.style.display = 'none'; }, 320);
  }

  trigger.addEventListener('click', () => { if (isOpen) closeChat(); else openChat(); });
  closeBtn.addEventListener('click', closeChat);

  // ---- Lead flow helpers ----

  async function askLeadQuestion(myId: number) {
    const step = LEAD_STEPS[leadStepIndex];
    if (!step) return;
    const typingEl = showTypingIndicator();
    await wait(650);
    typingEl.remove();
    if (myId !== sequenceId) return;

    addMessage(
      'bot',
      formatText(`${step.question}\n\n(You can type **cancel** anytime.)`)
    );
  }

  function startLeadFlow(myId: number) {
    leadActive = true;
    leadStepIndex = 0;
    leadDraft = {};
    runSequence(RESPONSES.estimate, myId).then(() => {
      if (myId !== sequenceId) return;
      askLeadQuestion(myId);
    });
  }

  function cancelLeadFlow() {
    leadActive = false;
    leadStepIndex = 0;
    leadDraft = {};
    addMessage(
      'bot',
      formatText(`No worries — cancelled. If you want a quote later, type **estimate**.\n\nOr call/text **760-410-2340** anytime.`)
    );
  }

  function renderLeadSummary(): string {
    const rows: Array<[string, string | undefined]> = [
      ["Service", leadDraft.service],
      ["Property", leadDraft.property],
      ["City/ZIP", leadDraft.cityOrZip],
      ["Roof Type", leadDraft.roofType],
      ["Approx Size", leadDraft.approxSize],
      ["Issue", leadDraft.issue],
      ["Timeline", leadDraft.timeline],
      ["Name", leadDraft.name],
      ["Phone", leadDraft.phone],
      ["Email", leadDraft.email],
    ];

    const lines = rows
      .filter(([, v]) => v && v.trim().length > 0)
      .map(([k, v]) => `• <strong>${k}:</strong> ${escapeHtml(v as string)}`)
      .join('<br>');

    const contactLink = `<a href="#contact" style="text-decoration:underline;">open the contact form</a>`;
    return `${lines}<br><br>You can also ${contactLink} or call/text <strong>760-410-2340</strong>.`;
  }

  function setLeadField(key: LeadStepKey, value: string) {
    const v = value.trim();
    switch (key) {
      case 'service':
        leadDraft.service = (v.charAt(0).toUpperCase() + v.slice(1)) as LeadService;
        break;
      case 'property':
        leadDraft.property = (v.toLowerCase().includes('comm') ? 'Commercial' : 'Residential');
        break;
      case 'cityOrZip':
        leadDraft.cityOrZip = v;
        break;
      case 'roofType':
        leadDraft.roofType = v;
        break;
      case 'approxSize':
        leadDraft.approxSize = v;
        break;
      case 'issue':
        leadDraft.issue = v;
        break;
      case 'timeline':
        leadDraft.timeline = v;
        break;
      case 'name':
        leadDraft.name = v;
        break;
      case 'phone':
        leadDraft.phone = v;
        break;
      case 'email':
        leadDraft.email = v;
        break;
      default:
        break;
    }
  }

  async function handleLeadInput(text: string) {
    const myId = ++sequenceId;

    const lower = text.trim().toLowerCase();
    if (lower === 'cancel' || lower === 'stop' || lower === 'never mind') {
      cancelLeadFlow();
      return;
    }

    const step = LEAD_STEPS[leadStepIndex];
    if (!step) return;

// confirm step
if (step.key === 'confirm') {
  const yn = normalizeYesNo(text);

  if (!yn) {
    addMessage('bot', formatText("Please reply **yes** or **no**."));
    return;
  }

  if (yn === 'no') {
    leadActive = false;
    addMessage(
      'bot',
      formatText("All good. If you want, you can still call/text **760-410-2340** or use the contact form.")
    );
    return;
  }

  // 🔥 YES → Send to backend
  const typingEl = showTypingIndicator();

  try {
    const res = await fetch("http://localhost:3001/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadDraft),
    });

    typingEl.remove();

    if (res.ok) {
      addMessage(
        'bot',
        formatText("✅ Sent! Our team will contact you shortly.\n\nIf urgent, call/text **760-410-2340**.")
      );
    } else {
      addMessage(
        'bot',
        formatText("⚠️ I couldn’t submit it right now. Please call/text **760-410-2340**.")
      );
    }
  } catch (err) {
    typingEl.remove();
    addMessage(
      'bot',
      formatText("⚠️ Submission failed. Please call/text **760-410-2340**.")
    );
  }

  leadActive = false;
  leadStepIndex = 0;
  leadDraft = {};
  return;
}

    // optional email step
    if (step.optional && isSkip(text)) {
      leadStepIndex++;
      await askLeadQuestion(myId);
      return;
    }

    setLeadField(step.key, text);
    leadStepIndex++;

    // if next step is confirm, show summary first
    if (LEAD_STEPS[leadStepIndex]?.key === 'confirm') {
      addMessage('bot', renderLeadSummary());
    }

    await askLeadQuestion(myId);
  }

  // ---- Quick replies ----
  quickReplies.querySelectorAll<HTMLElement>('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = (btn.dataset.reply || 'default') as IntentKey;
      addMessage('user', escapeHtml(btn.textContent || ''));
      quickReplies.style.display = 'none';

      const myId = ++sequenceId;

      // Only answer the specific question, not all prebuilt answers
      if (RESPONSES[key]) {
        runSequence(RESPONSES[key], myId);
      } else {
        runSequence(RESPONSES.default.slice(0, 1), myId); // fallback: intro only
      }
    });
  });

  // ---- Free-text send ----
  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage('user', escapeHtml(text));
    quickReplies.style.display = 'none';

    // If lead flow is active, we handle step-by-step Qs
    if (leadActive) {
      await handleLeadInput(text);
      return;
    }

    const intent = detectIntent(text);

    // Emergency override always scripted
    if (intent === 'emergency') {
      const myId = ++sequenceId;
      runSequence(RESPONSES.emergency, myId);
      return;
    }

    // If they ask for estimate → start lead flow
    if (intent === 'estimate') {
      const myId = ++sequenceId;
      startLeadFlow(myId);
      return;
    }

    // For prebuilt questions, only answer that specific question
    if (intent !== 'default' && RESPONSES[intent]) {
      const myId = ++sequenceId;
      runSequence(RESPONSES[intent], myId);
      return;
    }

    // Otherwise: AI answer using KB server
    const myId = ++sequenceId;
    const typingEl = showTypingIndicator();
    chatHistory.push({ role: 'user', content: text });
    const aiReply = await getAIReply(text, chatHistory);
    chatHistory.push({ role: 'assistant', content: aiReply });
    typingEl.remove();
    if (myId !== sequenceId) return;

    addMessage('bot', formatText(aiReply));
  }

  sendBtn.addEventListener('click', () => { void handleSend(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') void handleSend(); });
}