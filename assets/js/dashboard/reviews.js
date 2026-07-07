let reviews = [];
let selectedRating = 0;

async function reviewsInit() {
    if (!window.supabaseClient) { renderReviewForm(); renderReviewList(); return; }
    
    try {
        const { data, error } = await window.supabaseClient
            .from('reviews')
            .select('*, packages(name)')
            .eq('user_id', window.currentUser.id)
            .order('created_at', { ascending: false });
            
        if (error) {
            // Table might not exist, ignore
        } else if (data) {
            reviews = data.map(r => ({
                id: r.id,
                packageName: r.packages ? r.packages.name : (r.package_name || 'Unknown'),
                rating: r.rating,
                comment: r.comment,
                date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Unknown'
            }));
        }
    } catch (err) {
        console.error(err);
    window.reviews = reviews;
    }
    renderReviewForm();
    renderReviewList();
}

function getApprovedPackages() {
    const names = [];
    if (typeof bookings === 'undefined') return names;
    for (let b of bookings) {
        if (b.status.toLowerCase() !== "approved") continue;
        if (!names.find(n => n.name === b.packageName)) {
            names.push({ name: b.packageName, id: b.package_id });
        }
    }
    return names;
}

function renderReviewForm() {
    const box = document.getElementById("review-form-body");
    const approved = getApprovedPackages();

    if (approved.length === 0) {
        box.innerHTML = '<p class="muted">Complete a trip to leave a review.</p>';
        return;
    }

    selectedRating = 0;

    let s = `<label class="field-label" for="review-package">Select Package</label>`;
    s += `<select class="field-input" id="review-package">`;
    for (let pkg of approved) {
        s += `<option value="${pkg.id || pkg.name}">${pkg.name}</option>`;
    }
    s += `</select>`;

    s += `<label class="field-label">Your Rating</label>`;
    s += `<div class="star-rating" id="review-stars">`;
    for (let j = 1; j <= 5; j++) {
        s += `<span class="star" data-value="${j}" onclick="setRating(${j})">&#9733;</span>`;
    }
    s += `</div>`;

    s += `<label class="field-label" for="review-comment">Your Comment</label>`;
    s += `<textarea class="field-input field-textarea" id="review-comment" placeholder="Tell us about your trip..."></textarea>`;
    s += `<p class="field-error" id="review-error"></p>`;
    s += `<button class="btn-primary review-submit-btn" onclick="submitReview()"><i data-lucide="send" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> Submit Review</button>`;

    box.innerHTML = s;
}

function setRating(value) {
    selectedRating = value;
    const stars = document.querySelectorAll("#review-stars .star");
    stars.forEach(star => {
        let val = Number(star.getAttribute("data-value"));
        if (val <= selectedRating) {
            star.classList.add("filled");
        } else {
            star.classList.remove("filled");
        }
    });
}

async function submitReview() {
    const packageSelect = document.getElementById("review-package");
    const packageIdOrName = packageSelect.value;
    const packageName = packageSelect.options[packageSelect.selectedIndex].text;
    const comment = document.getElementById("review-comment").value.trim();
    const errorLine = document.getElementById("review-error");

    if (selectedRating === 0) {
        errorLine.textContent = "Please pick a star rating.";
        return;
    }
    if (comment === "") {
        errorLine.textContent = "Please write a short comment.";
        return;
    }
    errorLine.textContent = "";

    if (window.supabaseClient) {
        const { error } = await window.supabaseClient.from('reviews').insert({
            user_id: window.currentUser.id,
            package_id: packageIdOrName === packageName ? null : packageIdOrName, package_name: packageName,
            
            rating: selectedRating,
            comment: comment
        });
        if (error) {
            showToast("Failed to submit review: " + error.message, "error");
            return;
        }
    }
    
    // Refresh
    reviewsInit();
    showToast("Review submitted.", "success");
}

function renderReviewList() {
    const list = document.getElementById("reviews-list");

    if (reviews.length === 0) {
        list.innerHTML = '<p class="muted">You have not written any reviews yet.</p>';
        return;
    }

    let html = "";
    for (let i = 0; i < reviews.length; i++) {
        html += buildReviewCard(reviews[i], i);
    }
    list.innerHTML = html;
}

function buildReviewCard(review, index) {
    let s = `<div class="review-card"><div class="review-card-head">`;
    s += `<h4 class="review-pkg">${review.packageName}</h4>`;
    s += `<button class="btn-outline notif-mark-btn" onclick="deleteReview(${index})"><i data-lucide="trash-2" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> Delete</button></div>`;
    s += buildStaticStars(review.rating);
    s += `<p class="review-comment">${review.comment}</p>`;
    s += `<span class="review-date">${review.date}</span></div>`;
    return s;
}

function buildStaticStars(rating) {
    let s = '<div class="star-rating">';
    for (let i = 1; i <= 5; i++) {
        s += `<span class="star-static ${i <= rating ? 'filled' : ''}">&#9733;</span>`;
    }
    s += "</div>";
    return s;
}

async function deleteReview(index) {
    let review = reviews[index];
    if (window.supabaseClient) {
        const { error } = await window.supabaseClient.from('reviews').delete().eq('id', review.id);
        if (error) {
            showToast("Failed to delete review", "error");
            return;
        }
    }
    reviews.splice(index, 1);
    renderReviewList();
    showToast("Review deleted.", "success");
}

window.reviewsInit = reviewsInit;
window.setRating = setRating;
window.submitReview = submitReview;
window.renderReviewForm = renderReviewForm;
window.renderReviewList = renderReviewList;
