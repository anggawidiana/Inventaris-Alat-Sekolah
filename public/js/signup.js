document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const messageEl = document.getElementById("message");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Mencegah form submit secara default

    // Validasi sisi klien: cek apakah password cocok
    if (passwordInput.value !== confirmPasswordInput.value) {
      messageEl.textContent = "Password dan konfirmasi password tidak cocok.";
      messageEl.className = "text-center text-sm mt-4 text-red-600";
      return; // Hentikan proses jika tidak cocok
    }

    // Mengambil data dari form (hanya email dan password)
    const data = {
      email: document.getElementById("email").value,
      password: passwordInput.value,
    };

    // Mengatur pesan ke loading
    messageEl.textContent = "Mendaftarkan...";
    messageEl.className = "text-center text-sm mt-4 text-gray-600";

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        messageEl.textContent = result.message;
        messageEl.className = "text-center text-sm mt-4 text-green-600";
        // Arahkan ke halaman login setelah 2 detik
        setTimeout(() => {
          window.location.href = "/login.html";
        }, 2000);
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
