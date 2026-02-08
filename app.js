// Product Data
const products = {
    vegetables: [
        { id: 1, name: 'Tomato', price: 40, icon: '🍅', unit: 'per kg' },
        { id: 2, name: 'Potato', price: 30, icon: '🥔', unit: 'per kg' },
        { id: 3, name: 'Onion', price: 35, icon: '🧅', unit: 'per kg' },
        { id: 4, name: 'Carrot', price: 50, icon: '🥕', unit: 'per kg' },
        { id: 5, name: 'Cabbage', price: 25, icon: '🥬', unit: 'per piece' },
        { id: 6, name: 'Broccoli', price: 80, icon: '🥦', unit: 'per kg' },
        { id: 7, name: 'Bell Pepper', price: 60, icon: '🫑', unit: 'per kg' },
        { id: 8, name: 'Cucumber', price: 35, icon: '🥒', unit: 'per kg' }
    ],
    fruits: [
        { id: 9, name: 'Apple', price: 120, icon: '🍎', unit: 'per kg' },
        { id: 10, name: 'Banana', price: 50, icon: '🍌', unit: 'per dozen' },
        { id: 11, name: 'Orange', price: 80, icon: '🍊', unit: 'per kg' },
        { id: 12, name: 'Mango', price: 150, icon: '🥭', unit: 'per kg' },
        { id: 13, name: 'Grapes', price: 100, icon: '🍇', unit: 'per kg' },
        { id: 14, name: 'Watermelon', price: 30, icon: '🍉', unit: 'per kg' },
        { id: 15, name: 'Strawberry', price: 200, icon: '🍓', unit: 'per kg' },
        { id: 16, name: 'Pineapple', price: 60, icon: '🍍', unit: 'per piece' }
    ],
    groceries: [
        { id: 17, name: 'Rice', price: 60, icon: '🍚', unit: 'per kg' },
        { id: 18, name: 'Wheat Flour', price: 45, icon: '🌾', unit: 'per kg' },
        { id: 19, name: 'Cooking Oil', price: 150, icon: '🛢️', unit: 'per liter' },
        { id: 20, name: 'Sugar', price: 50, icon: '🍬', unit: 'per kg' },
        { id: 21, name: 'Salt', price: 20, icon: '🧂', unit: 'per kg' },
        { id: 22, name: 'Tea', price: 250, icon: '☕', unit: 'per kg' },
        { id: 23, name: 'Milk', price: 60, icon: '🥛', unit: 'per liter' },
        { id: 24, name: 'Bread', price: 40, icon: '🍞', unit: 'per loaf' }
    ]
};

// LocalStorage Database (Simple implementation without Firebase setup requirements)
class Database {
    constructor() {
        this.usersKey = 'grocery_users';
        this.loginHistoryKey = 'login_history';
        this.currentUserKey = 'current_user';
    }

    // Get all users
    getUsers() {
        const users = localStorage.getItem(this.usersKey);
        return users ? JSON.parse(users) : [];
    }

    // Save users
    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    // Register new user
    registerUser(userData) {
        const users = this.getUsers();
        
        // Check if mobile number already exists
        const existingUser = users.find(u => u.mobile === userData.mobile);
        if (existingUser) {
            throw new Error('Mobile number already registered');
        }

        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            mobile: userData.mobile,
            email: userData.email,
            password: userData.password, // In production, this should be hashed
            registeredAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }

    // Login user
    loginUser(mobile, password) {
        const users = this.getUsers();
        const user = users.find(u => u.mobile === mobile && u.password === password);
        
        if (!user) {
            throw new Error('Invalid mobile number or password');
        }

        // Save login history
        this.saveLoginHistory(user);
        
        // Set current user
        localStorage.setItem(this.currentUserKey, JSON.stringify({
            id: user.id,
            name: user.name,
            mobile: user.mobile,
            email: user.email
        }));

        return user;
    }

    // Save login history
    saveLoginHistory(user) {
        const history = this.getLoginHistory();
        history.push({
            userId: user.id,
            mobile: user.mobile,
            name: user.name,
            loginTime: new Date().toISOString()
        });
        localStorage.setItem(this.loginHistoryKey, JSON.stringify(history));
    }

    // Get login history
    getLoginHistory() {
        const history = localStorage.getItem(this.loginHistoryKey);
        return history ? JSON.parse(history) : [];
    }

    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem(this.currentUserKey);
        return user ? JSON.parse(user) : null;
    }

    // Logout
    logout() {
        localStorage.removeItem(this.currentUserKey);
    }
}

// Initialize database
const db = new Database();

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Landing Page Navigation
document.getElementById('goto-login-main').addEventListener('click', () => {
    showPage('login-page');
});

document.getElementById('goto-register-main').addEventListener('click', () => {
    showPage('registration-page');
});

document.getElementById('goto-forgot-main').addEventListener('click', () => {
    showPage('forgot-password-page');
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Registration Form
document.getElementById('registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    try {
        db.registerUser({ name, mobile, email, password });
        showNotification('Registration successful! Please login.');
        document.getElementById('registration-form').reset();
        showPage('login-page');
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Login Form
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const mobile = document.getElementById('login-mobile').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const user = db.loginUser(mobile, password);
        showNotification(`Welcome back, ${user.name}!`);
        document.getElementById('login-form').reset();
        loadHomePage();
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Forgot Password Form
document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const mobile = document.getElementById('forgot-mobile').value.trim();
    const newPassword = document.getElementById('forgot-new-password').value;
    const confirmPassword = document.getElementById('forgot-confirm-password').value;

    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    try {
        const users = db.getUsers();
        const userIndex = users.findIndex(u => u.mobile === mobile);
        
        if (userIndex === -1) {
            showNotification('Mobile number not found', 'error');
            return;
        }

        // Update password
        users[userIndex].password = newPassword;
        db.saveUsers(users);
        
        showNotification('Password reset successful! Please login with new password.');
        document.getElementById('forgot-password-form').reset();
        showPage('login-page');
    } catch (error) {
        showNotification('Error resetting password', 'error');
    }
});

// Load Home Page
function loadHomePage() {
    const user = db.getCurrentUser();
    if (!user) {
        showPage('login-page');
        return;
    }

    document.getElementById('user-name').textContent = user.name;
    showPage('home-page');
}

// Category Click Handler
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        loadProducts(category);
    });
});

// Load Products
function loadProducts(category) {
    const productGrid = document.getElementById('product-grid');
    const categoryTitle = document.getElementById('category-title');
    
    categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    
    productGrid.innerHTML = '';
    
    products[category].forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-icon">${product.icon}</div>
            <h4>${product.name}</h4>
            <div class="product-price">₹${product.price}</div>
            <p>${product.unit}</p>
            <button class="btn-add" data-id="${product.id}">Add to Cart</button>
        `;
        productGrid.appendChild(productCard);
    });

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const product = Object.values(products).flat().find(p => p.id == productId);
            showNotification(`${product.name} added to cart!`);
        });
    });

    showPage('product-page');
}

// Navigation Links
document.getElementById('goto-login').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('login-page');
});

document.getElementById('goto-register').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('registration-page');
});

document.getElementById('goto-forgot-login').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('forgot-password-page');
});

document.getElementById('goto-login-forgot').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('login-page');
});

// Back to Main Page Links
document.getElementById('back-to-main-reg').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('landing-page');
});

document.getElementById('back-to-main-login').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('landing-page');
});

document.getElementById('back-to-main-forgot').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('landing-page');
});

document.getElementById('back-btn').addEventListener('click', () => {
    showPage('home-page');
});

// Logout Buttons
document.getElementById('logout-btn').addEventListener('click', () => {
    db.logout();
    showNotification('Logged out successfully');
    showPage('landing-page');
});

document.getElementById('logout-btn-2').addEventListener('click', () => {
    db.logout();
    showNotification('Logged out successfully');
    showPage('landing-page');
});

// Check if user is already logged in
window.addEventListener('load', () => {
    const user = db.getCurrentUser();
    if (user) {
        loadHomePage();
    } else {
        showPage('landing-page');
    }
});
