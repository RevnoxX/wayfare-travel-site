let wishlistItems = [];

async function wishlistInit() {
    if (!window.supabaseClient) { renderWishlist(); return; }
    
    try {
        const { data, error } = await window.supabaseClient
            .from('wishlist')
            .select('*, packages(*)')
            .eq('user_id', window.currentUser.id);
            
        if (error) {
            // Table might not exist, ignore
        } else if (data) {
            wishlistItems = data.map(item => ({
                id: item.id,
                name: item.packages?.name || 'Unknown',
                destination: item.packages?.destination || 'Unknown',
                duration: item.packages?.duration ? item.packages.duration + ' days' : 'Unknown',
                price: item.packages?.price || 0,
                category: "Standard",
                imageUrl: item.packages?.image_url || 'https://picsum.photos/400/240'
            }));
        }
    } catch (err) {
        console.error(err);
    }
    renderWishlist();
}

function renderWishlist() {
    const grid = document.getElementById("wishlist-grid");

    if (wishlistItems.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9825;</div><p>No saved packages yet. Explore tours to add some.</p></div>';
        return;
    }

    let html = "";
    for (let i = 0; i < wishlistItems.length; i++) {
        html += buildWishCard(wishlistItems[i], i);
    }
    grid.innerHTML = html;
}

function buildWishCard(item, index) {
    let s = `<div class="wish-card">`;
    s += `<img class="wish-img" src="${item.imageUrl}" alt="${item.name}" />`;
    s += `<div class="wish-body">`;
    s += `<span class="tag">${item.category}</span>`;
    s += `<h3 class="wish-name">${item.name}</h3>`;
    s += `<p class="wish-dest">${item.destination}</p>`;
    s += `<div class="wish-meta"><span>${item.duration}</span><span class="wish-price">${formatWishPrice(item.price)}</span></div>`;
    s += `<div class="wish-actions">`;
    s += `<button class="btn-primary" onclick="bookFromWishlist(${index})"><i data-lucide="shopping-bag" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> Book Now</button>`;
    s += `<button class="btn-outline" onclick="removeFromWishlist(${index})"><i data-lucide="trash-2" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> Remove</button>`;
    s += `</div></div></div>`;
    return s;
}

function bookFromWishlist(index) {
    showToast("Redirecting to booking...", "success");
}

async function removeFromWishlist(index) {
    let item = wishlistItems[index];
    if (window.supabaseClient) {
        const { error } = await window.supabaseClient.from('wishlist').delete().eq('id', item.id);
        if (error) {
            showToast("Failed to remove item.", "error");
            return;
        }
    }
    
    wishlistItems.splice(index, 1);
    renderWishlist();
    showToast("Removed from wishlist.", "success");
}

function formatWishPrice(amount) {
    return "Rs " + Number(amount).toLocaleString("en-IN");
}

window.wishlistInit = wishlistInit;
window.removeFromWishlist = removeFromWishlist;
window.renderWishlist = renderWishlist;
