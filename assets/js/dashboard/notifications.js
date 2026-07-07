let notifications = [];

async function notificationsInit() {
    if (!window.supabaseClient) { renderNotifications(); return; }
    
    try {
        const { data, error } = await window.supabaseClient
            .from('notifications')
            .select('*')
            .eq('user_id', window.currentUser.id)
            .order('created_at', { ascending: false });
            
        if (error) {
            // Table might not exist, ignore
        } else if (data) {
            notifications = data.map(n => ({
                id: n.id,
                message: n.message,
                time: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Unknown',
                read: n.is_read || n.read || false
            }));
        }
    } catch (err) {
        console.error(err);
    }
    renderNotifications();
}

function renderNotifications() {
    const list = document.getElementById("notifications-list");
    if (notifications.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128276;</div><p>You have no notifications.</p></div>';
    } else {
        let html = "";
        for (let i = 0; i < notifications.length; i++) {
            html += buildNotificationRow(notifications[i], i);
        }
        list.innerHTML = html;
    }
    updateNotifCountLabel();
    updateNotificationBadges();
}

function buildNotificationRow(notification, index) {
    let rowClass = "notif-item" + (notification.read ? "" : " unread");
    let dotClass = "notif-dot" + (notification.read ? "" : " unread");

    let s = `<div class="${rowClass}">`;
    s += `<span class="${dotClass}"></span>`;
    s += `<div class="notif-body"><p class="notif-msg">${notification.message}</p><span class="notif-time">${notification.time}</span></div>`;
    
    if (!notification.read) {
        s += `<button class="btn-outline notif-mark-btn" onclick="markNotificationRead(${index})"><i data-lucide="check" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> Mark as Read</button>`;
    }
    s += `</div>`;
    return s;
}

async function markNotificationRead(index) {
    if (window.supabaseClient) {
        let n = notifications[index];
        await window.supabaseClient.from('notifications').update({ is_read: true, read: true }).eq('id', n.id);
    }
    notifications[index].read = true;
    renderNotifications();
}

async function markAllNotificationsRead() {
    if (window.supabaseClient) {
        await window.supabaseClient.from('notifications').update({ is_read: true, read: true }).eq('user_id', window.currentUser.id).eq('is_read', false);
    }
    for (let n of notifications) n.read = true;
    renderNotifications();
    showToast("All notifications marked as read.", "success");
}

function countUnreadNotifications() {
    return notifications.filter(n => !n.read).length;
}

function updateNotifCountLabel() {
    let count = countUnreadNotifications();
    let label = document.getElementById("notif-count-label");
    if (label) label.textContent = count + " unread";
}

function updateNotificationBadges() {
    let count = countUnreadNotifications();
    let navBadge = document.getElementById("nav-notif-badge");
    if (navBadge) {
        navBadge.textContent = count;
        if (count === 0) navBadge.classList.add("empty");
        else navBadge.classList.remove("empty");
    }

    let bellBadge = document.getElementById("topbar-bell-count");
    if (bellBadge) {
        bellBadge.textContent = count;
        if (count === 0) bellBadge.classList.add("empty");
        else bellBadge.classList.remove("empty");
    }
}

window.notificationsInit = notificationsInit;
window.markAllNotificationsRead = markAllNotificationsRead;
window.renderNotifications = renderNotifications;
window.updateNotificationBadges = updateNotificationBadges;
