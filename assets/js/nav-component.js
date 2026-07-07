class WayFareNav extends HTMLElement {
  connectedCallback() {
    // Inject the HTML and CSS directly into the component
    this.innerHTML = `
      <style>
        /* Variables & Theming */
        :root {
          --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
          --color-parchment-deep: #f2ebe1;
          --color-parchment-card: #faf7f2;
          --color-terracotta: #b56554;
          --color-ink: #2c3531;
          
          --bg-main: var(--color-parchment-deep);
          --text-main: var(--color-ink);
          --hover-bg: rgba(44, 53, 49, 0.05);
          --tooltip-bg: var(--color-ink);
          --tooltip-text: var(--color-parchment-deep);
          --dropdown-bg: #faf7f2;
          --border-color: rgba(44, 53, 49, 0.1);
          --icon-color: rgba(44, 53, 49, 0.8);
        }

        html.dark {
          --bg-main: #0a0a0a;
          --text-main: var(--color-parchment-deep);
          --hover-bg: rgba(255, 255, 255, 0.05);
          --tooltip-bg: #E8E4D9;
          --tooltip-text: #111111;
          --dropdown-bg: #111111;
          --border-color: rgba(255, 255, 255, 0.1);
          --icon-color: rgba(255, 255, 255, 0.8);
        }

        /* Component Styles */
        .nav-header {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4rem;
          width: calc(100% - 2rem);
          max-width: 900px;
          padding: 0 1rem;
          border-radius: 16px;
          background-color: transparent;
          border: 1px solid transparent;
          transition: max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
                      background-color 0.5s ease, 
                      border-color 0.5s ease, 
                      box-shadow 0.5s ease, 
                      border-radius 0.5s ease, 
                      padding 0.5s ease;
          z-index: 1000;
          font-family: var(--font-sans);
          color: var(--text-main);
        }

        .nav-header.is-scrolled {
          max-width: 420px;
          background-color: rgba(250, 247, 242, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 24px;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.05);
          padding: 0 0.75rem;
        }

        html.dark .nav-header.is-scrolled {
          background-color: rgba(17, 17, 17, 0.4);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(0, 0, 0, 0.2);
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-main);
          overflow: hidden;
          z-index: 20;
          flex-shrink: 0;
          max-width: 200px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }

        .brand-link.is-scrolled {
          max-width: 60px;
          gap: 0;
        }

        .logo-container {
          width: 1.5rem;
          height: 1.5rem;
          color: var(--color-terracotta);
          flex-shrink: 0;
        }

        .site-name {
          font-weight: 600;
          font-size: 1.125rem;
          white-space: nowrap;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: 150px;
          opacity: 1;
        }

        .brand-link.is-scrolled .site-name {
          max-width: 0;
          opacity: 0;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 0.5rem;
          position: relative;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: calc(100% - 16px);
          width: 70px;
          border-radius: 20px;
          transition: all 0.5s ease;
          margin: 8px 0;
          outline: none;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          text-decoration: none;
        }

        .nav-item:hover {
          background-color: var(--hover-bg);
        }

        .nav-item::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          border-top: 2px solid transparent;
          border-left: 2px solid transparent;
          border-top-left-radius: 8px;
          width: 0%;
          height: 0%;
          transition: all 0.3s ease;
          z-index: 20;
          pointer-events: none;
        }

        .nav-item::before {
          content: "";
          position: absolute;
          right: 0;
          bottom: 0;
          border-bottom: 2px solid transparent;
          border-right: 2px solid transparent;
          border-bottom-right-radius: 8px;
          width: 0%;
          height: 0%;
          transition: all 0.3s ease;
          z-index: 20;
          pointer-events: none;
        }

        .nav-item:not(.active):hover::before,
        .nav-item:not(.active):hover::after {
          width: 12px;
          height: 12px;
          border-color: #A6A6A6;
        }

        html.dark .nav-item:not(.active):hover::before,
        html.dark .nav-item:not(.active):hover::after {
          border-color: rgba(255, 255, 255, 0.4);
        }

        .nav-item.active {
          width: 130px;
          height: 100%;
          margin: 0;
          background-color: transparent;
          transform: scale(0.95);
        }

        .nav-item-inner {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
        }

        .nav-item.active::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle 80px at top, rgba(181, 101, 84, 0.45) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: -1;
          pointer-events: none;
        }

        .nav-item.active .nav-item-inner::before {
          opacity: 1;
        }

        .nav-label {
          font-weight: 600;
          font-size: 0.9375rem;
          white-space: nowrap;
          position: absolute;
          transition: all 0.5s ease;
          opacity: 0;
          max-width: 0;
          transform: translateY(1rem);
          color: var(--color-terracotta);
        }

        .nav-item.active .nav-label {
          opacity: 1;
          max-width: 100px;
          transform: translateY(-8px);
        }

        html.dark .nav-item.active .nav-label { color: white; }

        .icon-wrapper {
          position: absolute;
          transition: all 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.4;
          color: var(--text-main);
          transform: translateY(0);
        }

        .nav-item:hover .icon-wrapper { opacity: 1; }

        .nav-item.active .icon-wrapper {
          transform: translateY(24px);
          opacity: 1;
          color: var(--color-terracotta);
        }

        html.dark .nav-item.active .icon-wrapper { color: white; }
        
        .brand-way { color: var(--color-primary); }
        .brand-fare { color: var(--color-text); }

        .active-indicator {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0.5);
          width: 40px;
          height: 2px;
          background-color: var(--color-terracotta);
          border-radius: 9999px;
          box-shadow: 0 0 8px var(--color-terracotta);
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .nav-item.active .active-indicator { opacity: 1; transform: translateX(-50%) scaleX(1); }

        .action-container {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          position: relative;
        }

        .desktop-actions {
          display: flex;
          align-items: center;
          gap: 0.125rem;
          opacity: 1;
          visibility: visible;
          width: 125px; 
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, gap 0.5s ease;
        }

        .desktop-actions .action-wrapper {
          position: relative;
          display: flex;
          justify-content: center;
          width: 2.5rem;
          transform: scale(1);
          transform-origin: center;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-header.is-scrolled .desktop-actions {
          width: 0;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          gap: 0;
        }

        .nav-header.is-scrolled .desktop-actions .action-wrapper {
          width: 0;
          transform: scale(0);
        }

        .action-container > .action-wrapper { position: relative; }
        .action-wrapper { position: relative; }

        .action-btn {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--icon-color);
          transition: background-color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
        }
        .action-btn:active, .hamburger-btn:active { transform: scale(0.95); }
        .action-btn:hover { background-color: var(--hover-bg); }
        .action-btn i { width: 18px; height: 18px; }

        .icon-moon { display: none; }
        .icon-sun { display: block; }
        html.dark .icon-moon { display: block; }
        html.dark .icon-sun { display: none; }

        .hamburger-wrapper { position: relative; }

        .hamburger-btn {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
          transition: all 0.5s ease;
          overflow: hidden;
          max-width: 0;
          opacity: 0;
          background: none;
          border: none;
          cursor: pointer;
        }

        .hamburger-btn:hover { background-color: var(--hover-bg); }

        .nav-header.is-scrolled .hamburger-btn { max-width: 40px; opacity: 1; }

        .bar {
          width: 18px;
          height: 2px;
          background-color: var(--text-main);
          border-radius: 9999px;
          transition: transform 0.3s, opacity 0.3s;
        }

        .hamburger-btn.open .bar-top { transform: translateY(8px) rotate(45deg); }
        .hamburger-btn.open .bar-middle { opacity: 0; }
        .hamburger-btn.open .bar-bottom { transform: translateY(-8px) rotate(-45deg); }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 14rem;
          background-color: var(--dropdown-bg);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          opacity: 0;
          transform: translateY(10px) scale(0.95);
          pointer-events: none;
          transition: opacity 0.2s, transform 0.2s;
          z-index: 50;
        }

        .dropdown-menu.show {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-align: left;
          border-radius: 0.75rem;
          transition: background-color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
        }

        .dropdown-item:hover { background-color: var(--hover-bg); }
        .dropdown-item.text-terracotta { color: var(--color-terracotta); }
        .dropdown-item.text-terracotta:hover { background-color: rgba(181, 101, 84, 0.1); }
        .dropdown-divider { height: 1px; background-color: var(--border-color); margin: 0.25rem 0.5rem; }

        .nav-tooltip, .action-tooltip {
          position: absolute;
          top: calc(100% + 16px);
          left: 50%;
          transform: translateX(-50%) translateY(-15px) scale(0.9);
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.025em;
          background-color: var(--tooltip-bg);
          color: var(--tooltip-text);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease-out, transform 0.15s ease-out;
          z-index: 50;
        }

        .nav-item:hover:not(.active) .nav-tooltip,
        .action-wrapper:hover .action-tooltip,
        .hamburger-wrapper:hover .action-tooltip:not(.hidden) {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }

        .hamburger-wrapper .action-tooltip {
          left: auto;
          right: 0;
          transform: translateY(-5px) scale(0.95);
        }
        
        .hamburger-wrapper:hover .action-tooltip:not(.hidden) {
          transform: translateY(0) scale(1);
        }

        .nav-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--color-terracotta);
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          height: 16px;
          min-width: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid var(--bg-main);
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .nav-badge.empty {
          opacity: 0;
        }

        .nav-tooltip::before, .action-tooltip::before {
          content: "";
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background-color: var(--tooltip-bg);
        }
        
        .hamburger-wrapper .action-tooltip::before {
          left: auto;
          right: 1rem;
        }

        @media (max-width: 640px) {
          .nav-item { width: 50px; }
          .nav-item.active { width: 100px; }
          .nav-label { font-size: 0.875rem; }
          .nav-header.is-scrolled { padding: 0 0.5rem; }
          .desktop-actions { display: none; }
          .hamburger-btn { max-width: 40px; opacity: 1; }
        }

        @media (max-width: 850px) {
          .site-name { max-width: 0; opacity: 0; }
          .brand-link { max-width: 60px; }
        }

        @media (max-width: 768px) {
          .brand-link.is-scrolled { max-width: 0; opacity: 0; padding-left: 0; pointer-events: none; }
        }

        .notification-panel {
          position: fixed;
          top: 0;
          right: -360px; /* Hide completely offscreen */
          left: auto;
          width: 350px;
          max-width: 80vw;
          height: 100vh;
          background-color: var(--dropdown-bg);
          border-left: 1px solid var(--border-color);
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
          z-index: 2000;
          transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }
        .notification-panel.open {
          right: 0;
        }
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .notif-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-main);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        .close-btn:hover {
          background-color: var(--hover-bg);
        }
        .notif-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .notif-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background-color: var(--bg-main);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .notif-icon {
          color: var(--color-terracotta);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .notif-text p {
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          color: var(--text-main);
          line-height: 1.4;
        }
        .notif-text span {
          font-size: 0.75rem;
          color: var(--icon-color);
        }
        .notif-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 1500;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .notif-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }
      </style>

      <header id="nav-header" class="nav-header">
        <!-- Brand Logo & Name -->
        <a href="#" id="brand-link" class="brand-link">
          <div class="logo-container">
            <img src="../final/assets/favicon.png" alt="WayFare Nomad Logo" class="logo-container">
          </div>
          <span class="site-name"><span class="brand-way">Way</span><span class="brand-fare">Fare</span></span>
        </a>

        <!-- Core Navigation Options -->
        <nav id="nav-menu" class="nav-menu">
          <a href="index.html" class="nav-item active" data-id="home">
            <div class="nav-item-inner">
              <span class="nav-label">Home</span>
              <div class="icon-wrapper">
                <i data-lucide="home"></i>
              </div>
              <div class="active-indicator"></div>
            </div>
            <div class="nav-tooltip">Home</div>
          </a>

          <a href="/explore.html" data-no-swup class="nav-item" data-id="explore">
            <div class="nav-item-inner">
              <span class="nav-label">Explore</span>
              <div class="icon-wrapper">
                <i data-lucide="compass"></i>
              </div>
              <div class="active-indicator"></div>
            </div>
            <div class="nav-tooltip">Explore</div>
          </a>

          <a href="contact.html" class="nav-item" data-id="contact">
            <div class="nav-item-inner">
              <span class="nav-label">Contact</span>
              <div class="icon-wrapper">
                <i data-lucide="phone"></i>
              </div>
              <div class="active-indicator"></div>
            </div>
            <div class="nav-tooltip">Contact</div>
          </a>
        </nav>

        <!-- Actions & Hamburger -->
        <div id="action-container" class="action-container">
                    

          <!-- Desktop Action Icons -->
          <div id="desktop-actions" class="desktop-actions">

          

            <div class="action-wrapper">
              <button id="notif-action-btn" class="action-btn">
                <i data-lucide="bell"></i>
                <span id="nav-notif-badge" class="nav-badge empty">0</span>
              </button>
              <div class="action-tooltip">Notifications</div>
            </div>

            <div class="action-wrapper">
              <button id="theme-toggle" class="action-btn">
                <i data-lucide="moon" class="icon-moon"></i>
                <i data-lucide="sun" class="icon-sun"></i>
              </button>
              <div class="action-tooltip">Toggle Theme</div>
            </div>

            <div class="action-wrapper">
              <button id="user-action-btn" class="action-btn">
                <i data-lucide="user"></i>
              </button>
              <div id="user-action-tooltip" class="action-tooltip">Sign In</div>
            </div>

            <div class="action-wrapper" id="signout-wrapper" style="display: none;">
              <button id="signout-action-btn" class="action-btn">
                <i data-lucide="log-out"></i>
              </button>
              <div class="action-tooltip">Sign Out</div>
            </div>
          </div>

          <!-- Hamburger Menu -->
          <div class="hamburger-wrapper">
            <button id="hamburger-btn" class="hamburger-btn">
              <span class="bar bar-top"></span>
              <span class="bar bar-middle"></span>
              <span class="bar bar-bottom"></span>
            </button>
            <div class="action-tooltip" id="hamburger-tooltip">Menu</div>
            
            <!-- Dropdown Menu -->
            <div id="dropdown-menu" class="dropdown-menu">
              <button id="mobile-user-btn" class="dropdown-item">
                <i data-lucide="user"></i> Dashboard
              </button>
              <button id="mobile-notif-btn" class="dropdown-item">
                <i data-lucide="bell"></i> Notifications
              </button>
              <button id="mobile-theme-toggle" class="dropdown-item">
                <i data-lucide="moon" class="icon-moon"></i>
                <i data-lucide="sun" class="icon-sun"></i>
                Toggle Theme
              </button>
              <div class="dropdown-divider"></div>
              <button id="mobile-auth-btn" class="dropdown-item text-terracotta">
                <i data-lucide="log-in"></i> Sign In
              </button>
            </div>
          </div>
        </div>

          
      </header>
<!-- Notification Panel -->
          <div id="notification-panel" class="notification-panel">
            <div class="notif-header">
              <h3>Notifications</h3>
              <button id="close-notif-btn" class="close-btn"><i data-lucide="x"></i></button>
            </div>
            <div class="notif-content">
              <div class="notif-item">
                <div class="notif-icon"><i data-lucide="info"></i></div>
                <div class="notif-text">
                  <p>Welcome to WayFare! Explore our new destinations.</p>
                  <span>2 hours ago</span>
                </div>
              </div>
              <div class="notif-item">
                <div class="notif-icon"><i data-lucide="check-circle"></i></div>
                <div class="notif-text">
                  <p>Your booking for Paris has been confirmed.</p>
                  <span>1 day ago</span>
                </div>
              </div>
              <div class="notif-item">
                <div class="notif-icon"><i data-lucide="alert-circle"></i></div>
                <div class="notif-text">
                  <p>Payment required for Tokyo package.</p>
                  <span>3 days ago</span>
                </div>
              </div>
            </div>
          </div>
          <div id="notif-overlay" class="notif-overlay"></div>
    `;

    // Render the Lucide Icons safely for this component
    if (window.lucide) {
      lucide.createIcons({ root: this });
    }

    // Initialize all event listeners and logic
    this.initLogic();
  }

  initLogic() {
    // --- Audio Feedback ---
    let audioCtx = null;

    function playClickSound() {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'sine';
        const now = audioCtx.currentTime;
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {
        // Silently ignore if audio fails
      }
    }

    // --- DOM Elements scoped to THIS component ---
    const navHeader = this.querySelector('#nav-header');
    const brandLink = this.querySelector('#brand-link');
    const navItems = this.querySelectorAll('.nav-item');

    const hamburgerBtn = this.querySelector('#hamburger-btn');
    const dropdownMenu = this.querySelector('#dropdown-menu');
    const hamburgerTooltip = this.querySelector('#hamburger-tooltip');

    const desktopThemeToggle = this.querySelector('#theme-toggle');
    const mobileThemeToggle = this.querySelector('#mobile-theme-toggle');

    // --- Scroll Effect ---
    const updateScrollState = () => {
      if (window.scrollY > 50) {
        navHeader.classList.add('is-scrolled');
        brandLink.classList.add('is-scrolled');
      } else {
        navHeader.classList.remove('is-scrolled');
        brandLink.classList.remove('is-scrolled');
      }
    };
    
    window.addEventListener('scroll', updateScrollState);
    updateScrollState(); // Check on init

    // --- Navigation Tab Active State ---
    let currentPath = window.location.pathname.replace(/\.html$/, '');
    if (currentPath === '' || currentPath === '/index' || currentPath === 'index') {
        currentPath = '/';
    }
    let hasActiveTab = false;

    navItems.forEach(item => {
      // Remove the active class from all tabs
      item.classList.remove('active');

      // Check if the link's href matches the current page URL
      let linkHref = item.getAttribute('href').replace(/\.html$/, '');
      if (linkHref === '' || linkHref === 'index' || linkHref === '/index') linkHref = '/';

      let match = false;
      if (currentPath === '/' && linkHref === '/') {
          match = true;
      } else if (currentPath !== '/' && linkHref !== '/' && currentPath.includes(linkHref)) {
          match = true;
      }

      if (match) {
        item.classList.add('active');
        hasActiveTab = true;
      }

      // Add sound effect on click
      item.addEventListener('click', () => {
        playClickSound();
      });
    });

    // --- Dropdown Menu Logic ---
    let isDropdownOpen = false;

    const toggleDropdown = (e) => {
      e.stopPropagation();
      playClickSound();
      isDropdownOpen = !isDropdownOpen;

      if (isDropdownOpen) {
        hamburgerBtn.classList.add('open');
        dropdownMenu.classList.add('show');
        hamburgerTooltip.classList.add('hidden');
      } else {
        hamburgerBtn.classList.remove('open');
        dropdownMenu.classList.remove('show');
        hamburgerTooltip.classList.remove('hidden');
      }
    };

    hamburgerBtn.addEventListener('click', toggleDropdown);

    document.addEventListener('click', (e) => {
      if (isDropdownOpen && !dropdownMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        isDropdownOpen = false;
        hamburgerBtn.classList.remove('open');
        dropdownMenu.classList.remove('show');
        hamburgerTooltip.classList.remove('hidden');
      }
    });

    // --- Theme Toggling ---
    const toggleTheme = (e) => {
      if (e) e.stopPropagation();

      const root = document.documentElement;
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }

      if (isDropdownOpen) {
        isDropdownOpen = false;
        hamburgerBtn.classList.remove('open');
        dropdownMenu.classList.remove('show');
        hamburgerTooltip.classList.remove('hidden');
      }
    };

    desktopThemeToggle.addEventListener('click', toggleTheme);
    mobileThemeToggle.addEventListener('click', toggleTheme);

    // Initialize theme on load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
    
    // --- Auth Logic ---
    
    this.updateAuthState();
  }

  updateAuthState() {
    let user = null;
    try {
        const uStr = localStorage.getItem('wayfare_user');
        if (uStr && uStr !== 'undefined') {
            user = JSON.parse(uStr);
        }
    } catch(e) {
        console.error('Error parsing user', e);
    }
    
    const desktopUserBtn = this.querySelector('#user-action-btn');
    const desktopUserTooltip = this.querySelector('#user-action-tooltip');
    const notifBtn = this.querySelector('#notif-action-btn');
    const signoutWrapper = this.querySelector('#signout-wrapper');
    const signoutBtn = this.querySelector('#signout-action-btn');
    const mobileUserBtn = this.querySelector('#mobile-user-btn');
    const mobileAuthBtn = this.querySelector('#mobile-auth-btn');
    
    const handleAuthClick = (e) => {
        if (user) {
            window.location.href = '/dashboard.html';
        } else {
            window.location.href = '/login.html';
        }
    };

    const handleSignOutClick = (e) => {
        localStorage.removeItem('wayfare_user');
        if (typeof window.showToast === 'function') {
            window.showToast('Logged out successfully', 'success');
            setTimeout(() => window.location.replace('/login.html'), 1000);
        } else {
            window.location.replace('/login.html');
        }
    };
    
    if (desktopUserBtn) desktopUserBtn.addEventListener('click', handleAuthClick);
    if (mobileUserBtn) mobileUserBtn.addEventListener('click', handleAuthClick);
    
    if (signoutBtn) signoutBtn.addEventListener('click', handleSignOutClick);
    if (mobileAuthBtn) {
        mobileAuthBtn.addEventListener('click', (e) => {
            if (user) {
                handleSignOutClick(e);
            } else {
                handleAuthClick(e);
            }
        });
    }

    const notifPanel = this.querySelector('#notification-panel');
    const notifOverlay = this.querySelector('#notif-overlay');
    const closeNotifBtn = this.querySelector('#close-notif-btn');
    const mobileNotifBtn = this.querySelector('#mobile-notif-btn');

    const openNotifPanel = () => {
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        notifPanel.classList.add('open');
        notifOverlay.classList.add('show');
    };
    
    const closeNotifPanel = () => {
        notifPanel.classList.remove('open');
        notifOverlay.classList.remove('show');
    };

    if (notifBtn) notifBtn.addEventListener('click', openNotifPanel);
    if (mobileNotifBtn) mobileNotifBtn.addEventListener('click', () => {
        // close mobile menu if open
        const hamburgerBtn = this.querySelector('#hamburger-btn');
        const dropdownMenu = this.querySelector('#dropdown-menu');
        const hamburgerTooltip = this.querySelector('#hamburger-tooltip');
        if (hamburgerBtn && hamburgerBtn.classList.contains('open')) {
            hamburgerBtn.classList.remove('open');
            if (dropdownMenu) dropdownMenu.classList.remove('show');
            if (hamburgerTooltip) hamburgerTooltip.classList.remove('hidden');
        }
        openNotifPanel();
    });
    if (closeNotifBtn) closeNotifBtn.addEventListener('click', closeNotifPanel);
    if (notifOverlay) notifOverlay.addEventListener('click', closeNotifPanel);

    
    if (user) {
        // Logged In
        if (desktopUserTooltip) desktopUserTooltip.textContent = 'Dashboard (' + user.name + ')';
        if (desktopUserBtn) desktopUserBtn.innerHTML = '<i data-lucide="user"></i>';
        
        if (mobileUserBtn) mobileUserBtn.innerHTML = '<i data-lucide="user"></i> Dashboard';
        if (mobileAuthBtn) mobileAuthBtn.innerHTML = '<i data-lucide="log-out"></i> Sign Out';
        
        // Show dashboard button, keep sign out button
        if (mobileUserBtn) mobileUserBtn.style.display = 'flex';
        if (signoutWrapper) signoutWrapper.style.display = 'block';
    } else {
        // Not Logged In
        if (desktopUserTooltip) desktopUserTooltip.textContent = 'Sign In';
        if (desktopUserBtn) desktopUserBtn.innerHTML = '<i data-lucide="log-in"></i>';
        
        // Hide dashboard on mobile if not logged in
        if (mobileUserBtn) mobileUserBtn.style.display = 'none';
        if (mobileAuthBtn) mobileAuthBtn.innerHTML = '<i data-lucide="log-in"></i> Sign In';
        if (signoutWrapper) signoutWrapper.style.display = 'none';
    }
    
    if (window.lucide) {
        lucide.createIcons({ root: this });
    }
    
    // Check if on protected page on load (when page is cached/history nav)
    this.checkAuthOnLoad(user);
  }

  checkAuthOnLoad(user) {
    const isLoginPage = window.location.pathname.includes('login.html');
    const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '';
    
    // If not logged in and not on login page or index page, redirect to login
    if (!user && !isLoginPage && !isIndexPage) {
        window.location.replace('/login.html');
    }
  }

  updateActiveTab(path = window.location.pathname) {
    let currentPath = path.replace(/\.html$/, ''); // Strip .html for robust matching
    if (currentPath === '' || currentPath === '/index' || currentPath === 'index') {
        currentPath = '/';
    }
    const navItems = this.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.classList.remove('active');
      let linkHref = item.getAttribute('href').replace(/\.html$/, '');
      if (linkHref === '' || linkHref === 'index' || linkHref === '/index') linkHref = '/';
      
      let match = false;
      if (currentPath === '/' && linkHref === '/') {
          match = true;
      } else if (currentPath !== '/' && linkHref !== '/' && currentPath.includes(linkHref)) {
          match = true;
      }

      if (match) {
        item.classList.add('active');
      }
    });
  }
}

// Register the custom element
customElements.define('wayfare-nav', WayFareNav);

window.addNavNotification = function(message, iconName, link) {
    const nav = document.querySelector('wayfare-nav');
    if (!nav) return;
    const notifContent = nav.querySelector('.notif-content');
    const badge = nav.querySelector('#nav-notif-badge');
    if (!notifContent || !badge) return;

    const notifItem = document.createElement('div');
    notifItem.className = 'notif-item';
    if (link) {
        notifItem.style.cursor = 'pointer';
        notifItem.onclick = () => window.location.href = link;
    }
    
    notifItem.innerHTML = `
        <div class="notif-icon"><i data-lucide="${iconName || 'info'}"></i></div>
        <div class="notif-text">
            <p>${message}</p>
            <span>Just now</span>
        </div>
    `;
    
    notifContent.insertBefore(notifItem, notifContent.firstChild);
    if (window.lucide) {
        lucide.createIcons({ root: notifItem });
    }
    
    let currentCount = parseInt(badge.textContent) || 0;
    currentCount++;
    badge.textContent = currentCount;
    badge.classList.remove('empty');
};
