// ===== GLOBAL VARIABLES =====
let users = JSON.parse(localStorage.getItem('users')) || [];
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  initializeCartSystem();
  initializeModals();
  initializeUserSystem();
  setupCategoryFilter();
  setupCardHoverEffects();
  setupScrollEffects();
  
  // Update UI elements
  updateCartCount();
  updateLoginButton();
});

// ===== CART SYSTEM =====
function initializeCartSystem() {
  // Update all cart count displays
  function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
      element.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    });
  }

  // Add item to cart
  function addToCart(productName, productPrice, productImage = '') {
    // Check if product already exists
    const existingItem = cart.find(item => 
      item.name === productName && item.price === productPrice
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: Date.now(),
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${productName} added to cart!`);
  }

  // Setup all add-to-cart buttons
  document.querySelectorAll('[onclick*="addToCart"]').forEach(button => {
    button.addEventListener('click', function() {
      const productName = this.getAttribute('data-name') || 
                         this.closest('.card').querySelector('.card-title').textContent;
      const productPrice = parseFloat(this.getAttribute('data-price'));
      const productImage = this.closest('.card').querySelector('img').src;
      
      addToCart(productName, productPrice, productImage);
    });
  });
}

// ===== MODAL SYSTEMS =====
function initializeModals() {
  // Show details modal
  const showModal = document.getElementById('showModal');
  if (showModal) {
    showModal.addEventListener('show.bs.modal', function(event) {
      const button = event.relatedTarget;
      const modal = this;
      
      ['title', 'year', 'genre', 'desc'].forEach(attr => {
        modal.querySelector(`#show${attr.charAt(0).toUpperCase() + attr.slice(1)}`).textContent = 
          button.getAttribute(`data-${attr}`);
      });

      modal.querySelector('#watchNowBtn').onclick = function() {
        const originalOnClick = button.getAttribute('onclick');
        if (originalOnClick && originalOnClick.includes('window.open')) {
          const url = originalOnClick.match(/window\.open\('([^']+)'/)[1];
          window.open(url, '_blank');
        }
      };
    });
  }

  // Contact form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast("Your message has been sent!");
      this.reset();
    });
  }
}

// ===== USER SYSTEM =====
function initializeUserSystem() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;

      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        loggedInUser = user;
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
        updateLoginButton();
        bootstrap.Modal.getInstance(loginForm.closest('.modal')).hide();
      } else {
        alert('Invalid credentials');
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('signupUsername').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
      }

      if (users.some(u => u.username === username)) {
        alert("Username already exists!");
        return;
      }

      users.push({ username, email, password });
      localStorage.setItem('users', JSON.stringify(users));
      alert("Account created! Please login.");
      bootstrap.Modal.getInstance(this.closest('.modal')).hide();
    });
  }
}

// ===== UI HELPERS =====
function updateLoginButton() {
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.textContent = loggedInUser ? loggedInUser.username : 'Login';
    loginBtn.classList.toggle('logged-in', !!loggedInUser);
  }
}

function showToast(message) {
  const toastEl = document.getElementById('cartToast');
  if (toastEl) {
    document.getElementById('toastMessage').textContent = message;
    new bootstrap.Toast(toastEl).show();
  }
}

// ===== PAGE-SPECIFIC SETUP =====
function setupCategoryFilter() {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.dataset.category;
      document.querySelectorAll('#products-container > div').forEach(item => {
        item.style.display = (category === 'all' || item.dataset.category === category) ? 'block' : 'none';
      });
    });
  });
}

function setupCardHoverEffects() {
  document.querySelectorAll('.card, .show-card, .movie-card, .product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.05)';
      card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
      card.style.boxShadow = 'none';
    });
  });
}

function setupScrollEffects() {
  window.addEventListener('scroll', () => {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ===== UTILITY FUNCTIONS =====
function redirectTo(url) {
  window.open(url, '_blank');
}
// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if it doesn't exist
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // Update cart count in navigation
    updateCartCount();

    // Add to cart buttons functionality
    setupAddToCartButtons();

    // Display cart items if on cart page
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }
});

function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            
            addToCart(productName, productPrice);
            showToast(`${productName} added to cart!`);
            updateCartCount();
        });
    });
}

function addToCart(name, price) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart text-center py-5">
                <i class="fas fa-shopping-cart fa-4x mb-3"></i>
                <h4>Your cart is empty</h4>
                <p>Browse our store to add items</p>
                <a href="store.html" class="btn btn-primary">Go to Store</a>
            </div>
        `;
        updateCartTotals();
        return;
    }
    
    let html = '';
    cart.forEach(item => {
        html += `
            <div class="cart-item mb-3 p-3 border rounded">
                <div class="row">
                    <div class="col-8">
                        <h5>${item.name}</h5>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary quantity-btn" data-name="${item.name}" data-action="decrease">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary quantity-btn" data-name="${item.name}" data-action="increase">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-4 text-end">
                        <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        <button class="btn btn-sm btn-danger remove-item" data-name="${item.name}">
                            <i class="fas fa-trash-alt"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-name');
            const action = this.getAttribute('data-action');
            updateQuantity(productName, action);
        });
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-name');
            removeFromCart(productName);
        });
    });
    
    updateCartTotals();
}

function updateQuantity(name, action) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const item = cart.find(item => item.name === name);
    
    if (item) {
        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartCount();
    }
}

function removeFromCart(name) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart = cart.filter(item => item.name !== name);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
    showToast('Item removed from cart');
}

function updateCartTotals() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5.99;
    const tax = subtotal * 0.1; // Assuming 10% tax
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('tax').textContent = tax.toFixed(2);
    document.getElementById('total-price').textContent = (subtotal + shipping + tax).toFixed(2);
}

function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    displayCartItems();
    updateCartCount();
    showToast('Cart cleared');
}

function showToast(message) {
    const toastElement = document.getElementById('cartToast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toastElement && toastMessage) {
        toastMessage.textContent = message;
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }
}