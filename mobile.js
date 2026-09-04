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

function parseAmount(str) {
  const n = parseFloat(str.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(n) {
  return n.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

/* Demo pull values — no real backend, so a "successful" SMS code just fills these in. */
const FLEX_PULL_VALUES = {
  bill: '29,50',
  installment: '89,40',
};

/* ---------- Demo persona ---------- */
const MOBILE_PERSONAS = {
  normal: { phone: '6987654321', balance: '42,10 €' },
  flex: { phone: '6912345678', balance: '29,50 €' },
};

let mobilePersona = 'normal';

const mHomePhone = document.getElementById('m-home-phone');
const mHomeBalance = document.getElementById('m-home-balance');
const mBillsPhone = document.getElementById('m-bills-phone');
const mBillsBalance = document.getElementById('m-bills-balance');

function applyMobilePersona() {
  const data = MOBILE_PERSONAS[mobilePersona];
  mHomePhone.textContent = data.phone;
  mHomeBalance.textContent = data.balance;
  mBillsPhone.textContent = data.phone;
  mBillsBalance.textContent = data.balance;
}
applyMobilePersona();

document.querySelectorAll('.persona-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.persona-btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    mobilePersona = btn.dataset.persona;
    applyMobilePersona();
  });
});

/* ---------- Screen navigation ---------- */
function showMobileScreen(name) {
  document.querySelectorAll('.phone-screen').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.screen === name);
  });
}

document.getElementById('m-go-bills').addEventListener('click', () => showMobileScreen('bills'));
document.getElementById('m-back-home').addEventListener('click', () => showMobileScreen('home'));

/* ---------- Sheet open/close ---------- */
const mSheetBackdrop = document.getElementById('m-sheet-backdrop');
const mSheetStandard = document.getElementById('m-sheet-standard');
const mSheetFlex = document.getElementById('m-sheet-flex');
const allMobileSheets = [mSheetStandard, mSheetFlex];

function openMobileSheet(sheet) {
  mSheetBackdrop.classList.add('is-open');
  sheet.classList.add('is-open');
}

function closeMobileSheets() {
  mSheetBackdrop.classList.remove('is-open');
  allMobileSheets.forEach((s) => s.classList.remove('is-open'));
}

mSheetBackdrop.addEventListener('click', closeMobileSheets);
document.querySelectorAll('[data-close-sheet]').forEach((btn) => {
  btn.addEventListener('click', closeMobileSheets);
});

document.getElementById('m-open-payment').addEventListener('click', () => {
  if (mobilePersona === 'flex') {
    resetMobileFlexSheet();
    openMobileSheet(mSheetFlex);
  } else {
    resetMobileStandardSheet();
    openMobileSheet(mSheetStandard);
  }
});

/* ---------- Sheet: standard payment ---------- */
const mTabTotal = document.getElementById('m-tab-total');
const mTabOther = document.getElementById('m-tab-other');
const mAmountTotalView = document.getElementById('m-amount-total-view');
const mAmountOtherInput = document.getElementById('m-amount-other-input');
const mStandardTotal = document.getElementById('m-standard-total');
const mStandardCardFields = document.getElementById('m-standard-card-fields');
const mStandardEmail = document.getElementById('m-standard-email');
const mStandardConfirm = document.getElementById('m-standard-confirm');

function toggleMobileStandardMethodUI(method) {
  document.querySelectorAll('#m-sheet-standard .flex-method-card').forEach((c) => c.classList.remove('is-selected'));
  document.querySelector(`input[name="m-standard-payment-method"][value="${method}"]`).closest('.flex-method-card').classList.add('is-selected');
  mStandardCardFields.hidden = method !== 'card';
}

function resetMobileStandardSheet() {
  mStandardTotal.textContent = MOBILE_PERSONAS[mobilePersona].balance;
  mTabTotal.classList.add('is-active');
  mTabOther.classList.remove('is-active');
  mAmountTotalView.hidden = false;
  mAmountOtherInput.hidden = true;
  mAmountOtherInput.value = '';
  document.querySelector('input[name="m-standard-payment-method"][value="wallet"]').checked = true;
  toggleMobileStandardMethodUI('wallet');
  mStandardEmail.value = '';
}

mTabTotal.addEventListener('click', () => {
  mTabTotal.classList.add('is-active');
  mTabOther.classList.remove('is-active');
  mAmountTotalView.hidden = false;
  mAmountOtherInput.hidden = true;
});

mTabOther.addEventListener('click', () => {
  mTabOther.classList.add('is-active');
  mTabTotal.classList.remove('is-active');
  mAmountOtherInput.hidden = false;
  mAmountTotalView.hidden = true;
  mAmountOtherInput.focus();
});

document.querySelectorAll('input[name="m-standard-payment-method"]').forEach((radio) => {
  radio.addEventListener('change', () => toggleMobileStandardMethodUI(radio.value));
});

mStandardConfirm.addEventListener('click', () => {
  const amount = mTabTotal.classList.contains('is-active') ? mStandardTotal.textContent : mAmountOtherInput.value;
  alert('Demo only — δεν υπάρχει πραγματικό backend.\nΠοσό: ' + amount);
});

/* ---------- Sheet: Flex / Snappi payment ---------- */
const mFlexBillInput = document.getElementById('m-flex-bill-input');
const mFlexInstallmentInput = document.getElementById('m-flex-installment-input');
const mFlexAmountsContinue = document.getElementById('m-flex-amounts-continue');
const mFlexPaymentSummary = document.getElementById('m-flex-payment-summary');
const mFlexCardFields = document.getElementById('m-flex-card-fields');
const mFlexWalletNote = document.getElementById('m-flex-wallet-note');
const mFlexInstallmentBadge = document.querySelector('#m-sheet-flex [data-installment-badge]');

/* Which Flex installment this is, out of how many total. */
const FLEX_INSTALLMENT_INFO = { current: 3, total: 7 };

function showMobileFlexStep(step) {
  document.querySelectorAll('.m-flex-step').forEach((el) => {
    el.hidden = el.dataset.mstep !== step;
  });
}

function toggleMobileFlexPaymentMethodUI(method) {
  document.querySelectorAll('#m-sheet-flex .flex-method-card').forEach((c) => c.classList.remove('is-selected'));
  document.querySelector(`input[name="m-flex-payment-method"][value="${method}"]`).closest('.flex-method-card').classList.add('is-selected');
  mFlexCardFields.hidden = method !== 'card';
  mFlexWalletNote.hidden = method !== 'wallet';
}

function resetMobileFlexSheet() {
  /* Logged-in session — amounts are already known, no SMS/OTP step needed. */
  mFlexBillInput.value = FLEX_PULL_VALUES.bill;
  mFlexInstallmentInput.value = FLEX_PULL_VALUES.installment;
  mFlexInstallmentBadge.textContent = FLEX_INSTALLMENT_INFO.current + '/' + FLEX_INSTALLMENT_INFO.total;
  document.querySelector('input[name="m-flex-payment-method"][value="card"]').checked = true;
  toggleMobileFlexPaymentMethodUI('card');
  showMobileFlexStep('amounts');
}

mFlexAmountsContinue.addEventListener('click', () => {
  if (mFlexAmountsContinue.disabled) return;
  const total = parseAmount(mFlexBillInput.value) + parseAmount(mFlexInstallmentInput.value);
  mFlexPaymentSummary.textContent = 'Πληρωμή ποσού: ' + formatAmount(total);
  showMobileFlexStep('payment');
});

document.querySelectorAll('input[name="m-flex-payment-method"]').forEach((radio) => {
  radio.addEventListener('change', () => toggleMobileFlexPaymentMethodUI(radio.value));
});

document.getElementById('m-flex-modal-continue').addEventListener('click', () => {
  alert('Demo only — δεν υπάρχει πραγματικό backend.\nΕξομοίωση πληρωμής μέσω Snappi Bank.');
});
