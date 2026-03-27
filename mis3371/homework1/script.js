/*
  Program name: script.js
  Author: Ryan Alexander Rodriguez
  Date created: 03/27/2026
  Date last edited: 03/27/2026
  Version: 2.0
  Description: External JavaScript for MedCare Plus Patient Registration Form (HW2).
               Handles:
               - Live salary slider formatting
               - Password strength validation (oninput)
               - Password match validation (oninput)
               - Review panel population
               - Final form submission guard
               - Review panel close / confirm
*/

/* ============================================================
   UTILITY: Show / clear an error message span
   ============================================================ */
/**
 * setError – writes an error message below a field.
 * @param {string} id   – the span element id (e.g. "err-firstname")
 * @param {string} msg  – the message to display, or "" to clear
 */
function setError(id, msg) {
  var span = document.getElementById(id);
  if (!span) return;
  span.textContent = msg;
  span.style.display = msg ? 'block' : 'none';
}

/* ============================================================
   SALARY SLIDER – live formatted display
   ============================================================ */
/**
 * updateSalary – called oninput from the salary range input.
 * Formats the value as $XX,XXX / yr and updates the display span.
 * @param {number|string} val – the raw slider value
 */
function updateSalary(val) {
  var num = parseInt(val, 10);
  var formatted = '$' + num.toLocaleString('en-US') + ' / yr';
  document.getElementById('salary_val').textContent = formatted;
}

/* ============================================================
   PASSWORD VALIDATION – runs live as user types (oninput)
   ============================================================ */
/**
 * validatePasswords – checks password strength rules and match.
 * Rules:
 *   1. 8–30 characters
 *   2. At least 1 uppercase letter
 *   3. At least 1 lowercase letter
 *   4. At least 1 digit
 *   5. At least 1 special character from: !@#%^&*()-_+=\/><.,`~
 *   6. No double-quote characters (")
 *   7. Password cannot contain the User ID value
 *   8. Both password fields must match
 */
function validatePasswords() {
  var pw1     = document.getElementById('password').value;
  var pw2     = document.getElementById('password2').value;
  var userid  = document.getElementById('userid').value.toLowerCase();
  var err1    = '';
  var err2    = '';

  // --- Rule checks for password 1 ---
  if (pw1.length > 0) {
    if (pw1.length < 8 || pw1.length > 30) {
      err1 = 'Password must be 8–30 characters.';
    } else if (!/[A-Z]/.test(pw1)) {
      err1 = 'Password must contain at least 1 uppercase letter.';
    } else if (!/[a-z]/.test(pw1)) {
      err1 = 'Password must contain at least 1 lowercase letter.';
    } else if (!/[0-9]/.test(pw1)) {
      err1 = 'Password must contain at least 1 number.';
    } else if (!/[!@#%^&*()\-_+=\\\/><.,`~]/.test(pw1)) {
      err1 = 'Password must contain at least 1 special character (!@#%^&*…).';
    } else if (pw1.indexOf('"') !== -1) {
      err1 = 'Password cannot contain double-quote characters.';
    } else if (userid.length >= 3 && pw1.toLowerCase().indexOf(userid) !== -1) {
      err1 = 'Password cannot contain your User ID.';
    }
  }

  // --- Rule check for password match ---
  if (pw2.length > 0 && pw1 !== pw2) {
    err2 = 'Passwords do not match.';
  } else if (pw2.length > 0 && pw1 === pw2 && err1 === '') {
    err2 = ''; // both good
  }

  setError('err-password',  err1);
  setError('err-password2', err2);
}

/* ============================================================
   REVIEW FORM – collects all data and displays the review panel
   ============================================================ */
/**
 * reviewForm – validates the form, then builds and shows the review panel.
 * Called by the "Review My Information" button.
 */
function reviewForm() {

  // --- Run validation first ---
  var valid = validateAll();
  if (!valid) {
    alert('Please fix the highlighted errors before reviewing.');
    return;
  }

  // --- Gather values ---
  var firstname   = document.getElementById('firstname').value.trim();
  var middleinit  = document.getElementById('middleinit').value.trim();
  var lastname    = document.getElementById('lastname').value.trim();
  var dob         = document.getElementById('dob').value;
  var ssn         = document.getElementById('ssn').value; // display masked
  var genderRadio = document.querySelector('input[name="gender"]:checked');
  var gender      = genderRadio ? genderRadio.value : '(not selected)';

  var email  = document.getElementById('email').value.trim();
  var phone  = document.getElementById('phone').value.trim() || '(not provided)';

  var addr1  = document.getElementById('addr1').value.trim();
  var addr2  = document.getElementById('addr2').value.trim() || '(none)';
  var city   = document.getElementById('city').value.trim();
  var state  = document.getElementById('state').value;
  var zip    = document.getElementById('zip').value.trim().substring(0, 5); // truncate to 5

  var vaccRadio = document.querySelector('input[name="vaccinated"]:checked');
  var vacc      = vaccRadio ? vaccRadio.value : '(not selected)';
  var insRadio  = document.querySelector('input[name="insurance"]:checked');
  var ins       = insRadio  ? insRadio.value  : '(not selected)';
  var housingRadio = document.querySelector('input[name="housing"]:checked');
  var housing   = housingRadio ? housingRadio.value : '(not selected)';

  // Gather checked conditions
  var condChecks = document.querySelectorAll('input[name="conditions"]:checked');
  var conditions = [];
  condChecks.forEach(function(cb) { conditions.push(cb.value); });
  var condStr = conditions.length > 0 ? conditions.join(', ') : 'None';

  var salary      = document.getElementById('salary_val').textContent;
  var healthRating= document.getElementById('health_val').textContent;
  var symptoms    = document.getElementById('symptoms').value.trim() || '(none provided)';

  var userid   = document.getElementById('userid').value.toLowerCase();
  var password = document.getElementById('password').value;
  // Mask password for display (show length as asterisks)
  var pwMasked = '*'.repeat(password.length);

  // Convert DOB from YYYY-MM-DD to MM/DD/YYYY for display
  var dobDisplay = dob;
  if (dob && dob.indexOf('-') !== -1) {
    var parts = dob.split('-');
    dobDisplay = parts[1] + '/' + parts[2] + '/' + parts[0];
  }

  // Mask SSN: show last 4 only
  var ssnMasked = 'XXX-XX-' + (ssn.replace(/-/g, '').slice(-4) || '????');

  // --- Build review table rows ---
  var rows = [
    { section: 'Personal Information' },
    { label: 'Full Name',          value: firstname + (middleinit ? ' ' + middleinit + '.' : '') + ' ' + lastname },
    { label: 'Date of Birth',      value: dobDisplay,  validate: validateDob(dob) },
    { label: 'Social Security #',  value: ssnMasked },
    { label: 'Gender',             value: gender },

    { section: 'Contact Information' },
    { label: 'Email Address',      value: email,  validate: validateEmail(email) },
    { label: 'Phone Number',       value: phone },

    { section: 'Address' },
    { label: 'Address Line 1',     value: addr1 },
    { label: 'Address Line 2',     value: addr2 },
    { label: 'City',               value: city },
    { label: 'State',              value: state },
    { label: 'Zip Code (5-digit)', value: zip },

    { section: 'Health History' },
    { label: 'Vaccinated?',        value: vacc },
    { label: 'Has Insurance?',     value: ins },
    { label: 'Housing Status',     value: housing },
    { label: 'Previous Conditions',value: condStr },
    { label: 'Desired Salary',     value: salary },
    { label: 'Health Rating',      value: healthRating + ' / 10' },
    { label: 'Described Symptoms', value: symptoms },

    { section: 'Account Credentials' },
    { label: 'User ID',            value: userid },
    { label: 'Password',           value: pwMasked + ' (' + password.length + ' chars – normally not shown)' }
  ];

  // --- Render table ---
  var tbody = '';
  rows.forEach(function(row) {
    if (row.section) {
      // Section header row
      tbody += '<tr class="review-section-row"><td colspan="3">' + row.section + '</td></tr>';
    } else {
      // Data row
      var status = 'pass';
      var statusText = '&#10003; pass';
      // If validate function returned an error string, show it
      if (row.validate && row.validate !== '') {
        status = 'error';
        statusText = '&#10007; ERROR: ' + row.validate;
      }
      tbody += '<tr>' +
        '<td class="rv-label">'  + row.label + '</td>' +
        '<td class="rv-value">'  + escapeHtml(String(row.value)) + '</td>' +
        '<td class="rv-status ' + status + '">' + statusText + '</td>' +
        '</tr>';
    }
  });

  document.getElementById('review-table').innerHTML = tbody;

  // Show the review panel
  document.getElementById('review-panel').style.display = 'block';

  // Scroll review panel into view
  document.getElementById('review-panel').scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   VALIDATE ALL FIELDS – returns true if form is valid
   ============================================================ */
/**
 * validateAll – checks each required field and sets error messages.
 * @returns {boolean} true if no errors found
 */
function validateAll() {
  var ok = true;

  // Helper: check a single text field
  function chk(id, errId, regex, errMsg) {
    var val = document.getElementById(id).value.trim();
    if (!val) {
      setError(errId, 'This field is required.');
      ok = false;
    } else if (regex && !regex.test(val)) {
      setError(errId, errMsg);
      ok = false;
    } else {
      setError(errId, '');
    }
  }

  // First name
  chk('firstname', 'err-firstname', /^[A-Za-z'\-]{1,30}$/, 'Letters, apostrophes, and hyphens only. Max 30.');
  // Middle initial (optional)
  var mi = document.getElementById('middleinit').value.trim();
  if (mi && !/^[A-Za-z]$/.test(mi)) {
    setError('err-middleinit', 'One letter only.');
    ok = false;
  } else {
    setError('err-middleinit', '');
  }
  // Last name
  chk('lastname', 'err-lastname', /^[A-Za-z'\-0-9]{1,30}$/, 'Letters, apostrophes, hyphens, numbers only. Max 30.');
  // DOB
  var dob = document.getElementById('dob').value;
  if (!dob) {
    setError('err-dob', 'Date of birth is required.');
    ok = false;
  } else {
    var dobErr = validateDob(dob);
    if (dobErr) { setError('err-dob', dobErr); ok = false; }
    else         { setError('err-dob', ''); }
  }
  // SSN
  chk('ssn', 'err-ssn', /^\d{3}-\d{2}-\d{4}$/, 'Use format XXX-XX-XXXX.');
  // Gender
  if (!document.querySelector('input[name="gender"]:checked')) {
    setError('err-gender', 'Please select a gender.'); ok = false;
  } else {
    setError('err-gender', '');
  }
  // Email
  var emailVal = document.getElementById('email').value.trim();
  if (!emailVal) {
    setError('err-email', 'Email is required.'); ok = false;
  } else if (validateEmail(emailVal)) {
    setError('err-email', validateEmail(emailVal)); ok = false;
  } else {
    setError('err-email', '');
  }
  // Phone (optional but if entered must match pattern)
  var ph = document.getElementById('phone').value.trim();
  if (ph && !/^\(\d{3}\) \d{3}-\d{4}$/.test(ph)) {
    setError('err-phone', 'Format: (XXX) XXX-XXXX'); ok = false;
  } else {
    setError('err-phone', '');
  }
  // Address 1
  chk('addr1', 'err-addr1', /^.{2,30}$/, '2–30 characters required.');
  // Address 2 (optional)
  var a2 = document.getElementById('addr2').value.trim();
  if (a2 && (a2.length < 2 || a2.length > 30)) {
    setError('err-addr2', 'If entered, must be 2–30 characters.'); ok = false;
  } else {
    setError('err-addr2', '');
  }
  // City
  chk('city', 'err-city', /^.{2,30}$/, '2–30 characters required.');
  // State
  if (!document.getElementById('state').value) {
    setError('err-state', 'Please select a state.'); ok = false;
  } else {
    setError('err-state', '');
  }
  // Zip
  chk('zip', 'err-zip', /^\d{5}(-\d{4})?$/, '5-digit ZIP or ZIP+4 (e.g., 77002-1234).');
  // Vaccinated
  if (!document.querySelector('input[name="vaccinated"]:checked')) {
    setError('err-vaccinated', 'Please select yes or no.'); ok = false;
  } else {
    setError('err-vaccinated', '');
  }
  // Insurance
  if (!document.querySelector('input[name="insurance"]:checked')) {
    setError('err-insurance', 'Please select yes or no.'); ok = false;
  } else {
    setError('err-insurance', '');
  }
  // Symptoms – no double quotes
  var sym = document.getElementById('symptoms').value;
  if (sym.indexOf('"') !== -1) {
    setError('err-symptoms', 'Please remove any double-quote ( " ) characters.'); ok = false;
  } else {
    setError('err-symptoms', '');
  }
  // User ID
  chk('userid', 'err-userid', /^[A-Za-z][A-Za-z0-9_\-]{4,29}$/, '5–30 chars, start with a letter, no spaces or special characters (underscore and hyphen allowed).');
  // Passwords
  validatePasswords();
  var pw1 = document.getElementById('password').value;
  var pw2 = document.getElementById('password2').value;
  if (!pw1) { setError('err-password', 'Password is required.'); ok = false; }
  if (!pw2) { setError('err-password2', 'Please confirm your password.'); ok = false; }
  if (document.getElementById('err-password').textContent ||
      document.getElementById('err-password2').textContent) {
    ok = false;
  }

  return ok;
}

/* ============================================================
   HELPER: Validate email format
   Returns "" if valid, error string if invalid.
   ============================================================ */
function validateEmail(email) {
  // Must match name@domain.tld
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return 'Must be in format name@domain.tld';
  }
  return '';
}

/* ============================================================
   HELPER: Validate date of birth
   Returns "" if valid, error string if invalid.
   ============================================================ */
function validateDob(dobStr) {
  if (!dobStr) return 'Date of birth is required.';
  var dob   = new Date(dobStr);
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 120);
  if (dob > today) return 'Cannot be a future date.';
  if (dob < minDate) return 'Cannot be more than 120 years ago.';
  return '';
}

/* ============================================================
   HELPER: Escape HTML for safe display in review table
   ============================================================ */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================
   CLOSE REVIEW PANEL
   ============================================================ */
/**
 * closeReview – hides the review panel and scrolls back to top of form.
 */
function closeReview() {
  document.getElementById('review-panel').style.display = 'none';
  document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   CLEAR / RESET
   ============================================================ */
/**
 * clearReview – hides the review panel when form is reset.
 */
function clearReview() {
  document.getElementById('review-panel').style.display = 'none';
  // Reset dynamic displays
  document.getElementById('salary_val').textContent  = '$60,000 / yr';
  document.getElementById('health_val').textContent  = '5';
  // Clear all error messages
  var errSpans = document.querySelectorAll('.err-msg');
  errSpans.forEach(function(s) { s.textContent = ''; s.style.display = 'none'; });
}

/* ============================================================
   SUBMIT FORM (via Submit button)
   ============================================================ */
/**
 * submitForm – validates before allowing native form submit.
 * @param {Event} e – the submit/click event
 * @returns {boolean} false to block submit if invalid
 */
function submitForm(e) {
  var valid = validateAll();
  if (!valid) {
    if (e && e.preventDefault) e.preventDefault();
    alert('Please fix the highlighted errors before submitting.');
    return false;
  }
  return true;
}

/* ============================================================
   CONFIRM & SUBMIT from review panel
   ============================================================ */
/**
 * confirmSubmit – final validation then programmatically submits the form.
 */
function confirmSubmit() {
  var valid = validateAll();
  if (!valid) {
    alert('There are still errors on the form. Please go back and fix them.');
    return;
  }
  document.getElementById('reg-form').submit();
}

/* ============================================================
   END OF script.js
   ============================================================ */
