import { auth } from "./firebase.js";
import { 
    signInWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/**
 * Login Function
 * Reads email and password, attempts Firebase signInWithEmailAndPassword,
 * handles error/success states and redirects to index.html on success.
 */
window.login = async function() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const msg = document.getElementById("msg");
    const loader = document.getElementById("loader");

    if (!emailInput || !passwordInput || !msg) {
        console.error("Required login elements (email, password, or msg) not found.");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    msg.innerText = "";
    msg.style.color = "#ff4d4d"; // Red color for errors

    if (email === "") {
        msg.innerText = "Please enter email";
        return;
    }

    if (password === "") {
        msg.innerText = "Please enter password";
        return;
    }

    if (loader) loader.style.display = "block";

    try {
        // Firebase Authentication Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save Login Status in LocalStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("adminUID", user.uid);
        localStorage.setItem("userEmail", user.email || email);

        msg.style.color = "#4CAF50"; // Green color for success
        msg.innerText = "Login Success";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);

    } catch (error) {
        console.error("Login Error:", error);

        let errorMessage = "Invalid Email or Password";
        if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email format";
        } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            errorMessage = "Invalid Email or Password";
        } else if (error.code === "auth/too-many-requests") {
            errorMessage = "Too many failed attempts. Try again later.";
        }

        msg.innerText = errorMessage;
    } finally {
        if (loader) loader.style.display = "none";
    }
};

/**
 * Logout Function
 * Performs Firebase signOut, clears localStorage, and redirects to admin-login.html.
 */
window.logout = async function() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
    } finally {
        localStorage.clear();
        window.location.href = "admin-login.html";
    }
};

/**
 * Password Visibility Toggle Helper
 */
window.togglePassword = function() {
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");
    if (!passwordInput) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        if (eyeIcon) eyeIcon.className = "fas fa-eye-slash";
    } else {
        passwordInput.type = "password";
        if (eyeIcon) eyeIcon.className = "fas fa-eye";
    }
};

// Aliases for global accessibility
window.loginUser = window.login;
window.logoutUser = window.logout;