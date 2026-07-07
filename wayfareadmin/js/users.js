
// ── Users — WayFare Admin ─────────────────────────────────────────────────────

var usersData = [];

async function initUsers() {
  if (!window.supabaseClient) {
    showToast('Database connection missing. Check settings.', 'error');
    renderUsersTable(usersData);
    return;
  }
  try {
    const { data, error } = await window.supabaseClient.from('profiles').select('*');
    if (error) {
      console.error(error);
      showToast('Failed to fetch users.', 'error');
      return;
    }
    
    // Also fetch booking counts for each user
    const { data: bookingsData, error: bookingsErr } = await window.supabaseClient.from('bookings').select('user_id');
    if (bookingsErr) throw bookingsErr;

    const bookingCounts = {};
    if (bookingsData) {
      bookingsData.forEach(b => {
        bookingCounts[b.user_id] = (bookingCounts[b.user_id] || 0) + 1;
      });
    }

    if (data) {
      usersData = data.map(user => ({
        id: user.id,
        name: user.name || 'Unknown',
        email: user.id + '@placeholder.com', // Profiles table doesn't have email in the schema
        phone: user.phone || '',
        joined: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : 'N/A',
        bookings: bookingCounts[user.id] || 0,
        status: 'Active'
      }));
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to fetch users.', 'error');
  }
  renderUsersTable(usersData);
}

function renderUsersTable(list) {
  var tbody = document.getElementById('usersTbody');
  tbody.innerHTML = '';

  for (var i = 0; i < list.length; i++) {
    var user = list[i];
    var tr = buildUserRow(user, i);
    tbody.appendChild(tr);
  }
}

function buildUserRow(user, index) {
  var tr = document.createElement('tr');

  var tdAvatar = document.createElement('td');
  var avatarEl = document.createElement('div');
  if (index % 2 === 0) {
    avatarEl.className = 'user-avatar';
  } else {
    avatarEl.className = 'user-avatar alt';
  }
  avatarEl.textContent = getInitials(user.name);
  tdAvatar.appendChild(avatarEl);

  var tdName = document.createElement('td');
  tdName.textContent = user.name;

  var tdEmail = document.createElement('td');
  tdEmail.textContent = user.phone; // Using phone since email is not in the schema provided

  var tdJoined = document.createElement('td');
  tdJoined.textContent = user.joined;

  var tdBookings = document.createElement('td');
  tdBookings.textContent = user.bookings;

  var tdStatus = document.createElement('td');
  var badge = document.createElement('span');
  if (user.status === 'Active') {
    badge.className = 'badge badge-active';
  } else {
    badge.className = 'badge badge-inactive';
  }
  badge.textContent = user.status;
  tdStatus.appendChild(badge);

  tr.appendChild(tdAvatar);
  tr.appendChild(tdName);
  tr.appendChild(tdEmail);
  tr.appendChild(tdJoined);
  tr.appendChild(tdBookings);
  tr.appendChild(tdStatus);

  return tr;
}

function filterUsers() {
  var searchValue = document.getElementById('userSearch').value.trim().toLowerCase();

  if (searchValue === '') {
    renderUsersTable(usersData);
    return;
  }

  var filtered = [];
  for (var i = 0; i < usersData.length; i++) {
    var user = usersData[i];
    var lowerName  = user.name.toLowerCase();
    var lowerPhone = user.phone.toLowerCase();

    if (lowerName.indexOf(searchValue) !== -1 || lowerPhone.indexOf(searchValue) !== -1) {
      filtered.push(user);
    }
  }

  renderUsersTable(filtered);
}

function getInitials(name) {
  var parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0].charAt(0) + parts[1].charAt(0);
  }
  return parts[0].charAt(0) || 'U';
}

window.initUsers = initUsers;
window.filterUsers = filterUsers;

