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

continueBtn.addEventListener('click', () => {
  if (continueBtn.disabled) return;
  const method = methodPhone.checked ? 'phone' : 'subscriber';
  const value = phoneInput.value.trim();

  if (isFlexCustomer(method, value)) {
    openModal(flexModal);
  } else {
    standardModalWarning.hidden = method !== 'subscriber';
    amountInput.value = '';
    amountClear.hidden = true;
    standardContinue.disabled = true;
    openModal(standardModal);
  }
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
document.getElementById('flex-modal-continue').addEventListener('click', () => {
  alert('Demo only — δεν υπάρχει πραγματικό backend.\nΕξομοίωση πληρωμής δόσεων Flex μέσω Snappi Bank.');
});
