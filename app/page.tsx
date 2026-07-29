"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // ── Theme toggle ──────────────────────────────────────
    function updateIcons(t: string) {
      const sun = document.getElementById("iconSun");
      const moon = document.getElementById("iconMoon");
      if (!sun || !moon) return;
      sun.style.display = t === "dark" ? "block" : "none";
      moon.style.display = t === "dark" ? "none" : "block";
    }

    const current =
      document.documentElement.getAttribute("data-theme") || "light";
    updateIcons(current);

    const themeToggle = document.getElementById("themeToggle");
    const onToggle = () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
      updateIcons(next);
    };
    themeToggle?.addEventListener("click", onToggle);

    // ── Mobile nav ────────────────────────────────────────
    const overlay = document.getElementById("drawerOverlay");
    const drawer = document.getElementById("drawer");
    const menuOpen = document.getElementById("menuOpen");
    const menuClose = document.getElementById("menuClose");

    function openDrawer() {
      drawer?.classList.add("open");
      overlay?.classList.add("open");
      menuOpen?.setAttribute("aria-expanded", "true");
      overlay?.removeAttribute("aria-hidden");
    }
    function closeDrawer() {
      drawer?.classList.remove("open");
      overlay?.classList.remove("open");
      menuOpen?.setAttribute("aria-expanded", "false");
      overlay?.setAttribute("aria-hidden", "true");
    }

    menuOpen?.addEventListener("click", openDrawer);
    menuClose?.addEventListener("click", closeDrawer);
    overlay?.addEventListener("click", closeDrawer);
    const drawerLinks = drawer
      ? Array.from(drawer.querySelectorAll("a"))
      : [];
    drawerLinks.forEach((a) => a.addEventListener("click", closeDrawer));

    // Close drawer on Escape (before the quick-exit handler runs)
    const onDrawerEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawer?.classList.contains("open")) {
        e.stopPropagation();
        closeDrawer();
      }
    };
    document.addEventListener("keydown", onDrawerEsc, true);

    // ── Quick exit ────────────────────────────────────────
    const onQuickExit = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !drawer?.classList.contains("open")) {
        window.location.replace("https://weather.com");
      }
    };
    document.addEventListener("keydown", onQuickExit);

    // ── Country search ────────────────────────────────────
    const search = document.getElementById(
      "countrySearch",
    ) as HTMLInputElement | null;
    const onSearch = () => {
      const q = (search?.value || "").toLowerCase();
      document.querySelectorAll<HTMLElement>(".country-card").forEach((card) => {
        const name =
          card.querySelector(".country-name")?.textContent?.toLowerCase() || "";
        card.style.display = name.includes(q) ? "" : "none";
      });
    };
    search?.addEventListener("input", onSearch);

    // ── Cleanup ───────────────────────────────────────────
    return () => {
      themeToggle?.removeEventListener("click", onToggle);
      menuOpen?.removeEventListener("click", openDrawer);
      menuClose?.removeEventListener("click", closeDrawer);
      overlay?.removeEventListener("click", closeDrawer);
      drawerLinks.forEach((a) => a.removeEventListener("click", closeDrawer));
      document.removeEventListener("keydown", onDrawerEsc, true);
      document.removeEventListener("keydown", onQuickExit);
      search?.removeEventListener("input", onSearch);
    };
  }, []);

  return (
    <>
      <a href="#main" className="skip">
        Skip to main content
      </a>

      {/* Emergency Bar */}
      <div className="ebar" role="alert" aria-live="polite">
        <span>🚨 Are you in danger right now?</span>
        <a href="tel:112">📞 International: 112</a>
      </div>

      {/* Header */}
      <header>
        <div className="header-inner">
          <a href="#" className="logo" aria-label="SafeHer home">
            <div className="logo-icon">
              <svg
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="logo-name">SafeHer</span>
              <span className="logo-tag">
                Because every woman deserves safety
              </span>
            </div>
          </a>

          <ul className="nav-links" role="list">
            <li>
              <a href="#emergency">Emergency</a>
            </li>
            <li>
              <a href="#hotlines">Hotlines</a>
            </li>
            <li>
              <a href="#resources">Resources</a>
            </li>
            <li>
              <a href="#safety">Safety Tips</a>
            </li>
            <li>
              <a href="#legal">Legal Rights</a>
            </li>
            <li>
              <a href="#community">Community</a>
            </li>
          </ul>

          <div className="header-controls">
            {/* Dark mode toggle */}
            <button
              className="icon-btn"
              id="themeToggle"
              aria-label="Toggle dark mode"
              title="Toggle theme"
            >
              <svg
                id="iconSun"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: "none" }}
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <svg
                id="iconMoon"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            </button>
            {/* Language */}
            <button
              className="icon-btn lang-btn"
              aria-label="Select language"
              title="Change language"
            >
              <svg
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              English
            </button>
            {/* Hamburger */}
            <button
              className="icon-btn hamburger"
              id="menuOpen"
              aria-label="Open navigation"
              aria-expanded="false"
              aria-controls="drawer"
            >
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className="drawer-overlay" id="drawerOverlay" aria-hidden="true" />
      <nav
        className="drawer"
        id="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="drawer-head">
          <span className="drawer-name">SafeHer</span>
          <button className="drawer-close" id="menuClose" aria-label="Close menu">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <ul className="drawer-links">
          <li>
            <a href="#emergency">Emergency</a>
          </li>
          <li>
            <a href="#hotlines">Hotlines</a>
          </li>
          <li>
            <a href="#resources">Resources</a>
          </li>
          <li>
            <a href="#safety">Safety Tips</a>
          </li>
          <li>
            <a href="#legal">Legal Rights</a>
          </li>
          <li>
            <a href="#community">Community</a>
          </li>
        </ul>
        <div className="drawer-foot">
          <a href="tel:112" className="drawer-emg">
            📞 Emergency: 112
          </a>
        </div>
      </nav>

      <main id="main">
        {/* Hero */}
        <section className="hero" aria-labelledby="h1">
          <div className="hero-inner">
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" aria-hidden="true" />
                200+ languages supported
              </div>
              <h1 className="display" id="h1">
                You Are
                <br />
                Not Alone.
              </h1>
              <p className="hero-sub">
                Millions of women around the world face gender-based violence
                every day. SafeHer provides real emergency numbers, resources,
                and support — in every language.
              </p>
              <div className="hero-ctas">
                <a href="#emergency" className="btn-primary">
                  🆘 I Need Help Now
                </a>
                <a href="#resources" className="btn-ghost">
                  Browse Resources
                </a>
              </div>
            </div>
            <div className="hero-stats" aria-label="Key statistics">
              <div className="stat-block">
                <div className="stat-val">1 in 3</div>
                <div className="stat-lbl">women experience violence</div>
              </div>
              <div className="stat-block">
                <div className="stat-val">80+</div>
                <div className="stat-lbl">countries with hotlines</div>
              </div>
              <div className="stat-block">
                <div className="stat-val">24/7</div>
                <div className="stat-lbl">crisis support available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency */}
        <section
          className="emergency-section"
          id="emergency"
          aria-labelledby="h-emg"
        >
          <div className="section-inner">
            <div className="section-header">
              <span className="eyebrow">Immediate Help</span>
              <h2 className="display" id="h-emg">
                Emergency Assistance
              </h2>
              <p className="section-sub">
                If you&apos;re in immediate danger, contact emergency services in
                your country.
              </p>
            </div>
            <div className="emg-grid">
              <div className="emg-card">
                <div className="emg-card-icon">📞</div>
                <h3>International: 112</h3>
                <p style={{ marginBottom: ".9rem" }}>
                  Connects to emergency services in most countries worldwide.
                </p>
                <a href="tel:112" className="call-btn">
                  Call 112 Now
                </a>
              </div>
              <div className="emg-card">
                <div className="emg-card-icon">🆘</div>
                <h3>Crisis Hotline</h3>
                <p>
                  Available 24/7 — find your country&apos;s specific crisis line
                  in the hotlines section below.
                </p>
              </div>
              <div className="emg-card">
                <div className="emg-card-icon">🔒</div>
                <h3>Safe Word</h3>
                <p>
                  Agree on a code word with a trusted person so you can signal
                  for help without being heard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hotlines */}
        <section
          className="hotlines-section"
          id="hotlines"
          aria-labelledby="h-hot"
        >
          <div className="section-inner">
            <div className="section-header">
              <span className="eyebrow">By Country</span>
              <h2 className="display" id="h-hot">
                Find Help in Your Country
              </h2>
              <p className="section-sub">
                Real emergency numbers and crisis lines for 80+ countries.
              </p>
            </div>
            <div className="search-wrap">
              <svg
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                className="search-input"
                placeholder="Search country…"
                aria-label="Search country"
                id="countrySearch"
              />
            </div>
            <div className="country-list" id="countryList">
              {/* Sample entries */}
              <div className="country-card">
                <div className="country-header">
                  <span className="country-name">🇺🇸 United States</span>
                  <div className="country-emg">
                    <span className="emg-num">Emergency: 911</span>
                    <a href="tel:911" className="tel-link">
                      Call 911
                    </a>
                  </div>
                </div>
                <div className="country-detail">
                  <div className="detail-line">
                    <strong>DV Hotline:</strong>{" "}
                    <a href="tel:18007997233">1-800-799-7233</a>
                  </div>
                  <div className="detail-line">
                    <strong>Sexual Assault:</strong>{" "}
                    <a href="tel:18006564673">1-800-656-4673</a>
                  </div>
                  <div className="detail-line">
                    <strong>Crisis Text:</strong> Text HOME to 741741
                  </div>
                </div>
              </div>
              <div className="country-card">
                <div className="country-header">
                  <span className="country-name">🇬🇧 United Kingdom</span>
                  <div className="country-emg">
                    <span className="emg-num">Emergency: 999</span>
                    <a href="tel:999" className="tel-link">
                      Call 999
                    </a>
                  </div>
                </div>
                <div className="country-detail">
                  <div className="detail-line">
                    <strong>National DV:</strong>{" "}
                    <a href="tel:08082000247">0808 200 0247</a>
                  </div>
                  <div className="detail-line">
                    <strong>Rape Crisis:</strong>{" "}
                    <a href="tel:08088029999">0808 802 9999</a>
                  </div>
                  <div className="detail-line">
                    <strong>Samaritans:</strong> <a href="tel:116123">116 123</a>
                  </div>
                </div>
              </div>
              <div className="country-card">
                <div className="country-header">
                  <span className="country-name">🇮🇳 India</span>
                  <div className="country-emg">
                    <span className="emg-num">Emergency: 112</span>
                    <a href="tel:112" className="tel-link">
                      Call 112
                    </a>
                  </div>
                </div>
                <div className="country-detail">
                  <div className="detail-line">
                    <strong>Women&apos;s Helpline:</strong>{" "}
                    <a href="tel:1091">1091</a>
                  </div>
                  <div className="detail-line">
                    <strong>Police:</strong> <a href="tel:100">100</a>
                  </div>
                  <div className="detail-line">
                    <strong>iCall:</strong>{" "}
                    <a href="tel:9152987821">9152987821</a>
                  </div>
                </div>
              </div>
              <div className="country-card">
                <div className="country-header">
                  <span className="country-name">🇩🇪 Germany</span>
                  <div className="country-emg">
                    <span className="emg-num">Emergency: 110 / 112</span>
                    <a href="tel:110" className="tel-link">
                      Call 110
                    </a>
                  </div>
                </div>
                <div className="country-detail">
                  <div className="detail-line">
                    <strong>Women&apos;s Helpline:</strong>{" "}
                    <a href="tel:08000116016">08000 116 016</a>
                  </div>
                  <div className="detail-line">
                    <strong>Crisis Line:</strong>{" "}
                    <a href="tel:08001110111">0800 111 0 111</a>
                  </div>
                </div>
              </div>
              <div className="country-card">
                <div className="country-header">
                  <span className="country-name">🇧🇷 Brazil</span>
                  <div className="country-emg">
                    <span className="emg-num">Emergency: 190</span>
                    <a href="tel:190" className="tel-link">
                      Call 190
                    </a>
                  </div>
                </div>
                <div className="country-detail">
                  <div className="detail-line">
                    <strong>Ligue Mulher:</strong> <a href="tel:180">180</a>
                  </div>
                  <div className="detail-line">
                    <strong>CVV:</strong> <a href="tel:188">188</a>
                  </div>
                </div>
              </div>
            </div>
            <p
              style={{
                textAlign: "center",
                marginTop: "1.5rem",
                fontSize: ".82rem",
                color: "var(--text-muted)",
              }}
            >
              Showing 5 of 80+ countries — search above or{" "}
              <a href="#" style={{ color: "var(--link)" }}>
                see all countries
              </a>
            </p>
          </div>
        </section>

        {/* Resources */}
        <section
          className="resources-section"
          id="resources"
          aria-labelledby="h-res"
        >
          <div className="section-inner">
            <div className="section-header">
              <span className="eyebrow">Support Available</span>
              <h2 className="display" id="h-res">
                Resources &amp; Support
              </h2>
              <p className="section-sub">
                Find specialized help near you, across every need.
              </p>
            </div>
            <div className="resources-grid">
              <div className="res-card">
                <div className="res-icon">🏠</div>
                <h3>Domestic Violence Support</h3>
                <p>
                  Shelters, hotlines, and legal assistance for survivors of
                  domestic abuse.
                </p>
                <a href="#" className="text-link">
                  Learn more →
                </a>
              </div>
              <div className="res-card">
                <div className="res-icon">💜</div>
                <h3>Sexual Assault Support</h3>
                <p>
                  Confidential support, counseling, and resources for reporting.
                </p>
                <a href="#" className="text-link">
                  Learn more →
                </a>
              </div>
              <div className="res-card">
                <div className="res-icon">🧠</div>
                <h3>Mental Health</h3>
                <p>Counseling, therapy resources, and peer support groups.</p>
                <a href="#" className="text-link">
                  Learn more →
                </a>
              </div>
              <div className="res-card">
                <div className="res-icon">⚖️</div>
                <h3>Legal Aid</h3>
                <p>
                  Free and low-cost legal assistance for protection orders and
                  rights.
                </p>
                <a href="#" className="text-link">
                  Learn more →
                </a>
              </div>
              <div className="res-card">
                <div className="res-icon">🏡</div>
                <h3>Safe Shelters</h3>
                <p>
                  Emergency and transitional housing for women and children.
                </p>
                <a href="#" className="text-link">
                  Learn more →
                </a>
              </div>
              <div className="res-card">
                <div className="res-icon">💪</div>
                <h3>Economic Empowerment</h3>
                <p>
                  Financial assistance, job training, and resources for
                  independence.
                </p>
                <a href="#" className="text-link">
                  Learn more →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="safety-section" id="safety" aria-labelledby="h-saf">
          <div className="section-inner">
            <div className="section-header">
              <span className="eyebrow">Stay Safe</span>
              <h2 className="display" id="h-saf">
                Safety Tips
              </h2>
              <p className="section-sub">
                Knowledge is power — protect yourself and those around you.
              </p>
            </div>
            <div className="tips-grid">
              <div className="tips-card">
                <div className="tips-title">
                  <span className="tips-title-icon">💻</span>
                  <h3>Digital Safety</h3>
                </div>
                <ul className="tips-list">
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Use strong, unique passwords and enable two-factor
                      authentication
                    </span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>Be careful sharing your location on social media</span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>Know how to clear your browser history quickly</span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Use encrypted messaging apps (Signal, WhatsApp) for
                      sensitive conversations
                    </span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>Check devices regularly for tracking software</span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Use private browsing or incognito mode when searching for
                      help
                    </span>
                  </li>
                </ul>
              </div>
              <div className="tips-card">
                <div className="tips-title">
                  <span className="tips-title-icon">🛡️</span>
                  <h3>Physical Safety</h3>
                </div>
                <ul className="tips-list">
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Trust your instincts — if something feels wrong, it
                      probably is
                    </span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Share your location with a trusted person when going out
                    </span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Memorize emergency numbers, don&apos;t rely only on your
                      phone
                    </span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Plan and practice escape routes from home and work
                    </span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Keep copies of important documents in a safe place outside
                      your home
                    </span>
                  </li>
                  <li>
                    <span className="tip-check" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      Prepare an emergency bag with essentials you can grab
                      quickly
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Legal */}
        <section className="legal-section" id="legal" aria-labelledby="h-leg">
          <div className="section-inner">
            <div className="section-header">
              <span className="eyebrow">Know Your Rights</span>
              <h2 className="display" id="h-leg">
                Legal Protections
              </h2>
              <p className="section-sub">
                Legal protections exist for you — learn what they are.
              </p>
            </div>
            <div className="legal-grid">
              <div className="legal-card">
                <div className="legal-card-icon">🛡️</div>
                <h3>Protection Orders</h3>
                <p>
                  You have the right to seek a restraining or protection order
                  against an abuser in most countries.
                </p>
              </div>
              <div className="legal-card">
                <div className="legal-card-icon">💼</div>
                <h3>Workplace Rights</h3>
                <p>
                  Gender-based harassment and discrimination are illegal in most
                  countries — you can report it.
                </p>
              </div>
              <div className="legal-card">
                <div className="legal-card-icon">✈️</div>
                <h3>Immigration &amp; Asylum</h3>
                <p>
                  Gender-based persecution and domestic violence may qualify you
                  for asylum or special visa protections.
                </p>
              </div>
              <div className="legal-card">
                <div className="legal-card-icon">👩‍👧</div>
                <h3>Child Custody</h3>
                <p>
                  Your rights as a mother are protected — learn about custody
                  rights and how to keep children safe.
                </p>
              </div>
            </div>
            <div className="legal-ctas">
              <button className="btn-solid">Find a Lawyer</button>
              <button className="btn-outline">UN Women&apos;s Rights</button>
            </div>
          </div>
        </section>

        {/* Community */}
        <section
          className="community-section"
          id="community"
          aria-labelledby="h-com"
        >
          <div className="section-inner">
            <div className="section-header">
              <span className="eyebrow">You Belong Here</span>
              <h2 className="display" id="h-com">
                Join Our Community
              </h2>
              <p className="section-sub">
                Connect with other women, share your story, find strength
                together.
              </p>
            </div>
            <div className="comm-grid">
              <div className="comm-card">
                <div className="comm-card-icon">💬</div>
                <h3>Support Forum</h3>
                <p>
                  A safe, moderated space to share experiences and find support.
                </p>
              </div>
              <div className="comm-card">
                <div className="comm-card-icon">🌟</div>
                <h3>Survivor Stories</h3>
                <p>
                  Read stories of strength and resilience from women worldwide.
                </p>
              </div>
              <div className="comm-card">
                <div className="comm-card-icon">🤝</div>
                <h3>Volunteer</h3>
                <p>
                  Help other women by contributing your time, skills, or
                  resources.
                </p>
              </div>
              <div className="comm-card">
                <div className="comm-card-icon">❤️</div>
                <h3>Donate</h3>
                <p>
                  Support organizations that protect and empower women
                  worldwide.
                </p>
              </div>
            </div>
            <div className="comm-cta">
              <button className="btn-white">Join Our Community →</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <svg
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="footer-name">SafeHer</span>
              </div>
              <p className="footer-mission">
                Dedicated to supporting women facing gender-based violence and
                hardship worldwide. Every woman deserves safety.
              </p>
            </div>
            <div className="footer-col">
              <h4>Navigation</h4>
              <ul>
                <li>
                  <a href="#emergency">Emergency</a>
                </li>
                <li>
                  <a href="#hotlines">Hotlines</a>
                </li>
                <li>
                  <a href="#resources">Resources</a>
                </li>
                <li>
                  <a href="#safety">Safety Tips</a>
                </li>
                <li>
                  <a href="#legal">Legal Rights</a>
                </li>
                <li>
                  <a href="#community">Community</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Use</a>
                </li>
                <li>
                  <a href="#">Contact Us</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="crisis-note">
              🚨 In crisis? Call 112 (international) or your local emergency
              number
            </p>
            <p className="copy">© 2025 SafeHer. All rights reserved.</p>
          </div>
          <p className="escape-note">
            Press Escape at any time to quickly leave this site
          </p>
        </div>
      </footer>
    </>
  );
}
