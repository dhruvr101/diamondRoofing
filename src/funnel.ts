// funnel.ts — Multi-step contact funnel logic

interface FunnelState {
  property: string;
  service: string;
  timeline: string;
}

const state: FunnelState = { property: '', service: '', timeline: '' };

// Cached DOM elements — queried once at init
let progressSteps: Element[] = [];
let progressLines: (HTMLElement | null)[] = [];
let funnelSteps: Element[] = [];

function setProgress(step: number) {
  progressSteps.forEach((dot, i) => {
    const n = i + 1;
    dot.classList.remove('active', 'done');
    if (n < step) dot.classList.add('done');
    else if (n === step) dot.classList.add('active');
  });
  progressLines.forEach((el, i) => {
    if (el) el.style.width = i < step - 1 ? '100%' : '0%';
  });
}

function showStep(step: number | 'success') {
  funnelSteps.forEach(s => s.classList.remove('active'));
  const id = step === 'success' ? 'stepSuccess' : `step${step}`;
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function goToStep(step: number) {
  showStep(step);
  setProgress(step);
}

function bindChoiceCards(stepId: string, onSelect: (value: string) => void) {
  const cards = document.querySelectorAll(`#${stepId} .choice-card`);
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      onSelect((card as HTMLElement).dataset.value || '');
    });
  });
}

export function initFunnel(): void {
  // Cache elements once
  progressSteps = Array.from(document.querySelectorAll('.progress-step'));
  progressLines = ['pLine1', 'pLine2', 'pLine3'].map(id => document.getElementById(id));
  funnelSteps = Array.from(document.querySelectorAll('.funnel-step'));

  // --- STEP 1: Property type ---
  bindChoiceCards('step1', (value) => {
    state.property = value;
    setTimeout(() => goToStep(2), 320);
  });

  // --- STEP 2: Service chips ---
  const chips = document.querySelectorAll('#step2 .chip');
  const next2 = document.getElementById('next2') as HTMLButtonElement;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      state.service = (chip as HTMLElement).dataset.value || '';
      if (next2) next2.disabled = false;
    });
  });

  next2?.addEventListener('click', () => { if (state.service) goToStep(3); });
  document.getElementById('back2')?.addEventListener('click', () => goToStep(1));

  // --- STEP 3: Timeline ---
  bindChoiceCards('step3', (value) => {
    state.timeline = value;
    setTimeout(() => goToStep(4), 320);
  });

  document.getElementById('back3')?.addEventListener('click', () => goToStep(2));

  // --- STEP 4: Contact form ---
  document.getElementById('back4')?.addEventListener('click', () => goToStep(3));

  const form = document.getElementById('contactForm') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    const formData: Record<string, string> = { ...state };
    inputs.forEach(input => { if (input.placeholder) formData[input.placeholder] = input.value; });

    try {
      await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // still show success — email failure shouldn't block UX
    }

    setProgress(5);
    showStep('success');
  });

  // Initialize
  setProgress(1);
}
