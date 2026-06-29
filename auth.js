// auth.js
import { 
    auth, db, googleProvider, doc, getDoc, setDoc, collection, query, where, getDocs, 
    updateDoc, increment, serverTimestamp, toast, logTransaction, notifyUser 
} from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    signInWithPopup, signOut, sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const WELCOME_BONUS = 200000;
const REFERRAL_BONUS = 2000;

// Register Flow
window.registerUser = async (fullName, email, phone, password, refCode = "") => {
    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // Generate personal ref code
        const myRefCode = fullName.split(' ')[0].toUpperCase() + Math.floor(1000 + Math.random() * 9000);
        
        const userData = {
            uid: user.uid,
            email: email,
            displayName: fullName,
            phone: phone,
            photoBase64: "",
            balance: WELCOME_BONUS,
            totalDeposited: 0,
            totalInvested: 0,
            totalWithdrawn: 0,
            totalEarned: 0,
            referralCode: myRefCode,
            referredBy: refCode,
            referralCount: 0,
            referralEarnings: 0,
            role: "user",
            kycStatus: "unverified",
            isActive: true,
            agentName: ["Sarah Mitchell", "David Osei", "Amara Nwosu"][Math.floor(Math.random() * 3)],
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp()
        };

        await setDoc(doc(db, "users", user.uid), userData);

        // Handle Referral logic
        if (refCode) {
            const q = query(collection(db, "users"), where("referralCode", "==", refCode));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const referrerId = snap.docs[0].id;
                await updateDoc(doc(db, "users", referrerId), {
                    balance: increment(REFERRAL_BONUS),
                    referralCount: increment(1),
                    referralEarnings: increment(REFERRAL_BONUS)
                });
                await logTransaction(referrerId, 'referral', REFERRAL_BONUS, `Bonus for inviting ${fullName}`);
                await notifyUser(referrerId, 'New Referral!', `You earned ${REFERRAL_BONUS} from ${fullName}`, 'success');
            }
        }

        await logTransaction(user.uid, 'bonus', WELCOME_BONUS, 'Welcome Bonus');
        await sendEmailVerification(user);
        return { success: true };
    } catch (e) {
        toast(e.message, 'error');
        return { success: false };
    }
};

// Login Flow
window.loginUser = async (email, password) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        if (!res.user.emailVerified) return { verified: false };
        return { success: true, verified: true };
    } catch (e) {
        toast(e.message, 'error');
        return { success: false };
    }
};

// Google Auth logic
window.continueWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists()) {
            const myRefCode = user.displayName.split(' ')[0].toUpperCase() + Math.floor(1000 + Math.random() * 9000);
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                balance: WELCOME_BONUS,
                referralCode: myRefCode,
                role: "user",
                kycStatus: "unverified",
                isActive: true,
                createdAt: serverTimestamp()
            });
            await logTransaction(user.uid, 'bonus', WELCOME_BONUS, 'Welcome Bonus');
        }
        window.location.href = 'dashboard.html';
    } catch (e) {
        toast(e.message, 'error');
    }
};

window.logoutUser = () => signOut(auth).then(() => window.location.href = 'login.html');
