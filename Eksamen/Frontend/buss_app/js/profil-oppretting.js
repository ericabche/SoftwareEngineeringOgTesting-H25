// Enkel 3-stegs "Opprett profil"-flyt
(function(){
  const form = document.getElementById('signup-form');
  const steps = [
    document.getElementById('panel-step-1'),
    document.getElementById('panel-step-2'),
    document.getElementById('panel-step-3')
  ];
  const dots = [
    document.getElementById('step-dot-1'),
    document.getElementById('step-dot-2'),
    document.getElementById('step-dot-3')
  ];

  let ix = 0;

  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const first = document.getElementById('first');
  const last  = document.getElementById('last');

  const next1 = document.getElementById('next-1');
  const next2 = document.getElementById('next-2');
  const back2 = document.getElementById('back-2');
  const back3 = document.getElementById('back-3');

  const phoneError = document.getElementById('phone-error');
  const emailError = document.getElementById('email-error');
  const nameError  = document.getElementById('name-error');

  function showStep(n){
    ix = Math.max(0, Math.min(n, steps.length-1));
    steps.forEach((s,i)=> s.toggleAttribute('data-active', i===ix));
    dots.forEach((d,i)=> {
      d.setAttribute('aria-selected', String(i===ix));
      d.tabIndex = i===ix ? 0 : -1;
    });
    steps[ix].querySelector('input')?.focus();
  }

  const phoneRegex = /^(?:\+?47)?\s?(?:\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})$/;

  function validateStep1(){
    const ok = phone.value.trim().length > 0 && phoneRegex.test(phone.value.trim());
    phoneError.hidden = ok;
    next1.disabled = !ok;
    return ok;
  }
  function validateStep2(){
    const ok = email.validity.valid;
    emailError.hidden = ok;
    next2.disabled = !ok;
    return ok;
  }
  function validateStep3(){
    const ok = first.value.trim().length > 0 && last.value.trim().length > 0;
    nameError.hidden = ok;
    return ok;
  }

  phone.addEventListener('input', () => {
    phone.value = phone.value.replace(/[^\d+ ]/g,'');
    validateStep1();
  });
  email.addEventListener('input', validateStep2);
  first.addEventListener('input', validateStep3);
  last.addEventListener('input', validateStep3);

  next1.addEventListener('click', () => { if (validateStep1()) showStep(1); });
  next2.addEventListener('click', () => { if (validateStep2()) showStep(2); });
  back2.addEventListener('click', () => showStep(0));
  back3.addEventListener('click', () => showStep(1));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    form.hidden = true;
    document.getElementById('done').hidden = false;
  });

  validateStep1();
  validateStep2();
  validateStep3();
  showStep(0);
})();