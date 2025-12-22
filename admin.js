const ADMIN_ID = "AquaSellTeam";
const ADMIN_PASS = "core2026";

/** * EDIT THIS DATA MANUALLY 
 * You can add or remove items here.
 */
const sellerData = [
    { name: "Nikhil Bajpai", address: "123 Water St, NY", phone: "+91 88957-56612", waterSold: 5200 },
    { name: "Anjali Goshal", address: "45 Industrial Park", phone: "+91 95555-10202", waterSold: 1200 },
    { name: "Disha Ambani", address: "89 Suburban Rd", phone: "+91 84555-30303", waterSold: 450 },
    { name: "Akhil Kumar", address: "12 Downtown Blvd", phone: "+91 95841-10404", waterSold: 80 },
    { name: "Sarah Khan", address: "Biran Road", phone: "+1 95415-10505", waterSold: 2100 }
];

const buyerData = [
    { name: "City Car Wash", address: "500 Main St", phone: "+91 94154-48646", waterBought: 6000, useCase: "Car Washing" },
    { name: "Bloom Gardens", address: "Greenfield Lane", phone: "+91 84151-95444", waterBought: 1500, useCase: "Gardening" },
    { name: "Urban Laundry", address: "Warehouse market", phone: "+91 89654-41584", waterBought: 800, useCase: "Cloth Washing" },
    { name: "Aqua Fun Park", address: "Kidwai Nagar", phone: "+91 64154-49845", waterBought: 10000, useCase: "Water Park" },
    { name: "Eco Utensils", address: "Bar Devi", phone: "+91 74411-41545", waterBought: 300, useCase: "Utensil Washing" }
];

// Login Logic
document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('admin-id').value;
    const pass = document.getElementById('admin-pass').value;

    if (id === ADMIN_ID && pass === ADMIN_PASS) {
        sessionStorage.setItem('admin_auth_static', 'true');
        showDashboard();
    } else {
        alert("Incorrect Credentials");
    }
});

function showDashboard() {
    document.getElementById('admin-auth-container').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    renderList('sellers');
}

function switchTab(type) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if(type === 'sellers') {
        document.getElementById('btn-sellers').classList.add('active');
        document.getElementById('tab-title').innerText = "Seller Account Details";
        renderList('sellers');
    } else {
        document.getElementById('btn-buyers').classList.add('active');
        document.getElementById('tab-title').innerText = "Buyer Account Details";
        renderList('buyers');
    }
}

function renderList(type) {
    const container = document.getElementById('data-container');
    const data = (type === 'sellers') ? sellerData : buyerData;
    let html = '';

    data.forEach(item => {
        const volume = (type === 'sellers') ? item.waterSold : item.waterBought;
        const stars = getStarRating(volume);

        html += `
            <div class="admin-card">
                <div class="card-header">
                    <h3>${item.name}</h3>
                    <div class="star-rating">${stars}</div>
                </div>
                <div class="card-body">
                    <p><i class="fas fa-map-marker-alt"></i> <strong>Address:</strong> ${item.address}</p>
                    <p><i class="fas fa-phone"></i> <strong>Contact:</strong> ${item.phone}</p>
                    ${type === 'buyers' ? `<p><i class="fas fa-faucet"></i> <strong>Use:</strong> ${item.useCase}</p>` : ''}
                    <p><i class="fas fa-chart-line"></i> <strong>Lifetime ${type === 'sellers' ? 'Sold' : 'Purchased'}:</strong> ${volume} L</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function getStarRating(amount) {
    if (amount >= 5000) return '⭐⭐⭐⭐⭐';
    if (amount >= 2000) return '⭐⭐⭐⭐';
    if (amount >= 500) return '⭐⭐⭐';
    if (amount >= 100) return '⭐⭐';
    return '⭐';
}

function adminLogout() {
    sessionStorage.removeItem('admin_auth_static');
    location.reload();
}

// Auto-login if session exists
if (sessionStorage.getItem('admin_auth_static') === 'true') {
    showDashboard();
}