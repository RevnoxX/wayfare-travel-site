
var allPackages = [];
var currentCategory = 'All';
var currentSearch = '';

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExplorePage);
} else {
    initExplorePage();
}

// Support Swup re-evaluating the script if we ever remove data-no-swup
if (typeof window !== 'undefined' && window.swup && window.swup.hooks) {
    window.swup.hooks.on('page:view', () => {
        if (window.location.pathname.includes('explore.html')) {
            initExplorePage();
        }
    });
}





async function initExplorePage() {
    const grid = document.getElementById('exploreGrid');
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><p>Loading packages...</p></div>';

    if (window.supabaseClient) {
        try {
            const { data, error } = await window.supabaseClient.from('packages').select('*').order('id', { ascending: true });
            if (error) throw error;
            allPackages = data || [];
        } catch (e) {
            console.error('Error fetching packages:', e);
            allPackages = window.wayfarePackages || []; // Fallback if exists
        }
    } else {
        allPackages = window.wayfarePackages || [];
    }

    // Extract categories
    const categories = new Set();
    allPackages.forEach(pkg => {
        if (pkg.category) categories.add(pkg.category);
    });
    
    const filterBar = document.getElementById('categoryFilters');
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-pill';
        btn.setAttribute('data-category', cat);
        btn.textContent = cat;
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = cat;
            renderPackages();
        });
        filterBar.appendChild(btn);
    });

    document.querySelector('.filter-pill[data-category="All"]').addEventListener('click', (e) => {
        document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = 'All';
        renderPackages();
    });

    const searchInput = document.getElementById('searchInput');
    
    // Check if there's a search param in URL
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
        currentSearch = q.toLowerCase();
        searchInput.value = q;
    }

    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderPackages();
    });

    renderPackages();
}

function renderPackages() {
    const grid = document.getElementById('exploreGrid');
    
    const filtered = allPackages.filter(pkg => {
        const matchCategory = currentCategory === 'All' || pkg.category === currentCategory;
        const matchSearch = currentSearch === '' || 
                            (pkg.name && pkg.name.toLowerCase().includes(currentSearch)) ||
                            (pkg.destination && pkg.destination.toLowerCase().includes(currentSearch)) ||
                            (pkg.description && pkg.description.toLowerCase().includes(currentSearch));
        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-secondary);"><p>No packages found matching your criteria.</p></div>';
        return;
    }

    let html = '';
    filtered.forEach(pkg => {
        html += buildCard(pkg);
    });
    grid.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof window.initWishlistState === 'function') window.initWishlistState();
}

function buildCard(pkg) {
    const imageUrl = pkg.image_url || pkg.image || `https://picsum.photos/seed/wayfare-${pkg.id}/900/560`;
    return `
        <a href="/booking.html?packageId=${pkg.id}" data-no-swup class="tour-card" style="display: flex; flex-direction: column; height: 100%;">
            <div class="tour-image">
                <img alt="${pkg.name}" src="${imageUrl}" loading="lazy">
                <button class="wishlist-btn" onclick="if(window.toggleHeart) window.toggleHeart(event, this, '${pkg.name}')"><i data-lucide="heart"></i></button>
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
                <span class="btn-see-more" style="margin-top: 1rem; display: inline-block;">See Details & Book</span>
            </div>
        </a>
    `;
}
