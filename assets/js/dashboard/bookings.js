let bookings = [];
let activeBookingFilter = "all";
let pendingCancelId = null;

async function bookingsInit() {
    if (!window.supabaseClient) { showToast("Database connection missing.", "error"); return; }
    
    try {
        const { data, error } = await window.supabaseClient
            .from('bookings')
            .select('*, packages(name, destination)')
            .eq('user_id', window.currentUser.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (data) {
            bookings = data.map(b => ({
                id: b.id, package_id: b.package_id,
                packageName: b.packages ? b.packages.name : 'Unknown',
                destination: b.packages ? b.packages.destination : 'Unknown',
                travelDate: b.travel_date,
                travelers: b.travelers,
                amount: b.amount,
                status: b.status || 'pending',
                paymentStatus: b.payment_status || 'Awaiting confirmation',
                confirmationNo: b.confirmation_no || '—',
                bookedOn: b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Unknown',
                itinerary: [] // Normally fetched from packages, using empty array here
            }));
        }
    } catch (err) {
        console.error(err);
        showToast("Failed to fetch bookings.", "error");
    }
    
    renderBookings();
    attachCancelModalListeners();
}

function filterBookings(filterName) {
    activeBookingFilter = filterName;
    updateBookingPills();
    renderBookings();
}

function updateBookingPills() {
    const pills = document.querySelectorAll("#bookings-filter .pill");
    pills.forEach(pill => {
        if (pill.getAttribute("data-filter") === activeBookingFilter) {
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });
}

function renderBookings() {
    const list = document.getElementById("bookings-list");
    let html = "";
    let shown = 0;

    for (let i = 0; i < bookings.length; i++) {
        let b = bookings[i];
        if (activeBookingFilter !== "all" && b.status.toLowerCase() !== activeBookingFilter) {
            continue;
        }
        html += buildBookingCard(b, i);
        shown++;
    }

    if (shown === 0) {
        html = '<div class="empty-state"><div class="empty-icon">&#9992;</div><p>No bookings in this category.</p></div>';
    }

    list.innerHTML = html;
}

function buildBookingCard(booking, index) {
    let badgeClass = "badge-" + booking.status.toLowerCase();
    let statusWord = capitalise(booking.status);
    let cardClass = "booking-card" + (booking.status.toLowerCase() === "cancelled" ? " cancelled" : "");

    let s = `<div class="${cardClass}" id="booking-card-${index}">`;
    s += `<div class="booking-head" onclick="toggleBookingDetail(${index})">`;
    s += `<div><h3 class="booking-name">${booking.packageName}</h3><p class="booking-dest">${booking.destination}</p></div>`;
    s += `<span class="badge ${badgeClass}">${statusWord}</span></div>`;
    
    s += `<div class="booking-meta">`;
    s += buildMetaItem("Travel Date", formatBookingDate(booking.travelDate));
    s += buildMetaItem("Travelers", booking.travelers + " people");
    s += buildMetaItem("Booking ID", booking.id);
    s += buildMetaItem("Amount Paid", formatMoney(booking.amount));
    s += `</div>`;
    
    s += buildBookingActions(booking, index);
    s += buildBookingDetail(booking);
    s += `</div>`;
    return s;
}

function buildMetaItem(label, value) {
    return `<div class="booking-meta-item"><span class="booking-meta-label">${label}</span><span class="booking-meta-value">${value}</span></div>`;
}

function buildBookingActions(booking, index) {
    if (booking.status.toLowerCase() === "cancelled") return "";
    let s = `<div class="booking-actions">`;
    if (booking.status.toLowerCase() === "pending") {
        s += `<button class="btn-outline" onclick="requestCancelBooking(${index})"><i data-lucide="x-circle" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> Cancel Booking</button>`;
    }
    if (booking.status.toLowerCase() === "approved") {
        s += `<button class="btn-primary" id="download-btn-${index}" onclick="downloadConfirmation(${index})"><i data-lucide="download" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> Download Confirmation</button>`;
    }
    s += `</div>`;
    return s;
}

function buildBookingDetail(booking) {
    let s = `<div class="booking-detail" id="booking-detail-${booking.id}">`;
    s += `<h4 class="card-title">Itinerary</h4><ul class="itinerary-list">`;
    for (let step of booking.itinerary) {
        s += `<li class="itinerary-item"><span class="itinerary-day">${step.day}</span><span>${step.text}</span></li>`;
    }
    s += `</ul>`;
    s += `<div class="detail-row"><span>Payment Status</span><span>${booking.paymentStatus}</span></div>`;
    s += `<div class="detail-row"><span>Confirmation Number</span><span>${booking.confirmationNo}</span></div>`;
    s += `</div>`;
    return s;
}

function toggleBookingDetail(index) {
    let booking = bookings[index];
    let detail = document.getElementById("booking-detail-" + booking.id);
    if (!detail) return;
    detail.classList.toggle("open");
}

function attachCancelModalListeners() {
    document.getElementById("cancel-confirm-btn").addEventListener("click", confirmCancelBooking);
    document.getElementById("cancel-modal-close").addEventListener("click", hideCancelModal);
    document.getElementById("cancel-dismiss-btn").addEventListener("click", hideCancelModal);
    document.getElementById("cancel-modal").addEventListener("click", function(e) {
        if (e.target === this) hideCancelModal();
    });
}

function requestCancelBooking(index) {
    let booking = bookings[index];
    pendingCancelId = booking.id;
    document.getElementById("cancel-modal-msg").textContent = `Are you sure you want to cancel booking ${booking.id} for ${booking.packageName}?`;
    document.getElementById("cancel-modal").style.display = "flex";
}

function hideCancelModal() {
    document.getElementById("cancel-modal").style.display = "none";
    pendingCancelId = null;
}

async function confirmCancelBooking() {
    if (pendingCancelId === null) return;
    
    if (window.supabaseClient) {
        const { error } = await window.supabaseClient.from('bookings').update({ status: 'cancelled' }).eq('id', pendingCancelId);
        if (error) {
            showToast("Failed to cancel booking.", "error");
            return;
        }
    }
    
    let index = bookings.findIndex(b => b.id === pendingCancelId);
    if (index !== -1) {
        bookings[index].status = "cancelled";
        bookings[index].paymentStatus = "Refunded";
        bookings[index].confirmationNo = "—";
    }
    
    let id = pendingCancelId;
    hideCancelModal();
    renderBookings();
    showToast(`Booking ${id} has been cancelled.`, "success");
}

function downloadConfirmation(index) {
    let booking = bookings[index];
    let btn = document.getElementById("download-btn-" + index);
    btn.textContent = "Generating...";
    btn.disabled = true;
    setTimeout(() => {
        let text = `------------------------------------------\nWAYFARE BOOKING CONFIRMATION\n------------------------------------------\nBooking ID    : ${booking.id}\nPackage       : ${booking.packageName}\nDestination   : ${booking.destination}\nTravel Date   : ${formatBookingDate(booking.travelDate)}\nTravelers     : ${booking.travelers}\nAmount Paid   : ${formatMoney(booking.amount)}\nStatus        : CONFIRMED\n------------------------------------------\nThis is your official booking confirmation.\nThank you for travelling with WayFare.\n------------------------------------------\n`;
        let blob = new Blob([text], { type: "text/plain" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = `WayFare-Confirmation-${booking.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        btn.textContent = "Download Confirmation";
        btn.disabled = false;
        showToast("Confirmation downloaded.", "success");
    }, 1500);
}

function capitalise(word) {
    if(!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatMoney(amount) {
    if(!amount) return "Rs 0";
    return "Rs " + Number(amount).toLocaleString("en-IN");
}

function formatBookingDate(dateString) {
    if(!dateString) return "Unknown";
    const d = new Date(dateString);
    if(isNaN(d)) return dateString;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

window.bookingsInit = bookingsInit;
window.requestCancelBooking = requestCancelBooking;
window.hideCancelModal = hideCancelModal;
window.confirmCancelBooking = confirmCancelBooking;
window.filterBookings = filterBookings;
window.renderBookings = renderBookings;
