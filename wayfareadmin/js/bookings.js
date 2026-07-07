
// ── Bookings — WayFare Admin ──────────────────────────────────────────────────

var bookingsData = [];

async function initBookings() {
  if (!window.supabaseClient) {
    showToast('Database connection missing. Check settings.', 'error');
    renderBookingsTable(bookingsData);
    return;
  }
  try {
    const { data, error } = await window.supabaseClient
      .from('bookings')
      .select('*, profiles(name), packages(name)');
    
    if (error) {
      console.error(error);
      showToast('Failed to fetch bookings.', 'error');
      return;
    }

    if (data) {
      bookingsData = data.map(b => ({
        id: b.id,
        user: b.client_name || (b.profiles ? b.profiles.name : 'Unknown User'),
        package: b.package_name || (b.packages ? b.packages.name : 'Unknown Package'),
        date: b.travel_date,
        travelers: b.travelers,
        status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase()) : 'Pending'
      }));
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to fetch bookings.', 'error');
  }
  renderBookingsTable(bookingsData);
}

function renderBookingsTable(list) {
  var tbody = document.getElementById('bookingsTbody');
  tbody.innerHTML = '';

  for (var i = 0; i < list.length; i++) {
    var booking = list[i];
    var tr = buildBookingRow(booking);
    tbody.appendChild(tr);
  }
}

function buildBookingRow(booking) {
  var tr = document.createElement('tr');

  if (booking.status === 'Cancelled') {
    tr.className = 'row-cancelled';
  }

  var tdId = document.createElement('td');
  tdId.textContent = booking.id;

  var tdUser = document.createElement('td');
  tdUser.textContent = booking.user;

  var tdPkg = document.createElement('td');
  tdPkg.textContent = booking.package;

  var tdDate = document.createElement('td');
  tdDate.textContent = booking.date;

  var tdTravelers = document.createElement('td');
  tdTravelers.textContent = booking.travelers;

  var tdStatus = document.createElement('td');
  var badge = document.createElement('span');
  badge.className = 'badge ' + getBookingBadgeClass(booking.status);
  badge.textContent = booking.status;
  tdStatus.appendChild(badge);

  var tdActions = document.createElement('td');
  var actionWrap = document.createElement('div');
  actionWrap.className = 'table-actions';

  if (booking.status === 'Pending') {
    var approveBtn = document.createElement('button');
    approveBtn.className = 'btn-approve';
    approveBtn.textContent = 'Approve';
    approveBtn.setAttribute('data-id', booking.id);
    approveBtn.onclick = function() {
      updateBookingStatus(this.getAttribute('data-id'), 'Approved');
    };

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.setAttribute('data-id', booking.id);
    cancelBtn.onclick = function() {
      updateBookingStatus(this.getAttribute('data-id'), 'Cancelled');
    };

    actionWrap.appendChild(approveBtn);
    actionWrap.appendChild(cancelBtn);
  } else if (booking.status === 'Approved') {
    var cancelBtn2 = document.createElement('button');
    cancelBtn2.className = 'btn-cancel';
    cancelBtn2.textContent = 'Cancel';
    cancelBtn2.setAttribute('data-id', booking.id);
    cancelBtn2.onclick = function() {
      updateBookingStatus(this.getAttribute('data-id'), 'Cancelled');
    };

    actionWrap.appendChild(cancelBtn2);
  }

  tdActions.appendChild(actionWrap);

  tr.appendChild(tdId);
  tr.appendChild(tdUser);
  tr.appendChild(tdPkg);
  tr.appendChild(tdDate);
  tr.appendChild(tdTravelers);
  tr.appendChild(tdStatus);
  tr.appendChild(tdActions);

  return tr;
}

async function updateBookingStatus(bookingId, newStatus) {
  if (window.supabaseClient) {
    const { error } = await window.supabaseClient
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);
      
    if (error) {
      console.error(error);
      showToast('Error updating booking.', 'error');
      return;
    }
  }
  
  for (var i = 0; i < bookingsData.length; i++) {
    if (bookingsData[i].id == bookingId) {
      bookingsData[i].status = newStatus;
      break;
    }
  }

  showToast('Booking ' + bookingId + ' marked as ' + newStatus + '.', 'success');
  filterBookings();
}

function filterBookings() {
  var statusFilter = document.getElementById('bookingStatusFilter').value;
  var searchValue  = document.getElementById('bookingSearch').value.trim().toLowerCase();

  var filtered = [];

  for (var i = 0; i < bookingsData.length; i++) {
    var booking = bookingsData[i];
    var statusMatch = true;
    if (statusFilter !== 'all' && statusFilter !== 'All Status') {
      statusMatch = booking.status.toLowerCase() === statusFilter.toLowerCase();
    }

    var searchMatch = true;
    if (searchValue !== '') {
      var lowerName = booking.user.toLowerCase();
      searchMatch = lowerName.indexOf(searchValue) !== -1;
    }

    if (statusMatch && searchMatch) {
      filtered.push(booking);
    }
  }

  renderBookingsTable(filtered);
}

function getBookingBadgeClass(status) {
  if (status.toLowerCase() === 'approved') return 'badge-approved';
  if (status.toLowerCase() === 'pending') return 'badge-pending';
  if (status.toLowerCase() === 'cancelled') return 'badge-cancelled';
  return 'badge-pending';
}

window.initBookings = initBookings;

window.updateBookingStatus = updateBookingStatus;
window.filterBookings = filterBookings;