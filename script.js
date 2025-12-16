document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();

  // Page specific initializations
  if (document.getElementById('rotating-text')) initRotatingText();
  if (document.getElementById('profiles')) initAlumniPage();
  if (document.getElementById('supportForm')) initStudentPage();
  if (document.getElementById('loginForm')) initLoginPage();
});

/* =========================================
   1. NAVIGATION & HEADER
   ========================================= */
function initNavigation() {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav.nav');

  // Sticky Header Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }
  });

  // Mobile Menu
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      const icon = nav.classList.contains('active') ? '✕' : '☰';
      menuToggle.textContent = icon;
    });
  }
}

/* =========================================
   2. SCROLL ANIMATIONS
   ========================================= */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up').forEach(el => {
    observer.observe(el);
  });
}

/* =========================================
   3. HOME PAGE: ROTATING TEXT
   ========================================= */
function initRotatingText() {
  const el = document.getElementById('rotating-text');
  const phrases = [
    "OneGoal is here",
    "Your Personal Tutor",
    "A Path to Success",
    "Community Support"
  ];
  let index = 0;

  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      index = (index + 1) % phrases.length;
      el.textContent = phrases[index];
      el.style.opacity = '1';
    }, 500); // Wait for fade out
  }, 3000);
}

/* =========================================
   4. ALUMNI PAGE: SEARCH & MODALS
   ========================================= */
function initAlumniPage() {
  // --- Route Protection ---
  if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  // --- Search Functionality ---
  const searchInput = document.getElementById('searchInput');
  const profiles = document.querySelectorAll('.suggestion-item');

  function filterProfiles() {
    const query = searchInput.value.toLowerCase().trim();

    profiles.forEach(card => {
      const text = card.innerText.toLowerCase();
      if (text.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterProfiles);
  }

  // --- Modal Logic ---
  const modals = document.querySelectorAll('.modal');
  const openBtns = document.querySelectorAll('[data-action="open"]');
  const closeBtns = document.querySelectorAll('[data-action="close"]');

  function openModal(id) {
    const modal = document.getElementById(`modal-${id}`);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Lock scroll
    }
  }

  function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Unlock scroll
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      openModal(id);
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      closeModal(modal);
    });
  });

  // Close on click outside
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal.show');
      if (activeModal) closeModal(activeModal);
    }
  });

  // Toast Notification for "Request Connect"
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('connect-btn')) {
      e.preventDefault();
      const activeModal = document.querySelector('.modal.show');
      if (activeModal) closeModal(activeModal);
      showToast('Request sent successfully! An alumni will contact you soon.');
    }
  });
}

/* =========================================
   5. STUDENT PAGE: FORM VALIDATION
   ========================================= */
function initStudentPage() {
  const form = document.getElementById('supportForm');
  const inputs = form.querySelectorAll('input, select, textarea');

  // Real-time validation
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateInput(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) validateInput(input);
    });
  });

  function validateInput(input) {
    if (input.checkValidity()) {
      input.classList.add('valid');
      input.classList.remove('invalid');
      return true;
    } else {
      input.classList.add('invalid');
      input.classList.remove('valid');
      return false;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    inputs.forEach(input => {
      if (!validateInput(input)) isValid = false;
    });

    if (isValid) {
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      // Simulate API call
      try {
        // Use the actual form action if you want, or just simulate for now
        // const response = await fetch(form.action, { method: 'POST', body: new FormData(form) });

        await new Promise(r => setTimeout(r, 1500)); // Fake delay

        document.getElementById('successModal').classList.add('show');
        form.reset();
        inputs.forEach(i => i.classList.remove('valid'));

      } catch (error) {
        alert('Something went wrong. Please try again.');
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
  });
}

/* =========================================
   6. LOGIN PAGE
   ========================================= */
function initLoginPage() {
  const form = document.getElementById('loginForm');
  const errorMsg = document.getElementById('loginError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Hardcoded credentials as requested
    if (username === 'StudentOne' && password === 'StudentOne') {
      // Success
      errorMsg.style.display = 'none';

      // Store login state
      sessionStorage.setItem('isLoggedIn', 'true');

      // Optional: Simulate loading
      const btn = form.querySelector('button');
      const originalText = btn.textContent;
      btn.textContent = 'Logging in...';
      btn.disabled = true;

      setTimeout(() => {
        // Redirect to Alumni page
        window.location.href = 'alumni.html';
      }, 800);

    } else {
      // Failure
      errorMsg.style.display = 'block';
      // Shake animation effect
      const card = document.querySelector('.login-card');
      card.style.transform = 'translateX(10px)';
      setTimeout(() => card.style.transform = 'translateX(-10px)', 100);
      setTimeout(() => card.style.transform = 'translateX(10px)', 200);
      setTimeout(() => card.style.transform = 'translateX(0)', 300);
    }
  });
}

/* =========================================
   UTILITIES
   ========================================= */
function showToast(message) {
  // Remove existing toast if any
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">✓</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
