let enquiries = [];
let expandedEnquiries = {};

async function enquiriesInit() {
    if (!window.supabaseClient) { renderEnquiries(); return; }
    
    try {
        const { data, error } = await window.supabaseClient
            .from('enquiries')
            .select('*')
            .eq('user_id', window.currentUser.id)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error(error);
        } else if (data) {
            enquiries = data.map(e => ({
                id: e.id,
                subject: e.subject || 'No Subject',
                message: e.message || '',
                date: e.created_at ? new Date(e.created_at).toLocaleDateString() : 'Unknown',
                status: e.reply ? 'replied' : (e.status || 'new'),
                reply: e.reply || ''
            }));
        }
    } catch (err) {
        console.error(err);
    window.enquiries = enquiries;
    }
    renderEnquiries();
}

function renderEnquiries() {
    const list = document.getElementById("enquiries-list");
    if (enquiries.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9993;</div><p>You have not sent any enquiries yet.</p></div>';
        return;
    }

    let html = "";
    for (let i = 0; i < enquiries.length; i++) {
        html += buildEnquiryCard(enquiries[i], i);
    }
    list.innerHTML = html;
}

function buildEnquiryCard(enquiry, index) {
    let badgeClass = "badge-" + enquiry.status;
    let statusWord = capitaliseEnquiry(enquiry.status);
    let isOpen = expandedEnquiries[enquiry.id] === true;

    let messageText = enquiry.message;
    let hint = "";
    if (enquiry.message.length > 80 && !isOpen) {
        messageText = enquiry.message.slice(0, 80) + "...";
        hint = ' <span class="enquiry-expand-hint">Read more</span>';
    } else if (enquiry.message.length > 80 && isOpen) {
        hint = ' <span class="enquiry-expand-hint">Show less</span>';
    }

    let s = `<div class="enquiry-card">`;
    s += `<div class="enquiry-head"><h4 class="enquiry-subject">${enquiry.subject}</h4><span class="badge ${badgeClass}">${statusWord}</span></div>`;
    s += `<p class="enquiry-message" onclick="toggleEnquiry(${index})">${messageText}${hint}</p>`;
    s += `<div class="enquiry-date">Submitted ${enquiry.date}</div>`;

    if (enquiry.reply) {
        s += `<div class="reply-bubble"><div class="reply-label">WayFare Support:</div><div class="reply-text">${enquiry.reply}</div></div>`;
    }
    s += `</div>`;
    return s;
}

function toggleEnquiry(index) {
    let enquiry = enquiries[index];
    expandedEnquiries[enquiry.id] = !expandedEnquiries[enquiry.id];
    renderEnquiries();
}

function openEnquiryModal() {
    document.getElementById("enquiry-subject").value = "";
    document.getElementById("enquiry-message").value = "";
    document.getElementById("enquiry-error").textContent = "";
    document.getElementById("enquiry-modal").classList.add("open");
}

function closeEnquiryModal() {
    document.getElementById("enquiry-modal").classList.remove("open");
}

async function submitEnquiry() {
    const subject = document.getElementById("enquiry-subject").value.trim();
    const message = document.getElementById("enquiry-message").value.trim();
    const errorLine = document.getElementById("enquiry-error");

    if (subject === "") {
        errorLine.textContent = "Please enter a subject.";
        return;
    }
    if (message === "") {
        errorLine.textContent = "Please enter a message.";
        return;
    }
    errorLine.textContent = "";

    if (window.supabaseClient) {
        const { data, error } = await window.supabaseClient.from('enquiries').insert({
            name: window.currentUser.name,
            email: window.currentUser.email,
            subject: subject,
            message: message,
            status: 'new'
        }).select();
        
        if (error) {
            showToast("Failed to submit enquiry.", "error");
            return;
        }
        
        if (data && data[0]) {
            enquiries.unshift({
                id: data[0].id,
                subject: data[0].subject,
                message: data[0].message,
                date: new Date(data[0].created_at).toLocaleDateString(),
                status: data[0].status,
                reply: ''
            });
        }
    }
    
    renderEnquiries();
    closeEnquiryModal();
    showToast("Enquiry submitted.", "success");
}

function capitaliseEnquiry(word) {
    if(!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
}

window.enquiriesInit = enquiriesInit;
window.submitEnquiry = submitEnquiry;
window.closeEnquiryModal = closeEnquiryModal;
window.toggleEnquiry = toggleEnquiry;
window.openEnquiryModal = openEnquiryModal;
window.renderEnquiries = renderEnquiries;
