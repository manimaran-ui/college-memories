import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Check authentication status using Firebase Auth Listener
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split("/").pop();

    // Do not redirect if already on login page
    if (pageName === "admin-login.html" || pageName === "login.html") {
        return;
    }

    // Redirect unauthenticated users to admin-login.html
    if (!user) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isAdminLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userUID");
        window.location.href = "admin-login.html";
    } else {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdminLoggedIn", "true");
    }
});