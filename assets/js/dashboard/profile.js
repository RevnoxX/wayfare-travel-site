function profileInit() {
    renderEditProfileCard();
}

function renderEditProfileCard() {
    const card = document.getElementById("profile-edit-card");

    let s = `<h3 class="card-title">Edit Profile</h3>`;
    s += `<div class="profile-avatar-big" id="profile-avatar-big">${window.currentUser.avatar}</div>`;
    s += `<label class="field-label" for="profile-name">Full Name</label>`;
    s += `<input type="text" class="field-input" id="profile-name" value="${window.currentUser.name || ''}" />`;
    s += `<label class="field-label" for="profile-email">Email</label>`;
    s += `<input type="text" class="field-input" id="profile-email" value="${window.currentUser.email || ''}" readonly />`;
    s += `<label class="field-label" for="profile-phone">Phone</label>`;
    s += `<input type="text" class="field-input" id="profile-phone" value="${window.currentUser.phone || ''}" />`;
    s += `<label class="field-label" for="profile-address">Address</label>`;
    s += `<input type="text" class="field-input" id="profile-address" value="${window.currentUser.address || ''}" />`;
    s += `<button class="btn-primary profile-save-btn" onclick="saveProfile()"><i data-lucide="save" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> Save Changes</button>`;

    card.innerHTML = s;
}

async function saveProfile() {
    const newName = document.getElementById("profile-name").value.trim();
    const newPhone = document.getElementById("profile-phone").value.trim();
    const newAddress = document.getElementById("profile-address").value.trim();

    if (newName === "") {
        showToast("Name cannot be empty.", "error");
        return;
    }

    if (window.supabaseClient) {
        const { error } = await window.supabaseClient.from('profiles').update({
            name: newName,
            phone: newPhone,
            address: newAddress
        }).eq('id', window.currentUser.id);
        
        if (error) {
            showToast("Failed to update profile", "error");
            return;
        }
    }

    window.currentUser.name = newName;
    window.currentUser.phone = newPhone;
    window.currentUser.address = newAddress;
    window.currentUser.avatar = buildInitials(newName);

    localStorage.setItem("wayfare_user", JSON.stringify(window.currentUser));

    document.getElementById("sidebar-user-name").textContent = window.currentUser.name;
    document.getElementById("sidebar-avatar").textContent = window.currentUser.avatar;
    document.getElementById("topbar-avatar").textContent = window.currentUser.avatar;
    
    let bigAvatar = document.getElementById("profile-avatar-big");
    if(bigAvatar) bigAvatar.textContent = window.currentUser.avatar;

    showToast("Profile updated.", "success");
}

function overviewInit() {
    let welcome = document.getElementById("overview-welcome");
    if(welcome) welcome.textContent = "Welcome back, " + (window.currentUser.name || 'User');

    let dateLine = document.getElementById("overview-date");
    if(dateLine) dateLine.textContent = "Today is " + formatLongDate(new Date());

    renderOverviewStats();
    renderOverviewUpcoming();
    renderOverviewActivity();
}

function renderOverviewStats() {
    let totalBookings = typeof bookings !== 'undefined' ? bookings.length : 0;
    let upcomingCount = 0;
    let now = new Date();
    
    if (typeof bookings !== 'undefined') {
        for (let b of bookings) {
            let travel = new Date(b.travelDate);
            if (b.status.toLowerCase() === "approved" && travel > now) {
                upcomingCount++;
            }
        }
    }

    let wishCount = typeof wishlistItems !== 'undefined' ? wishlistItems.length : 0;
    let reviewCount = typeof reviews !== 'undefined' ? reviews.length : 0;

    let html = buildStatCard("Total Bookings", totalBookings) +
               buildStatCard("Upcoming Trips", upcomingCount) +
               buildStatCard("Wishlist Items", wishCount) +
               buildStatCard("Reviews Given", reviewCount);

    let row = document.getElementById("overview-stats");
    if(row) row.innerHTML = html;
}

function buildStatCard(label, value) {
    return `<div class="card stat-card"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div>`;
}

function renderOverviewUpcoming() {
    let best = null;
    let now = new Date();
    if (typeof bookings !== 'undefined') {
        for (let b of bookings) {
            let travel = new Date(b.travelDate);
            if (b.status.toLowerCase() !== "approved" || travel <= now) continue;
            if (best === null || travel < new Date(best.travelDate)) {
                best = b;
            }
        }
    }

    let box = document.getElementById("overview-upcoming");
    if(!box) return;

    if (best === null) {
        box.innerHTML = '<h3 class="card-title">Next Trip</h3><p class="muted">You have no upcoming trips. Time to plan one!</p>';
        return;
    }

    let html = `<h3 class="card-title">Next Trip</h3>`;
    html += `<h4 class="upcoming-name">${best.packageName}</h4>`;
    html += `<p class="muted">${best.destination}</p>`;
    html += `<div class="upcoming-meta"><span>${formatLongDate(new Date(best.travelDate))}</span><span>${best.travelers} travelers</span></div>`;
    html += `<span class="badge badge-approved">Approved</span>`;
    html += `<div class="upcoming-actions"><button class="btn-primary" onclick="showSection('bookings')"><i data-lucide="eye" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> View Details</button></div>`;
    box.innerHTML = html;
}

function renderOverviewActivity() {
    let items = [];
    if (typeof bookings !== 'undefined') {
        for (let i = 0; i < bookings.length && i < 3; i++) {
            items.push({ text: `You booked ${bookings[i].packageName}`, time: bookings[i].bookedOn });
        }
    }
    if (typeof reviews !== 'undefined') {
        for (let j = 0; j < reviews.length && j < 2; j++) {
            items.push({ text: `You reviewed ${reviews[j].packageName}`, time: reviews[j].date });
        }
    }
    if (typeof enquiries !== 'undefined') {
        for (let k = 0; k < enquiries.length && k < 2; k++) {
            items.push({ text: `You sent an enquiry: ${enquiries[k].subject}`, time: enquiries[k].date });
        }
    }

    let list = document.getElementById("overview-activity");
    if(!list) return;

    if (items.length === 0) {
        list.innerHTML = '<li class="muted">No recent activity.</li>';
        return;
    }

    let html = "";
    for (let i = 0; i < Math.min(items.length, 5); i++) {
        html += `<li class="activity-item"><span class="activity-dot"></span><div class="activity-text"><span>${items[i].text}</span><span class="activity-time">${items[i].time}</span></div></li>`;
    }
    list.innerHTML = html;
}

window.overviewInit = overviewInit;
window.profileInit = profileInit;
window.saveProfile = saveProfile;

