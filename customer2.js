const defaultItems = [
    { name: "Ligo Sardines", price: "45.00", category: "Others" },
    { name: "Lucky Me Pancit Canton", price: "25.00", category: "Instant Noodles" },
    { name: "C2 Apple Big", price: "39.00", category: "Drinks" },
    { name: "Skyflakes Plain", price: "8.00", category: "Snacks" },
    { name: "Sunsilk Pink Shampoo", price: "8.00", category: "Personal Care" }
];

let products = [];
let cart = [];
let currentCategory = 'All';

window.render = function() {
    const cList = document.getElementById('customer-list');
    const searchInput = document.getElementById('customer-search');
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";
    
    const filtered = products.filter(p => {
        const matchesCat = currentCategory === 'All' || p.category === currentCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery);
        return matchesCat && matchesSearch;
    });

    if (cList) {
        cList.innerHTML = filtered.length ? filtered.map((p) => `
            <div class="product-item">
                <div>
                    <strong>${p.name}</strong><br>
                    <small>${p.category} | ₱${parseFloat(p.price).toFixed(2)}</small>
                </div>
                <button onclick="addToCart('${p.name.replace(/'/g, "\\'")}')" style="background:#00a844; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Add</button>
            </div>
        `).join('') : "No products found.";
    }

    const cartContainer = document.getElementById('cart-items');
    if (cartContainer) {
        cartContainer.innerHTML = cart.map(item => `
            <div class="product-item"><span>${item.name}</span> <span>₱${parseFloat(item.price).toFixed(2)}</span></div>
        `).join('');
    }

    document.getElementById('cart-badge').innerText = `Cart: ${cart.length} items`;
    document.getElementById('checkout-btn').classList.toggle('hidden', cart.length === 0);
};

window.addToCart = (name) => { 
    const item = products.find(p => p.name === name);
    if(item) {
        cart.push(item); 
        window.render(); 
    }
};

window.filterCustomer = (cat) => {
    currentCategory = cat;
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === cat || (cat === 'All' && btn.innerText === 'All'));
    });
    window.render();
};

window.showReceipt = () => {
    const total = cart.reduce((s, item) => s + parseFloat(item.price), 0);
    document.getElementById('receipt-details').innerHTML = cart.map(item => `
        <div style="display:flex; justify-content:space-between;"><span>${item.name}</span><span>₱${parseFloat(item.price).toFixed(2)}</span></div>
    `).join('') + `<br><strong>TOTAL: ₱${total.toFixed(2)}</strong>`;
    document.getElementById('receipt-modal').classList.remove('hidden');
};

window.closeReceipt = () => { 
    if (cart.length > 0) {
        const total = cart.reduce((s, item) => s + parseFloat(item.price), 0);
        const newOrder = {
            items: cart.map(i => i.name),
            totalAmount: total,
            date: new Date().toLocaleString(),
            status: "Completed"
        };
        database.ref('stores/store_001/orders').push(newOrder);
    }
    cart = []; 
    document.getElementById('receipt-modal').classList.add('hidden'); 
    window.render(); 
};

window.continueShopping = () => {
    document.getElementById('receipt-modal').classList.add('hidden');
    window.render(); 
};

// Start the listener
database.ref('stores/store_001/inventory').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        products = Object.keys(data).map(key => ({
            name: key,
            ...data[key]
        }));
    } else {
        products = defaultItems;
    }
    window.render(); 
});