/* ============================================================
   VDJ PUNIT — MAIN.JS
   Config-driven, vanilla JS. Relies on global CONFIG (js/config.js)
============================================================ */
(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ============================================================
     1. LOADER
  ============================================================ */
  function initLoader() {
    const loader = $("#loader");
    const bar = $("#loader-bar");
    const pctNum = $("#loader-pct-num");
    if (!loader) return;
    let pct = 0;
    const tick = () => {
      pct += Math.random() * 18 + 6;
      if (pct >= 100) pct = 100;
      bar.style.width = pct + "%";
      pctNum.textContent = Math.floor(pct) + "%";
      if (pct < 100) {
        setTimeout(tick, 140);
      } else {
        setTimeout(() => loader.classList.add("hide"), 280);
      }
    };
    tick();
  }

  /* ============================================================
     2. NAVBAR
  ============================================================ */
  function initNav() {
    const navbar = $("#navbar");
    const toggle = $("#navToggle");
    const links = $("#navLinks");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 40);
    });

    toggle?.addEventListener("click", () => links.classList.toggle("open"));
    $$(".nav-link").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

    // Active link on scroll
    const sections = $$("section[id]");
    const navLinkMap = {};
    $$(".nav-link").forEach(a => { navLinkMap[a.getAttribute("href").slice(1)] = a; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$(".nav-link").forEach(a => a.classList.remove("active"));
          navLinkMap[entry.target.id]?.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => io.observe(s));
  }

  /* ============================================================
     3. PROFILE / HERO / CONTACT BINDINGS
  ============================================================ */
  function bindProfile() {
    const c = window.CONFIG;
    if (!c) return;

    document.title = `${c.profile.name} | ${c.profile.tagline}`;

    // Hero media
    const heroVideo = $("#heroVideo");
    if (heroVideo) {
      const src = heroVideo.querySelector("source");
      if (src && c.profile.heroVideo) src.src = c.profile.heroVideo;
      if (c.profile.heroPoster) heroVideo.poster = c.profile.heroPoster;
      heroVideo.load();
    }

    // About photo
    const aboutImg = $(".about-photo img");
    if (aboutImg && c.profile.profilePhoto) aboutImg.src = c.profile.profilePhoto;

    // Bio
    const bio = $(".about-bio");
    if (bio && c.profile.bio) bio.innerHTML = c.profile.bio;

    // Press kit
    const kit = $(".download-kit");
    if (kit && c.profile.pressKit) kit.href = c.profile.pressKit;

    // Stats counters
    $$(".stat-num[data-count]").forEach((node, i) => {
      const key = i === 0 ? c.profile.stats.shows : c.profile.stats.crowd;
      node.setAttribute("data-count", key);
    });

    // Social links (data-link attrs)
    $$("[data-link]").forEach(a => {
      const key = a.getAttribute("data-link");
      if (c.social[key]) a.href = c.social[key];
    });

    // Contact bar bindings
    const phoneEl = $('[data-bind="phone"]');
    const emailEl = $('[data-bind="email"]');
    const locEl = $('[data-bind="location"]');
    if (phoneEl) phoneEl.textContent = c.profile.phone;
    if (emailEl) emailEl.textContent = c.profile.email;
    if (locEl) locEl.textContent = c.profile.location;

    // make phone/email clickable
    if (phoneEl) phoneEl.closest(".contact-item").querySelector(".val").outerHTML =
      `<a class="val" href="tel:${c.profile.phone.replace(/\s/g,"")}" data-bind="phone">${c.profile.phone}</a>`;
    if (emailEl) emailEl.closest(".contact-item").querySelector(".val").outerHTML =
      `<a class="val" href="mailto:${c.profile.email}" data-bind="email">${c.profile.email}</a>`;
  }

  /* ============================================================
     4. STATS COUNTER ANIMATION
  ============================================================ */
  function initCounters() {
    const counters = $$(".stat-num[data-count]");
    if (!counters.length) return;
    const animate = (node) => {
      const target = parseInt(node.getAttribute("data-count"), 10) || 0;
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.floor(eased * target).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else node.textContent = target.toLocaleString() + "+";
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => io.observe(c));
  }

  /* ============================================================
     5. ABOUT: SKILLS BARS + TIMELINE + GENRES + STATS
  ============================================================ */
  function buildAbout() {
    const c = window.CONFIG;
    if (!c) return;

    // Skill bars
    const skillsWrap = $(".about-skills");
    if (skillsWrap && c.skills) {
      const rows = skillsWrap.querySelectorAll(".skill-row");
      c.skills.forEach((s, i) => {
        const row = rows[i];
        if (!row) return;
        row.querySelector(".skill-row-top span:first-child").textContent = s.label;
        row.querySelector(".skill-row-top span:last-child").textContent = s.value + "%";
        row.querySelector(".skill-bar-fill").setAttribute("data-skill", s.value);
      });
    }

    // Genres
    const genreWrap = $(".genre-tags");
    if (genreWrap && c.genres) {
      genreWrap.innerHTML = c.genres.map(g => `<span class="genre-tag">${g}</span>`).join("");
    }

    // About stat pills
    const statRow = $(".about-stat-row");
    if (statRow && c.aboutStats) {
      statRow.innerHTML = c.aboutStats.map(s => `
        <div class="about-stat-pill glass"><div class="num">${s.num}</div><div class="lbl">${s.label}</div></div>
      `).join("");
    }

    // Timeline
    const tlWrap = $("#timelineMini");
    if (tlWrap && c.timeline) {
      tlWrap.innerHTML = c.timeline.map(t => `
        <div class="tl-item"><div class="tl-year">${t.year}</div><div class="tl-label">${t.label}</div></div>
      `).join("");
    }

    // Animate skill bars on reveal
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$(".skill-bar-fill").forEach(bar => {
            bar.style.width = bar.getAttribute("data-skill") + "%";
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    if (skillsWrap) io.observe(skillsWrap);
  }

  /* ============================================================
     6. GALLERY: AUTO LOAD + FILTER + LIGHTBOX
  ============================================================ */
  function buildGallery() {
    const c = window.CONFIG;
    const grid = $("#galleryGrid");
    if (!grid || !c?.gallery) return;

    grid.innerHTML = c.gallery.map(g => `
      <div class="gallery-item" data-cat="${g.category}">
        <img src="${g.src}" alt="${g.alt || ""}" loading="lazy">
      </div>
    `).join("");

    // Filters
    $$(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        $$(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.getAttribute("data-filter");
        $$(".gallery-item", grid).forEach(item => {
          item.classList.toggle("hidden", f !== "all" && item.getAttribute("data-cat") !== f);
        });
      });
    });

    // Lightbox
    const lightbox = $("#lightbox");
    const lightboxImg = $("#lightboxImg");
    grid.addEventListener("click", (e) => {
      const item = e.target.closest(".gallery-item");
      if (!item) return;
      lightboxImg.src = item.querySelector("img").src;
      lightbox.classList.add("open");
    });
    $(".lightbox-close")?.addEventListener("click", () => lightbox.classList.remove("open"));
    lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.classList.remove("open"); });

    const viewAll = $("#galleryViewAll");
if (viewAll && c.social.gallery)
    viewAll.href = c.social.gallery;
  }

  /* ============================================================
     7. INSTAGRAM REELS: PASTE LINK -> AUTO EMBED (oEmbed) + POPUP
  ============================================================ */
  function buildReels() {
    const c = window.CONFIG;
    const grid = $("#reelsGrid");
    if (!grid || !c?.reels) return;

    grid.innerHTML = c.reels.map((r, i) => `
      <div class="reel-card" data-url="${r.url}" data-index="${i}">
        <img src="${r.thumb}" alt="Instagram Reel" loading="lazy">
        <div class="reel-play">▶</div>
        <div class="reel-views">👁 ${r.views || ""}</div>
      </div>
    `).join("");

    // Popup player using Instagram embed.js blockquote (oEmbed HTML) when clicked
    const modal = $("#reelModal");
    const modalInner = $("#reelModalInner");
    grid.addEventListener("click", async (e) => {
      const card = e.target.closest(".reel-card");
      if (!card) return;
      const url = card.getAttribute("data-url");
      modalInner.innerHTML = `<div style="padding:60px 20px;text-align:center;color:var(--text-mid);font-size:13px;">Loading reel…</div>`;
      modal.classList.add("open");
      try {
        const res = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        modalInner.innerHTML = data.html;
        if (!window.instgrm) {
          const s = document.createElement("script");
          s.src = "https://www.instagram.com/embed.js";
          s.async = true;
          document.body.appendChild(s);
        } else {
          window.instgrm.Embeds.process();
        }
      } catch (e) {
        modalInner.innerHTML = `
          <div style="padding:50px 24px;text-align:center;">
            <p style="color:var(--text-mid);font-size:14px;margin-bottom:18px;">Couldn't auto-load this reel here.</p>
            <a href="${url}" target="_blank" rel="noopener" class="btn btn-primary">Open on Instagram ↗</a>
          </div>`;
      }
    });
    $(".reel-modal-close")?.addEventListener("click", () => { modal.classList.remove("open"); modalInner.innerHTML = ""; });
    modal?.addEventListener("click", (e) => { if (e.target === modal) { modal.classList.remove("open"); modalInner.innerHTML = ""; } });

    const moreLink = $("#reelsViewAll");
    if (moreLink) moreLink.href = c.reelsMoreLink || c.social.instagram;
  }

  /* ============================================================
     8. REVIEWS: AUTO LOAD FROM CONFIG
  ============================================================ */
  function buildReviews() {
    const c = window.CONFIG;
    const grid = $("#reviewsGrid");
    if (!grid || !c?.reviews) return;

    grid.innerHTML = c.reviews.map(r => `
      <div class="review-card glass">
        <div class="review-top">
          <img class="review-avatar" src="${r.avatar}" alt="${r.name}" loading="lazy"
               onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2742%27 height=%2742%27><rect width=%2742%27 height=%2742%27 fill=%23241433/></svg>'">
          <div>
            <div class="review-name">${r.name}</div>
            <div class="review-event">${r.event}</div>
          </div>
        </div>
        <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <div class="review-text">${r.text}</div>
        ${r.media ? `
          <div class="review-media" data-video="${r.media}">
            <img src="${r.media}" alt="Video review" loading="lazy">
            <div class="play-badge"><span>▶</span></div>
          </div>` : ""}
      </div>
    `).join("");

  const viewAll = $("#reviewsViewAll");
  if (viewAll && c.social.googleReviews) {
    viewAll.href = c.social.googleReviews;
    viewAll.target = "_blank";
}
  }

  /* ============================================================
     9. SHOWREEL (YouTube embed + playlist)
  ============================================================ */
  function buildShowreel() {
    const c = window.CONFIG;
    const section = $("#showreel");
    if (!section || !c?.showreel) return;
    const frame = $(".showreel-frame iframe", section);
    if (frame) frame.src = c.showreel.main;

    const playlist = $(".showreel-playlist", section);
    if (playlist && c.showreel.playlist) {
      playlist.innerHTML = c.showreel.playlist.map((p, i) => `
        <div class="showreel-thumb${i === 0 ? " active" : ""}" data-embed="https://www.youtube.com/embed/${p.id}">
          <img src="${p.thumb}" alt="${p.label}" loading="lazy">
          <div class="lbl">${p.label}</div>
        </div>
      `).join("");
      playlist.addEventListener("click", (e) => {
        const thumb = e.target.closest(".showreel-thumb");
        if (!thumb) return;
        $$(".showreel-thumb", playlist).forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        if (frame) frame.src = thumb.getAttribute("data-embed");
      });
    }
  }

  /* ============================================================
     10. EVENTS: AUTO LOAD
  ============================================================ */
  function buildEvents() {
    const c = window.CONFIG;
    const grid = $("#eventsGrid");
    if (!grid || !c?.events) return;
    const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    grid.innerHTML = c.events.map(ev => `
      <div class="event-card glass">
        <div class="event-poster">
          <img src="${ev.poster}" alt="${ev.name}" loading="lazy">
          <span class="event-status ${ev.status}">${ev.status}</span>
        </div>
        <div class="event-body">
          <div class="event-name">${ev.name}</div>
          <div class="event-date">${fmt(ev.date)}</div>
          <div class="event-loc">${ev.location}</div>
        </div>
      </div>
    `).join("");
  }

  /* ============================================================
     11. BOOKING FORM: WHATSAPP DELIVERY + (OPTIONAL) EMAILJS + SUCCESS POPUP
  ============================================================ */
  function buildBookingExtras() {
    const c = window.CONFIG;

    // Event type icons
    const typeWrap = $(".booking-event-types");
    if (typeWrap && c?.eventTypes) {
      typeWrap.innerHTML = c.eventTypes.map(t => `
        <div class="booking-event-type"><span class="ico">${t.icon}</span> ${t.label}</div>
      `).join("");
    }

    const form = $("#bookingForm");
    if (!form) return;

    // Inject success popup once
    if (!$("#successPopup")) {
      const popup = el("div", "success-popup", `
        <div class="success-popup-card glass">
          <div class="check">✓</div>
          <h3>Request Sent!</h3>
          <p>Thanks for reaching out. We've opened WhatsApp with your booking details — just hit send there to confirm.</p>
          <button class="btn btn-primary" id="successClose">Close</button>
        </div>`);
      popup.id = "successPopup";
      document.body.appendChild(popup);
      $("#successClose").addEventListener("click", () => popup.classList.remove("open"));
      popup.addEventListener("click", (e) => { if (e.target === popup) popup.classList.remove("open"); });
    }

    // Optional EmailJS (only runs if enabled + SDK loaded + keys provided)
    function trySendEmailJS(data) {
      const cfg = c?.emailjs;
      if (!cfg?.enabled || !cfg.publicKey || !window.emailjs) return;
      try {
        window.emailjs.init(cfg.publicKey);
        window.emailjs.send(cfg.serviceId, cfg.templateId, data);
      } catch (err) { console.warn("EmailJS send skipped:", err); }
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      const lines = [
        `*New Booking Inquiry*`,
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        data.email ? `Email: ${data.email}` : "",
        `Event Type: ${data.eventType}`,
        data.date ? `Date: ${data.date}` : "",
        data.location ? `Location: ${data.location}` : "",
        data.message ? `Message: ${data.message}` : ""
      ].filter(Boolean).join("\n");

      const waNumber = c?.profile?.whatsapp || "";
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines)}`;

      trySendEmailJS(data);

      window.open(waUrl, "_blank", "noopener");
      $("#successPopup").classList.add("open");
      form.reset();
    });
  }

  /* ============================================================
     12. CONTACT & FOOTER: BACK TO TOP
  ============================================================ */
  function initBackToTop() {
    if (!$("#backToTop")) {
      const btn = el("button", "", "↑");
      btn.id = "backToTop";
      btn.setAttribute("aria-label", "Back to top");
      document.body.appendChild(btn);
      btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
    window.addEventListener("scroll", () => {
      $("#backToTop").classList.toggle("show", window.scrollY > 600);
    });
  }

  /* ============================================================
     13. ANIMATIONS: SCROLL REVEAL + MOUSE GLOW + CURSOR + PAGE TRANSITION
  ============================================================ */
  function initScrollReveal() {
    const items = $$(".reveal");
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(i => io.observe(i));
  }

  function initMouseGlow() {
    const glow = $("#mouse-glow");
    if (!glow) return;
    let raf = null, x = window.innerWidth / 2, y = window.innerHeight / 2;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
        raf = null;
      });
    });
  }

  function initCustomCursor() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const dot = el("div", "cursor-dot");
    const ring = el("div", "cursor-ring");
    document.body.append(dot, ring);
    window.addEventListener("mousemove", (e) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
    $$("a, button, .gallery-item, .reel-card, .filter-btn").forEach(node => {
      node.addEventListener("mouseenter", () => ring.classList.add("hover"));
      node.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });
  }

  function initPageTransitionOnAnchors() {
    const overlay = el("div");
    overlay.id = "pageTransition";
    document.body.appendChild(overlay);
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener("click", () => {
        overlay.classList.remove("active");
        void overlay.offsetWidth; // restart animation
        overlay.classList.add("active");
      });
    });
  }

  /* ============================================================
     14. PREMIUM EFFECTS: PARTICLES, LASER, MUSIC VISUALIZER, MUSIC TOGGLE
  ============================================================ */
  function buildPremiumFeaturesStrip() {
    const c = window.CONFIG;
    const track = $("#pfTrack");
    if (!track || !c?.premiumFeatures) return;
    const cardsHtml = c.premiumFeatures.map(f => `
      <div class="pf-card"><div class="ico">${f.icon}</div><div class="lbl">${f.label.replace(" ", "<br>")}</div></div>
    `).join("");
    track.innerHTML = cardsHtml + cardsHtml; // duplicate for seamless loop
  }

  function initParticles() {
    const canvas = el("canvas");
    canvas.id = "particlesCanvas";
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");
    let w, h, particles;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function makeParticles() {
      const count = Math.min(70, Math.floor((w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vy: Math.random() * 0.3 + 0.08,
        vx: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.5 + 0.15,
        hue: Math.random() > 0.5 ? "155,79,242" : "94,231,255"
      }));
    }
    function loop() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.y -= p.vy; p.x += p.vx;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    resize(); makeParticles(); loop();
    window.addEventListener("resize", () => { resize(); makeParticles(); });
  }

  function initLaserLayer() {
    const hero = $("#hero");
    if (!hero) return;
    const layer = el("div", "laser-layer");
    for (let i = 0; i < 3; i++) {
      const beam = el("div", "laser-beam");
      beam.style.left = `${20 + i * 30}%`;
      beam.style.animationDelay = `${i * 1.3}s`;
      layer.appendChild(beam);
    }
    hero.prepend(layer);
  }

  function initMusicToggle() {
    const c = window.CONFIG;
    const btn = $("#musicToggle");
    if (!btn || !c?.bgMusic) return;
    const audio = new Audio(c.bgMusic);
    audio.loop = true;
    audio.volume = 0.35;
    btn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {});
        btn.classList.add("playing");
      } else {
        audio.pause();
        btn.classList.remove("playing");
      }
    });
  }

  /* ============================================================
     15. REVIEW VIDEO MODAL (reuses reel modal)
  ============================================================ */
  function initReviewVideoModal() {
    const modal = $("#reelModal");
    const modalInner = $("#reelModalInner");
    document.addEventListener("click", (e) => {
      const media = e.target.closest(".review-media");
      if (!media) return;
      const src = media.getAttribute("data-video");
      modalInner.innerHTML = `<video src="${src}" controls autoplay style="width:100%;display:block;"></video>`;
      modal.classList.add("open");
    });
  }

  /* ============================================================
     INIT
  ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initNav();
    bindProfile();
    buildAbout();
    buildGallery();
    buildReels();
    buildReviews();
    buildShowreel();
    buildEvents();
    buildBookingExtras();
    buildPremiumFeaturesStrip();

    initCounters();
    initBackToTop();
    initScrollReveal();
    initMouseGlow();
    initCustomCursor();
    initPageTransitionOnAnchors();
    initParticles();
    initLaserLayer();
    initMusicToggle();
    initReviewVideoModal();
  });
})();