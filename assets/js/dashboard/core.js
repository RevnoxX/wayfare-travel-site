window.currentUser = null;
window.initializedSections = {};

function showToast(message, type = "success") {
    var container = document.getElementById("toast-container");
    if (!container) return;
    var toast = document.createElement("div");
    toast.className = "toast " + (type === "error" ? "toast-error" : "toast-success");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(function () {
        toast.classList.remove("show");
        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

function showSection(name) {
    var sections = document.querySelectorAll(".section");
    sections.forEach(s => s.classList.remove("active"));
    var target = document.getElementById("section-" + name);
    if (target) target.classList.add("active");

    var navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        if (link.getAttribute("data-section") === name) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    var title = document.getElementById("topbar-title");
    if(title) title.textContent = prettyTitle(name);

    var initName = name + "Init";
    if (!initializedSections[name]) {
        if (typeof window[initName] === "function") {
            window[initName]();
        }
        initializedSections[name] = true;
    }
}

function prettyTitle(name) {
    const titles = {
        overview: "Overview",
        bookings: "My Bookings",
        wishlist: "Wishlist",
        reviews: "Reviews",
        notifications: "Notifications",
        enquiries: "My Enquiries",
        profile: "Profile"
    };
    return titles[name] || "Dashboard";
}

function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme");
    var next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("wayfare_theme", next);
    updateThemeLabel();
}

function updateThemeLabel() {
    var current = document.documentElement.getAttribute("data-theme");
    var label = document.getElementById("theme-toggle-label");
    if(label) label.textContent = current === "dark" ? "Light Mode" : "Dark Mode";
}

function logoutUser() {
    localStorage.removeItem("wayfare_user");
    showToast("Logged out successfully.", "success");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}

function buildInitials(fullName) {
    if(!fullName) return "?";
    var parts = fullName.trim().split(" ");
    var initials = parts[0].charAt(0);
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0);
    }
    return initials.toUpperCase();
}

async function startApp() {
    updateThemeLabel();
    
    // Check auth
    const userStr = localStorage.getItem('wayfare_user');
    if (!userStr) {
        window.location.replace('login.html');
        return;
    }
    
    window.currentUser = JSON.parse(userStr);
    
    // Check if valid session via supabase (optional but good practice)
    if(window.supabaseClient) {
        if (!window.currentUser.id) {
            const { data: firstProfile } = await window.supabaseClient.from('profiles').select('*').limit(1);
            if (firstProfile && firstProfile.length > 0) {
                window.currentUser.id = firstProfile[0].id;
                window.currentUser.name = firstProfile[0].name;
            }
        }
        
        if (window.currentUser.id) {
            const { data } = await window.supabaseClient.from('profiles').select('*').eq('id', window.currentUser.id).single();
            if(data) {
                window.currentUser = { ...window.currentUser, ...data };
                localStorage.setItem('wayfare_user', JSON.stringify(window.currentUser));
            }
        }
    }
    
    window.currentUser.avatar = buildInitials(window.currentUser.name);
    
    document.getElementById("sidebar-user-name").textContent = window.currentUser.name || 'User';
    document.getElementById("sidebar-user-email").textContent = window.currentUser.email || '';
    document.getElementById("sidebar-avatar").textContent = window.currentUser.avatar;
    document.getElementById("topbar-avatar").textContent = window.currentUser.avatar;

    if(typeof window.updateNotificationBadges === "function") window.updateNotificationBadges();
    
    // Preload data for overview
    if (typeof window.bookingsInit === "function") await window.bookingsInit();
    if (typeof window.wishlistInit === "function") await window.wishlistInit();
    if (typeof window.reviewsInit === "function") await window.reviewsInit();
    if (typeof window.enquiriesInit === "function") await window.enquiriesInit();
    
    const urlParams = new URLSearchParams(window.location.search);
    const targetSection = urlParams.get('section');
    if (targetSection) {
        showSection(targetSection);
    } else {
        showSection('overview');
    }
    
}

function formatLongDate(dateObj) {
    if(!dateObj) return "";
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return dateObj.getDate() + " " + months[dateObj.getMonth()] + " " + dateObj.getFullYear();
}

window.addEventListener("load", startApp);

window.showToast = showToast;
window.showSection = showSection;
window.prettyTitle = prettyTitle;
window.updateThemeLabel = updateThemeLabel;
window.toggleTheme = toggleTheme;
window.logoutUser = logoutUser;
window.buildInitials = buildInitials;
window.startApp = startApp;
window.formatLongDate = formatLongDate;