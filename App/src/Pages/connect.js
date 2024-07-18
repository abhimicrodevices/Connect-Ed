const { invoke } = window.__TAURI__.tauri;

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("submit-button").addEventListener("click", async (e) => {
        e.preventDefault();
        const inviteDetails = document.getElementById("invite-details").value;

        try {
            const result = await invoke("receive_invitation", { inviteDetails });
            console.log("Invitation details sent to Rust backend:", result);
            alert(result);
            window.location.href = 'welcome.html';
        } catch (error) {
            console.error("Failed to send invitation details to Rust backend:", error);
            alert("Failed to send invitation: " + error);
        }
    });
    document.querySelector(".button").addEventListener("click", async () => {
        try {
            const response = await invoke("download_invitation");
            console.log("Invitation details downloaded:", response);
            alert("Invitation details downloaded. Check your file system.");
        } catch (error) {
            console.error("Failed to download invitation details:", error);
            alert("Failed to download invitation details: " + error);
        }
    });
});