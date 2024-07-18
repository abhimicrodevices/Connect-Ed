const { invoke } = window.__TAURI__.tauri;

document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordForm = document.querySelector(".forgot-password-form");
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            var email = document.getElementById("email").value;
            var resetData = {
                email: email
            };
            try {
                if (!email) {
                    throw new Error("Email address is required.");
                }
    
                // Invoke the 'forgot_password' command in Rust with the correct data structure
                await invoke("forgot_password", resetData);
                alert("Password reset link sent to your email!");
                // Redirect to login page or any other appropriate action
                window.location.href = "login.html";
                console.log("Password reset request sent to Rust:", resetData);
            } catch (error) {
                console.error("Failed to send password reset request to Rust:", error);
            }
        });
    } else {
        console.error("Forgot password form not found.");
    }
});
