let userBookings = [];
let currentUser = null;

window.initContactForm = async function() {
    if (!document.getElementById('bookingRef')) return;

    let user = null;
    try {
        const userStr = localStorage.getItem('wayfare_user');
        if (userStr) {
            user = JSON.parse(userStr);
        }
    } catch(e) {}

    if (user && user.role !== 'admin') {
        currentUser = user;
        document.getElementById('userFieldsGroup').style.display = 'none';
        document.getElementById('name').removeAttribute('required');
        document.getElementById('email').removeAttribute('required');

        if (window.supabaseClient) {
            if (!currentUser.id) {
                const { data } = await window.supabaseClient.from('profiles').select('*').limit(1);
                if (data && data.length > 0) {
                    currentUser.id = data[0].id;
                }
            }
            if (currentUser.id) {
                await fetchBookings();
            } else {
                 const br = document.getElementById('bookingRef'); if (br) br.innerHTML = '<option value="">No bookings found</option>';
                 const rp = document.getElementById('reviewPackage'); if (rp) rp.innerHTML = '<option value="">No approved bookings</option>';
            }
        } else {
            userBookings = [
                {id: 101, package_id: 1, status: 'approved', packages: {name: 'Bali Retreat'}},
                {id: 102, package_id: 2, status: 'pending', packages: {name: 'Swiss Alps Explorer'}}
            ];
            populateDropdowns();
        }
    } else {
        const br = document.getElementById('bookingRef'); if (br) br.innerHTML = '<option value="">Login to view bookings</option>';
        const rp = document.getElementById('reviewPackage'); if (rp) rp.innerHTML = '<option value="">Login to review tours</option>';
    }

    window.selectType('query'); // Initialize
};
document.addEventListener('DOMContentLoaded', window.initContactForm);

async function fetchBookings() {
    try {
        const { data, error } = await window.supabaseClient
            .from('bookings')
            .select('id, status, package_id, created_at, packages(name, destination)')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        userBookings = data || [];
        populateDropdowns();
    } catch (e) {
        console.error('Error fetching bookings:', e);
    }
}

function populateDropdowns() {
    const bookingRefSelect = document.getElementById('bookingRef');
    const reviewPackageSelect = document.getElementById('reviewPackage');
    
    if (bookingRefSelect) bookingRefSelect.innerHTML = '<option value="">Select a booking (Optional)</option>';
    if (reviewPackageSelect) reviewPackageSelect.innerHTML = '<option value="">Select a booking to review</option>';

    userBookings.forEach(b => {
        const pkgName = b.packages ? b.packages.name : `Booking #${b.id}`;
        
        // For Support (bookingRef)
        const refOption = document.createElement('option');
        refOption.value = b.id;
        refOption.textContent = `${pkgName} (${b.status})`;
        bookingRefSelect.appendChild(refOption);

        // For Review (reviewPackage) - include only approved bookings
        if (b.status && b.status.toLowerCase() === 'approved') {
            const revOption = document.createElement('option');
            revOption.value = b.package_id;
            revOption.textContent = pkgName;
            reviewPackageSelect.appendChild(revOption);
        }
    });

    if (reviewPackageSelect && reviewPackageSelect.options.length === 1) {
        reviewPackageSelect.innerHTML = '<option value="">No approved bookings to review</option>';
    }
}

window.selectType = function(type) {
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
    const selectedBtn = document.querySelector(`.type-btn[data-type="${type}"]`);
    if (selectedBtn) selectedBtn.classList.add('active');

    const typeInput = document.getElementById('inquiryType');
    if (typeInput) typeInput.value = type;

    const bookingRefGroup = document.getElementById('bookingRefGroup');
    const reviewPackageGroup = document.getElementById('reviewPackageGroup');
    const ratingGroup = document.getElementById('ratingGroup');
    const subjectGroup = document.getElementById('subject').parentElement;
    const submitBtn = document.getElementById('submitBtn');

    if (bookingRefGroup) bookingRefGroup.style.display = 'none';
    if (reviewPackageGroup) reviewPackageGroup.style.display = 'none';
    if (ratingGroup) ratingGroup.style.display = 'none';
    if (subjectGroup) subjectGroup.style.display = 'block';
    document.getElementById('subject').setAttribute('required', 'true');

    if (type === 'support') {
        if (bookingRefGroup) bookingRefGroup.style.display = 'block';
        if (submitBtn) submitBtn.innerHTML = 'Request Support <i data-lucide="life-buoy"></i>';
    } else if (type === 'review') {
        if (reviewPackageGroup) reviewPackageGroup.style.display = 'block';
        if (ratingGroup) ratingGroup.style.display = 'block';
        if (subjectGroup) {
            subjectGroup.style.display = 'none';
            document.getElementById('subject').removeAttribute('required');
        }
        if (submitBtn) submitBtn.innerHTML = 'Submit Review <i data-lucide="star"></i>';
    } else {
        if (submitBtn) submitBtn.innerHTML = 'Send Message <i data-lucide="send"></i>';
    }

    if (typeof lucide !== 'undefined' && submitBtn) {
        lucide.createIcons({ root: submitBtn });
    }
};

window.handleContactSubmit = async function(e) {
    e.preventDefault();
    
    if (!window.supabaseClient) {
        window.showContactToast('Database connection missing', 'error');
        return;
    }

    const type = document.getElementById('inquiryType').value;

    // For review, user MUST be logged in and must select a package
    if (type === 'review') {
        if (!currentUser) {
            window.showContactToast('Please login to submit a review.', 'error');
            return;
        }
        const pkgId = document.getElementById('reviewPackage').value;
        if (!pkgId) {
            window.showContactToast('Please select a completed tour to review.', 'error');
            return;
        }
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalContent = submitBtn.innerHTML;
    
    if (submitBtn) submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin" style="animation: spin 1s linear infinite"></i> Sending...';
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: submitBtn });
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
        let name = document.getElementById('name').value.trim();
        let email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        let message = document.getElementById('message').value.trim();

        if (currentUser) {
            name = currentUser.user_metadata?.full_name || name || 'User';
            email = currentUser.email;
        }

        if (type === 'query' || type === 'support') {
            let finalSubject = subject;
            if (type === 'support') {
                finalSubject = '[Support] ' + subject;
                const bRef = document.getElementById('bookingRef');
                if (bRef && bRef.value) {
                    const optionText = bRef.options[bRef.selectedIndex].text;
                    message = `Booking Reference: ${optionText}\n\n${message}`;
                }
            }

            const { error } = await window.supabaseClient.from('enquiries').insert({
                user_id: currentUser ? currentUser.id : null,
                name: name,
                email: email,
                subject: finalSubject,
                message: message,
                status: 'new'
            });

            if (error) throw error;
            window.showContactToast(type === 'support' ? 'Support request submitted.' : 'Message sent successfully!', 'success');

        } else if (type === 'review') {
            const pkgId = document.getElementById('reviewPackage').value;
            const rating = parseInt(document.getElementById('rating').value, 10);

            const { error } = await window.supabaseClient.from('reviews').insert({
                user_id: currentUser.id,
                package_id: parseInt(pkgId, 10),
                rating: rating,
                comment: message,
                
            });

            if (error) throw error;
            window.showContactToast('Thank you for your review!', 'success');
        }
        
        e.target.reset();
        window.selectType('query');

    } catch (err) {
        console.error(err);
        window.showContactToast(err.message || 'An error occurred.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        if (submitBtn) submitBtn.innerHTML = originalContent;
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: submitBtn });
    }
};

window.showContactToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';
    const color = type === 'success' ? 'var(--color-primary)' : '#dc2626';
    
    toast.style.cssText = `
        display: flex; align-items: center; gap: 0.75rem;
        background: var(--color-card); border: 1px solid var(--color-outline);
        padding: 1rem 1.5rem; border-radius: 8px; margin-top: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        color: var(--color-text); font-weight: 500;
        transform: translateX(120%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    if (type === 'success') {
        toast.style.borderLeft = `4px solid ${color}`;
    }

    toast.innerHTML = `
        <div style="color: ${color}"><i data-lucide="${icon}"></i></div>
        <div>${message}</div>
    `;
    
    container.appendChild(toast);
    if (typeof lucide !== "undefined") lucide.createIcons({ root: toast });
    
    toast.offsetHeight;
    toast.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};



document.addEventListener('mousemove', (e) => {
    const cartoon = document.getElementById('cartoon');
    if (!cartoon) return;
    
    const rect = cartoon.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.sqrt(dx*dx + dy*dy), 50);
    const maxOffsetX = 8;
    const maxOffsetY = 6;
    
    // Scale offset by distance
    const offsetRatio = distance / 50;
    const offsetX = Math.cos(angle) * maxOffsetX * offsetRatio;
    const offsetY = Math.sin(angle) * maxOffsetY * offsetRatio;
    
    const pupilL = document.getElementById('pupilL');
    const pupilR = document.getElementById('pupilR');
    
    if (pupilL) pupilL.setAttribute('transform', `translate(${offsetX}, ${offsetY})`);
    if (pupilR) pupilR.setAttribute('transform', `translate(${offsetX}, ${offsetY})`);
});
