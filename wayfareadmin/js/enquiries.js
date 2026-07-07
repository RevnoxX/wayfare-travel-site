
// ── Enquiries — WayFare Admin ─────────────────────────────────────────────────

var enquiriesData = [];
var expandedEnquiryId = null;
var activeReplyId = null;

async function initEnquiries() {
  if (!window.supabaseClient) {
    showToast('Database connection missing. Check settings.', 'error');
    renderEnquiriesTable();
    attachReplyModalListeners();
    return;
  }
  try {
    const { data, error } = await window.supabaseClient.from('enquiries').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      showToast('Failed to fetch enquiries.', 'error');
      return;
    }
    
    if (data) {
      enquiriesData = data.map(enq => ({
        id: enq.id,
        name: enq.name || 'Unknown',
        email: enq.email || 'Unknown',
        subject: enq.subject || 'No Subject',
        message: enq.message || '',
        date: enq.created_at ? new Date(enq.created_at).toISOString().split('T')[0] : 'Unknown',
        status: enq.status === 'new' ? 'New' : (enq.status === 'read' ? 'Read' : enq.status),
        reply: enq.reply || null
      }));
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to fetch enquiries.', 'error');
  }
  
  renderEnquiriesTable();
  attachReplyModalListeners();
}

function renderEnquiriesTable() {
  var tbody = document.getElementById('enquiriesTbody');
  tbody.innerHTML = '';

  for (var i = 0; i < enquiriesData.length; i++) {
    var enquiry = enquiriesData[i];
    var tr = buildEnquiryRow(enquiry);
    tbody.appendChild(tr);
    var expandRow = buildExpandRow(enquiry);
    tbody.appendChild(expandRow);
  }

  if (expandedEnquiryId !== null) {
    var openRow = document.getElementById('enquiry-expand-' + expandedEnquiryId);
    if (openRow) {
      openRow.style.display = 'table-row';
    }
  }
}

function buildEnquiryRow(enquiry) {
  var tr = document.createElement('tr');
  tr.setAttribute('data-id', enquiry.id);

  tr.style.cursor = 'pointer';
  tr.onclick = function() {
    var id = parseInt(this.getAttribute('data-id'), 10);
    toggleEnquiryExpand(id);
  };

  var tdName = document.createElement('td');
  tdName.textContent = enquiry.name;

  var tdEmail = document.createElement('td');
  tdEmail.textContent = enquiry.email;

  var tdSubject = document.createElement('td');
  tdSubject.textContent = enquiry.subject;

  var tdMessage = document.createElement('td');
  var preview = enquiry.message || '';
  if (preview.length > 60) preview = preview.substring(0, 60) + '…';
  tdMessage.textContent = preview;
  tdMessage.style.color    = 'var(--color-secondary)';
  tdMessage.style.fontSize = '0.8rem';

  var tdDate = document.createElement('td');
  tdDate.textContent = enquiry.date;

  var tdStatus = document.createElement('td');
  var badge = document.createElement('span');
  if (enquiry.reply !== null && enquiry.reply !== '') {
    badge.className = 'badge badge-replied';
    badge.textContent = 'Replied';
  } else {
    badge.className = 'badge ' + getEnquiryBadgeClass(enquiry.status);
    badge.textContent = enquiry.status;
  }
  tdStatus.appendChild(badge);

  var tdAction = document.createElement('td');
  var actionWrap = document.createElement('div');
  actionWrap.className = 'table-actions';

  if (enquiry.status === 'New' && (!enquiry.reply)) {
    var markBtn = document.createElement('button');
    markBtn.className = 'btn-mark-read';
    markBtn.textContent = 'Mark Read';
    markBtn.setAttribute('data-id', enquiry.id);
    markBtn.onclick = function(event) {
      event.stopPropagation();
      var id = parseInt(this.getAttribute('data-id'), 10);
      markEnquiryRead(id);
    };
    actionWrap.appendChild(markBtn);
  }

  var replyBtn = document.createElement('button');
  replyBtn.className = 'btn-primary btn-sm';
  replyBtn.textContent = 'Reply';
  replyBtn.setAttribute('data-id', enquiry.id);
  replyBtn.onclick = function(event) {
    event.stopPropagation();
    var id = parseInt(this.getAttribute('data-id'), 10);
    openReplyModal(id);
  };
  actionWrap.appendChild(replyBtn);

  tdAction.appendChild(actionWrap);

  tr.appendChild(tdName);
  tr.appendChild(tdEmail);
  tr.appendChild(tdSubject);
  tr.appendChild(tdMessage);
  tr.appendChild(tdDate);
  tr.appendChild(tdStatus);
  tr.appendChild(tdAction);

  return tr;
}

function buildExpandRow(enquiry) {
  var tr = document.createElement('tr');
  tr.className = 'enquiry-expand-row';
  tr.setAttribute('id', 'enquiry-expand-' + enquiry.id);
  tr.style.display = 'none';

  var td = document.createElement('td');
  td.setAttribute('colspan', '7');

  var inner = document.createElement('div');
  inner.className = 'enquiry-expand-inner';

  var msgText = document.createElement('p');
  msgText.textContent = enquiry.message;
  inner.appendChild(msgText);

  if (enquiry.reply !== null && enquiry.reply !== '') {
    var replyBlock = document.createElement('div');
    replyBlock.className = 'reply-display';

    var replyLabel = document.createElement('p');
    replyLabel.className = 'reply-display-label';
    replyLabel.textContent = 'Your reply:';

    var replyText = document.createElement('p');
    replyText.className = 'reply-display-text';
    replyText.textContent = enquiry.reply;

    replyBlock.appendChild(replyLabel);
    replyBlock.appendChild(replyText);
    inner.appendChild(replyBlock);
  }

  td.appendChild(inner);
  tr.appendChild(td);

  return tr;
}

function toggleEnquiryExpand(id) {
  var expandRow = document.getElementById('enquiry-expand-' + id);
  if (!expandRow) return;

  if (expandedEnquiryId === id) {
    expandRow.style.display = 'none';
    expandedEnquiryId = null;
  } else {
    if (expandedEnquiryId !== null) {
      var prevRow = document.getElementById('enquiry-expand-' + expandedEnquiryId);
      if (prevRow) prevRow.style.display = 'none';
    }
    expandRow.style.display = 'table-row';
    expandedEnquiryId = id;
  }
}

async function markEnquiryRead(id) {
  if (window.supabaseClient) {
    const { error } = await window.supabaseClient.from('enquiries').update({ status: 'read' }).eq('id', id);
    if (error) {
       console.error(error);
       showToast('Error marking as read', 'error');
       return;
    }
  }

  for (var i = 0; i < enquiriesData.length; i++) {
    if (enquiriesData[i].id === id) {
      enquiriesData[i].status = 'Read';
      break;
    }
  }

  showToast('Enquiry marked as Read.', 'success');
  renderEnquiriesTable();
}

function findEnquiryById(id) {
  for (var i = 0; i < enquiriesData.length; i++) {
    if (enquiriesData[i].id === id) return enquiriesData[i];
  }
  return null;
}

function openReplyModal(id) {
  var enq = findEnquiryById(id);
  if (enq === null) return;

  activeReplyId = id;

  var toLabel = document.getElementById('reply-to-label');
  toLabel.innerHTML = 'To: <span>' + enq.name + ' (' + enq.email + ')</span>';

  var subjectLabel = document.getElementById('reply-subject-label');
  subjectLabel.innerHTML = 'Re: <span>' + enq.subject + '</span>';

  var textarea = document.getElementById('reply-textarea');
  if (enq.reply !== null) {
    textarea.value = enq.reply;
  } else {
    textarea.value = '';
  }

  var modal = document.getElementById('reply-modal');
  modal.classList.add('open');
  textarea.focus();
}

function closeReplyModal() {
  var modal = document.getElementById('reply-modal');
  modal.classList.remove('open');
  activeReplyId = null;
  document.getElementById('reply-textarea').value = '';
}

async function sendReply() {
  var textarea = document.getElementById('reply-textarea');
  var replyText = textarea.value.trim();

  if (replyText === '') {
    showToast('Reply cannot be empty.', 'error');
    return;
  }

  if (activeReplyId === null) return;

  if (window.supabaseClient) {
      const { error } = await window.supabaseClient.from('enquiries').update({ reply: replyText, status: 'read' }).eq('id', activeReplyId);
      if (error) {
          console.error(error);
          showToast('Failed to send reply', 'error');
          return;
      }
  }

  for (var i = 0; i < enquiriesData.length; i++) {
    if (enquiriesData[i].id === activeReplyId) {
      enquiriesData[i].reply  = replyText;
      enquiriesData[i].status = 'Read';
      break;
    }
  }

  showToast('Reply sent to customer.', 'success');
  closeReplyModal();
  renderEnquiriesTable();
}

function attachReplyModalListeners() {
  var closeBtn  = document.getElementById('reply-close-btn');
  var cancelBtn = document.getElementById('reply-cancel-btn');
  var sendBtn   = document.getElementById('reply-send-btn');
  var overlay   = document.getElementById('reply-modal');

  closeBtn.onclick = function() { closeReplyModal(); };
  cancelBtn.onclick = function() { closeReplyModal(); };
  sendBtn.onclick = function() { sendReply(); };
  overlay.onclick = function(event) {
    if (event.target === overlay) closeReplyModal();
  };
}

function getEnquiryBadgeClass(status) {
  if (status === 'New') return 'badge-new';
  return 'badge-read';
}

window.initEnquiries = initEnquiries;

window.sendReply = sendReply;