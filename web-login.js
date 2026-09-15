/* ---------- My Vodafone dashboard ---------- */
const myvfPayBtn = document.getElementById('myvf-pay-btn');

myvfPayBtn.addEventListener('click', () => {
  /* Already logged in — always go straight to the Snappi/Flex environment. */
  resetFlexModal();
  openModal(flexModal);
});

/* ---------- Modal plumbing ---------- */
const standardModal = document.getElementById('standard-modal');
const flexModal = document.getElementById('flex-modal');
const allModals = [standardModal, flexModal];

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
  alert('Demo only — δεν υπάρχει πραγματικό backend.\nΠοσό: ' + amountInput.value);
});

/* ---------- Scenario 1: Flex / Snappi modal (prefilled — already logged in) ---------- */
const flexBillInput = document.getElementById('flex-bill-input');
const flexInstallmentInput = document.getElementById('flex-installment-input');
const flexAmountsContinue = document.getElementById('flex-amounts-continue');
const flexInstallmentBadge = document.querySelector('[data-installment-badge]');
const flexPaymentSummary = document.getElementById('flex-payment-summary');
const flexCardFields = document.getElementById('flex-card-fields');
const flexWalletNote = document.getElementById('flex-wallet-note');

/* Demo pull values — no real backend, so these are just filled in directly. */
const FLEX_PULL_VALUES = {
  bill: '29,50',
  installment: '89,40',
};

/* Which Flex installment this is, out of how many total. */
const FLEX_INSTALLMENT_INFO = { current: 3, total: 7 };

function showFlexStep(step) {
  document.querySelectorAll('.flex-step').forEach((el) => {
    el.hidden = el.dataset.step !== step;
  });
}

function parseAmount(str) {
  const n = parseFloat(str.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(n) {
  return n.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function toggleFlexPaymentMethodUI(method) {
  document.querySelectorAll('.flex-method-card').forEach((c) => c.classList.remove('is-selected'));
  document.querySelector(`input[name="flex-payment-method"][value="${method}"]`).closest('.flex-method-card').classList.add('is-selected');
  flexCardFields.hidden = method !== 'card';
  flexWalletNote.hidden = method !== 'wallet';
}

function resetFlexModal() {
  /* Logged-in session — amounts are already known, no SMS/OTP step needed. */
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
  flexPaymentSummary.textContent = 'Πληρωμή ποσού: ' + formatAmount(total);
  showFlexStep('payment');
});

document.querySelectorAll('input[name="flex-payment-method"]').forEach((radio) => {
  radio.addEventListener('change', () => toggleFlexPaymentMethodUI(radio.value));
});

document.getElementById('flex-modal-continue').addEventListener('click', () => {
  alert('Demo only — δεν υπάρχει πραγματικό backend.\nΕξομοίωση πληρωμής μέσω Snappi Bank.');
});
