// app.js
import { auth, db, doc, onSnapshot, toast } from "./firebase-config.js";

// Global CSS Injection (to ensure Toast and Base layout works everywhere)
const style = document.createElement('style');
style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    :root {
        --bg: #06080f; --bg2: #0b0f1a; --bg3: #0f1422;
        --blue: #1d4ed8; --blue2: #3b82f6; --gold: #d4af37;
        --text: #eef0f4; --muted: #5e6980; --green: #22c55e; --red: #ef4444;
        --border: rgba(255,255,255,0.07);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background: var(--bg); color: var(--text); -webkit-tap-highlight-color: transparent; }
    
    #toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
    .toast { 
        padding: 14px 24px; border-radius: 12px; background: var(--bg2); border: 1px solid var(--border);
        color: white; display: flex; align-items: center; gap: 12px; min-width: 280px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideIn 0.3s ease-out; transition: 0.5s; pointer-events: auto;
    }
    .toast.success { border-left: 4px solid var(--green); }
    .toast.error { border-left: 4px solid var(--red); }
    .toast.warning { border-left: 4px solid var(--gold); }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    .loader-overlay { position: fixed; inset: 0; background: var(--bg); z-index: 10000; display: flex; align-items: center; justify-content: center; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

// Page Loader
const showLoader = () => {
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.id = 'page-loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
};

const hideLoader = () => {
    const loader = document.getElementById('page-loader');
    if (loader) loader.remove();
};

// Global Auth Observer
auth.onAuthStateChanged(async (user) => {
    const path = window.location.pathname;
    const publicPages = ['/', '/index.html', '/login.html', '/register.html', '/forgot-password.html', '/terms.html', '/privacy.html', '/investment-plans.html'];
    const isPublic = publicPages.some(p => path.endsWith(p));

    if (user) {
        if (path.endsWith('login.html') || path.endsWith('register.html')) {
            window.location.href = 'dashboard.html';
        }
        
        // Real-time Balance/Role Listener
        onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.role === 'admin' && path.endsWith('dashboard.html')) {
                    // Option to switch to admin dashboard
                }
                // Update UI elements with class 'user-balance'
                document.querySelectorAll('.user-balance').forEach(el => {
                    el.innerText = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(data.balance);
                });
            }
        });
    } else {
        if (!isPublic) {
            window.location.href = 'login.html';
        }
    }
});

// Mobile Nav Toggle
window.toggleMenu = () => {
    const nav = document.getElementById('side-nav');
    if(nav) nav.classList.toggle('open');
};
