// firebase-config.js - Core Engine & Helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification, 
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    serverTimestamp, 
    increment,
    limit,
    getDocs
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

// --- UTILITIES ---

// Toast System
const toast = (message, type = 'success') => {
    const container = document.getElementById('toast-container') || createToastContainer();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 500);
    }, 4000);
};

function createToastContainer() {
    const div = document.createElement('div');
    div.id = 'toast-container';
    document.body.appendChild(div);
    return div;
}

// Formatting
const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
    }).format(amount);
};

const timeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((new Date() - timestamp.toDate()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

// --- DATA HELPERS ---

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

const updateBalance = async (uid, amount) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        balance: increment(amount)
    });
};

// Paystack Helper
const payWithPaystack = ({ email, amount, onSuccess }) => {
    const handler = PaystackPop.setup({
        key: 'pk_test_914662bcd8cdc4c28bfbdeb8f48653dbf00c595a',
        email,
        amount: Math.round(amount * 100),
        currency: 'NGN',
        ref: 'BP_' + Date.now() + '_' + Math.random().toString(36).substr(2,9),
        callback: (response) => onSuccess(response),
        onClose: () => toast('Transaction cancelled by user', 'warning')
    });
    handler.openIframe();
};

export { 
    auth, db, googleProvider, signInWithPopup, createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail,
    doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, orderBy, 
    onSnapshot, serverTimestamp, increment, limit, getDocs,
    toast, formatNaira, timeAgo, logTransaction, notifyUser, updateBalance, payWithPaystack 
};
