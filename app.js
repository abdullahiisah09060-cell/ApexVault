
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Registration Handler
const regForm = document.getElementById('registerForm');
if(regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('fullName').value;
        const refCode = document.getElementById('refCode').value;

        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", cred.user.uid), { fullName, email, balance: 0, refCode: refCode });
            await sendEmailVerification(cred.user);
            window.location.href = "verify.html";
        } catch (err) { alert(err.message); }
    });
}

// Google Handler
const googleBtn = document.getElementById('googleBtn');
if(googleBtn) {
    googleBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        window.location.href = "welcome.html";
    });
}
