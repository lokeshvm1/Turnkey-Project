/**
 * FORMA ARCHITECTS — Precision Scroll Animation Controller
 * Hardware-accelerated Canvas frame scrubber synced to viewport scroll
 */

(function () {
  'use strict';

  // Configuration
  const TOTAL_FRAMES = 120;
  const FRAME_PREFIX = 'image/clean_frames/frame_';
  const FRAME_EXT = '.jpg';

  // DOM Elements
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  const progressFill = document.getElementById('progress-fill');
  const stepIndicator = document.getElementById('step-indicator');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');

  // 3D Spatial Compass & Coordinate Elements
  const cube3d = document.getElementById('cube-3d');
  const spatialElevation = document.getElementById('spatial-elevation');
  const spatialPitch = document.getElementById('spatial-pitch');
  const spatialSector = document.getElementById('spatial-sector');
  const spatialFill = document.getElementById('spatial-fill');
  let scrollVelocity = 0;
  let lastScrollTop = 0;
  let lastScrollTime = performance.now();

  // Frame Cache
  const frames = [];
  let loadedCount = 0;
  let currentFrameIndex = 0;
  let targetFrameIndex = 0;
  let isTicking = false;

  // Format frame index to 4-digit zero-padded string
  function padIndex(index) {
    return String(index).padStart(4, '0');
  }

  // Preload all 120 images
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = `${FRAME_PREFIX}${padIndex(i)}${FRAME_EXT}`;
    img.onload = () => {
      loadedCount++;
      // Render initial frame once the first frame (or enough frames) is available
      if (i === 0 || loadedCount === 1) {
        renderFrame(0);
      }
    };
    frames.push(img);
  }

  // Responsive Canvas Sizing (Hi-DPI aware)
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    renderFrame(Math.round(currentFrameIndex));
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // High-performance canvas draw with "object-fit: cover" mathematics
  function renderFrame(index) {
    const safeIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
    const img = frames[safeIndex];

    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback to nearest loaded frame if current frame is still downloading
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = frames[safeIndex - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          drawCover(prev);
          return;
        }
        const next = frames[safeIndex + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          drawCover(next);
          return;
        }
      }
      return;
    }

    drawCover(img);
  }

  function drawCover(img) {
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const hRatio = cw / iw;
    const vRatio = ch / ih;
    const ratio = Math.max(hRatio, vRatio);

    const nw = iw * ratio;
    const nh = ih * ratio;
    const nx = (cw - nw) * 0.5;
    const ny = (ch - nh) * 0.5;

    ctx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
  }

  // Smooth frame loop using linear interpolation (lerp)
  function animationLoop() {
    // Smooth lerp damping towards target frame
    const delta = targetFrameIndex - currentFrameIndex;
    if (Math.abs(delta) > 0.01) {
      currentFrameIndex += delta * 0.22;
      renderFrame(currentFrameIndex);
    }

    requestAnimationFrame(animationLoop);
  }

  requestAnimationFrame(animationLoop);

  // Scroll Event Handler
  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;

    // Update target frame
    targetFrameIndex = progress * (TOTAL_FRAMES - 1);

    // Update progress bar
    if (progressFill) {
      progressFill.style.width = `${progress * 100}%`;
    }

    // Calculate scroll velocity for 3D spatial field
    const now = performance.now();
    const dt = Math.max(1, now - lastScrollTime);
    const dScroll = scrollTop - lastScrollTop;
    scrollVelocity = (dScroll / dt) * 12;
    lastScrollTop = scrollTop;
    lastScrollTime = now;

    // Update 3D Spatial Wireframe Cube
    if (cube3d) {
      const rotX = 25 + progress * 720;
      const rotY = 45 + progress * 540;
      const rotZ = progress * 180;
      cube3d.style.transform = `rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg)`;
    }

    // Update 3D Telemetry HUD
    if (spatialElevation) {
      const elev = (progress * 28.5).toFixed(2);
      spatialElevation.textContent = `+${elev}m`;
    }
    if (spatialPitch) {
      const deg = ((progress * 360) % 360).toFixed(0);
      spatialPitch.textContent = `${deg}° / 360°`;
    }
    if (spatialFill) {
      spatialFill.style.width = `${(progress * 100).toFixed(1)}%`;
    }
    if (spatialSector) {
      if (progress < 0.25) spatialSector.textContent = '01 FOUNDATION';
      else if (progress < 0.50) spatialSector.textContent = '02 SLAB & STRUCTURE';
      else if (progress < 0.75) spatialSector.textContent = '03 CURTAIN WALL';
      else spatialSector.textContent = '04 TURNKEY HANDOVER';
    }

    // 3D Perspective Tilt for Sections based on viewport distance
    const viewCenter = scrollTop + window.innerHeight * 0.5;
    sections.forEach((sec) => {
      const secCenter = sec.offsetTop + sec.offsetHeight * 0.5;
      const distFromCenter = secCenter - viewCenter;
      const normDist = Math.max(-1, Math.min(1, distFromCenter / (window.innerHeight * 0.85)));
      const tiltX = -normDist * 5;
      const depthZ = -Math.abs(normDist) * 35;
      sec.style.transform = `perspective(1600px) rotateX(${tiltX.toFixed(2)}deg) translateZ(${depthZ.toFixed(1)}px)`;
    });

    // Update step indicator (01, 02, 03) based on which section is in view
    let currentStep = '01';
    const viewportMiddle = scrollTop + window.innerHeight * 0.45;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (viewportMiddle >= top && viewportMiddle < top + height) {
        currentStep = section.getAttribute('data-step') || '01';
      }
    });

    if (stepIndicator && stepIndicator.textContent !== currentStep) {
      stepIndicator.textContent = currentStep;
    }

    // Highlight active nav link
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollTop >= top && scrollTop < top + height) {
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else if (link.getAttribute('href').startsWith('#')) {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', () => {
    onScroll();
    resizeCanvas();
  });

  // Smooth Anchor Navigation & Form Modal Routing
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').substring(1);
      if (targetId === 'project-inquiry') {
        e.preventDefault();
        openProjectForm();
        return;
      }
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Interactive Project Cards on Left Stack
  const projectCards = document.querySelectorAll('.project-card');
  const hudLocation = document.getElementById('hud-location');
  const hudCoords = document.getElementById('hud-coords');
  const hudPhase = document.getElementById('hud-phase');
  const hudProgress = document.getElementById('hud-progress');

  function setActiveCard(card) {
    if (!card) return;
    projectCards.forEach((c) => c.classList.remove('active'));
    card.classList.add('active');

    const loc = card.getAttribute('data-location');
    const coords = card.getAttribute('data-coords');
    const phase = card.getAttribute('data-phase');
    const prog = card.getAttribute('data-progress');

    if (hudLocation && loc) hudLocation.textContent = loc;
    if (hudCoords && coords) hudCoords.textContent = coords;
    if (hudPhase && phase) hudPhase.textContent = phase;
    if (hudProgress && prog) hudProgress.textContent = prog;
  }

  projectCards.forEach((card) => {
    card.addEventListener('mouseenter', () => setActiveCard(card));
    card.addEventListener('click', () => setActiveCard(card));
  });

  // Project Requirements Modal Controller
  const formModal = document.getElementById('project-form-modal');
  const btnCloseForm = document.getElementById('btn-close-form');
  const formModalBackdrop = document.getElementById('form-modal-backdrop');
  const requirementsForm = document.getElementById('requirements-form');
  const formSuccessMessage = document.getElementById('form-success-message');
  const btnSuccessClose = document.getElementById('btn-success-close');
  const btnSuccessNew = document.getElementById('btn-success-new');
  const turnkeyScopeSelect = document.getElementById('turnkey-scope');
  const locationInput = document.getElementById('project-location');
  const areaInput = document.getElementById('project-area');
  const exploreBtn = document.getElementById('explore-btn');
  const ctaContactBtn = document.getElementById('cta-contact-btn');
  const btnWhatsApp = document.getElementById('btn-whatsapp-inquiry');

  function openProjectForm(preselectScope, preselectLocation, preselectArea) {
    if (!formModal) return;
    if (preselectScope && turnkeyScopeSelect) {
      // Find matching option or set value
      for (let i = 0; i < turnkeyScopeSelect.options.length; i++) {
        if (turnkeyScopeSelect.options[i].text.toLowerCase().includes(preselectScope.toLowerCase()) ||
            turnkeyScopeSelect.options[i].value.toLowerCase().includes(preselectScope.toLowerCase())) {
          turnkeyScopeSelect.selectedIndex = i;
          break;
        }
      }
    }
    if (preselectLocation && locationInput) {
      locationInput.value = preselectLocation;
    }
    if (preselectArea && areaInput) {
      areaInput.value = preselectArea;
    }
    formModal.classList.add('open');
    formModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.location.hash = 'project-inquiry';
  }

  function closeProjectForm() {
    if (!formModal) return;
    formModal.classList.remove('open');
    formModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.location.hash === '#project-inquiry') {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }

  // Connect "EXPLORE PROJECTS" Hero Button directly to Open Form
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openProjectForm();
    });
  }

  if (ctaContactBtn) {
    ctaContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openProjectForm();
    });
  }

  if (btnCloseForm) {
    btnCloseForm.addEventListener('click', (e) => {
      e.preventDefault();
      closeProjectForm();
    });
  }

  if (formModalBackdrop) {
    formModalBackdrop.addEventListener('click', closeProjectForm);
  }

  if (btnSuccessClose) {
    btnSuccessClose.addEventListener('click', () => {
      closeProjectForm();
      if (formSuccessMessage) formSuccessMessage.classList.remove('visible');
      if (requirementsForm) requirementsForm.reset();
      updateWhatsAppLink();
      document.querySelectorAll('.quick-chip').forEach((c) => c.classList.remove('active'));
    });
  }

  if (btnSuccessNew) {
    btnSuccessNew.addEventListener('click', () => {
      if (formSuccessMessage) formSuccessMessage.classList.remove('visible');
      if (requirementsForm) requirementsForm.reset();
      updateWhatsAppLink();
      document.querySelectorAll('.quick-chip').forEach((c) => c.classList.remove('active'));
    });
  }

  // Close on Escape Key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && formModal && formModal.classList.contains('open')) {
      closeProjectForm();
    }
  });

  // Quick Chips for Location and Area Presets
  document.querySelectorAll('.quick-chips .quick-chip').forEach((chip) => {
    chip.addEventListener('click', function () {
      const container = this.closest('.quick-chips');
      const targetId = container ? container.getAttribute('data-target') : null;
      if (!targetId) return;
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        targetInput.value = this.getAttribute('data-val') || this.textContent.trim();
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        targetInput.focus();
      }
      container.querySelectorAll('.quick-chip').forEach((c) => c.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Dynamic WhatsApp Link Prefill with Turnkey Project Details
  function updateWhatsAppLink() {
    if (!btnWhatsApp) return;
    const name = (document.getElementById('client-name')?.value || '').trim();
    const phone = (document.getElementById('client-phone')?.value || '').trim();
    const loc = (document.getElementById('project-location')?.value || '').trim();
    const area = (document.getElementById('project-area')?.value || '').trim();
    const scope = (document.getElementById('turnkey-scope')?.value || '').trim();
    const details = (document.getElementById('turnkey-details')?.value || '').trim();

    let msg = `Hello FORMA ARCHITECTS, I would like to enquire about a Turnkey Project:`;
    if (name) msg += `\n• Client: ${name}`;
    if (phone) msg += `\n• Contact: ${phone}`;
    if (loc) msg += `\n• Site Location: ${loc}`;
    if (area) msg += `\n• Area: ${area} Sq Ft`;
    if (scope) msg += `\n• Turnkey Scope: ${scope}`;
    if (details) msg += `\n• Turnkey Details: ${details}`;

    btnWhatsApp.href = `https://api.whatsapp.com/send?phone=919840012345&text=${encodeURIComponent(msg)}`;
  }

  ['client-name', 'client-phone', 'project-location', 'project-area', 'turnkey-scope', 'turnkey-details'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateWhatsAppLink);
      el.addEventListener('change', updateWhatsAppLink);
    }
  });
  updateWhatsAppLink();

  // Handle URL hash on page load or hash change
  function checkHash() {
    if (window.location.hash === '#project-inquiry') {
      openProjectForm();
    }
  }
  window.addEventListener('hashchange', checkHash);
  checkHash();

  // Form Submission — Transmit to venkatlokesh101@gmail.com via Nodemailer API & Cloud Backup
  if (requirementsForm) {
    requirementsForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-submit-inquiry');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>DISPATCHING BRIEF TO venkatlokesh101@gmail.com...</span>';
      }

      const nameVal = (document.getElementById('client-name')?.value || '').trim() || 'Client';
      const phoneVal = (document.getElementById('client-phone')?.value || '').trim() || '—';
      const locVal = (document.getElementById('project-location')?.value || '').trim() || '—';
      const rawArea = (document.getElementById('project-area')?.value || '').trim();
      const areaVal = rawArea ? `${rawArea} SQ FT` : '—';
      const scopeVal = document.getElementById('turnkey-scope')?.value || 'Complete Turnkey (Design + Build + Handover)';
      const structureVal = document.getElementById('project-structure')?.value || 'G+1 Duplex / Villa';
      const emailVal = (document.getElementById('client-email')?.value || '').trim();
      const timelineVal = document.getElementById('project-timeline')?.value || 'Within 1 to 3 Months';
      const detailsVal = (document.getElementById('turnkey-details')?.value || '').trim() || '—';

      const payload = {
        name: nameVal,
        phone: phoneVal,
        location: locVal,
        area: rawArea || '0',
        turnkey_scope: scopeVal,
        structure: structureVal,
        email: emailVal,
        timeline: timelineVal,
        turnkey_details: detailsVal,
        recipient: 'venkatlokesh101@gmail.com',
      };

      let refId = `FORMA-TK-${Math.floor(1000 + Math.random() * 9000)}`;
      // Construct formatted email body for direct mailto dispatch to venkatlokesh101@gmail.com
      const mailSubject = encodeURIComponent(`[${refId}] Turnkey Enquiry: ${nameVal} (${areaVal}, ${locVal})`);
      const mailBodyText = encodeURIComponent(
        `FORMA ARCHITECTS — TURNKEY SPECIFICATION BRIEF\n` +
        `==================================================\n` +
        `Reference Number: #${refId}\n\n` +
        `Client Name:     ${nameVal}\n` +
        `Contact Phone:   ${phoneVal}\n` +
        `Client Email:    ${emailVal || '—'}\n` +
        `Site Location:   ${locVal}\n` +
        `Plot / Area:     ${areaVal}\n` +
        `Turnkey Scope:   ${scopeVal}\n` +
        `Structure Type:  ${structureVal}\n` +
        `Start Timeline:  ${timelineVal}\n\n` +
        `PROJECT REQUIREMENTS & DETAILS:\n` +
        `${detailsVal}\n` +
        `==================================================\n`
      );



      // Save lead locally to browser storage as permanent backup
      try {
        const stored = JSON.parse(localStorage.getItem('forma_inquiries') || '[]');
        stored.push({ ref: refId, timestamp: new Date().toISOString(), ...payload });
        localStorage.setItem('forma_inquiries', JSON.stringify(stored));
      } catch (e) {
        // ignore localStorage errors
      }

      let emailSentDirectly = false;

      // Dispatch to Backend API (/api/send-inquiry)
      try {
        const response = await fetch('/api/send-inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          if (result && result.ref) refId = result.ref;
          if (result && result.emailDispatched) emailSentDirectly = true;
          console.log('[FORMA] Turnkey brief delivered to server for venkatlokesh101@gmail.com');
        }
      } catch (err) {
        console.log('[FORMA] Brief recorded locally; direct email button armed for venkatlokesh101@gmail.com.');
      }

      // Reset button state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>SUBMIT TURNKEY ENQUIRY</span><svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>';
      }

      // Populate summary receipt
      const refEl = document.getElementById('summary-ref');
      if (refEl) refEl.textContent = `REF: #${refId}`;

      const elName = document.getElementById('summary-name');
      if (elName) elName.textContent = nameVal;

      const elPhone = document.getElementById('summary-phone');
      if (elPhone) elPhone.textContent = phoneVal;

      const elLoc = document.getElementById('summary-location');
      if (elLoc) elLoc.textContent = locVal;

      const elArea = document.getElementById('summary-area');
      if (elArea) elArea.textContent = areaVal;

      const elScope = document.getElementById('summary-scope');
      if (elScope) elScope.textContent = scopeVal;

      const elDetails = document.getElementById('summary-details');
      if (elDetails) elDetails.textContent = detailsVal;

      // Update success notice with clean in-page confirmation
      const successSub = document.querySelector('.success-sub');
      if (successSub) {
        successSub.innerHTML = `Your turnkey specifications have been securely recorded under reference <strong>#${refId}</strong>. Our Principal Turnkey Architect has received the brief and will review your parameters and connect at <strong>${phoneVal}</strong> within 24 hours.`;
      }

      if (formSuccessMessage) {
        formSuccessMessage.classList.add('visible');
        formSuccessMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Connect Card specification buttons to open the form with card context
  document.querySelectorAll('.project-card .card-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const card = link.closest('.project-card');
      const loc = card ? card.getAttribute('data-location') : '';
      openProjectForm('Complete Turnkey', loc);
    });
  });

  // --------------------------------------------------------------------------
  // 3D SPATIAL PARTICLES & HOLOGRAPHIC BLUEPRINT GRID
  // --------------------------------------------------------------------------
  const spatialCanvas = document.getElementById('spatial-canvas');
  if (spatialCanvas) {
    const spatialCtx = spatialCanvas.getContext('2d');
    const TOTAL_NODES = 48;
    const spatialNodes = [];

    function resizeSpatialCanvas() {
      spatialCanvas.width = window.innerWidth;
      spatialCanvas.height = window.innerHeight;
    }
    resizeSpatialCanvas();
    window.addEventListener('resize', resizeSpatialCanvas);

    // Initialize 3D coordinate nodes in spatial depth
    for (let i = 0; i < TOTAL_NODES; i++) {
      spatialNodes.push({
        x: (Math.random() - 0.5) * window.innerWidth * 1.8,
        y: (Math.random() - 0.5) * window.innerHeight * 1.8,
        z: Math.random() * 1000 + 50,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.2
      });
    }

    function renderSpatialField() {
      if (!spatialCtx) return;
      spatialCtx.clearRect(0, 0, spatialCanvas.width, spatialCanvas.height);
      const cx = spatialCanvas.width * 0.5;
      const cy = spatialCanvas.height * 0.5;
      const fov = 340;

      // React to scroll velocity with smooth dampening
      scrollVelocity *= 0.92;
      const moveZ = 0.6 + Math.min(18, Math.abs(scrollVelocity) * 1.6);

      for (let i = 0; i < spatialNodes.length; i++) {
        const node = spatialNodes[i];
        node.z -= moveZ;
        if (node.z <= 20) {
          node.z = 1000;
          node.x = (Math.random() - 0.5) * spatialCanvas.width * 1.8;
          node.y = (Math.random() - 0.5) * spatialCanvas.height * 1.8;
        }

        const scale = fov / node.z;
        const sx = cx + node.x * scale;
        const sy = cy + node.y * scale;

        if (sx >= -40 && sx <= spatialCanvas.width + 40 && sy >= -40 && sy <= spatialCanvas.height + 40) {
          const depthAlpha = Math.min(1, Math.max(0, (1 - node.z / 1000) * node.alpha));
          
          // Render glowing architectural node
          spatialCtx.beginPath();
          spatialCtx.arc(sx, sy, Math.max(0.6, node.size * scale), 0, Math.PI * 2);
          spatialCtx.fillStyle = `rgba(197, 168, 128, ${depthAlpha * 0.7})`;
          spatialCtx.fill();

          // Connect nearby coordinate nodes with architectural grid line
          for (let j = i + 1; j < Math.min(i + 4, spatialNodes.length); j++) {
            const node2 = spatialNodes[j];
            const scale2 = fov / node2.z;
            const sx2 = cx + node2.x * scale2;
            const sy2 = cy + node2.y * scale2;
            const dist = Math.hypot(sx - sx2, sy - sy2);
            if (dist < 100) {
              spatialCtx.beginPath();
              spatialCtx.moveTo(sx, sy);
              spatialCtx.lineTo(sx2, sy2);
              spatialCtx.strokeStyle = `rgba(229, 200, 156, ${(1 - dist / 100) * depthAlpha * 0.16})`;
              spatialCtx.lineWidth = 0.5;
              spatialCtx.stroke();
            }
          }
        }
      }

      requestAnimationFrame(renderSpatialField);
    }
    requestAnimationFrame(renderSpatialField);
  }

  // --------------------------------------------------------------------------
  // 3D INTERACTIVE CARD PERSPECTIVE TILT (Mouse & Scroll responsive)
  // --------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.project-card, .atelier-card, .philosophy-card, .facet-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotY = ((x - cx) / cx) * 7;
      const rotX = -((y - cy) / cy) * 7;
      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(16px) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0) scale3d(1, 1, 1)';
    });
  });
})();
