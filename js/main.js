import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Event binding for Logout buttons across all pages
document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.renderUserRoleUI === "function") {
        window.renderUserRoleUI();
    }
    const logoutBtns = document.querySelectorAll("#logout-btn, .logout-btn");
    logoutBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof window.logout === "function") {
                window.logout();
            } else {
                localStorage.removeItem("isAdminLoggedIn");
                localStorage.removeItem("userEmail");
                window.location.href = "login.html";
            }
        });
    });
});

// Auth state observer for UI controls
onAuthStateChanged(auth, (user) => {
    const adminButtons = document.querySelectorAll(".admin-action, .admin-only");

    if (user && (localStorage.getItem("isAdminLoggedIn") === "true" || localStorage.getItem("isLoggedIn") === "true")) {
        adminButtons.forEach(btn => {
            btn.style.display = "block";
        });
    } else {
        adminButtons.forEach(btn => {
            btn.style.display = "none";
        });
    }
});