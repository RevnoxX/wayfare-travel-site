class FooterComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <h2 class="footer-logo">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-compass" style="color: var(--color-primary); margin-right: 0.5rem; vertical-align: middle; display: inline-block;"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                                <span class="brand-way">Way</span><span class="brand-fare">Fare</span>
                            </h2>
                            <p class="footer-desc">Curating authentic, slow travel experiences for the modern explorer who seeks connection over consumption.</p>
                            <div class="social-links">
                                <a href="#" class="social-link" aria-label="Instagram">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                                </a>
                                <a href="#" class="social-link" aria-label="Twitter">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 0.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                                </a>
                                <a href="#" class="social-link" aria-label="YouTube">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                                </a>
                            </div>
                        </div>
                        <div class="footer-links-group">
                            <h4 class="footer-heading">Destinations</h4>
                            <ul class="footer-links">
                                <li><a href="#">Japan</a></li>
                                <li><a href="#">Morocco</a></li>
                                <li><a href="#">Norway</a></li>
                                <li><a href="#">Spain</a></li>
                            </ul>
                        </div>
                        <div class="footer-links-group">
                            <h4 class="footer-heading">Company</h4>
                            <ul class="footer-links">
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Journal</a></li>
                                <li><a href="#">Contact</a></li>
                                <li><a href="#">FAQ</a></li>
                            </ul>
                        </div>
                        <div class="footer-links-group">
                            <h4 class="footer-heading">Newsletter</h4>
                            <p class="footer-desc">Subscribe for field notes and exclusive journey announcements.</p>
                            <form class="newsletter-form" onsubmit="event.preventDefault()">
                                <input type="email" placeholder="Email address" class="newsletter-input" required>
                                <button type="submit" class="newsletter-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2026 <span class="brand-way">Way</span><span class="brand-fare">Fare</span>. All rights reserved.</p>
                        <div class="footer-legal">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons({ root: this });
        }
    }
}
customElements.define('wayfare-footer', FooterComponent);
