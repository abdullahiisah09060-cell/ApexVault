// auth.js
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const registerUser = async (email, password, fullName, referralCode = "") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        balance: 0,
        referralCode: Math.random().toString(36).substring(7).toUpperCase(),
        referredBy: referralCode,
        createdAt: new Date().toISOString()
    });

    await sendEmailVerification(user);
    return user;
};

export const googleAuth = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Logic for Google users: Skip verification check
    window.location.href = "welcome.html";
};
