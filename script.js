/**
 * RAMAN TIWARI - FREELANCE PORTFOLIO & CLIENT CONVERSION ENGINE
 * Dynamic interactions: Filter tabs, Proposal Estimator, Copy Vault, Theme Toggle
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initBottomMobileNav();
  initScrollAnimations();
  initWebAppShowcase();
  initPipelineStudio();
  initProjectFilters();
  initProposalEstimator();
  initCopyVault();
  initContactForm();
  initSmoothScroll();
});

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

/* ==========================================================================
   11. INTERACTIVE WEB & APP DEVELOPMENT SHOWCASE CONTROLLER
   ========================================================================== */
function initWebAppShowcase() {
  const showcaseSection = document.getElementById('app-web-dev');
  if (!showcaseSection) return;

  const tabBtns = document.querySelectorAll('.dev-tab-btn');
  const featureCards = document.querySelectorAll('.dev-feature-card');
  const mockupBrowser = document.getElementById('mockupBrowser');
  const mockupPhone = document.getElementById('mockupPhone');
  const chartBarsWrap = document.getElementById('chartBarsWrap');
  const phoneNotification = document.getElementById('phoneNotification');
  const stageWrapper = document.getElementById('devStageInteractive');

  // Tab switching logic (Unified, Web Architecture, Cross-Platform Mobile)
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-mode');

      // Adjust feature cards styling based on mode
      featureCards.forEach(card => {
        const feat = card.getAttribute('data-feature');
        if (mode === 'all' || feat === mode || feat === 'all') {
          card.style.opacity = '1';
          card.classList.add('highlight');
          setTimeout(() => card.classList.remove('highlight'), 1000);
        } else {
          card.style.opacity = '0.4';
        }
      });

      // Adjust mockups emphasis based on mode
      if (mode === 'web') {
        if (mockupBrowser) {
          mockupBrowser.style.zIndex = '5';
          mockupBrowser.style.transform = 'scale(1.03) rotateY(0deg) rotateX(0deg)';
          mockupBrowser.style.boxShadow = '0 30px 70px rgba(6, 182, 212, 0.35)';
        }
        if (mockupPhone) {
          mockupPhone.style.zIndex = '3';
          mockupPhone.style.transform = 'translateZ(20px) scale(0.92) translateY(20px)';
          mockupPhone.style.opacity = '0.65';
        }
      } else if (mode === 'app') {
        if (mockupPhone) {
          mockupPhone.style.zIndex = '6';
          mockupPhone.style.transform = 'translateZ(80px) scale(1.08) translateY(-10px)';
          mockupPhone.style.opacity = '1';
          mockupPhone.style.boxShadow = '0 35px 70px rgba(168, 85, 247, 0.45)';
        }
        if (mockupBrowser) {
          mockupBrowser.style.zIndex = '2';
          mockupBrowser.style.transform = 'scale(0.95) rotateY(-8deg)';
          mockupBrowser.style.opacity = '0.6';
        }
      } else {
        // Reset to all
        if (mockupBrowser) {
          mockupBrowser.style.zIndex = '2';
          mockupBrowser.style.transform = '';
          mockupBrowser.style.boxShadow = '';
          mockupBrowser.style.opacity = '1';
        }
        if (mockupPhone) {
          mockupPhone.style.zIndex = '4';
          mockupPhone.style.transform = '';
          mockupPhone.style.boxShadow = '';
          mockupPhone.style.opacity = '1';
        }
      }
    });
  });

  // Scroll Triggered Animations for Chart Bars, Notification, and Metrics Counter
  let hasAnimatedOnScroll = false;

  const showcaseObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimatedOnScroll) {
        hasAnimatedOnScroll = true;

        // 1. Animate chart bars rising
        if (chartBarsWrap) {
          chartBarsWrap.classList.add('animate');
        }

        // 2. Animate phone notification slide-down
        if (phoneNotification) {
          setTimeout(() => {
            phoneNotification.classList.add('is-active');
          }, 450);
        }

        // 3. Animate metrics numbers
        animateDevCounters();
      }
    });
  }, {
    threshold: 0.2
  });

  showcaseObserver.observe(showcaseSection);

  function animateDevCounters() {
    const counterElements = showcaseSection.querySelectorAll('.dev-metric-num');
    counterElements.forEach(el => {
      const targetStr = el.getAttribute('data-counter');
      if (!targetStr) return;

      const targetVal = parseFloat(targetStr);
      const isDecimal = targetStr.includes('.');
      const isFps = el.textContent.includes('FPS');
      const isPercent = el.textContent.includes('%');
      const isMs = el.textContent.includes('ms');

      let currentVal = 0;
      const duration = 1400;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);

        currentVal = easeOutQuad * targetVal;

        let displayVal = isDecimal ? currentVal.toFixed(2) : Math.floor(currentVal);
        if (isFps) {
          el.textContent = `${displayVal} FPS`;
        } else if (isPercent) {
          el.textContent = `${displayVal}%`;
        } else if (isMs) {
          el.textContent = `< ${displayVal}ms`;
        } else {
          el.textContent = displayVal;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Final exact formatting
          if (isFps) el.textContent = `${targetStr} FPS`;
          else if (isPercent) el.textContent = `${targetStr}%`;
          else if (isMs) el.textContent = `< ${targetStr}ms`;
          else el.textContent = targetStr;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // 3D Parallax Tilt Effect on Desktop Mouse Move
  if (stageWrapper && window.innerWidth > 992) {
    stageWrapper.addEventListener('mousemove', (e) => {
      const rect = stageWrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotY = x * 14;
      const rotX = -y * 12;

      if (mockupBrowser && !mockupBrowser.style.transform.includes('scale')) {
        mockupBrowser.style.transform = `rotateY(${rotY - 4}deg) rotateX(${rotX + 2}deg) translateY(-2px)`;
      }

      if (mockupPhone && !mockupPhone.style.transform.includes('scale')) {
        mockupPhone.style.transform = `translateZ(60px) rotateY(${rotY * 1.4}deg) rotateX(${rotX * 1.2}deg) translateY(${y * 10}px)`;
      }
    });

    stageWrapper.addEventListener('mouseleave', () => {
      if (mockupBrowser && !mockupBrowser.style.transform.includes('scale')) {
        mockupBrowser.style.transform = 'rotateY(-5deg) rotateX(3deg)';
      }
      if (mockupPhone && !mockupPhone.style.transform.includes('scale')) {
        mockupPhone.style.transform = 'translateZ(50px) translateY(15px)';
      }
    });
  }
}

/* ==========================================================================
   10. 5-SECOND PIPELINE CREATION STUDIO (WEB, APP, SECURITY, MARKETING)
   ========================================================================== */
function initPipelineStudio() {
  const studio = document.getElementById('creation-studio');
  if (!studio) return;

  const tabButtons = studio.querySelectorAll('.pipe-tab-btn');
  const panels = studio.querySelectorAll('.pipeline-panel');
  const timerFill = document.getElementById('pipelineTimerFill');

  const modes = ['web', 'app', 'security', 'marketing'];
  let currentIndex = 0;
  const cycleDuration = 5000; // 5 seconds per discipline
  let cycleStartTime = performance.now();
  let animationFrameId = null;
  let isUserInteracting = false;
  let resumeTimeout = null;

  function setPipeline(modeKey, resetTimer = true) {
    const idx = modes.indexOf(modeKey);
    if (idx !== -1) {
      currentIndex = idx;
    }

    // Update tab buttons
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-pipeline') === modeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update panels
    panels.forEach(panel => {
      const panelId = panel.id.toLowerCase();
      if (panelId.includes(modeKey)) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Trigger internal stage micro-animations
    triggerPanelMicroAnimations(modeKey);

    if (resetTimer) {
      cycleStartTime = performance.now();
      if (timerFill) timerFill.style.width = '0%';
    }
  }

  let webStageTimeout1 = null;
  let webStageTimeout2 = null;
  let webStageTimeout3 = null;

  function triggerPanelMicroAnimations(modeKey) {
    if (modeKey === 'web') {
      const stageLabel = document.getElementById('webStageLabel');
      const cursor = document.getElementById('creationCursor');
      const cards = studio.querySelectorAll('.c-live-card');
      const headline = studio.querySelector('.c-headline-bar');
      const hud = studio.querySelector('.creation-code-hud');

      clearTimeout(webStageTimeout1);
      clearTimeout(webStageTimeout2);
      clearTimeout(webStageTimeout3);

      // Phase 1: Drafting Wireframe (0s)
      if (stageLabel) stageLabel.textContent = '1. Drafting Wireframe...';
      if (cursor) {
        cursor.style.transform = 'translate(20px, 10px)';
        const cursorTag = cursor.querySelector('.cursor-tag');
        if (cursorTag) cursorTag.textContent = 'Drafting...';
      }
      if (headline) headline.style.background = 'rgba(255,255,255,0.18)';
      cards.forEach(card => {
        card.style.opacity = '0.45';
        card.style.transform = 'scale(0.97)';
      });

      // Phase 2: Styling UI (1.4s)
      webStageTimeout1 = setTimeout(() => {
        if (stageLabel) stageLabel.textContent = '2. Styling UI & Layout...';
        if (cursor) {
          cursor.style.transform = 'translate(140px, 45px)';
          const cursorTag = cursor.querySelector('.cursor-tag');
          if (cursorTag) cursorTag.textContent = 'Styling UI...';
        }
        if (headline) headline.style.background = 'linear-gradient(90deg, #fde68a 0%, #e5c07b 50%, #b45309 100%)';
        cards.forEach((card, idx) => {
          setTimeout(() => {
            card.style.opacity = '0.85';
            card.style.transform = 'scale(1) translateY(-2px)';
          }, idx * 100);
        });
      }, 1400);

      // Phase 3: Code Compilation (2.8s)
      webStageTimeout2 = setTimeout(() => {
        if (stageLabel) stageLabel.textContent = '3. Compiling Code Engine...';
        if (cursor) {
          cursor.style.transform = 'translate(80px, 90px)';
          const cursorTag = cursor.querySelector('.cursor-tag');
          if (cursorTag) cursorTag.textContent = 'Deploying...';
        }
        if (hud) {
          hud.style.boxShadow = '0 0 15px rgba(229, 192, 123, 0.5)';
        }
      }, 2800);

      // Phase 4: Production Live (3.9s)
      webStageTimeout3 = setTimeout(() => {
        if (stageLabel) stageLabel.textContent = '4. Live SaaS Online (0.4s Fast)';
        if (cursor) {
          cursor.style.transform = 'translate(190px, 20px)';
          const cursorTag = cursor.querySelector('.cursor-tag');
          if (cursorTag) cursorTag.textContent = '100% Ready';
        }
        cards.forEach(card => {
          card.style.opacity = '1';
          card.style.transform = 'none';
        });
      }, 3900);

    } else if (modeKey === 'app') {
      const bars = studio.querySelectorAll('.spark-bar');
      const heights = ['40%', '65%', '85%', '50%', '95%', '70%', '100%'];
      bars.forEach((bar, idx) => {
        bar.style.height = '15%';
        setTimeout(() => {
          bar.style.height = heights[idx % heights.length];
        }, 150 + idx * 80);
      });
    } else if (modeKey === 'security') {
      const sweep = studio.querySelector('.rc-sweep-laser');
      if (sweep) {
        sweep.style.animation = 'none';
        sweep.offsetHeight;
        sweep.style.animation = 'radarSweep 2.5s linear infinite';
      }
    } else if (modeKey === 'marketing') {
      const path = studio.querySelector('.growth-path');
      if (path) {
        path.style.animation = 'none';
        path.offsetHeight;
        path.style.animation = 'drawCurve 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      }
    }
  }

  function animateLoop(now) {
    if (!isUserInteracting) {
      const elapsed = now - cycleStartTime;
      const progress = Math.min(elapsed / cycleDuration, 1);

      if (timerFill) {
        timerFill.style.width = `${progress * 100}%`;
      }

      if (progress >= 1) {
        // Advance to next mode
        currentIndex = (currentIndex + 1) % modes.length;
        setPipeline(modes[currentIndex], true);
      }
    }

    animationFrameId = requestAnimationFrame(animateLoop);
  }

  // Click handling on tabs
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetMode = btn.getAttribute('data-pipeline');
      if (!targetMode) return;

      isUserInteracting = true;
      setPipeline(targetMode, true);

      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        isUserInteracting = false;
        cycleStartTime = performance.now();
      }, 4000);
    });
  });

  // Pause on hover, resume on mouse leave
  studio.addEventListener('mouseenter', () => {
    isUserInteracting = true;
  });

  studio.addEventListener('mouseleave', () => {
    isUserInteracting = false;
    cycleStartTime = performance.now();
  });

  // Start initial state
  setPipeline(modes[0], true);
  animationFrameId = requestAnimationFrame(animateLoop);
}

/* ==========================================================================
   11. IPHONE-STYLE FLOATING BOTTOM DOCK NAVIGATION
   ========================================================================== */
function initBottomMobileNav() {
  const tabs = document.querySelectorAll('.iphone-nav-tab');
  if (!tabs.length) return;

  const sections = [
    { id: 'hero', element: document.getElementById('hero') },
    { id: 'creation-studio', element: document.getElementById('creation-studio') },
    { id: 'app-web-dev', element: document.getElementById('app-web-dev') },
    { id: 'services', element: document.getElementById('services') }
  ].filter(sec => sec.element !== null);

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;

    let currentSectionId = 'hero';
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const top = sec.element.offsetTop;
      const height = sec.element.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = sec.id;
        break;
      }
    }

    tabs.forEach(tab => {
      const tabTarget = tab.getAttribute('data-nav');
      if (tabTarget === currentSectionId) {
        tab.classList.add('active');
      } else if (tabTarget !== 'contact') {
        tab.classList.remove('active');
      }
    });
  }, { passive: true });

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

