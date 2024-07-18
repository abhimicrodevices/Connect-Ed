const { invoke } = window.__TAURI__.tauri;
window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".login").addEventListener("submit", async (e) => {
      e.preventDefault();
      var username = document.getElementById("user").value;
      var passw= document.getElementById("pass1").value;
      var loginData = {
        user: username,
        pass:passw
      };
      try {
        // Invoke the 'signup' command in Rust with the user data
        await invoke("login", { loginData: loginData });
        //window.location.href="online.html";
        window.location.href="connect.html";
        console.log("Login data sent to Rust:", loginData);
      } catch (error) {
        console.error("Failed to send login data to Rust:", error);
      }
    });
});




























