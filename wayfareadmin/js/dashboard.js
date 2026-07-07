
// ── Dashboard — WayFare Admin ─────────────────────────────────────────────────

var dashboardRecentBookings = [];
var dashboardPopularity = [];
var dashboardStats = { totalBookings: 0, pendingApprovals: 0, totalPackages: 0, registeredUsers: 0 };

async function initDashboard() {
  if (!window.supabaseClient) {
    showToast('Database connection missing. Check settings.', 'error');
    renderStatCards();
    renderRecentBookings();
    renderPopularityList();
    return;
  }
  
  try {
    // Recent bookings (last 5)
    const { data: bookingsData, error: bookingsErr } = await window.supabaseClient
      .from('bookings')
      .select('*, profiles(name), packages(name)')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (bookingsErr) throw bookingsErr;

    if (bookingsData) {
      dashboardRecentBookings = bookingsData.map(b => ({
        id: b.id,
        user: b.profiles ? b.profiles.name : 'Unknown',
        package: b.packages ? b.packages.name : 'Unknown',
        date: b.travel_date,
        status: b.status || 'Pending'
      }));
    }

    // Popularity (bookings per package)
    const { data: allBookings, error: allBookingsErr } = await window.supabaseClient.from('bookings').select('*, packages(name)');
    if (allBookingsErr) throw allBookingsErr;
    
    const { data: allPackages, error: allPackagesErr } = await window.supabaseClient.from('packages').select('name');
    if (allPackagesErr) throw allPackagesErr;

    const packageCounts = {};
    if (allPackages) {
      allPackages.forEach(p => {
        packageCounts[p.name] = 0;
      });
    }

    if (allBookings) {
      allBookings.forEach(b => {
        if(b.packages && b.packages.name) {
            const name = b.packages.name;
            packageCounts[name] = (packageCounts[name] || 0) + 1;
        }
      });
      dashboardStats.totalBookings = allBookings.length;
      dashboardStats.pendingApprovals = allBookings.filter(b => b.status === 'Pending').length;
    }
    
    dashboardPopularity = Object.keys(packageCounts)
      .map(key => ({ name: key, count: packageCounts[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    

    const { count: pkgCount, error: pkgErr } = await window.supabaseClient.from('packages').select('*', { count: 'exact', head: true });
    if (pkgErr) throw pkgErr;
    if(pkgCount !== null) dashboardStats.totalPackages = pkgCount;

    const { count: userCount, error: userErr } = await window.supabaseClient.from('profiles').select('*', { count: 'exact', head: true });
    if (userErr) throw userErr;
    if(userCount !== null) dashboardStats.registeredUsers = userCount;
  } catch (err) {
    console.error(err);
    showToast('Failed to fetch dashboard data.', 'error');
  }

  renderStatCards();
  renderRecentBookings();
  renderPopularityList();
}

function renderStatCards() {
  var container = document.getElementById('dashboardStats');
  container.innerHTML = '';

  var cards = [
    { label: 'Total Bookings',    value: dashboardStats.totalBookings,    sub: 'All time'        },
    { label: 'Pending Approvals', value: dashboardStats.pendingApprovals, sub: 'Awaiting review' },
    { label: 'Total Packages',    value: dashboardStats.totalPackages,    sub: 'Active listings' },
    { label: 'Registered Users',  value: dashboardStats.registeredUsers,  sub: 'Across all plans' }
  ];

  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    var card = document.createElement('div');
    card.className = 'stat-card';

    var label = document.createElement('span');
    label.className = 'stat-label';
    label.textContent = c.label;

    var value = document.createElement('span');
    value.className = 'stat-value';
    value.textContent = c.value;

    var sub = document.createElement('span');
    sub.className = 'stat-sub';
    sub.textContent = c.sub;

    card.appendChild(label);
    card.appendChild(value);
    card.appendChild(sub);
    container.appendChild(card);
  }
}

function renderRecentBookings() {
  var tbody = document.getElementById('recentBookingsTbody');
  tbody.innerHTML = '';

  for (var i = 0; i < dashboardRecentBookings.length; i++) {
    var booking = dashboardRecentBookings[i];
    var tr = document.createElement('tr');

    var tdId = document.createElement('td');
    tdId.textContent = booking.id;

    var tdUser = document.createElement('td');
    tdUser.textContent = booking.user;

    var tdPkg = document.createElement('td');
    tdPkg.textContent = booking.package;

    var tdDate = document.createElement('td');
    tdDate.textContent = booking.date;

    var tdStatus = document.createElement('td');
    var badge = document.createElement('span');
    badge.className = 'badge ' + getBadgeClass(booking.status);
    badge.textContent = booking.status;
    tdStatus.appendChild(badge);

    tr.appendChild(tdId);
    tr.appendChild(tdUser);
    tr.appendChild(tdPkg);
    tr.appendChild(tdDate);
    tr.appendChild(tdStatus);
    tbody.appendChild(tr);
  }
}

function renderPopularityList() {
  var container = document.getElementById('popularityList');
  container.innerHTML = '';

  var maxCount = 0;
  for (var i = 0; i < dashboardPopularity.length; i++) {
    if (dashboardPopularity[i].count > maxCount) {
      maxCount = dashboardPopularity[i].count;
    }
  }
  if (maxCount === 0) maxCount = 1;

  for (var j = 0; j < dashboardPopularity.length; j++) {
    var item = dashboardPopularity[j];
    var widthPct = Math.round((item.count / maxCount) * 100);

    var wrapper = document.createElement('div');
    wrapper.className = 'popularity-item';

    var meta = document.createElement('div');
    meta.className = 'popularity-meta';

    var name = document.createElement('span');
    name.className = 'popularity-name';
    name.textContent = item.name;

    var count = document.createElement('span');
    count.className = 'popularity-count';
    count.textContent = item.count + ' bookings';

    meta.appendChild(name);
    meta.appendChild(count);

    var track = document.createElement('div');
    track.className = 'popularity-bar-track';

    var fill = document.createElement('div');
    fill.className = 'popularity-bar-fill';
    fill.style.width = widthPct + '%';

    track.appendChild(fill);
    wrapper.appendChild(meta);
    wrapper.appendChild(track);
    container.appendChild(wrapper);
  }
}

function getBadgeClass(status) {
  if (status.toLowerCase() === 'approved') return 'badge-approved';
  if (status.toLowerCase() === 'pending') return 'badge-pending';
  if (status.toLowerCase() === 'cancelled') return 'badge-cancelled';
  return 'badge-pending';
}

window.initDashboard = initDashboard;

