document.addEventListener('DOMContentLoaded', initBookingPage);

let selectedPackage = null;

async function initBookingPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const packageId = urlParams.get('packageId') || sessionStorage.getItem('wayfare_selected_package');
    
    if (!packageId) {
        document.getElementById('packageDetail').innerHTML = '<div class="detail-body"><p>No package selected. Please go back and select a package.</p></div>';
        return;
    }

    if (window.supabaseClient) {
        try {
            const { data, error } = await window.supabaseClient.from('packages').select('*').eq('id', packageId).single();
            if (data) selectedPackage = data;
        } catch (e) {
            console.error('Error fetching package:', e);
            if (window.wayfarePackages) selectedPackage = window.wayfarePackages.find(p => String(p.id) === String(packageId));
        }
    } else {
        if (window.wayfarePackages) selectedPackage = window.wayfarePackages.find(p => String(p.id) === String(packageId));
    }

    if (!selectedPackage) {
        document.getElementById('packageDetail').innerHTML = '<div class="detail-body"><p>Package not found.</p></div>';
        return;
    }

    sessionStorage.setItem('wayfare_selected_package', selectedPackage.id);
    document.getElementById('packageId').value = selectedPackage.id;
    
    // Auto-fill user if logged in
    try {
        const user = JSON.parse(localStorage.getItem('wayfare_user'));
        if (user) {
            document.getElementById('fullName').value = user.name || '';
            document.getElementById('emailAddress').value = user.email || '';
        }
    } catch(e) {}

    // Restrict date to future dates
    const dateInput = document.getElementById('travelDate');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];

    renderPackageDetail();
    updateBookingSummary();

    document.getElementById('travelersCount').addEventListener('input', updateBookingSummary);
    document.getElementById('tourBookingForm').addEventListener('submit', handleBookingSubmit);
}

function renderPackageDetail() {
    const detail = document.getElementById('packageDetail');
    const imageUrl = selectedPackage.image_url || selectedPackage.image || `https://picsum.photos/seed/wayfare-${selectedPackage.id}/900/560`;
    
    const itineraryItems = parseItinerary(selectedPackage.itinerary);
    let itineraryHtml = '';
    itineraryItems.forEach((item, index) => {
        itineraryHtml += `<li><strong>Day ${index + 1}</strong><span>${item}</span></li>`;
    });

    detail.innerHTML = `
        <div class="detail-hero">
            <img src="${imageUrl}" alt="${selectedPackage.name}" onerror="this.onerror=null;this.src='https://picsum.photos/seed/${selectedPackage.id}-detail/1100/620';">
        </div>
        <div class="detail-body">
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
                <span class="tag">${selectedPackage.category || 'Tour'}</span>
                <span class="tag">${selectedPackage.destination}</span>
            </div>
            <h1 class="detail-title">${selectedPackage.name}</h1>
            <p class="detail-desc">${selectedPackage.description}</p>
            <div class="detail-stats">
                <div class="detail-stat"><span>Duration</span><strong>${selectedPackage.duration} Days</strong></div>
                <div class="detail-stat"><span>Price per person</span><strong>₹${(selectedPackage.price || 0).toLocaleString('en-IN')}</strong></div>
                <div class="detail-stat"><span>Category</span><strong>${selectedPackage.category}</strong></div>
            </div>
            <h2 class="itinerary-title">Full Itinerary</h2>
            <ul class="detail-itinerary">${itineraryHtml}</ul>
        </div>
    `;
}

function parseItinerary(text) {
    if (!text) return ["Arrival and check-in", "Guided sightseeing", "Leisure and departure"];
    const cleaned = text.replace(/\s+/g, " ").trim();
    const parts = cleaned.split(/Day\s+\d+:\s*/i).filter(p => p.trim() !== '');
    return parts.length > 0 ? parts : [cleaned];
}

function updateBookingSummary() {
    const summary = document.getElementById('bookingSummary');
    if (!selectedPackage) return;

    const travelers = parseInt(document.getElementById('travelersCount').value) || 1;
    const price = selectedPackage.price || 0;
    const total = price * travelers;

    summary.innerHTML = `
        <div class="summary-row"><span>Package</span><strong>${selectedPackage.name}</strong></div>
        <div class="summary-row"><span>Price per traveler</span><strong>₹${price.toLocaleString('en-IN')}</strong></div>
        <div class="summary-row"><span>Travelers</span><strong>${travelers}</strong></div>
        <div class="summary-row summary-total"><span>Total</span><strong>₹${total.toLocaleString('en-IN')}</strong></div>
    `;
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('bookingSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Confirming...';

    const travelers = parseInt(document.getElementById('travelersCount').value) || 1;
    const price = selectedPackage.price || 0;
    const total = price * travelers;

    const payload = {
        package_id: selectedPackage.id,
        travel_date: document.getElementById('travelDate').value,
        travelers: travelers,
        status: 'pending',
        total_price: total,
        price_per_traveler: price,
        client_name: document.getElementById('fullName').value,
        client_email: document.getElementById('emailAddress').value
    };

    try {
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem('wayfare_user'));
            if (user && user.id) {
                payload.user_id = user.id; // Assign to user if logged in
            }
        } catch(e){}

        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient.from('bookings').insert([payload]);
            if (error) throw error;
        } else {
            throw new Error("Supabase client not initialized");
        }

        window.showToast("Booking recorded! Redirecting to payment...", "success");
        setTimeout(() => {
            const params = new URLSearchParams({
                amount: total,
                dest: selectedPackage.destination || '',
                name: selectedPackage.name || '',
                user: user ? '1' : '0'
            });
            window.location.href = `/payment.html?${params.toString()}`;
        }, 1500);

    } catch(err) {
        console.error('Booking failed:', err);
        window.showToast(err.message || 'Failed to confirm booking.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Booking';
    }
}
