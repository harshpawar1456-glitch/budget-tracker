// auth.js
// Shared login helpers + the logic for login.html and register.html.
// Loaded in the <head> of index.html, login.html and register.html.
//
// TOKEN STORAGE: we keep the JWT in localStorage. It is simple and works with
// our plain-JavaScript setup, but ANY script running on this page (for example
// through an XSS bug) can read it. It is not safe from XSS. That is why
// script.js escapes user text before putting it in the page, and why tokens
// expire after 7 days. Production apps often use httpOnly cookies instead.

const TOKEN_KEY = "bt_token";
const USER_KEY = "bt_user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (e) {
    return null;
  }
}

function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function logout() {
  clearAuth();
  window.location.replace("/login.html");
}

// Use this instead of fetch() for every protected API call.
// It adds the Authorization header, and if the server says 401
// (missing, invalid or expired token) it logs the user out.
async function authFetch(url, options = {}) {
  const headers = Object.assign({}, options.headers, {
    Authorization: "Bearer " + getToken(),
  });

  const response = await fetch(url, Object.assign({}, options, { headers }));

  if (response.status === 401) {
    clearAuth();
    window.location.replace("/login.html");
    throw new Error("Session expired. Please log in again.");
  }

  return response;
}

// ---------- Page guards (run immediately, before the page draws) ----------

const page = document.documentElement.dataset.page; // "app", "login" or "register"

// Budget Tracker page: no token means no entry.
if (page === "app" && !getToken()) {
  window.location.replace("/login.html");
}

// Login/register pages: already logged in, so go to the tracker.
if ((page === "login" || page === "register") && getToken()) {
  window.location.replace("/index.html");
}

// ---------- Login / register forms ----------

function showAuthMessage(text) {
  const box = document.getElementById("authMessage");
  box.textContent = text;
  box.className = "message error";
}

// Sends the form data to the server, saves the token, opens the tracker.
async function submitAuth(endpoint, body, button) {
  button.disabled = true;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Something went wrong");

    saveAuth(data.token, data.user);
    window.location.replace("/index.html");
  } catch (error) {
    showAuthMessage(error.message);
    button.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (page === "login") {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        return showAuthMessage("Enter your email and password.");
      }

      submitAuth(
        "/api/auth/login",
        { email, password },
        loginForm.querySelector("button[type='submit']")
      );
    });
  }

  if (page === "register") {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirm = document.getElementById("confirmPassword").value;

      if (!name) return showAuthMessage("Enter your name.");
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return showAuthMessage("Enter a valid email address.");
      }
      if (password.length < 8) {
        return showAuthMessage("Password must be at least 8 characters.");
      }
      if (password !== confirm) {
        return showAuthMessage("Passwords do not match.");
      }

      submitAuth(
        "/api/auth/register",
        { name, email, password },
        registerForm.querySelector("button[type='submit']")
      );
    });
  }
});