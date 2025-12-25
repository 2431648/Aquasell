/* aquasell.js - FULL UPDATED VERSION */

document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // --- FIREBASE CONFIGURATION ---
    // =============================================
    
    const firebaseConfig = {
        apiKey: "AIzaSyDmHTFDs3RGMwkIUvPc_Qo-qwSDAGijju8",
        authDomain: "aquasell-1688a.firebaseapp.com",
        projectId: "aquasell-1688a",
        storageBucket: "aquasell-1688a.firebasestorage.app",
        messagingSenderId: "846974173429",
        appId: "1:846974173429:web:b6ec5f3218ae9d869e05bc"
    };

    // Initialize Firebase
    try {
        firebase.initializeApp(firebaseConfig);
    } catch (e) {
        console.error("Firebase initialization error:", e);
        alert("Could not connect to the database. Please check your Firebase config.");
    }

    const db = firebase.firestore();
    const auth = firebase.auth();


    // =============================================
    // PAGE NAVIGATION (Single Page App)
    // =============================================
    const allPages = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function showPage(pageId) {
        allPages.forEach(page => {
            if (!page.id.includes('modal')) {
                 page.classList.add('hidden');
            }
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            window.scrollTo(0, 0);

            if (pageId === 'page-seller-form') {
                initializeMap('seller-map-container', 'seller-coords', 'pin-seller-location');
            } else if (pageId === 'page-buyer-form') {
                initializeMap('buyer-map-container', 'buyer-coords', 'pin-buyer-location');
            }
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPageId = link.getAttribute('data-target');
            showPage(targetPageId);
        });
    });

    // =============================================
    // MODAL (POP-UP) LOGIC
    // =============================================
    const successModal = document.getElementById('success-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function showModal(message) {
        modalMessage.textContent = message;
        successModal.classList.remove('hidden');
    }

    function closeModal() {
        successModal.classList.add('hidden');
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    // =============================================
    // --- GOOGLE MAPS LOGIC ---
    // =============================================
    
    const initializedMaps = {};

    function initializeMap(containerId, coordsInputId, pinButtonId) {
        if (initializedMaps[containerId]) return;

        const mapContainer = document.getElementById(containerId);
        if (!mapContainer) return;

        const coordsInput = document.getElementById(coordsInputId);
        const pinButton = document.getElementById(pinButtonId);

        const defaultCoords = { lat: 20.5937, lng: 78.9629 };
        
        const map = new google.maps.Map(mapContainer, {
            center: defaultCoords,
            zoom: 5,
        });
        
        initializedMaps[containerId] = map;

        const marker = new google.maps.Marker({
            position: defaultCoords,
            map: map,
            draggable: true
        });

        marker.addListener('dragend', (e) => {
            const pos = e.latLng;
            coordsInput.value = `${pos.lat()}, ${pos.lng()}`; 
            map.panTo(pos);
        });

        pinButton.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        marker.setPosition(pos);
                        map.setCenter(pos);
                        map.setZoom(16);
                        coordsInput.value = `${pos.lat}, ${pos.lng}`;
                    },
                    () => { alert('Error: Could not get your location.'); }
                );
            }
        });
    }

    // =============================================
    // --- AUTHENTICATION ---
    // =============================================

    // Seller Signup
    const sellerSignupBtn = document.getElementById('seller-signup-btn');
    if (sellerSignupBtn) {
        sellerSignupBtn.addEventListener('click', () => {
            const email = document.getElementById('seller-email-signup').value;
            const pass = document.getElementById('seller-pass-signup').value;
            const confirmPass = document.getElementById('seller-pass-confirm').value;

            if (pass !== confirmPass) return alert("Passwords do not match.");

            auth.createUserWithEmailAndPassword(email, pass)
                .then(() => showPage('page-seller-form'))
                .catch((error) => alert(error.message));
        });
    }

    // Seller Login
    const sellerLoginBtn = document.getElementById('seller-login-btn');
    if (sellerLoginBtn) {
        sellerLoginBtn.addEventListener('click', () => {
            const email = document.getElementById('seller-email-login').value;
            const pass = document.getElementById('seller-pass-login').value;
            auth.signInWithEmailAndPassword(email, pass)
                .then(() => showPage('page-seller-home'))
                .catch((error) => alert(error.message));
        });
    }
    
    // Seller Log Out
    const sellerLogoutBtn = document.getElementById('seller-logout-btn');
    if (sellerLogoutBtn) {
        sellerLogoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => showPage('page-landing'))
            .catch((error) => alert(error.message));
        });
    }

    // Buyer Signup
    const buyerSignupBtn = document.getElementById('buyer-signup-btn');
    if (buyerSignupBtn) {
        buyerSignupBtn.addEventListener('click', () => {
            const email = document.getElementById('buyer-email-signup').value;
            const pass = document.getElementById('buyer-pass-signup').value;
            const confirmPass = document.getElementById('buyer-pass-confirm').value;

            if (pass !== confirmPass) return alert("Passwords do not match.");

            auth.createUserWithEmailAndPassword(email, pass)
                .then(() => showPage('page-buyer-form'))
                .catch((error) => alert(error.message));
        });
    }

    // Buyer Login
    const buyerLoginBtn = document.getElementById('buyer-login-btn');
    if (buyerLoginBtn) {
        buyerLoginBtn.addEventListener('click', () => {
            const email = document.getElementById('buyer-email-login').value;
            const pass = document.getElementById('buyer-pass-login').value;
            auth.signInWithEmailAndPassword(email, pass)
                .then((userCredential) => showBuyerMarketplace(userCredential.user))
                .catch((error) => alert(error.message));
        });
    }

    // =============================================
    // --- DATABASE (FIRESTORE) LOGIC ---
    // =============================================

    function createGeoPointFromInput(inputId) {
        const coordsString = document.getElementById(inputId).value;
        if (!coordsString) return null;
        const [lat, lng] = coordsString.split(',').map(Number);
        return (lat && lng) ? new firebase.firestore.GeoPoint(lat, lng) : null;
    }

    // --- Seller Form Save ---
    const sellerForm = document.getElementById('seller-details-form');
    if (sellerForm) {
        sellerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            const coordsGeoPoint = createGeoPointFromInput('seller-coords');

            if (!user) return alert("Please log in.");
            if (!coordsGeoPoint) return alert("Please pin your location on the map.");

            const sellerData = {
                name: document.getElementById('seller-name').value,
                phone: document.getElementById('seller-phone').value,
                address: document.getElementById('seller-address').value,
                account: document.getElementById('seller-account').value,
                ifsc: document.getElementById('seller-ifsc').value,
                coords: coordsGeoPoint,
                email: user.email
            };

            db.collection('sellers').doc(user.uid).set(sellerData)
                .then(() => {
                    showModal("Your details have been saved successfully!");
                    setTimeout(() => { 
                        closeModal(); 
                        showPage('page-seller-home'); 
                    }, 2000);
                })
                .catch((error) => alert("Error saving: " + error.message));
        });
    }

    // --- Buyer Form Save (FIXED REDIRECT LOGIC) ---
    const buyerForm = document.getElementById('buyer-details-form');
    if (buyerForm) {
        buyerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            const coordsGeoPoint = createGeoPointFromInput('buyer-coords');

            if (!user) return alert("Please log in.");
            if (!coordsGeoPoint) return alert("Please pin your location.");

            const buyerData = {
                name: document.getElementById('buyer-name').value,
                phone: document.getElementById('buyer-phone').value,
                useCase: document.getElementById('buyer-work-type').value,
                litersPerDay: document.getElementById('buyer-water-amount').value,
                coords: coordsGeoPoint,
                email: user.email
            };

            // Save to Firestore first
            db.collection('buyers').doc(user.uid).set(buyerData)
                .then(() => {
                    // Show success feedback
                    showModal("Your details are saved! Finding sellers...");
                    // Wait for the user to see the modal before redirecting
                    setTimeout(() => {
                        window.location.href = 'thanks.html'; 
                    }, 2500);
                })
                .catch((error) => alert("Error saving details: " + error.message));
        });
    }

    // =============================================
    // --- BUYER MARKETPLACE LOGIC ---
    // =============================================

    const sellerListContainer = document.getElementById('seller-list-container');

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
    
    function showBuyerMarketplace(user) {
        showPage('page-buyer-home');
        if (!user) return;

        db.collection('buyers').doc(user.uid).get()
            .then((doc) => {
                const buyerCoords = (doc.exists && doc.data().coords) ? doc.data().coords : null;
                loadSellers(buyerCoords);
            })
            .catch(() => loadSellers(null));
    }

    function loadSellers(buyerCoords) {
        if (!sellerListContainer) return;
        sellerListContainer.innerHTML = '<p class="text-gray-600">Loading available sellers...</p>';

        db.collection('sellers').get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    sellerListContainer.innerHTML = '<p class="text-gray-600">No sellers registered yet.</p>';
                    return;
                }
                sellerListContainer.innerHTML = ''; 
                querySnapshot.forEach((doc) => {
                    const seller = doc.data();
                    let distanceHTML = '';

                    if (buyerCoords && seller.coords) {
                        const distance = calculateDistance(
                            buyerCoords.latitude, buyerCoords.longitude,
                            seller.coords.latitude, seller.coords.longitude
                        );
                        distanceHTML = `
                            <p class="font-semibold text-brand-blue-light mt-2">
                                ${distance.toFixed(1)} km away
                            </p>
                        `;
                    }
                    
                    // const sellerCardHTML = `
                    //     <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-green flex flex-col justify-between">
                    //         <div>
                    //             <h3 class="text-xl font-bold text-brand-blue mb-2">${seller.name}</h3>
                    //             <p class="text-gray-600 mb-1">${seller.address}</p>
                    //             <p class="text-gray-700 font-medium">Phone: ${seller.phone}</p>
                    //             ${distanceHTML} 
                    //         </div>
                    //         <a href="tel:${seller.phone}" class="mt-4 inline-block w-full text-center bg-brand-green hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    //             Call Seller
                    //         </a>
                    //     </div>
                    // `;

                    sellerListContainer.insertAdjacentHTML('beforeend', sellerCardHTML);
                });
            })
            // .catch((error) => {
            //     console.error("Error loading sellers: ", error);
            //     sellerListContainer.innerHTML = '<p class="text-red-600">Error loading sellers.</p>';
            // });
    }

}); // --- END OF DOMCONTENTLOADED ---





// slider window 



document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    let index = 0;

    // Safety check: only run if elements are found
    if (track && slides.length > 0) {
        setInterval(() => {
            index++;
            
            // Loop back to the first slide
            if (index >= slides.length) {
                index = 0;
            }
            
            // Apply the move
            const offset = -index * 100;
            track.style.transform = `translateX(${offset}%)`;
        }, 3000); // 3 seconds
    } else {
        console.error("Slider track or slides not found. Check your HTML classes.");
    }
});
