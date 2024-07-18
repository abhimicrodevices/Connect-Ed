const { invoke } = window.__TAURI__.tauri;

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  document.getElementById("closeButton").addEventListener("click", function() {
    console.log("Close button clicked, redirecting to login.html");
    window.location.href = "login.html";
  });

  document.querySelectorAll('.signup-form input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        console.log("Enter key pressed, form submission prevented");
      }
    });
  });

  

  document.querySelector(".signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submission prevented");

    const fullname = document.getElementById("fname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("pass").value.trim();

    if (!fullname || !email || !password) {
      alert("Please fill out all fields.");
      return;
    }

    const userData = {
      name: fullname,
      mail: email,
      pass: password
    };

    console.log("User data to be sent:", userData);

    try {
      await invoke("signup", { userData });
      console.log("User data sent to Rust:", userData);
      console.log("Redirecting to success.html");
      window.location.href = "success.html";
    } catch (error) {
      console.error("Failed to send user data to Rust:", error);
      alert("An error occurred during signup. Please try again.");
    }
  });
});
