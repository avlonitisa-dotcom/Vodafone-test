/* ---------- Self-playing demo: drives the real page controls ---------- */
(function () {

/* Timing helpers (pause-aware) */
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

/* Elements */
const cursor = document.getElementById('auto-cursor');
const autoPlayBtn = document.getElementById('auto-play-btn');

const phoneInput = document.getElementById('phone-input');
const continueBtn = document.getElementById('continue-btn');

const smsGateModal = document.getElementById('sms-gate-modal');
const smsGateSendOtp = document.getElementById('sms-gate-send-otp');
const gateOtpInput = document.getElementById('sms-gate-otp-input');
const gateConfirmOtp = document.getElementById('sms-gate-confirm-otp');

const flexModal = document.getElementById('flex-modal');
const standardModal = document.getElementById('standard-modal');
const flexAmountsContinue = document.getElementById('flex-amounts-continue');
const walletRadio = document.querySelector('input[name="flex-payment-method"][value="wallet"]');
const cardRadio = document.querySelector('input[name="flex-payment-method"][value="card"]');
const cardNumberInput = document.getElementById('flex-card-number');
const cardExpiryInput = document.getElementById('flex-card-expiry');
const cardCvvInput = document.getElementById('flex-card-cvv');
const flexModalContinue = document.getElementById('flex-modal-continue');

const allAutoModals = [standardModal, flexModal, smsGateModal];

/* Cursor + synthetic interaction */
async function moveCursorTo(el) {
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  await wait(350);
  const r = el.getBoundingClientRect();
  cursor.classList.add('is-active');
  cursor.style.left = (r.left + r.width / 2) + 'px';
  cursor.style.top = (r.top + r.height / 2) + 'px';
  await wait(450);
}

async function clickAt(el) {
  await moveCursorTo(el);
  cursor.classList.add('is-clicking');
  await wait(220);
  cursor.classList.remove('is-clicking');
  el.click();
  await wait(150);
}

async function typeInto(el, text, speed = 90) {
  el.focus();
  el.value = '';
  for (const ch of text) {
    await waitWhilePaused();
    el.value += ch;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(speed);
  }
}

/* Reset the real page back to its starting state */
function resetPage() {
  allAutoModals.forEach((m) => { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); });
  phoneInput.value = '';
  phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
  gateOtpInput.value = '';
  gateOtpInput.dispatchEvent(new Event('input', { bubbles: true }));
  if (cardNumberInput) cardNumberInput.value = '';
  if (cardExpiryInput) cardExpiryInput.value = '';
  if (cardCvvInput) cardCvvInput.value = '';
  if (cardRadio && !cardRadio.checked) cardRadio.click();
  cursor.classList.remove('is-active', 'is-clicking');
  cursor.style.left = '-40px';
  cursor.style.top = '-40px';
}

/* ---------- Sequence: phone → Flex/Snappi payment, end to end ---------- */
async function runSequence() {
  resetPage();
  await wait(700);

  await clickAt(phoneInput);
  await typeInto(phoneInput, '6912345678');
  await wait(400);

  await clickAt(continueBtn);
  await wait(3400); // real 3s "backend check" overlay, then the SMS-gate modal opens

  await clickAt(smsGateSendOtp);
  await wait(500);

  await clickAt(gateOtpInput);
  await typeInto(gateOtpInput, '4821', 140);
  await wait(400);

  await clickAt(gateConfirmOtp);
  await wait(2400); // real 2s "fetching balance" overlay, then the Flex/Snappi modal opens

  await wait(3600); // let the prefilled bill + installment amounts be read

  await clickAt(flexAmountsContinue);
  await wait(700);

  if (walletRadio && cardRadio) {
    await clickAt(walletRadio);
    await wait(1300);
    await clickAt(cardRadio);
    await wait(600);
  }

  await clickAt(cardNumberInput);
  await typeInto(cardNumberInput, '4111 1111 1111 1111', 40);
  await clickAt(cardExpiryInput);
  await typeInto(cardExpiryInput, '09/28', 110);
  await clickAt(cardCvvInput);
  await typeInto(cardCvvInput, '123', 140);
  await wait(600);

  await clickAt(flexModalContinue);
  await wait(4200);

  onSequenceEnd();
}

/* ---------- Play / Pause / Replay ---------- */
let started = false;
let ended = false;

function onSequenceEnd() {
  started = false;
  ended = true;
  paused = false;
  autoPlayBtn.textContent = '↻ Επανάληψη';
}

autoPlayBtn.addEventListener('click', () => {
  if (ended) {
    ended = false;
    started = true;
    paused = false;
    autoPlayBtn.textContent = '⏸ Παύση';
    runSequence();
    return;
  }
  if (!started) {
    started = true;
    paused = false;
    autoPlayBtn.textContent = '⏸ Παύση';
    runSequence();
    return;
  }
  paused = !paused;
  autoPlayBtn.textContent = paused ? '▶ Συνέχεια' : '⏸ Παύση';
});

/* Auto-start */
setTimeout(() => {
  started = true;
  autoPlayBtn.textContent = '⏸ Παύση';
  runSequence();
}, 800);

})();
