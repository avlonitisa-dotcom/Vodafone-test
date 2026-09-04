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
    ? 'Συμπλήρωσε τον αριθμό τηλεφώνου'
    : 'Συμπλήρωσε τον αριθμό μητρώου συνδρομητή';
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
      resetFlexModal();
      openModal(flexModal);
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

/* ---------- Scenario 1: Flex / Snappi modal ---------- */
const flexBillInput = document.getElementById('flex-bill-input');
const flexInstallmentInput = document.getElementById('flex-installment-input');
const flexAmountsContinue = document.getElementById('flex-amounts-continue');
const flexOtpInput = document.getElementById('flex-otp-input');
const flexConfirmOtp = document.getElementById('flex-confirm-otp');
const flexPaymentSummary = document.getElementById('flex-payment-summary');
const flexCardFields = document.getElementById('flex-card-fields');
const flexWalletNote = document.getElementById('flex-wallet-note');

/* Demo pull values — no real backend, so a "successful" SMS code just fills these in. */
const FLEX_PULL_VALUES = {
  bill: '29,50',
  installment: '89,40',
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
  const n = parseFloat(str.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(n) {
  return n.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function updateFlexAmountsContinueState() {
  flexAmountsContinue.disabled = flexBillInput.value.trim().length === 0
    && flexInstallmentInput.value.trim().length === 0;
}

function toggleFlexPaymentMethodUI(method) {
  document.querySelectorAll('.flex-method-card').forEach((c) => c.classList.remove('is-selected'));
  document.querySelector(`input[name="flex-payment-method"][value="${method}"]`).closest('.flex-method-card').classList.add('is-selected');
  flexCardFields.hidden = method !== 'card';
  flexWalletNote.hidden = method !== 'wallet';
}

function resetFlexModal() {
  flexBillInput.value = '';
  flexBillInput.readOnly = false;
  flexInstallmentInput.value = '';
  flexInstallmentInput.readOnly = false;
  flexAmountsContinue.disabled = true;
  flexOtpInput.value = '';
  flexConfirmOtp.disabled = true;
  flexInstallmentBadge.hidden = true;
  document.querySelector('input[name="flex-payment-method"][value="card"]').checked = true;
  toggleFlexPaymentMethodUI('card');
  showFlexStep('amounts');
}

[flexBillInput, flexInstallmentInput].forEach((input) => {
  input.addEventListener('input', updateFlexAmountsContinueState);
});

document.getElementById('flex-learn-link').addEventListener('click', () => {
  showFlexStep('sms-prompt');
});

document.getElementById('flex-amounts-back').addEventListener('click', () => {
  closeModal(flexModal);
});

document.getElementById('flex-send-otp').addEventListener('click', () => {
  flexOtpInput.value = '';
  flexConfirmOtp.disabled = true;
  showFlexStep('otp');
});

document.getElementById('flex-skip-otp').addEventListener('click', () => {
  showFlexStep('amounts');
});

document.getElementById('flex-sms-back').addEventListener('click', () => {
  showFlexStep('amounts');
});

document.getElementById('flex-otp-back').addEventListener('click', () => {
  showFlexStep('sms-prompt');
});

document.getElementById('flex-payment-back').addEventListener('click', () => {
  showFlexStep('amounts');
});

flexOtpInput.addEventListener('input', () => {
  flexConfirmOtp.disabled = flexOtpInput.value.trim().length === 0;
});

const loadingOverlayText = loadingOverlay.querySelector('p');

flexConfirmOtp.addEventListener('click', () => {
  if (flexConfirmOtp.disabled) return;
  flexConfirmOtp.disabled = true;
  loadingOverlayText.textContent = 'Άντληση ποσού οφειλής…';
  loadingOverlay.classList.add('is-open');

  setTimeout(() => {
    loadingOverlay.classList.remove('is-open');
    loadingOverlayText.textContent = 'Έλεγχος λογαριασμού…';

    flexBillInput.value = FLEX_PULL_VALUES.bill;
    flexBillInput.readOnly = true;
    flexInstallmentInput.value = FLEX_PULL_VALUES.installment;
    flexInstallmentInput.readOnly = true;
    flexInstallmentBadge.textContent = FLEX_INSTALLMENT_INFO.current + '/' + FLEX_INSTALLMENT_INFO.total;
    flexInstallmentBadge.hidden = false;
    updateFlexAmountsContinueState();
    showFlexStep('amounts');
  }, 2000);
});

flexAmountsContinue.addEventListener('click', () => {
  if (flexAmountsContinue.disabled) return;
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
