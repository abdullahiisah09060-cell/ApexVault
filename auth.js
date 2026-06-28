
// auth.js
async function registerUser(email, password, fullName) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('users').doc(userCredential.user.uid).set({
      fullName,
      email,
      balance: 200000, // Welcome bonus
      createdAt: new Date()
    });
    return userCredential.user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function loginUser(email, password) {
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  return userCredential.user;
}

auth.onAuthStateChanged(user => {
  if (user) {
    if (user.email === "liger4683@gmail.com") {
      window.location.href = 'admin-dashboard.html';
    }
  }
});
