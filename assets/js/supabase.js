// ── Supabase client ──────────────────────────────────────────────────────
let SUPABASE_URL = (window.ENV && window.ENV.SUPABASE_URL) || 'YOUR_SUPABASE_URL';
if (SUPABASE_URL.endsWith('/rest/v1/')) {
    SUPABASE_URL = SUPABASE_URL.replace('/rest/v1/', '');
} else if (SUPABASE_URL.endsWith('/rest/v1')) {
    SUPABASE_URL = SUPABASE_URL.replace('/rest/v1', '');
}
const SUPABASE_ANON_KEY = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || 'YOUR_SUPABASE_ANON_KEY';
window.supabaseClient = window.supabase && SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL' ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
if (!window.supabaseClient) {
    console.error("Supabase client failed to initialize. Check environment variables.");
}


window.wayfarePackages = [
    {
        id: 'pkg-1',
        name: 'Tokyo Culture Circuit',
        destination: 'Japan',
        category: 'Cultural',
        duration: 7,
        price: 125000,
        description: 'Experience the perfect blend of traditional and modern Japan. Visit ancient temples, bustling streets, and enjoy authentic cuisine.',
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 'pkg-2',
        name: 'Santorini Sunsets',
        destination: 'Greece',
        category: 'Romantic',
        duration: 5,
        price: 95000,
        description: 'Relax in the beautiful island of Santorini. Watch stunning sunsets, explore white-washed villages, and sail the Aegean sea.',
        image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 'pkg-3',
        name: 'Bali Bliss Retreat',
        destination: 'Indonesia',
        category: 'Wellness',
        duration: 8,
        price: 75000,
        description: 'Rejuvenate your soul in the heart of Bali. Yoga sessions, meditation, and healthy organic meals included.',
        image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 'pkg-4',
        name: 'Swiss Alps Explorer',
        destination: 'Switzerland',
        category: 'Adventure',
        duration: 6,
        price: 180000,
        description: 'Hike through breathtaking alpine trails, enjoy pristine lakes, and experience world-class skiing resorts.',
        image_url: 'https://images.unsplash.com/photo-1531366936337-779504350758?auto=format&fit=crop&q=80&w=1200'
    },
    {
        id: 'pkg-5',
        name: 'Kenya Safari Quest',
        destination: 'Kenya',
        category: 'Wildlife',
        duration: 10,
        price: 210000,
        description: 'Witness the great migration and spot the Big Five in their natural habitat with our expert guides.',
        image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200'
    }
];

window.showToast = function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    // Limit to 2 toasts
    const currentToasts = container.querySelectorAll('.toast');
    if (currentToasts.length >= 2) {
        const oldest = currentToasts[0];
        oldest.classList.remove('show');
        setTimeout(() => oldest.remove(), 300);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'smile' : 'frown';
    
    toast.innerHTML = `
        <i data-lucide="${icon}" style="width: 20px; height: 20px;"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    if (typeof lucide !== 'undefined') {
        lucide.createIcons({ root: toast });
    }
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

window.toggleHeart = async function toggleHeart(e, btn, tourName) {
    e.preventDefault();
    e.stopPropagation();

    const userStr = localStorage.getItem('wayfare_user');
    if (!userStr) {
        window.location.href = '/login.html';
        return;
    }
    const user = JSON.parse(userStr);
    if (!user.id && window.supabaseClient) {
        const { data } = await window.supabaseClient.from('profiles').select('*').limit(1);
        if (data && data.length > 0) user.id = data[0].id;
    }

    const wasActive = btn.classList.contains('active');
    btn.classList.toggle('active');
    
    // Add pulse animation class
    btn.classList.add('animating');
    setTimeout(() => btn.classList.remove('animating'), 600);

    if (tourName) {
        if (!wasActive) {
            window.showToast(`Added ${tourName} to your Wishlist`, 'success');
            if (typeof window.addNavNotification === 'function') {
                window.addNavNotification(`${tourName} added to wishlist`, 'heart', '/dashboard.html?section=wishlist');
            }
        } else {
            window.showToast(`Removed ${tourName} from your Wishlist`, 'error');
            if (typeof window.addNavNotification === 'function') {
                window.addNavNotification(`${tourName} removed from wishlist`, 'heart', '/dashboard.html?section=wishlist');
            }
        }
    }

    // Sync with local storage for instant feedback
    let wishlist = [];
    try {
        wishlist = JSON.parse(localStorage.getItem('wayfare_wishlist')) || [];
    } catch (e) {}

    if (!wasActive) {
        if (!wishlist.includes(tourName)) {
            wishlist.push(tourName);
        }
    } else {
        wishlist = wishlist.filter(item => item !== tourName);
    }
    localStorage.setItem('wayfare_wishlist', JSON.stringify(wishlist));

    if (window.supabaseClient) {
        if (!wasActive) {
            // Try to find the package ID based on tour name to link it properly
            const { data: pkgData } = await window.supabaseClient.from('packages').select('id').eq('name', tourName).single();
            if (pkgData) {
                await window.supabaseClient.from('wishlist').insert({ user_id: user.id, package_id: pkgData.id });
            }
        } else {
            const { data: pkgData } = await window.supabaseClient.from('packages').select('id').eq('name', tourName).single();
            if (pkgData) {
                await window.supabaseClient.from('wishlist').delete().match({ user_id: user.id, package_id: pkgData.id });
            }
        }
    }
};

window.initWishlistState = async function initWishlistState() {
    try {
        const userStr = localStorage.getItem('wayfare_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        let wishlist = [];
        if (window.supabaseClient) {
            if (!user.id) {
                const { data: fallback } = await window.supabaseClient.from('profiles').select('*').limit(1);
                if (fallback && fallback.length > 0) user.id = fallback[0].id;
            }
            const { data } = await window.supabaseClient.from('wishlist').select('packages(name)').eq('user_id', user.id);
            if (data) {
                wishlist = data.map(w => w.packages?.name).filter(Boolean);
                localStorage.setItem('wayfare_wishlist', JSON.stringify(wishlist));
            }
        } else {
            wishlist = JSON.parse(localStorage.getItem('wayfare_wishlist')) || [];
        }

        const buttons = document.querySelectorAll('.wishlist-btn');
        buttons.forEach(btn => {
            const onclickStr = btn.getAttribute('onclick') || '';
            const match = onclickStr.match(/toggleHeart\(event, this, \'([^\']+)\'\)/);
            if (match && match[1]) {
                if (wishlist.includes(match[1])) {
                    btn.classList.add('active');
                }
            }
        });
    } catch(e) {}
};
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.initWishlistState === 'function') {
        window.initWishlistState();
    }
});

window.initTopLocations = async () => {
    const grid = document.getElementById('topLocationsGrid');
    if (!grid) return;
    
    let packages = [];
    if (window.supabaseClient) {
        try {
            const { data, error } = await window.supabaseClient.from('packages').select('*').limit(3);
            if (!error && data) packages = data;
        } catch(e) { console.error(e); }
    }
    if (packages.length === 0 && window.wayfarePackages) {
        packages = window.wayfarePackages.slice(0, 3);
    }
    
    if (packages.length > 0) {
        grid.innerHTML = packages.map(pkg => {
            const imageUrl = pkg.image_url || pkg.image || `https://picsum.photos/seed/wayfare-${pkg.id}/900/560`;
            return `
                <a href="/booking.html?packageId=${pkg.id}" data-no-swup class="tour-card animate-on-scroll" style="display: flex; flex-direction: column; height: 100%;">
                    <div class="tour-image">
                        <img alt="${pkg.name}" src="${imageUrl}">
                        <button class="wishlist-btn" onclick="window.toggleHeart(event, this, '${pkg.name}')"><i data-lucide="heart"></i></button>
                    </div>
                    <div class="tour-content" style="flex: 1; display: flex; flex-direction: column;">
                        <div class="tour-tags">
                            <span class="tag">${pkg.category || 'Tour'}</span>
                            <span class="tag">${pkg.destination}</span>
                        </div>
                        <h3 class="tour-title">${pkg.name}</h3>
                        <p class="tour-desc" style="flex: 1;">${(pkg.description || '').substring(0, 100)}...</p>
                        <div class="tour-meta" style="margin-top: 1rem;">
                            <span>${pkg.duration || 'N/A'} Days</span>
                            <span class="tour-price">From ₹${(pkg.price || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <span class="btn-see-more" style="margin-top: 1rem; display: inline-block;">See Details</span>
                    </div>
                </a>
            `;
        }).join('');
        if (typeof initScrollAnimations === 'function') initScrollAnimations();
        if (typeof window.initWishlistState === 'function') window.initWishlistState();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } else {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--color-secondary);">No locations available at the moment.</div>';
    }
};
