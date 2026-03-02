// funnel.ts — Multi-step contact funnel logic

interface FunnelState {
  step: number;
  property: string;
  service: string;
  timeline: string;
}

const state: FunnelState = {
  step: 1,
  property: '',
  service: '',
  timeline: '',
};

function setProgress(step: number) {
  // Update step dots
  document.querySelectorAll('.progress-step').forEach((dot, i) => {
    const stepNum = i + 1;
    dot.classList.remove('active', 'done');
    if (stepNum < step) dot.classList.add('done');
    else if (stepNum === step) dot.classList.add('active');
  });

  // Update progress lines
  const lines = ['pLine1', 'pLine2', 'pLine3'];
  lines.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.width = i < step - 1 ? '100%' : '0%';
  });
}

function showStep(step: number | 'success') {
  document.querySelectorAll('.funnel-step').forEach(s => s.classList.remove('active'));
  const id = step === 'success' ? 'stepSuccess' : `step${step}`;
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    // Trigger reflow for animation restart
    void (el as HTMLElement).offsetWidth;
  }
}

function goToStep(step: number) {
  state.step = step;
  showStep(step);
  setProgress(step);
}

export function initFunnel(): void {
  // --- STEP 1: Property type ---
  document.querySelectorAll('#step1 .choice-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#step1 .choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.property = (card as HTMLElement).dataset.value || '';

      setTimeout(() => goToStep(2), 320);
    });
  });

  // --- STEP 2: Service chips ---
  const chips = document.querySelectorAll('#step2 .chip');
  const next2 = document.getElementById('next2') as HTMLButtonElement;
  const back2 = document.getElementById('back2');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      state.service = (chip as HTMLElement).dataset.value || '';
      if (next2) next2.disabled = false;
    });
  });

  next2?.addEventListener('click', () => {
    if (!state.service) return;
    goToStep(3);
  });

  back2?.addEventListener('click', () => goToStep(1));

  // --- STEP 3: Timeline ---
  document.querySelectorAll('#step3 .choice-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#step3 .choice-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.timeline = (card as HTMLElement).dataset.value || '';

      setTimeout(() => goToStep(4), 320);
    });
  });

  document.getElementById('back3')?.addEventListener('click', () => goToStep(2));

  // --- STEP 4: Contact form ---
  document.getElementById('back4')?.addEventListener('click', () => goToStep(3));

  const form = document.getElementById('contactForm') as HTMLFormElement;
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect form data
    const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    const formData: Record<string, string> = {
      property: state.property,
      service: state.service,
      timeline: state.timeline,
    };
    inputs.forEach(input => {
      if (input.placeholder) {
        formData[input.type || 'textarea'] = input.value;
      }
    });

    console.log('Diamond Roofing Estimate Request:', formData);

    // Show success
    setProgress(5);
    showStep('success');
  });

  // Initialize
  setProgress(1);
}
