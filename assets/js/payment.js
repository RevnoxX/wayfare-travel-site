document.addEventListener('DOMContentLoaded', () => {
    // 1. Parse URL Parameters
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount') || '0';
    const dest = params.get('dest') || 'Unknown Destination';
    const pkgName = params.get('name') || 'Custom Tour';
    const isUser = params.get('user') === '1';

    // 2. Populate DOM
    document.getElementById('payTotal').textContent = `₹${parseInt(amount).toLocaleString('en-IN')}`;
    document.getElementById('payDest').textContent = dest;
    document.getElementById('payPackage').textContent = pkgName;

    // 3. Animation Logic
    const paymentForm = document.getElementById('paymentForm');
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    
    const cardWrap = document.getElementById('paymentCardWrap');
    const approvalStamp = document.getElementById('approvalStamp');
    const airplaneWrapper = document.getElementById('airplaneWrapper');
    const flightPath = document.getElementById('flightPath');

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Disable button
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Processing...';

        // THE TRIGGER: 3D Flip
        cardWrap.classList.add('flipped');

        // Wait for flip to complete (0.8s) 
        setTimeout(() => {
            // THE APPROVAL STAMP
            approvalStamp.classList.add('stamp-anim');

            // Wait a half-second after stamp lands
            setTimeout(() => {
                // THE ORIGAMI MORPH
                cardWrap.classList.add('origami-morph');
                airplaneWrapper.classList.add('appear');

                // Wait for morph to complete (0.5s)
                setTimeout(() => {
                    // THE TAKEOFF
                    airplaneWrapper.classList.add('takeoff');
                    flightPath.classList.add('draw');

                    // Sync with takeoff duration (1.5s)
                    setTimeout(() => {
                        // THE DESTINATION
                        if (isUser || localStorage.getItem('wayfare_user')) {
                            window.location.href = '/dashboard.html';
                        } else {
                            // If mock logged out booking, go to home/explore
                            window.location.href = '/explore.html';
                        }
                    }, 1500);

                }, 500);

            }, 500 + 400); // Wait 0.5s PLUS the stamp anim duration (0.4s)

        }, 800);
    });
});
