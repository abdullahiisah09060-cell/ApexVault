// auth.js
import { 
    auth, db, googleProvider, signInWithPopup, createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, signOut, sendEmailVerification, doc, getDoc, 
    setDoc, serverTimestamp, toast, logTransaction, notifyUser 
} from "./firebase-config.js";

// Constants
const WELCOME_BONUS = 200000;
const REFERRAL_BONUS = 2000;

// Registration Logic
window.registerUser = async (email, password, fullName, phone, refCode = "") => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Generate personal referral code
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
            welcomeBonusPaid: true,
            agentName: ["Sarah Mitchell", "David Osei", "Amara Nwosu", "James Adeleke"][Math.floor(Math.random() * 4)],
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp()
        };

        await setDoc(doc(db, "users", user.uid), userData);

        // Handle Referral logic if code exists
        if (refCode) {
            const q = query(collection(db, "users"), where("referralCode", "==", refCode));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const referrer = querySnapshot.docs[0];
                await updateDoc(doc(db, "users", referrer.id), {
                    balance: increment(REFERRAL_BONUS),
                    referralCount: increment(1),
                    referralEarnings: increment(REFERRAL_BONUS)
                });
                await logTransaction(referrer.id, 'referral', REFERRAL_BONUS, `Referral bonus for ${fullName}`);
                await notifyUser(referrer.id, 'Referral Bonus!', `You earned ${REFERRAL_BONUS} for referring ${fullName}`, 'success');
            }
        }

        await logTransaction(user.uid, 'bonus', WELCOME_BONUS, 'Registration Welcome Bonus');
        await sendEmailVerification(user);
        
        return { success: true };
    } catch (error) {
        toast(error.message, 'error');
        return { success: false, error };
    }
};

// Login Logic
window.loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
            return { success: true, verified: false };
        }
        return { success: true, verified: true };
    } catch (error) {
        toast(error.message, 'error');
        return { success: false, error };
    }
};

// Google Auth logic
window.signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists()) {
            // New Google User - Create Profile
            const myRefCode = user.displayName.split(' ')[0].toUpperCase() + Math.floor(1000 + Math.random() * 9000);
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                phone: "",
                photoBase64: user.photoURL || "",
                balance: WELCOME_BONUS,
                totalDeposited: 0,
                totalInvested: 0,
                totalWithdrawn: 0,
                totalEarned: 0,
                referralCode: myRefCode,
                referredBy: "",
                referralCount: 0,
                referralEarnings: 0,
                role: "user",
                kycStatus: "unverified",
                isActive: true,
                welcomeBonusPaid: true,
                agentName: "Sarah Mitchell",
                createdAt: serverTimestamp(),
                lastSeen: serverTimestamp()
            });
            await logTransaction(user.uid, 'bonus', WELCOME_BONUS, 'Registration Welcome Bonus');
        }
        window.location.href = "dashboard.html";
    } catch (error) {
        toast(error.message, 'error');
    }
};

// Logout
window.logoutUser = async () => {
    await signOut(auth);
    window.location.href = "login.html";
};
