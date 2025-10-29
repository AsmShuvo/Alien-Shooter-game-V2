// This script handles user registration, login, and form interactions.
(function () {
  // Simple shortcuts for selecting elements
  const $ = (s) => document.querySelector(s),
    $$ = (s) => document.querySelectorAll(s);

  // Get all the elements we need from the page
  const tabReg = $("#tab-register"),
    tabLogin = $("#tab-login");
  const formReg = $("#form-register"),
    formLogin = $("#form-login");
  const regError = $("#regError"),
    loginError = $("#loginError");

  // Helper to load users from local storage
  function loadUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
  }
  // Helper to save users to local storage
  function saveUsers(u) {
    localStorage.setItem("users", JSON.stringify(u));
  }

  // Handle switching between register and login tabs
  tabReg.addEventListener("click", () => {
    tabReg.classList.add("active");
    tabLogin.classList.remove("active");
    formReg.classList.remove("hidden");
    formLogin.classList.add("hidden");
  });
  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabReg.classList.remove("active");
    formLogin.classList.remove("hidden");
    formReg.classList.add("hidden");
  });

  // Handle the registration form submission
  formReg.addEventListener("submit", (e) => {
    e.preventDefault();
    regError.textContent = "";
    const name = $("#regName").value.trim();
    const phone = $("#regPhone").value.trim();
    const email = $("#regEmail").value.trim().toLowerCase();
    const pw = $("#regPassword").value;

    // --- Start Validation ---
    if (!name || !phone || !email || !pw) {
      regError.textContent = "All fields are required.";
      return;
    }
    if (name.length < 2) {
      regError.textContent = "Full name must be at least 2 characters.";
      return;
    }

    // Check for a valid UK phone number format
    const ukPhoneRegex =
      /^((0|44|\+44|\+44\s*\(0\)|\+44\s*0)\s*)?7(\s*[0-9]){9}$/;
    if (!ukPhoneRegex.test(phone)) {
      regError.textContent = "Please enter a valid UK mobile number.";
      return;
    }

    // Check for a valid email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      regError.textContent = "Please enter a valid email address.";
      return;
    }

    // Check for password strength
    if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}/.test(pw)) {
      regError.textContent =
        "Password must contain at least one letter, one number, and one special character.";
      return;
    }

    const users = loadUsers();
    // Check if the email is already in use
    if (users.find((u) => u.email === email)) {
      regError.textContent = "This email is already registered.";
      return;
    }
    // --- End Validation ---

    // If all checks pass, add the new user and save
    users.push({ name, phone, email, password: pw, highscore: 0 });
    saveUsers(users);

    // Switch to login tab
    tabLogin.classList.add("active");
    tabReg.classList.remove("active");
    formLogin.classList.remove("hidden");
    formReg.classList.add("hidden");

    // Pre-fill email and show success message
    $("#loginEmail").value = email;
    loginError.textContent =
      "Registration successful! Please log in to continue.";
    loginError.className = "success"; // Use success style
    $("#loginPassword").focus(); // Focus password field
  });

  // Handle the login form submission
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.textContent = "";
    const email = $("#loginEmail").value.trim().toLowerCase();
    const pw = $("#loginPassword").value;
    const users = loadUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      loginError.textContent = "No account found";
      return;
    }
    if (user.password !== pw) {
      loginError.textContent = "Incorrect password";
      return;
    }
    localStorage.setItem("currentUser", email);
    window.location.href = "game.html";
  });

  // Prevent non-logged-in users from clicking "Play"
  $$('a[href="game.html"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (!localStorage.getItem("currentUser")) {
        e.preventDefault();
        const authError = $("#authError");
        if (authError) {
          authError.textContent = "Please register or log in to play the game.";
        }
      }
    });
  });
})();
