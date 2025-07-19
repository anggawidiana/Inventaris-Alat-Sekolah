document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const messageEl = document.getElementById("message");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Mencegah form submit secara default

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    messageEl.textContent = "Memproses...";
    messageEl.className = "text-center text-sm mt-4 text-gray-600";

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        messageEl.textContent = "Login berhasil! Mengalihkan...";
        messageEl.className = "text-center text-sm mt-4 text-green-600";

        // Menggunakan redirectTo dari respons server
        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        } else {
          // Fallback jika redirectTo tidak ada (seharusnya tidak terjadi)
          window.location.href = "/"; // Arahkan ke root
        }
      } else {
        messageEl.textContent = result.message;
        messageEl.className = "text-center text-sm mt-4 text-red-600";
      }
    } catch (error) {
      console.error("Error:", error);
      messageEl.textContent = "Tidak dapat terhubung ke server.";
      messageEl.className = "text-center text-sm mt-4 text-red-600";
    }
  });
});
