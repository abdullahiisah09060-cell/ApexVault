// app.js
import { auth, db, doc, onSnapshot } from "./firebase-config.js";

// CSS Injection for Global Styles & Toast UI
const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
:root {
  --bg: #06080f; --bg2: #0b0f1a; --bg3: #121726;
  --blue: #1d4ed8; --blue2: #3b82f6; --gold: #d4af37;
  --text: #eef0f4; --muted: #64748b; --green: #22c55e; --red: #ef4444;
  --border: rgba(255,255,255,0.06);
}
* { margin:0; padding:0; box-sizing:border-box; font-family:'Inter', sans-serif; }
body { background: var(--bg); color: var(--text); line-height: 1.6; }
a { text-decoration: none; color: inherit; }
button { cursor: pointer; border: none; outline: none; }

/* Toast Styling */
#toast-box { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
.toast-msg { 
    background: var(--bg2); border: 1px solid var(--border); padding: 15px 25px; 
    border-radius: 12px; display: flex; align-items: center; gap: 12px; color: white;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: toastIn 0.4s ease forwards;
}
.toast-msg.success i { color: var(--green); }
.toast-msg.error i { color: var(--red); }
.toast-msg.hide { animation: toastOut 0.4s ease forwards; }
@keyframes toastIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }
@keyframes toastOut { to { transform: translateX(100%); opacity:0; } }

/* Shared Layouts */
.mobile-nav { 
    position: fixed; bottom: 0; left: 0; right: 0; height: 70px; background: rgba(11, 15, 26, 0.95);
    backdrop-filter: blur(10px); border-top: 1px solid var(--border); display: flex;
    justify-content: space-around; align-items: center; z-index: 1000;
}
.nav-item { color: var(--muted); display: flex; flex-direction: column; align-items: center; font-size: 10px; gap: 4px; }
.nav-item.active { color: var(--blue2); }
.nav-item i { font-size: 20px; }

@media (min-width: 768px) {
    .mobile-nav { top: 0; bottom: auto; left: 0; width: 260px; height: 100vh; flex-direction: column; justify-content: flex-start; padding: 40px 20px; }
}
`;
const sheet = document.createElement('style');
sheet.textContent = globalStyles;
document.head.appendChild(sheet);

// Auth Guard & Realtime User Listener
auth.onAuthStateChanged(user => {
    const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('register') || window.location.pathname.includes('index');
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                const u = snap.data();
                window.currentUser = u;
                document.querySelectorAll('.balance-text').forEach(el => el.innerText = new Intl.NumberFormat('en-NG', {style:'currency', currency:'NGN'}).format(u.balance));
            }
        });
        if (isAuthPage && !window.location.pathname.includes('index')) window.location.href = 'dashboard.html';
    } else {
        if (!isAuthPage) window.location.href = 'login.html';
    }
});
