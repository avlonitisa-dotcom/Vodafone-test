/* ---------- Main payment card ---------- */
const phoneInput = document.getElementById('phone-input');
const continueBtn = document.getElementById('continue-btn');
const methodPhone = document.getElementById('method-phone');
const methodSubscriber = document.getElementById('method-subscriber');

function updateContinueState() {
  continueBtn.disabled = phoneInput.value.trim().length === 0;
}

function updatePlaceholder() {
  phoneInput.value = '';
  phoneInput.placeholder = methodPhone.checked
    ? 'Enter your phone number'
    : 'Enter your subscriber registry number';
  updateContinueState();
}

phoneInput.addEventListener('input', updateContinueState);
methodPhone.addEventListener('change', updatePlaceholder);
methodSubscriber.addEventListener('change', updatePlaceholder);

/*
 * Demo-only "backend" check — this project has no real server.
 * These specific values simulate a customer who has active Flex
 * installments; everything else falls back to the standard flow.
 *   phone:       6912345678
 *   subscriber:  123456789
 */
const FLEX_TEST_VALUES = {
  phone: ['6912345678'],
  subscriber: ['123456789'],
};

function isFlexCustomer(method, value) {
  const list = method === 'phone' ? FLEX_TEST_VALUES.phone : FLEX_TEST_VALUES.subscriber;
  return list.includes(value.trim());
}

const loadingOverlay = document.getElementById('loading-overlay');

continueBtn.addEventListener('click', () => {
  if (continueBtn.disabled) return;
  const method = methodPhone.checked ? 'phone' : 'subscriber';
  const value = phoneInput.value.trim();

  continueBtn.disabled = true;
  loadingOverlay.classList.add('is-open');

  setTimeout(() => {
    loadingOverlay.classList.remove('is-open');
    continueBtn.disabled = false;

    if (isFlexCustomer(method, value)) {
      resetSmsGateModal();
      openModal(smsGateModal);
    } else {
      standardModalWarning.hidden = method !== 'subscriber';
      amountInput.value = '';
      amountClear.hidden = true;
      standardContinue.disabled = true;
      openModal(standardModal);
    }
  }, 3000);
});

/* ---------- Modal plumbing ---------- */
const standardModal = document.getElementById('standard-modal');
const flexModal = document.getElementById('flex-modal');
const smsGateModal = document.getElementById('sms-gate-modal');
const allModals = [standardModal, flexModal, smsGateModal];

function openModal(modal) {
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')));
});

allModals.forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') allModals.forEach(closeModal);
});

/* ---------- Info bubbles (explainer popovers) ---------- */
document.querySelectorAll('[data-info-trigger]').forEach((trigger) => {
  const bubble = trigger.nextElementSibling;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !bubble.classList.contains('is-open');
    document.querySelectorAll('.info-bubble.is-open').forEach((b) => b.classList.remove('is-open'));
    if (willOpen) bubble.classList.add('is-open');
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.info-bubble.is-open').forEach((b) => b.classList.remove('is-open'));
});

/* ---------- Scenario 2: standard modal ---------- */
const amountInput = document.getElementById('amount-input');
const amountClear = document.getElementById('amount-clear');
const standardModalWarning = document.getElementById('standard-modal-warning');
const standardContinue = document.getElementById('standard-modal-continue');

amountInput.addEventListener('input', () => {
  amountClear.hidden = amountInput.value.length === 0;
  standardContinue.disabled = amountInput.value.trim().length === 0;
});

amountClear.addEventListener('click', () => {
  amountInput.value = '';
  amountClear.hidden = true;
  standardContinue.disabled = true;
  amountInput.focus();
});

standardContinue.addEventListener('click', () => {
  if (standardContinue.disabled) return;
  alert('Demo only — there is no real backend.\nAmount: ' + amountInput.value);
});

/* ---------- SMS gate: verify balance before entering Snappi ---------- */
const gateOtpInput = document.getElementById('sms-gate-otp-input');
const gateConfirmOtp = document.getElementById('sms-gate-confirm-otp');
const loadingOverlayText = loadingOverlay.querySelector('p');

function showGateStep(step) {
  document.querySelectorAll('.gate-step').forEach((el) => {
    el.hidden = el.dataset.gateStep !== step;
  });
}

function resetSmsGateModal() {
  gateOtpInput.value = '';
  gateConfirmOtp.disabled = true;
  showGateStep('prompt');
}

document.getElementById('sms-gate-send-otp').addEventListener('click', () => {
  gateOtpInput.value = '';
  gateConfirmOtp.disabled = true;
  showGateStep('otp');
});

document.getElementById('sms-gate-otp-back').addEventListener('click', () => {
  showGateStep('prompt');
});

gateOtpInput.addEventListener('input', () => {
  gateConfirmOtp.disabled = gateOtpInput.value.trim().length === 0;
});

gateConfirmOtp.addEventListener('click', () => {
  if (gateConfirmOtp.disabled) return;
  gateConfirmOtp.disabled = true;
  loadingOverlayText.textContent = 'Fetching balance due…';
  loadingOverlay.classList.add('is-open');

  setTimeout(() => {
    loadingOverlay.classList.remove('is-open');
    loadingOverlayText.textContent = 'Checking account…';
    closeModal(smsGateModal);
    resetFlexModal();
    openModal(flexModal);
  }, 2000);
});

/* ---------- Scenario 1: Flex / Snappi modal (prefilled — balance already confirmed) ---------- */
const flexBillInput = document.getElementById('flex-bill-input');
const flexInstallmentInput = document.getElementById('flex-installment-input');
const flexAmountsContinue = document.getElementById('flex-amounts-continue');
const flexPaymentSummary = document.getElementById('flex-payment-summary');
const flexCardFields = document.getElementById('flex-card-fields');
const flexWalletNote = document.getElementById('flex-wallet-note');

/* Demo pull values — no real backend, so the SMS-gate "confirms" and fills these in. */
const FLEX_PULL_VALUES = {
  bill: '29.50',
  installment: '89.40',
};

/* Which Flex installment this is, out of how many total. */
const FLEX_INSTALLMENT_INFO = { current: 3, total: 7 };

const flexInstallmentBadge = document.querySelector('[data-installment-badge]');

function showFlexStep(step) {
  document.querySelectorAll('.flex-step').forEach((el) => {
    el.hidden = el.dataset.step !== step;
  });
}

function parseAmount(str) {
  const n = parseFloat(str.replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(n) {
  return '€' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toggleFlexPaymentMethodUI(method) {
  document.querySelectorAll('.flex-method-card').forEach((c) => c.classList.remove('is-selected'));
  document.querySelector(`input[name="flex-payment-method"][value="${method}"]`).closest('.flex-method-card').classList.add('is-selected');
  flexCardFields.hidden = method !== 'card';
  flexWalletNote.hidden = method !== 'wallet';
}

function resetFlexModal() {
  flexBillInput.value = FLEX_PULL_VALUES.bill;
  flexInstallmentInput.value = FLEX_PULL_VALUES.installment;
  flexInstallmentBadge.textContent = FLEX_INSTALLMENT_INFO.current + '/' + FLEX_INSTALLMENT_INFO.total;
  document.querySelector('input[name="flex-payment-method"][value="card"]').checked = true;
  toggleFlexPaymentMethodUI('card');
  showFlexStep('amounts');
}

document.getElementById('flex-amounts-back').addEventListener('click', () => {
  closeModal(flexModal);
});

document.getElementById('flex-payment-back').addEventListener('click', () => {
  showFlexStep('amounts');
});

flexAmountsContinue.addEventListener('click', () => {
  const total = parseAmount(flexBillInput.value) + parseAmount(flexInstallmentInput.value);
  flexPaymentSummary.textContent = 'Payment amount: ' + formatAmount(total);
  showFlexStep('payment');
});

document.querySelectorAll('input[name="flex-payment-method"]').forEach((radio) => {
  radio.addEventListener('change', () => toggleFlexPaymentMethodUI(radio.value));
});

document.getElementById('flex-modal-continue').addEventListener('click', () => {
  const total = parseAmount(flexBillInput.value) + parseAmount(flexInstallmentInput.value);
  document.getElementById('flex-success-desc').textContent =
    formatAmount(total) + ' (bill & installment) was paid via Snappi Bank.';
  showFlexStep('success');
});

document.getElementById('flex-success-close').addEventListener('click', () => {
  closeModal(flexModal);
});
