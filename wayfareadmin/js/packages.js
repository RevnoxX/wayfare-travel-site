
// ── Packages — WayFare Admin ──────────────────────────────────────────────────

var packagesData = [];
var editingPackageId = null;

async function initPackages() {
  if (!window.supabaseClient) {
    showToast('Database connection missing. Check settings.', 'error');
    renderPackagesTable();
    return;
  }
  try {
    const { data, error } = await window.supabaseClient.from('packages').select('*').order('id', { ascending: true });
    if (error) {
      console.error(error);
      showToast('Failed to fetch packages.', 'error');
      return;
    }
    packagesData = data || [];
  } catch (err) {
    console.error(err);
    showToast('Failed to fetch packages.', 'error');
  }
  renderPackagesTable();
}

function renderPackagesTable() {
  var tbody = document.getElementById('packagesTbody');
  tbody.innerHTML = '';

  for (var i = 0; i < packagesData.length; i++) {
    var pkg = packagesData[i];
    var tr = buildPackageRow(pkg);
    tbody.appendChild(tr);
  }
}

function buildPackageRow(pkg) {
  var tr = document.createElement('tr');

  var tdImg = document.createElement('td');
  var img = document.createElement('img');
  img.src = pkg.image_url;
  img.alt = pkg.name;
  img.className = 'pkg-thumb';
  img.loading = 'lazy';
  tdImg.appendChild(img);

  var tdName = document.createElement('td');
  tdName.textContent = pkg.name;

  var tdDest = document.createElement('td');
  tdDest.textContent = pkg.destination;

  var tdDur = document.createElement('td');
  tdDur.textContent = pkg.duration + ' days';

  var tdPrice = document.createElement('td');
  tdPrice.textContent = '$' + pkg.price.toLocaleString();

  var tdCat = document.createElement('td');
  var tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = pkg.category;
  tdCat.appendChild(tag);

  var tdActions = document.createElement('td');
  var actionWrap = document.createElement('div');
  actionWrap.className = 'table-actions';

  var editBtn = document.createElement('button');
  editBtn.className = 'btn-edit btn-sm';
  editBtn.textContent = 'Edit';
  editBtn.setAttribute('data-id', pkg.id);
  editBtn.onclick = function() {
    var id = parseInt(this.getAttribute('data-id'), 10);
    openPackageModal(id);
  };

  var deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete btn-sm';
  deleteBtn.textContent = 'Delete';
  deleteBtn.setAttribute('data-id', pkg.id);
  deleteBtn.onclick = function() {
    var id = parseInt(this.getAttribute('data-id'), 10);
    deletePackage(id);
  };

  actionWrap.appendChild(editBtn);
  actionWrap.appendChild(deleteBtn);
  tdActions.appendChild(actionWrap);

  tr.appendChild(tdImg);
  tr.appendChild(tdName);
  tr.appendChild(tdDest);
  tr.appendChild(tdDur);
  tr.appendChild(tdPrice);
  tr.appendChild(tdCat);
  tr.appendChild(tdActions);

  return tr;
}

function openPackageModal(id) {
  var overlay = document.getElementById('packageModalOverlay');
  var title   = document.getElementById('packageModalTitle');

  clearPackageForm();

  if (id === null) {
    editingPackageId = null;
    title.textContent = 'Add Package';
  } else {
    editingPackageId = id;
    title.textContent = 'Edit Package';
    var pkg = findPackageById(id);
    if (pkg !== null) {
      document.getElementById('packageModalId').value        = pkg.id;
      document.getElementById('modalName').value             = pkg.name;
      document.getElementById('modalDestination').value      = pkg.destination;
      document.getElementById('modalDuration').value         = pkg.duration;
      document.getElementById('modalPrice').value            = pkg.price;
      document.getElementById('modalCategory').value         = pkg.category;
      document.getElementById('modalImageUrl').value         = pkg.image_url;
      document.getElementById('modalDescription').value      = pkg.description;
      document.getElementById('modalItinerary').value        = pkg.itinerary;
    }
  }
  overlay.classList.add('open');
}

function closePackageModal() {
  var overlay = document.getElementById('packageModalOverlay');
  overlay.classList.remove('open');
  editingPackageId = null;
  clearPackageForm();
}

function closePackageModalOnOverlay(event) {
  if (event.target === document.getElementById('packageModalOverlay')) {
    closePackageModal();
  }
}

function clearPackageForm() {
  document.getElementById('packageModalId').value   = '';
  document.getElementById('modalName').value        = '';
  document.getElementById('modalDestination').value = '';
  document.getElementById('modalDuration').value    = '';
  document.getElementById('modalPrice').value       = '';
  document.getElementById('modalCategory').value    = '';
  document.getElementById('modalImageUrl').value    = '';
  document.getElementById('modalDescription').value = '';
  document.getElementById('modalItinerary').value   = '';
}

async function savePackage() {
  var name        = document.getElementById('modalName').value.trim();
  var destination = document.getElementById('modalDestination').value.trim();
  var duration    = parseInt(document.getElementById('modalDuration').value, 10);
  var price       = parseInt(document.getElementById('modalPrice').value, 10);
  var category    = document.getElementById('modalCategory').value;
  var imageUrl    = document.getElementById('modalImageUrl').value.trim();
  var description = document.getElementById('modalDescription').value.trim();
  var itinerary   = document.getElementById('modalItinerary').value.trim();

  if (!name || !destination || !duration || !price || !category) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  if (editingPackageId === null) {
    if (!imageUrl) {
      imageUrl = 'https://picsum.photos/80/60?random=' + Math.floor(Math.random() * 1000);
    }
    
    var newPkg = {
      name:        name,
      destination: destination,
      duration:    duration,
      price:       price,
      category:    category,
      image_url:   imageUrl,
      description: description,
      itinerary:   itinerary
    };

    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient.from('packages').insert([newPkg]).select();
      if (error) {
        console.error(error);
        showToast('Error saving package', 'error');
        return;
      }
      if (data && data.length > 0) {
        packagesData.push(data[0]);
      }
    } else {
        newPkg.id = packagesData.length + 1;
        packagesData.push(newPkg);
    }
    showToast('Package added successfully.', 'success');
  } else {
    var updatePkg = {
      name:        name,
      destination: destination,
      duration:    duration,
      price:       price,
      category:    category,
      image_url:   imageUrl,
      description: description,
      itinerary:   itinerary
    };

    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient.from('packages').update(updatePkg).eq('id', editingPackageId).select();
      if (error) {
        console.error(error);
        showToast('Error updating package', 'error');
        return;
      }
      if(data && data.length > 0) {
          for (var i = 0; i < packagesData.length; i++) {
              if (packagesData[i].id === editingPackageId) {
                packagesData[i] = data[0];
                break;
              }
          }
      }
    } else {
      for (var i = 0; i < packagesData.length; i++) {
        if (packagesData[i].id === editingPackageId) {
          packagesData[i] = { ...packagesData[i], ...updatePkg };
          if(imageUrl) packagesData[i].image_url = imageUrl;
          break;
        }
      }
    }
    showToast('Package updated successfully.', 'success');
  }

  closePackageModal();
  renderPackagesTable();
}

async function deletePackage(id) {
  var pkg = findPackageById(id);
  if (pkg === null) return;

  var confirmed = window.confirm('Delete "' + pkg.name + '"? This cannot be undone.');
  if (!confirmed) return;

  if (window.supabaseClient) {
    const { error } = await window.supabaseClient.from('packages').delete().eq('id', id);
    if (error) {
      console.error(error);
      showToast('Error deleting package', 'error');
      return;
    }
  }

  var newList = [];
  for (var i = 0; i < packagesData.length; i++) {
    if (packagesData[i].id !== id) newList.push(packagesData[i]);
  }
  packagesData = newList;

  showToast('Package deleted.', 'success');
  renderPackagesTable();
}

function findPackageById(id) {
  for (var i = 0; i < packagesData.length; i++) {
    if (packagesData[i].id === id) return packagesData[i];
  }
  return null;
}

window.initPackages = initPackages;
window.openPackageModal = openPackageModal;
window.closePackageModal = closePackageModal;
window.closePackageModalOnOverlay = closePackageModalOnOverlay;

window.savePackage = savePackage;
window.deletePackage = deletePackage;
