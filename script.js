/* ═══════════════════════════════════════════════
   Thazmert — Main Script
   Vanilla JavaScript, no dependencies required
   (Lucide icons loaded via CDN in HTML)
═══════════════════════════════════════════════ */

/* ── Price table ── */
const PRICES = {
  cultures:   4000,
  fertilizer: 5000,
  trees:      6000,
  analysis:   7500
};

const SERVICE_NAMES = {
  cultures:   'رش المحاصيل',
  fertilizer: 'نثر الأسمدة',
  trees:      'رش الأشجار',
  analysis:   'تحليل التربة'
};

/* ── State ── */
let currentService  = 'cultures';
let currentHectares = 5;
let statsAnimated   = false;

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons (CDN)
  if (typeof lucide !== 'undefined') lucide.createIcons();

  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initCalculator();
  initForm();
  initFAQ();
  initStatsCounter();
  updatePriceDisplay();
});

/* ═══════════════════════════════════════════════
   NAVBAR — scroll effect + active section
═══════════════════════════════════════════════ */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const sections = ['home', 'services', 'drone', 'why-us', 'calculator', 'faq'];
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  function onScroll() {
    /* Scrolled state */
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    /* Active section highlighting */
    let active = 'home';
    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= 130 && rect.bottom >= 130) {
        active = id;
        break;
      }
    }

    navLinks.forEach(link => {
      if (link.dataset.section === active) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ═══════════════════════════════════════════════
   MOBILE MENU
═══════════════════════════════════════════════ */
function initMobileMenu() {
  const toggleBtn  = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen   = document.getElementById('menu-icon-open');
  const iconClose  = document.getElementById('menu-icon-close');

  toggleBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    if (isOpen) {
      mobileMenu.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
    } else {
      mobileMenu.classList.remove('hidden');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
    }
  });
}

/* ═══════════════════════════════════════════════
   SMOOTH SCROLL — all .scroll-link elements
═══════════════════════════════════════════════ */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.scroll-link');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();
    const targetId = href.slice(1);
    const target   = document.getElementById(targetId);

    if (target) {
      const offset = 80; // navbar height
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    const iconOpen   = document.getElementById('menu-icon-open');
    const iconClose  = document.getElementById('menu-icon-close');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
    }

    // If link carries data-service, pre-select that service
    const service = link.dataset.service;
    if (service && PRICES[service]) {
      currentService = service;
      const select = document.getElementById('service-select');
      if (select) select.value = service;
      updatePriceDisplay();
      updateServiceButtons();
    }
  });
}

/* ═══════════════════════════════════════════════
   CALCULATOR
═══════════════════════════════════════════════ */
function initCalculator() {
  const serviceSelect = document.getElementById('service-select');
  const haInput       = document.getElementById('ha-input');
  const haRange       = document.getElementById('ha-range');
  const haPlus        = document.getElementById('ha-plus');
  const haMinus       = document.getElementById('ha-minus');
  const serviceBtns   = document.querySelectorAll('.service-btn');

  /* Service select (inside form) */
  if (serviceSelect) {
    serviceSelect.addEventListener('change', () => {
      currentService = serviceSelect.value;
      updateServiceButtons();
      updatePriceDisplay();
      updateWhatsAppLink();
    });
  }

  /* Range slider */
  if (haRange) {
    haRange.addEventListener('input', () => {
      currentHectares = parseInt(haRange.value) || 1;
      if (haInput) haInput.value = currentHectares;
      updatePriceDisplay();
      updateWhatsAppLink();
    });
  }

  /* Number input */
  if (haInput) {
    haInput.addEventListener('input', () => {
      let val = parseInt(haInput.value) || 1;
      val = Math.max(1, Math.min(500, val));
      currentHectares = val;
      if (haRange) haRange.value = Math.min(val, 100);
      updatePriceDisplay();
      updateWhatsAppLink();
    });
  }

  /* + / − buttons */
  if (haPlus) {
    haPlus.addEventListener('click', () => {
      currentHectares = Math.min(500, currentHectares + 1);
      syncHectaresInputs();
    });
  }
  if (haMinus) {
    haMinus.addEventListener('click', () => {
      currentHectares = Math.max(1, currentHectares - 1);
      syncHectaresInputs();
    });
  }

  /* Left-panel service buttons */
  serviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentService = btn.dataset.service;
      const select = document.getElementById('service-select');
      if (select) select.value = currentService;
      updateServiceButtons();
      updatePriceDisplay();
      updateWhatsAppLink();
    });
  });
}

function syncHectaresInputs() {
  const haInput = document.getElementById('ha-input');
  const haRange = document.getElementById('ha-range');
  if (haInput) haInput.value = currentHectares;
  if (haRange) haRange.value = Math.min(currentHectares, 100);
  updatePriceDisplay();
  updateWhatsAppLink();
}

function calcPrice() {
  const unitPrice    = PRICES[currentService] || 4000;
  const total        = unitPrice * currentHectares;
  const discountRate = currentHectares >= 50 ? 0.15 : currentHectares >= 20 ? 0.10 : 0;
  const finalPrice   = Math.round(total * (1 - discountRate));
  return { total, finalPrice, discountRate };
}

function updatePriceDisplay() {
  const { total, finalPrice, discountRate } = calcPrice();

  const priceDisplay     = document.getElementById('price-display');
  const discountRow      = document.getElementById('discount-row');
  const originalPriceEl  = document.getElementById('original-price');
  const discountBadge    = document.getElementById('discount-badge');
  const priceServiceLbl  = document.getElementById('price-service-label');
  const priceHaLbl       = document.getElementById('price-ha-label');

  if (priceDisplay)    priceDisplay.textContent   = finalPrice.toLocaleString('ar-DZ');
  if (priceServiceLbl) priceServiceLbl.textContent = SERVICE_NAMES[currentService];
  if (priceHaLbl)      priceHaLbl.textContent      = currentHectares + ' هكتار';

  if (discountRow) {
    if (discountRate > 0) {
      discountRow.classList.remove('hidden');
      if (originalPriceEl) originalPriceEl.textContent = total.toLocaleString('ar-DZ') + ' د.ج';
      if (discountBadge)   discountBadge.textContent   = 'خصم ' + Math.round(discountRate * 100) + '%';
    } else {
      discountRow.classList.add('hidden');
    }
  }
}

function updateServiceButtons() {
  document.querySelectorAll('.service-btn').forEach(btn => {
    const isActive = btn.dataset.service === currentService;
    if (isActive) {
      btn.classList.add('active');
      btn.classList.remove('border-white/20', 'text-white');
      btn.classList.add('bg-white', 'text-gray-900', 'border-white', 'shadow-lg');
      // Change icon color in active button
      const icon = btn.querySelector('i[data-lucide]');
      if (icon) icon.style.color = '#16a34a';
      const priceSpan = btn.querySelector('span:last-child');
      if (priceSpan) priceSpan.style.color = '#15803d';
    } else {
      btn.classList.remove('active', 'bg-white', 'text-gray-900', 'border-white', 'shadow-lg');
      btn.classList.add('border-white/20', 'text-white');
      btn.style.backgroundColor = '';
      const icon = btn.querySelector('i[data-lucide]');
      if (icon) icon.style.color = '#86efac';
      const priceSpan = btn.querySelector('span:last-child');
      if (priceSpan) priceSpan.style.color = '#86efac';
    }
  });
}

function updateWhatsAppLink() {
  const link = document.getElementById('whatsapp-calc-link');
  if (!link) return;
  const msg = `مرحباً، أريد الاستفسار عن خدمة ${SERVICE_NAMES[currentService]} لمساحة ${currentHectares} هكتار.`;
  link.href = `https://wa.me/213673442856?text=${encodeURIComponent(msg)}`;
}

/* ═══════════════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════════════ */
function initForm() {
  const form         = document.getElementById('contact-form');
  const successState = document.getElementById('success-state');
  const newReqBtn    = document.getElementById('new-request-btn');
  const formError    = document.getElementById('form-error');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = document.getElementById('name-input')?.value.trim();
    const phone = document.getElementById('phone-input')?.value.trim();

    if (!name || !phone) {
      if (formError) {
        formError.textContent = 'يرجى تعبئة الحقول الإلزامية (الاسم ورقم الهاتف).';
        formError.classList.remove('hidden');
      }
      return;
    }

    if (formError) formError.classList.add('hidden');

    // Show success summary
    const { finalPrice } = calcPrice();
    const summaryService = document.getElementById('summary-service');
    const summaryPrice   = document.getElementById('summary-price');
    const summaryHa      = document.getElementById('summary-ha');

    if (summaryService) summaryService.textContent = SERVICE_NAMES[currentService];
    if (summaryPrice)   summaryPrice.textContent   = finalPrice.toLocaleString('ar-DZ') + ' د.ج';
    if (summaryHa)      summaryHa.textContent      = currentHectares + ' هكتار';

    form.classList.add('hidden');
    if (successState) {
      successState.classList.remove('hidden');
      // Re-initialize icons in success state
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  });

  if (newReqBtn) {
    newReqBtn.addEventListener('click', () => {
      // Reset form
      if (form) {
        form.reset();
        form.classList.remove('hidden');
      }
      if (successState) successState.classList.add('hidden');
      if (formError)    formError.classList.add('hidden');
      currentService  = 'cultures';
      currentHectares = 5;
      const select  = document.getElementById('service-select');
      const haInput = document.getElementById('ha-input');
      const haRange = document.getElementById('ha-range');
      if (select)  select.value  = 'cultures';
      if (haInput) haInput.value = 5;
      if (haRange) haRange.value = 5;
      updateServiceButtons();
      updatePriceDisplay();
      updateWhatsAppLink();
    });
  }
}

/* ═══════════════════════════════════════════════
   FAQ ACCORDION
═══════════════════════════════════════════════ */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-btn');
    const answer = item.querySelector('.faq-answer');
    const symbol = item.querySelector('.toggle-symbol');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = other.querySelector('.faq-answer');
          const otherSymbol = other.querySelector('.toggle-symbol');
          if (otherAnswer) otherAnswer.classList.remove('open');
          if (otherSymbol) otherSymbol.textContent = '+';
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        answer.classList.remove('open');
        if (symbol) symbol.textContent = '+';
      } else {
        item.classList.add('open');
        answer.classList.remove('hidden');
        answer.classList.add('open');
        if (symbol) symbol.textContent = '−';
      }
    });
  });
}

/* ═══════════════════════════════════════════════
   STATS COUNTER — IntersectionObserver
═══════════════════════════════════════════════ */
function initStatsCounter() {
  const statsBar = document.getElementById('stats-bar');
  if (!statsBar) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateAllCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsBar);
}

function animateAllCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target   = parseInt(el.dataset.target) || 0;
    const duration = 1800;
    let startTime  = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });
}
