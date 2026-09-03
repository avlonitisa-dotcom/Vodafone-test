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

continueBtn.addEventListener('click', () => {
  if (continueBtn.disabled) return;
  alert('Demo only — no backend wired up yet.\nΤιμή πεδίου: ' + phoneInput.value);
});
