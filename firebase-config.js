// firebase-config.js - The Core Engine
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, 
    query, where, orderBy, onSnapshot, serverTimestamp, increment, limit, getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJlOQ4vgvuJPzE6ZG56aFxAtX0PSxvOtI",
    authDomain: "apexvault-investment.firebaseapp.com",
    projectId: "apexvault-investment",
    storageBucket: "apexvault-investment.firebasestorage.app",
    messagingSenderId: "884037084154",
    appId: "1:884037084154:web:b9ca0de1293527d38afa43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- UI UTILITIES ---

// Toast Notification System (Pure CSS/JS)
const toast = (message, type = 'success') => {
    let container = document.getElementById('toast-box');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-box';
        document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = `toast-msg ${type}`;
    t.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(t);
    setTimeout(() => {
        t.classList.add('hide');
        setTimeout(() => t.remove(), 500);
    }, 4000);
};

// Formatting Functions
const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(amount);
};

const timeAgo = (date) => {
    if (!date) return '...';
    const seconds = Math.floor((new Date() - date.toDate()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toDate().toLocaleDateString();
};

// --- DATABASE HELPERS ---

const logTransaction = async (uid, type, amount, description, status = 'completed', meta = {}) => {
    await addDoc(collection(db, "transactions"), {
        uid, type, amount, description, status, meta,
        createdAt: serverTimestamp()
    });
};

const notifyUser = async (uid, title, message, type = 'info') => {
    await addDoc(collection(db, "notifications"), {
        uid, title, message, type, read: false,
        createdAt: serverTimestamp()
    });
};

const updateLeaderboard = async (uid, displayName, totalInvested) => {
    await setDoc(doc(db, "leaderboard", uid), {
        uid, displayName, totalInvested, updatedAt: serverTimestamp()
    }, { merge: true });
};

// --- PAYSTACK INTEGRATION ---

const payWithPaystack = ({ email, amount, onSuccess }) => {
    const handler = PaystackPop.setup({
        key: 'pk_test_914662bcd8cdc4c28bfbdeb8f48653dbf00c595a',
        email,
        amount: Math.round(amount * 100), // convert to kobo
        currency: 'NGN',
        ref: 'BP_' + Math.floor((Math.random() * 100000000
