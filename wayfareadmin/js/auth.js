// ── Auth — WayFare Admin ──────────────────────────────────────────────────────

function checkAdminSession() {
  try {
    var userStr = localStorage.getItem('wayfare_user');
    if (!userStr) throw new Error('Not logged in');
    var user = JSON.parse(userStr);
    if (user.role !== 'admin') throw new Error('Not an admin');
  } catch (e) {
    window.location.replace('/login.html?admin_flow=true');
  }
}

checkAdminSession();

function logoutAdmin() {
  localStorage.removeItem('wayfare_user');
  if (typeof showToast === 'function') {
    showToast('Logged out successfully', 'success');
  }
  setTimeout(function() {
    window.location.replace('/login.html?admin_flow=true');
  }, 1000);
}

window.checkAdminSession = checkAdminSession;
window.logoutAdmin = logoutAdmin;

window.logoutAdmin = logoutAdmin;