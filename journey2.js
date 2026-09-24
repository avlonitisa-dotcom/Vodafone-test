/* ---------- Timing helpers (pause-aware) ---------- */
let paused = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitWhilePaused() {
  while (paused) await sleep(120);
}

async function wait(ms) {
  const step = 50;
  let elapsed = 0;
  while (elapsed < ms) {
    await waitWhilePaused();
    await sleep(step);
    elapsed += step;
  }
}

/* ---------- Elements ---------- */
const frame = document.getElementById('journey-frame');
const cursor = document.getElementById('journey-cursor');
const playBtn = document.getElementById('journey-play');
const dots = document.querySelectorAll('.journey-dot');
const acts = document.querySelectorAll('.journey-act');
const modalOverlay = document.getElementById('journey-modal-overlay');

const flexCta = document.getElementById('jb-flex-cta');
const phoneInput = document.getElementById('jb-phone-input');
const otpInput = document.getElementById('jb-otp-input');

const billingFirstname = document.getElementById('jb-billing-firstname');
const billingLastname = document.getElementById('jb-billing-lastname');
const billingPhone = document.getElementById('jb-billing-phone');
const billingEmail = document.getElementById('jb-billing-email');
const billingAddress = document.getElementById('jb-billing-address');
const billingContinue = document.getElementById('jb-billing-continue');

const deliveryBell = document.getElementById('jb-delivery-bell');
const deliveryContinue = document.getElementById('jb-delivery-continue');
const deliveryAddressDisplay = document.getElementById('jb-delivery-address-display');
const BILLING_ADDRESS_TEXT = 'Λεωφόρος Συγγρού, 100, Δ. Αθηναίων, Ν. Αττικής, 11745';

const installmentsSlider = document.getElementById('jb-slider-installments');
const installmentsValueInput = document.getElementById('jb-installments-value');
const amountSlider = document.getElementById('jb-slider-amount');
const amountValueInput = document.getElementById('jb-amount-value');
const resultBox = document.getElementById('jb-result');
const resultCount = document.getElementById('jb-result-count');
const resultRate = document.getElementById('jb-result-rate');
const resultTotal = document.getElementById('jb-result-total');
const resultRemaining = document.getElementById('jb-result-remaining');
const completeBtn = document.getElementById('jb-complete-btn');
const consentCheckbox = document.getElementById('jb-consent-checkbox');
const snappiContinueBtn = document.getElementById('jb-snappi-continue');

consentCheckbox.addEventListener('change', () => {
  completeBtn.disabled = !consentCheckbox.checked;
});

const PRODUCT_PRICE = 699;
const remainderAmountDisplay = document.getElementById('jb-remainder-amount');
const nexiAmountDisplay = document.getElementById('jb-nexi-amount');
const cardNumberInput = document.getElementById('jb-card-number');
const cardHolderInput = document.getElementById('jb-card-holder');
const cardExpiryInput = document.getElementById('jb-card-expiry');
const cardCvvInput = document.getElementById('jb-card-cvv');
const remainderPayBtn = document.getElementById('jb-remainder-pay-btn');

/* ---------- View helpers ---------- */
function showAct(name) {
  acts.forEach((a) => a.classList.toggle('is-active', a.dataset.act === name));
}

function showPanelStep(name) {
  document.querySelectorAll('.jb-panel-step').forEach((el) => {
    el.hidden = el.dataset.pstep !== name;
  });
}

function setDot(index) {
  dots.forEach((d, i) => {
    d.classList.toggle('is-active', i === index);
    d.classList.toggle('is-done', i < index);
  });
}

function updateSliderFill(el) {
  const min = +el.min, max = +el.max, val = +el.value;
  const pct = ((val - min) / (max - min)) * 100;
  el.style.setProperty('--jb-fill', pct + '%');
}

function formatEuro(n) {
  return n.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';
}

function recomputeResult() {
  const installments = +installmentsSlider.value;
  const amount = +amountSlider.value;
  const remaining = Math.max(PRODUCT_PRICE - amount, 0);
  installmentsValueInput.value = installments;
  amountValueInput.value = amount;
  const rate = amount / installments;
  resultCount.textContent = installments + ' δόσεις';
  resultRate.textContent = formatEuro(rate);
  resultTotal.textContent = formatEuro(amount);
  resultRemaining.textContent = formatEuro(remaining);
  remainderAmountDisplay.textContent = formatEuro(remaining);
  nexiAmountDisplay.textContent = 'ΕΥΡΩ ' + remaining.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  remainderPayBtn.textContent = 'Πληρωμή ' + formatEuro(remaining);
}

/* ---------- Cursor animation ---------- */
async function moveCursorTo(el) {
  const stageRect = frame.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const x = rect.left - stageRect.left + rect.width / 2;
  const y = rect.top - stageRect.top + rect.height / 2;
  cursor.style.left = x + 'px';
  cursor.style.top = y + 'px';
  await wait(700);
}

async function clickAt(el) {
  await moveCursorTo(el);
  cursor.classList.add('is-clicking');
  await wait(300);
  cursor.classList.remove('is-clicking');
}

async function typeInto(el, text, speed = 90) {
  el.value = '';
  for (const ch of text) {
    await waitWhilePaused();
    el.value += ch;
    await sleep(speed);
  }
}

async function dragSliderTo(el, target, steps = 14, stepDelay = 45) {
  const start = +el.value;
  const min = +el.min, max = +el.max;
  const stageRect = frame.getBoundingClientRect();
  const trackRect = el.getBoundingClientRect();
  const y = trackRect.top - stageRect.top + trackRect.height / 2;

  function xForValue(v) {
    const pct = (v - min) / (max - min);
    return trackRect.left - stageRect.left + pct * trackRect.width;
  }

  cursor.style.left = xForValue(start) + 'px';
  cursor.style.top = y + 'px';
  await wait(250);
  cursor.classList.add('is-clicking');
  await wait(150);

  for (let i = 1; i <= steps; i++) {
    await waitWhilePaused();
    const v = Math.round(start + (target - start) * (i / steps));
    el.value = v;
    updateSliderFill(el);
    recomputeResult();
    cursor.style.left = xForValue(v) + 'px';
    await sleep(stepDelay);
  }

  cursor.classList.remove('is-clicking');
}

/* ---------- Sequence ---------- */
function resetAll() {
  showAct('browse');
  modalOverlay.classList.remove('is-open');
  showPanelStep('phone');
  phoneInput.value = '';
  otpInput.value = '';
  billingFirstname.value = '';
  billingLastname.value = '';
  billingPhone.value = '';
  billingEmail.value = '';
  billingAddress.value = '';
  deliveryBell.value = '';
  deliveryAddressDisplay.textContent = '';
  cardNumberInput.value = '';
  cardHolderInput.value = '';
  cardExpiryInput.value = '';
  cardCvvInput.value = '';
  installmentsSlider.value = 2;
  amountSlider.value = 10;
  updateSliderFill(installmentsSlider);
  updateSliderFill(amountSlider);
  recomputeResult();
  resultBox.hidden = true;
  consentCheckbox.checked = false;
  completeBtn.disabled = true;
  cursor.style.left = '50%';
  cursor.style.top = '50%';
  setDot(0);
}

async function runSequence() {
  resetAll();
  await wait(600);

  /* Act 1 — browse the product, open Vodafone Flex */
  await clickAt(flexCta);
  modalOverlay.classList.add('is-open');
  showPanelStep('phone');
  await wait(900);

  setDot(1);
  await clickAt(phoneInput);
  await typeInto(phoneInput, '6912345678');
  await wait(400);
  await clickAt(document.querySelector('[data-pstep="phone"] .jb-btn-red'));

  showPanelStep('otp');
  await wait(900);
  await clickAt(otpInput);
  await typeInto(otpInput, '4821', 140);
  await wait(400);
  await clickAt(document.querySelector('[data-pstep="otp"] .jb-btn-red'));

  showPanelStep('result');
  await wait(1700);

  setDot(2);
  await clickAt(document.querySelector('[data-pstep="result"] .jb-btn-red'));
  modalOverlay.classList.remove('is-open');
  await wait(450);

  /* Act 2a — billing details */
  showAct('billing');
  await wait(600);
  await clickAt(billingFirstname);
  await typeInto(billingFirstname, 'Γιώργος');
  await clickAt(billingLastname);
  await typeInto(billingLastname, 'Παπαδόπουλος');
  await clickAt(billingPhone);
  await typeInto(billingPhone, '6912345678');
  await clickAt(billingEmail);
  await typeInto(billingEmail, 'g.papadopoulos@example.com', 55);
  await clickAt(billingAddress);
  await typeInto(billingAddress, BILLING_ADDRESS_TEXT, 40);
  await wait(500);
  await clickAt(billingContinue);
  deliveryAddressDisplay.textContent = billingAddress.value.toUpperCase();
  await wait(450);

  /* Act 2b — delivery details, using the address saved during billing */
  showAct('delivery');
  await wait(900);
  await clickAt(deliveryBell);
  await typeInto(deliveryBell, 'Παπαδόπουλος');
  await wait(600);
  await clickAt(deliveryContinue);
  await wait(450);

  /* Act 2c — checkout, choose amount & installments */
  showAct('checkout');
  await wait(750);

  await dragSliderTo(installmentsSlider, 36);
  await wait(300);
  /* Only half the price is financed through Flex — the rest is paid by card afterwards. */
  await dragSliderTo(amountSlider, Math.round(PRODUCT_PRICE / 2));
  resultBox.hidden = false;
  await wait(2600);

  await clickAt(consentCheckbox);
  consentCheckbox.checked = true;
  completeBtn.disabled = false;
  await wait(600);

  setDot(3);
  await clickAt(completeBtn);

  /* Redirect: Vodafone → Snappi onboarding */
  showAct('redirect-snappi');
  await wait(6000);

  /* Act 3 — redirected to Snappi for onboarding (last step only) */
  showAct('snappi');
  await wait(5200);
  await clickAt(snappiContinueBtn);

  /* Redirect: Snappi → back to Vodafone */
  showAct('redirect-vodafone');
  await wait(6000);

  /* Act 3b — pay the remaining balance by card before the loan can be approved */
  setDot(4);
  showAct('remainder');
  await wait(800);
  await clickAt(cardNumberInput);
  await typeInto(cardNumberInput, '4111 1111 1111 1111', 45);
  await clickAt(cardHolderInput);
  await typeInto(cardHolderInput, 'GEORGIOS PAPADOPOULOS', 45);
  await clickAt(cardExpiryInput);
  await typeInto(cardExpiryInput, '09/28', 110);
  await clickAt(cardCvvInput);
  await typeInto(cardCvvInput, '123', 140);
  await wait(600);
  await clickAt(remainderPayBtn);
  await wait(700);

  /* Act 4 — back on Vodafone, purchase confirmed */
  showAct('confirmation');
  await wait(6400);

  onSequenceEnd();
}

/* ---------- Play / Pause / Replay ---------- */
let started = false;
let ended = false;

function onSequenceEnd() {
  started = false;
  ended = true;
  paused = false;
  playBtn.textContent = '↻ Replay';
}

playBtn.addEventListener('click', () => {
  if (ended) {
    ended = false;
    started = true;
    paused = false;
    playBtn.textContent = '⏸ Pause';
    runSequence();
    return;
  }
  if (!started) {
    started = true;
    paused = false;
    playBtn.textContent = '⏸ Pause';
    runSequence();
    return;
  }
  paused = !paused;
  playBtn.textContent = paused ? '▶ Play' : '⏸ Pause';
});

/* Initial state */
resetAll();
