// chatbot.ts — Scripted AI chatbot widget (frontend-only)

type IntentKey = 'estimate' | 'emergency' | 'solar' | 'areas' | 'default';

interface BotResponse {
  text: string;
  delay?: number;
}

const RESPONSES: Record<IntentKey, BotResponse[]> = {
  estimate: [
    { text: "Great! Getting a free estimate is easy. 🏠" },
    {
      text: "We cover all of San Diego County, Riverside County, and Orange County. Just fill out our quick 2-minute form and we'll reach out within 24 hours — or call us directly at **760-410-2340** for an immediate response!",
      delay: 1200,
    },
  ],
  emergency: [
    { text: "Emergency roofing is available **24/7**! ⚡" },
    {
      text: "Please call us immediately at **760-410-2340** for emergency service. Our team responds fast to protect your property from further damage. Don't wait — every minute counts with roof emergencies!",
      delay: 1000,
    },
  ],
  solar: [
    { text: "Diamond in the Sky Roofing is your one-stop shop for both roofing AND solar! ☀️" },
    {
      text: "We handle complete solar panel installation, removal, and re-installation. Being roofing experts first means your solar goes in leak-free, every time. We serve residential and commercial clients across Southern California.",
      delay: 1200,
    },
    {
      text: "Want a free solar consultation? Call **760-410-2340** or use our estimate form!",
      delay: 2200,
    },
  ],
  areas: [
    { text: "We cover a wide area! 🗺️" },
    {
      text: "**San Diego County** — all cities including Carlsbad, Oceanside, Encinitas, San Marcos, Escondido, Vista, Poway, and 20+ more.\n\n**Riverside County** — Temecula, Murrieta, Menifee, Corona, and surrounding areas.\n\n**Orange County** — Irvine, Anaheim, Mission Viejo, San Clemente, and more.",
      delay: 1000,
    },
  ],
  default: [
    { text: "Thanks for your message! 😊" },
    {
      text: "For the fastest response, call or text us at **760-410-2340**. We're available for emergency service 24/7. Or use our free estimate form above!",
      delay: 900,
    },
  ],
};

const INTRO: BotResponse[] = [
  { text: "Hi! I'm the Diamond in the Sky Roofing AI assistant. 👋", delay: 1200 },
  { text: "I can help you get a free estimate, answer questions about our services, or connect you with our team. What can I help you with today?", delay: 2000 },
];

function formatText(text: string): string {
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
  if (/estimate|quote|price|cost|free/.test(lower)) return 'estimate';
  if (/emergency|urgent|leak|broken|storm|damage|asap/.test(lower)) return 'emergency';
  if (/solar|panel|energy|sun|electric/.test(lower)) return 'solar';
  if (/area|location|cover|city|county|where/.test(lower)) return 'areas';
  return 'default';
}

export function initChatbot(): void {
  const trigger = document.getElementById('chatbotTrigger')!;
  const panel = document.getElementById('chatbotPanel')!;
  const closeBtn = document.getElementById('chatbotClose')!;
  const messages = document.getElementById('chatbotMessages')!;
  const input = document.getElementById('chatbotInput') as HTMLInputElement;
  const sendBtn = document.getElementById('chatbotSend')!;
  const quickReplies = document.getElementById('quickReplies')!;

  let isOpen = false;
  let hasOpened = false;
  // Sequence ID — increment to cancel in-flight async message loops
  let sequenceId = 0;

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
      await wait(response.delay ?? 900);
      typingEl.remove();
      if (myId !== sequenceId) return;
      addMessage('bot', formatText(response.text));
    }
  }

  // ---- Open / close ----

  function openChat() {
    isOpen = true;
    panel.style.display = 'flex';
    requestAnimationFrame(() => panel.classList.add('open'));

    if (!hasOpened) {
      hasOpened = true;
      const myId = ++sequenceId;
      wait(800).then(() => runSequence(INTRO, myId));
    }
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('open');
    setTimeout(() => { if (!isOpen) panel.style.display = 'none'; }, 320);
  }

  trigger.addEventListener('click', () => { if (isOpen) closeChat(); else openChat(); });
  closeBtn.addEventListener('click', closeChat);

  // ---- Quick replies ----

  quickReplies.querySelectorAll<HTMLElement>('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = (btn.dataset.reply || 'default') as IntentKey;
      addMessage('user', escapeHtml(btn.textContent || ''));
      quickReplies.style.display = 'none';
      const myId = ++sequenceId;
      runSequence(RESPONSES[key] ?? RESPONSES.default, myId);
    });
  });

  // ---- Free-text send ----

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage('user', escapeHtml(text));
    quickReplies.style.display = 'none';
    const key = detectIntent(text);
    const myId = ++sequenceId;
    runSequence(RESPONSES[key], myId);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });
}
