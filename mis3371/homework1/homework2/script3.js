/*
  Program name: script3.js
  Author: Ryan Alexander Rodriguez
  Date created: 04/21/2026
  Date last edited: 04/21/2026
  Version: 3.0
  Description: External JavaScript for MedCare Plus Patient Registration Form (HW3).
               All validation is now done ON THE FLY using oninput / onblur events.
               Error messages stay on screen until the user corrects the field.
               The Submit button is hidden and only appears after the VALIDATE
               button is clicked and ALL fields pass.

  Functions:
    setError(id, msg)         – shows/clears an error span
    validateFirstName()       – oninput/onblur: letters, apostrophes, hyphens only, 1–30
    validateMiddleInit()      – oninput/onblur: optional, one letter only
    validateLastName()        – oninput/onblur: letters, apostrophes, hyphens only, 1–30
    validateDobField()        – onchange/onblur: required, not future, not >120 yrs ago
    formatSSN(el)             – oninput: auto-inserts dashes after 3 and 5 digits
    validateSSNField()        – onblur: checks full XXX-XX-XXXX pattern
    validateGender()          – onchange: radio must be selected
    validateEmailField()      – oninput/onblur: name@domain.tld format, force lowercase
    formatPhone(el)           – oninput: auto-formats to (XXX) XXX-XXXX
    validatePhoneField()      – onblur: optional but if entered must match pattern
    validateAddr1()           – oninput/onblur: required, 2–30 chars
    validateAddr2()           – oninput/onblur: optional but if entered 2–30 chars
    validateCity()            – oninput/onblur: required, 2–30 chars
    validateState()           – onchange/onblur: must select a state
    validateZip()             – oninput/onblur: 5 digits only
    validateVaccinated()      – onchange: radio must be selected
    validateInsurance()       – onchange: radio must be selected
    validateSymptoms()        – oninput/onblur: no double-quote characters
    validateUserID()          – oninput/onblur: 5–20 chars, start with letter, no spaces/symbols
    validatePasswords()       – oninput/onblur: strength + match + not equal to userID
    updatePain(val)           – oninput: live label for pain slider
    runValidateAll()          – VALIDATE button: runs all checks, shows Submit if all pass
    validateAll()             – internal: checks every field, returns true if all pass
    reviewForm()              – builds and shows the review panel
    closeReview()             – hides review panel
    clearForm()               – resets form and all error messages
    submitForm()              – navigates to thankyou.html
    confirmSubmit()           – confirm button in review panel
    validateEmail(email)      – helper: returns "" or error string
    validateDob(dobStr)       – helper: returns "" or error string
    escapeHtml(str)           – helper: sanitize for HTML display
*/

/* ============================================================
   UTILITY: Show / clear an error message span
   ============================================================ */
function setError(id, msg) {
  var span = document.getElementById(id);
  if (!span) return;
  span.textContent = msg;
  span.style.display = msg ? 'block' : 'none';
}

/* ============================================================
   LIVE FIELD VALIDATORS
   Each function is called oninput AND onblur so the user gets
   feedback as they type AND when they leave the field.
   ============================================================ */

// FIRST NAME – letters, apostrophes, hyphens only; 1–30 chars; required
function validateFirstName() {
  var val = document.getElementById('firstname').value.trim();
  if (!val) {
    setError('err-firstname', 'First name is required.');
  } else if (!/^[A-Za-z'\-]{1,30}$/.test(val)) {
    setError('err-firstname', 'Letters, apostrophes, and hyphens only. Max 30 characters.');
  } else {
    setError('err-firstname', '');
  }
  updateSubmitButton();
}

// MIDDLE INITIAL – optional; one letter only; no numbers
function validateMiddleInit() {
  var val = document.getElementById('middleinit').value.trim();
  if (val === '') {
    setError('err-middleinit', ''); // blank is ok
  } else if (!/^[A-Za-z]$/.test(val)) {
    setError('err-middleinit', 'One letter only. No numbers or symbols.');
  } else {
    setError('err-middleinit', '');
  }
  updateSubmitButton();
}

// LAST NAME – letters, apostrophes, hyphens only; 1–30 chars; required
function validateLastName() {
  var val = document.getElementById('lastname').value.trim();
  if (!val) {
    setError('err-lastname', 'Last name is required.');
  } else if (!/^[A-Za-z'\-]{1,30}$/.test(val)) {
    setError('err-lastname', 'Letters, apostrophes, and hyphens only. Max 30 characters.');
  } else {
    setError('err-lastname', '');
  }
  updateSubmitButton();
}

// DATE OF BIRTH – required; not future; not more than 120 years ago
function validateDobField() {
  var val = document.getElementById('dob').value;
  if (!val) {
    setError('err-dob', 'Date of birth is required.');
  } else {
    var msg = validateDob(val);
    setError('err-dob', msg);
  }
  updateSubmitButton();
}

// SSN / PATIENT ID – auto-format dashes as user types (ADVANCED EDITING)
// Inserts dash after 3rd digit, another after 5th digit
function formatSSN(el) {
  // Strip everything except digits
  var digits = el.value.replace(/\D/g, '');
  // Truncate to 9 digits max
  if (digits.length > 9) digits = digits.substring(0, 9);
  // Reformat with dashes
  var formatted = '';
  if (digits.length <= 3) {
    formatted = digits;
  } else if (digits.length <= 5) {
    formatted = digits.substring(0, 3) + '-' + digits.substring(3);
  } else {
    formatted = digits.substring(0, 3) + '-' + digits.substring(3, 5) + '-' + digits.substring(5);
  }
  el.value = formatted;
  // Validate on the fly once enough characters are entered
  if (digits.length === 9) {
    validateSSNField();
  } else if (digits.length > 0) {
    setError('err-ssn', '');  // clear error while still typing
  }
  updateSubmitButton();
}

// SSN – validate full pattern on blur
function validateSSNField() {
  var val = document.getElementById('ssn').value;
  if (!val) {
    setError('err-ssn', 'Patient ID is required.');
  } else if (!/^\d{3}-\d{2}-\d{4}$/.test(val)) {
    setError('err-ssn', 'Must be 9 digits in XXX-XX-XXXX format. Numbers only.');
  } else {
    setError('err-ssn', '');
  }
  updateSubmitButton();
}

// GENDER – at least one radio must be selected
function validateGender() {
  var sel = document.querySelector('input[name="gender"]:checked');
  if (!sel) {
    setError('err-gender', 'Please select a gender.');
  } else {
    setError('err-gender', '');
  }
  updateSubmitButton();
}

// EMAIL – must match name@domain.tld; force lowercase on the fly
function validateEmailField() {
  var el  = document.getElementById('email');
  el.value = el.value.toLowerCase();   // force lowercase
  var val = el.value.trim();
  if (!val) {
    setError('err-email', 'Email address is required.');
  } else {
    var msg = validateEmail(val);
    setError('err-email', msg);
  }
  updateSubmitButton();
}

// PHONE – auto-format to (XXX) XXX-XXXX as user types (ADVANCED EDITING)
function formatPhone(el) {
  var digits = el.value.replace(/\D/g, '');
  if (digits.length > 10) digits = digits.substring(0, 10);
  var formatted = '';
  if (digits.length === 0) {
    formatted = '';
  } else if (digits.length <= 3) {
    formatted = '(' + digits;
  } else if (digits.length <= 6) {
    formatted = '(' + digits.substring(0, 3) + ') ' + digits.substring(3);
  } else {
    formatted = '(' + digits.substring(0, 3) + ') ' + digits.substring(3, 6) + '-' + digits.substring(6);
  }
  el.value = formatted;
  updateSubmitButton();
}

// PHONE – validate on blur (optional field)
function validatePhoneField() {
  var val = document.getElementById('phone').value.trim();
  if (val === '') {
    setError('err-phone', ''); // optional
  } else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(val)) {
    setError('err-phone', 'Format must be (XXX) XXX-XXXX. Numbers only.');
  } else {
    setError('err-phone', '');
  }
  updateSubmitButton();
}

// ADDRESS LINE 1 – required; 2–30 chars
function validateAddr1() {
  var val = document.getElementById('addr1').value.trim();
  if (!val) {
    setError('err-addr1', 'Address line 1 is required.');
  } else if (val.length < 2 || val.length > 30) {
    setError('err-addr1', 'Must be between 2 and 30 characters.');
  } else {
    setError('err-addr1', '');
  }
  updateSubmitButton();
}

// ADDRESS LINE 2 – optional; if entered must be 2–30 chars
function validateAddr2() {
  var val = document.getElementById('addr2').value.trim();
  if (val === '') {
    setError('err-addr2', '');
  } else if (val.length < 2 || val.length > 30) {
    setError('err-addr2', 'If entered, must be between 2 and 30 characters.');
  } else {
    setError('err-addr2', '');
  }
  updateSubmitButton();
}

// CITY – required; 2–30 chars
function validateCity() {
  var val = document.getElementById('city').value.trim();
  if (!val) {
    setError('err-city', 'City is required.');
  } else if (val.length < 2 || val.length > 30) {
    setError('err-city', 'Must be between 2 and 30 characters.');
  } else {
    setError('err-city', '');
  }
  updateSubmitButton();
}

// STATE – must select a non-blank option
function validateState() {
  var val = document.getElementById('state').value;
  if (!val) {
    setError('err-state', 'Please select a state or territory.');
  } else {
    setError('err-state', '');
  }
  updateSubmitButton();
}

// ZIP CODE – required; exactly 5 digits
function validateZip() {
  var val = document.getElementById('zip').value.trim();
  if (!val) {
    setError('err-zip', 'Zip code is required.');
  } else if (!/^\d{5}$/.test(val)) {
    setError('err-zip', 'Must be exactly 5 digits (numbers only).');
  } else {
    setError('err-zip', '');
  }
  updateSubmitButton();
}

// VACCINATED – radio required
function validateVaccinated() {
  var sel = document.querySelector('input[name="vaccinated"]:checked');
  if (!sel) {
    setError('err-vaccinated', 'Please select Yes or No.');
  } else {
    setError('err-vaccinated', '');
  }
  updateSubmitButton();
}

// INSURANCE – radio required
function validateInsurance() {
  var sel = document.querySelector('input[name="insurance"]:checked');
  if (!sel) {
    setError('err-insurance', 'Please select Yes or No.');
  } else {
    setError('err-insurance', '');
  }
  updateSubmitButton();
}

// SYMPTOMS – optional; no double-quote characters
function validateSymptoms() {
  var val = document.getElementById('symptoms').value;
  if (val.indexOf('"') !== -1) {
    setError('err-symptoms', 'Please remove any double-quote ( " ) characters.');
  } else {
    setError('err-symptoms', '');
  }
  updateSubmitButton();
}

// USER ID – ADVANCED EDITING
//   1. Cannot start with a number
//   2. Must be 5–20 characters
//   3. Letters, numbers, dash, underscore only – no spaces or other special chars
function validateUserID() {
  var val = document.getElementById('userid').value; // already lowercased by oninput
  if (!val) {
    setError('err-userid', 'User ID is required.');
  } else if (/^[0-9]/.test(val)) {
    setError('err-userid', 'User ID cannot start with a number.');
  } else if (val.length < 5 || val.length > 20) {
    setError('err-userid', 'User ID must be 5–20 characters long.');
  } else if (/[^A-Za-z0-9_\-]/.test(val)) {
    setError('err-userid', 'Letters, numbers, hyphens, and underscores only. No spaces.');
  } else {
    setError('err-userid', '');
  }
  updateSubmitButton();
}

// PASSWORDS – ADVANCED EDITING (runs live on every keystroke in either box)
//   1. Cannot equal the User ID
//   2. Must be at least 8 characters
//   3. Must contain at least 1 uppercase letter
//   4. Must contain at least 1 lowercase letter
//   5. Must contain at least 1 digit
//   6. Both password boxes must match each other
function validatePasswords() {
  var pw1    = document.getElementById('password').value;
  var pw2    = document.getElementById('password2').value;
  var userid = document.getElementById('userid').value.toLowerCase();
  var err1   = '';
  var err2   = '';

  if (pw1.length > 0) {
    if (pw1.length < 8) {
      err1 = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(pw1)) {
      err1 = 'Password must contain at least 1 uppercase letter.';
    } else if (!/[a-z]/.test(pw1)) {
      err1 = 'Password must contain at least 1 lowercase letter.';
    } else if (!/[0-9]/.test(pw1)) {
      err1 = 'Password must contain at least 1 number (digit).';
    } else if (userid.length >= 3 && pw1.toLowerCase() === userid) {
      err1 = 'Password cannot be the same as your User ID.';
    }
  }

  if (pw2.length > 0) {
    if (pw1 !== pw2) {
      err2 = 'Passwords do not match. Please re-enter.';
    }
  }

  setError('err-password',  err1);
  setError('err-password2', err2);
  updateSubmitButton();
}

/* ============================================================
   PAIN SLIDER – live label update (ADVANCED EDITING)
   ============================================================ */
function updatePain(val) {
  var num   = parseInt(val, 10);
  var label = '';
  if (num === 1)          label = '1 – No Pain';
  else if (num <= 3)      label = num + ' – Mild';
  else if (num <= 6)      label = num + ' – Moderate';
  else if (num <= 8)      label = num + ' – Severe';
  else                    label = num + ' – Very Severe';
  document.getElementById('pain_val').textContent = label;
}

/* ============================================================
   UPDATE SUBMIT BUTTON VISIBILITY
   Checks all error spans – if any have text, hide Submit button.
   Also called by runValidateAll().
   ============================================================ */
function updateSubmitButton() {
  var allSpans = document.querySelectorAll('.err-msg');
  var hasError = false;
  allSpans.forEach(function(s) {
    if (s.textContent.trim() !== '') hasError = true;
  });
  // Only show Submit if validate has been run at least once AND no errors
  if (!hasError && window._validateRan) {
    document.getElementById('btn-submit').style.display = 'inline-block';
  } else {
    document.getElementById('btn-submit').style.display = 'none';
  }
}

/* ============================================================
   VALIDATE BUTTON – runs ALL field validators at once,
   then shows Submit button only if everything passes.
   ============================================================ */
function runValidateAll() {
  window._validateRan = true;
  var ok = validateAll();
  if (ok) {
    document.getElementById('btn-submit').style.display = 'inline-block';
    // Briefly highlight to draw attention
    var btn = document.getElementById('btn-submit');
    btn.classList.add('pulse');
    setTimeout(function() { btn.classList.remove('pulse'); }, 1000);
  } else {
    document.getElementById('btn-submit').style.display = 'none';
    alert('Please fix the highlighted errors before submitting.');
    // Scroll to first visible error
    var firstErr = document.querySelector('.err-msg[style*="block"]');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* ============================================================
   VALIDATE ALL – calls every individual validator.
   Returns true only if ALL fields pass.
   ============================================================ */
function validateAll() {
  // Run every individual validator
  validateFirstName();
  validateMiddleInit();
  validateLastName();
  validateDobField();
  validateSSNField();
  validateGender();
  validateEmailField();
  validatePhoneField();
  validateAddr1();
  validateAddr2();
  validateCity();
  validateState();
  validateZip();
  validateVaccinated();
  validateInsurance();
  validateSymptoms();
  validateUserID();
  validatePasswords();

  // Check password fields are not empty
  var pw1 = document.getElementById('password').value;
  var pw2 = document.getElementById('password2').value;
  if (!pw1) setError('err-password',  'Password is required.');
  if (!pw2) setError('err-password2', 'Please confirm your password.');

  // Count any remaining error messages
  var allSpans = document.querySelectorAll('.err-msg');
  var ok = true;
  allSpans.forEach(function(s) {
    if (s.textContent.trim() !== '') ok = false;
  });
  return ok;
}

/* ============================================================
   HELPER: Validate email format
   Returns "" if valid, error string if not.
   ============================================================ */
function validateEmail(email) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return 'Email must be in the format name@domain.tld';
  }
  return '';
}

/* ============================================================
   HELPER: Validate date of birth
   Returns "" if valid, error string if not.
   ============================================================ */
function validateDob(dobStr) {
  if (!dobStr) return 'Date of birth is required.';
  var dob     = new Date(dobStr);
  var today   = new Date();
  today.setHours(0, 0, 0, 0);
  var minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 120);
  if (dob > today)   return 'Date of birth cannot be in the future.';
  if (dob < minDate) return 'Date of birth cannot be more than 120 years ago.';
  return '';
}

/* ============================================================
   HELPER: Escape HTML for safe display in review table
   ============================================================ */
function escapeHtml(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

/* ============================================================
   REVIEW FORM – builds and shows the review panel.
   ============================================================ */
function reviewForm() {
  var valid = validateAll();
  if (!valid) {
    alert('Please fix the highlighted errors before reviewing.');
    return;
  }

  // Gather values
  var firstname    = document.getElementById('firstname').value.trim();
  var middleinit   = document.getElementById('middleinit').value.trim();
  var lastname     = document.getElementById('lastname').value.trim();
  var dob          = document.getElementById('dob').value;
  var ssn          = document.getElementById('ssn').value;
  var genderRadio  = document.querySelector('input[name="gender"]:checked');
  var gender       = genderRadio ? genderRadio.value : '(not selected)';
  var email        = document.getElementById('email').value.trim();
  var phone        = document.getElementById('phone').value.trim() || '(not provided)';
  var addr1        = document.getElementById('addr1').value.trim();
  var addr2        = document.getElementById('addr2').value.trim() || '(none)';
  var city         = document.getElementById('city').value.trim();
  var state        = document.getElementById('state').value;
  var zip          = document.getElementById('zip').value.trim().substring(0, 5);
  var vaccRadio    = document.querySelector('input[name="vaccinated"]:checked');
  var vacc         = vaccRadio ? vaccRadio.value : '(not selected)';
  var insRadio     = document.querySelector('input[name="insurance"]:checked');
  var ins          = insRadio  ? insRadio.value  : '(not selected)';
  var housingRadio = document.querySelector('input[name="housing"]:checked');
  var housing      = housingRadio ? housingRadio.value : '(not selected)';
  var condChecks   = document.querySelectorAll('input[name="conditions"]:checked');
  var conditions   = [];
  condChecks.forEach(function(cb) { conditions.push(cb.value); });
  var condStr      = conditions.length > 0 ? conditions.join(', ') : 'None selected';
  var painVal      = document.getElementById('pain_val').textContent;
  var healthVal    = document.getElementById('health_val').textContent;
  var symptoms     = document.getElementById('symptoms').value.trim() || '(none provided)';
  var userid       = document.getElementById('userid').value.toLowerCase();
  var password     = document.getElementById('password').value;
  var pwMasked     = '*'.repeat(password.length);

  // Format DOB for display
  var dobDisplay = dob;
  if (dob && dob.indexOf('-') !== -1) {
    var parts = dob.split('-');
    dobDisplay = parts[1] + '/' + parts[2] + '/' + parts[0];
  }
  // Mask SSN – show last 4 only
  var ssnMasked = 'XXX-XX-' + (ssn.replace(/-/g, '').slice(-4) || '????');

  // Build rows
  var rows = [
    { section: 'Personal Information' },
    { label: 'Full Name',          value: firstname + (middleinit ? ' ' + middleinit + '.' : '') + ' ' + lastname },
    { label: 'Date of Birth',      value: dobDisplay,   validate: validateDob(dob) },
    { label: 'Patient ID #',       value: ssnMasked },
    { label: 'Gender',             value: gender },
    { section: 'Contact Information' },
    { label: 'Email Address',      value: email,        validate: validateEmail(email) },
    { label: 'Phone Number',       value: phone },
    { section: 'Address' },
    { label: 'Address Line 1',     value: addr1 },
    { label: 'Address Line 2',     value: addr2 },
    { label: 'City',               value: city },
    { label: 'State',              value: state },
    { label: 'Zip Code',           value: zip },
    { section: 'Health History' },
    { label: 'Vaccinated?',        value: vacc },
    { label: 'Has Insurance?',     value: ins },
    { label: 'Housing Status',     value: housing },
    { label: 'Previous Conditions',value: condStr },
    { label: 'Pain Level',         value: painVal },
    { label: 'Health Rating',      value: healthVal + ' / 10' },
    { label: 'Described Symptoms', value: symptoms },
    { section: 'Account Credentials' },
    { label: 'User ID',            value: userid },
    { label: 'Password',           value: pwMasked + ' (' + password.length + ' chars)' }
  ];

  var tbody = '';
  rows.forEach(function(row) {
    if (row.section) {
      tbody += '<tr class="review-section-row"><td colspan="3">' + row.section + '</td></tr>';
    } else {
      var status     = 'pass';
      var statusText = '&#10003; OK';
      if (row.validate && row.validate !== '') {
        status     = 'error';
        statusText = '&#10007; ' + row.validate;
      }
      tbody += '<tr>' +
        '<td class="rv-label">'  + row.label + '</td>' +
        '<td class="rv-value">'  + escapeHtml(String(row.value)) + '</td>' +
        '<td class="rv-status ' + status + '">' + statusText + '</td>' +
        '</tr>';
    }
  });

  document.getElementById('review-table').innerHTML = tbody;
  document.getElementById('review-panel').style.display = 'block';
  document.getElementById('review-panel').scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   CLOSE REVIEW PANEL
   ============================================================ */
function closeReview() {
  document.getElementById('review-panel').style.display = 'none';
  document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   CLEAR / RESET FORM
   ============================================================ */
function clearForm() {
  // Hide review panel
  document.getElementById('review-panel').style.display = 'none';
  // Hide submit button
  document.getElementById('btn-submit').style.display = 'none';
  window._validateRan = false;
  // Reset slider displays
  document.getElementById('pain_val').textContent   = '1 – No Pain';
  document.getElementById('health_val').textContent = '5';
  // Clear all error messages
  var errSpans = document.querySelectorAll('.err-msg');
  errSpans.forEach(function(s) { s.textContent = ''; s.style.display = 'none'; });
}

/* ============================================================
   SUBMIT FORM – navigates to thankyou.html
   ============================================================ */
function submitForm() {
  var valid = validateAll();
  if (!valid) {
    alert('There are still errors on the form. Please fix them before submitting.');
    document.getElementById('btn-submit').style.display = 'none';
    return;
  }
  window.location.href = 'thankyou.html';
}

/* ============================================================
   CONFIRM & SUBMIT from review panel
   ============================================================ */
function confirmSubmit() {
  var valid = validateAll();
  if (!valid) {
    alert('There are still errors on the form. Please go back and fix them.');
    return;
  }
  window.location.href = 'thankyou.html';
}

/* ============================================================
   END OF script3.js
   ============================================================ */
