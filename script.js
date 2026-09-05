/**
 * RAMAN TIWARI - FREELANCE PORTFOLIO & CLIENT CONVERSION ENGINE
 * Dynamic interactions: Filter tabs, Proposal Estimator, Copy Vault, Theme Toggle
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initBottomMobileNav();
  initScrollAnimations();
  initProjectFilters();
  initProposalEstimator();
  initCopyVault();
  initContactForm();
  initSmoothScroll();
});

/* ==========================================================================
   1. THEME SWITCHER (DARK / LIGHT WITH LOCAL STORAGE)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const currentTheme = localStorage.getItem('rt_theme') || 'dark';

  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('rt_theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('themeIcon');
  const metaThemeColor = document.getElementById('metaThemeColor');

  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'light' ? '#ffffff' : '#07090e');
  }

  if (!themeIcon) return;
  
  if (theme === 'light') {
    themeIcon.className = 'fas fa-moon';
  } else {
    themeIcon.className = 'fas fa-sun';
  }
}

/* ==========================================================================
   2. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Close menu when clicking nav link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }
}

/* ==========================================================================
   3. PROJECT FILTER TABS
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue || category.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   4. INTERACTIVE PROPOSAL & SCOPE ESTIMATOR
   ========================================================================== */
const SERVICE_BASE_RATES = {
  mvp: { name: 'Full-Stack SaaS MVP (Laravel 11 + React)', weeks: '3 - 5 Weeks' },
  performance: { name: 'Performance Audit & Redis Scaling', weeks: '1 - 2 Weeks' },
  ai: { name: 'Agentic AI & Custom LLM Integration', weeks: '2 - 3 Weeks' },
  erp: { name: 'Enterprise Portal / Custom ERP Module', weeks: '3 - 4 Weeks' }
};

const TIMELINE_FACTORS = {
  standard: { label: 'Standard Delivery', badge: 'Standard Schedule' },
  urgent: { label: 'Priority Sprint (Expedited)', badge: '⚡ Rush Delivery (Priority)' }
};

function initProposalEstimator() {
  const serviceInputs = document.querySelectorAll('input[name="serviceType"]');
  const timelineInputs = document.querySelectorAll('input[name="timelineType"]');
  const addonInputs = document.querySelectorAll('input[name="addonOption"]');

  function calculateEstimate() {
    let selectedService = 'mvp';
    serviceInputs.forEach(input => {
      if (input.checked) selectedService = input.value;
    });

    let selectedTimeline = 'standard';
    timelineInputs.forEach(input => {
      if (input.checked) selectedTimeline = input.value;
    });

    let activeAddons = [];
    addonInputs.forEach(input => {
      if (input.checked) {
        activeAddons.push({
          id: input.value,
          label: input.getAttribute('data-name')
        });
      }
    });

    const baseService = SERVICE_BASE_RATES[selectedService] || SERVICE_BASE_RATES.mvp;
    const timeline = TIMELINE_FACTORS[selectedTimeline] || TIMELINE_FACTORS.standard;

    // Update UI elements
    const scopeNameEl = document.getElementById('receiptScopeName');
    const timelineBadgeEl = document.getElementById('receiptTimelineBadge');
    const estimatedWeeksEl = document.getElementById('receiptWeeks');
    const addonListEl = document.getElementById('receiptAddonsList');
    const estimatePriceEl = document.getElementById('receiptEstimatedPrice');

    if (scopeNameEl) scopeNameEl.textContent = baseService.name;
    if (timelineBadgeEl) timelineBadgeEl.textContent = timeline.badge;
    if (estimatedWeeksEl) estimatedWeeksEl.textContent = baseService.weeks;

    if (addonListEl) {
      if (activeAddons.length === 0) {
        addonListEl.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">No extra add-ons selected</span>';
      } else {
        addonListEl.innerHTML = activeAddons.map(a => 
          `<div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; margin-bottom: 0.25rem; color: var(--text-secondary);">
            <i class="fas fa-check" style="color: var(--accent-cyan); font-size: 0.7rem;"></i>
            <span>${a.label}</span>
          </div>`
        ).join('');
      }
    }

    if (estimatePriceEl) {
      estimatePriceEl.textContent = 'Custom Scope Ready';
    }

    // Update the generated inquiry message for direct submission (no price)
    updateInquirySnippet(baseService.name, baseService.weeks, timeline.badge, activeAddons);
  }

  // Attach listeners
  serviceInputs.forEach(i => i.addEventListener('change', calculateEstimate));
  timelineInputs.forEach(i => i.addEventListener('change', calculateEstimate));
  addonInputs.forEach(i => i.addEventListener('change', calculateEstimate));

  calculateEstimate();

  // Handle Export to WhatsApp button
  const sendWhatsAppBtn = document.getElementById('btnEstimateWhatsApp');
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', () => {
      const message = window.currentEstimateProposalText || "Hi Raman, I reviewed your portfolio and would like to discuss an engineering project.";
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/919580980177?text=${encoded}`, '_blank');
    });
  }

  // Handle Export to Email button
  const sendEmailBtn = document.getElementById('btnEstimateEmail');
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', () => {
      const message = window.currentEstimateProposalText || "Hi Raman, I would like to discuss a project.";
      const subject = encodeURIComponent("Project Consultation & Engineering Scope");
      const body = encodeURIComponent(message);
      window.location.href = `mailto:ramantiwari644@gmail.com?subject=${subject}&body=${body}`;
    });
  }
}

function updateInquirySnippet(serviceName, weeks, timelineBadge, addons) {
  const addonStr = addons.length > 0 ? addons.map(a => a.label).join(', ') : 'None';
  const text = `Hi Raman,\n\nI reviewed your portfolio (6+ years experience, TestDome Top 25% Laravel, high-traffic systems) and I am interested in collaborating on a freelance project.\n\n• Selected Scope: ${serviceName}\n• Desired Timeline: ${weeks} (${timelineBadge})\n• Included Requirements: ${addonStr}\n\nLet's schedule a brief 10-15 minute discovery call to discuss the specifications.\n\nBest regards,`;
  window.currentEstimateProposalText = text;
}

/* ==========================================================================
   5. COPY VAULT (UPWORK, LINKEDIN, PROPOSALS)
   ========================================================================== */
function initCopyVault() {
  const tabBtns = document.querySelectorAll('.vault-tab-btn');
  const panels = document.querySelectorAll('.vault-content-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanelId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Copy Buttons
  document.querySelectorAll('.btn-copy-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetElem = document.getElementById(targetId);
      if (targetElem) {
        const textToCopy = targetElem.innerText || targetElem.textContent;
        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
          showToast('Copied to clipboard successfully!');
          const origText = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => {
            btn.innerHTML = origText;
          }, 2000);
        }).catch(err => {
          console.error('Copy failed: ', err);
          showToast('Failed to copy. Please select text manually.');
        });
      }
    });
  });
}

/* ==========================================================================
   6. CONTACT FORM INTERACTION
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('projectInquiryForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('clientName')?.value.trim() || 'Prospective Client';
    const email = document.getElementById('clientEmail')?.value.trim() || '';
    const company = document.getElementById('clientCompany')?.value.trim() || 'N/A';
    const message = document.getElementById('clientMessage')?.value.trim() || '';

    const subject = encodeURIComponent(`Freelance Project Inquiry from ${name} (${company})`);
    const body = encodeURIComponent(
      `Hello Raman,\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\n\nProject Scope & Message:\n${message}\n\nLooking forward to hearing from you!`
    );

    // Open user's email client directly
    window.location.href = `mailto:ramantiwari644@gmail.com?subject=${subject}&body=${body}`;
    showToast('Redirecting to your email client...');
  });
}

/* ==========================================================================
   7. SMOOTH SCROLLING HELPER
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ==========================================================================
   8. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas fa-info-circle" style="color: var(--accent-cyan)"></i> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   9. SCROLL REVEAL ANIMATIONS (FROM SECOND STEP ONWARDS)
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    revealElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   10. MOBILE BOTTOM NAVIGATION SYNC
   ========================================================================== */
function initBottomMobileNav() {
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  const sections = document.querySelectorAll('section[id]');

  if (mobileNavItems.length === 0 || sections.length === 0) return;

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPos = window.pageYOffset + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      mobileNavItems.forEach(item => {
        if (item.getAttribute('data-nav') === currentSectionId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }, { passive: true });
}

