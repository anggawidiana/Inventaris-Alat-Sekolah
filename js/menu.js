// --- Elemen DOM ---
// Ambil semua elemen yang diperlukan dari DOM sekali di awal untuk kejelasan dan efisiensi.
const toggleButton = document.getElementById("toggle-sidebar-btn");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content"); // Pastikan ini digunakan jika perlu
const searchBtn = document.getElementById("search-btn");
const searchBar = document.getElementById("search-bar");
const addButton = document.getElementById("add-button");
const closeModalBtn = document.getElementById("closeModalBtn");
const cardForm = document.getElementById("card-form"); // Ini diasumsikan adalah modal overlay

// --- Fungsionalitas Sidebar & Hamburger Menu ---
// Tambahkan event listener untuk tombol hamburger
toggleButton.addEventListener("click", (e) => {
  sidebar.classList.toggle("hidden"); // Toggle sidebar visibility
  e.stopPropagation(); // Mencegah event bubbling
  if (window.innerWidth < 640) {
    sidebar.classList.toggle("-translate-x-[100vh]");
  }
});

// Mencegah sidebar tertutup ketika mengklik di dalamnya
sidebar.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Menutup sidebar saat mengklik di luar untuk layar mobile
document.addEventListener("click", () => {
  if (window.innerWidth < 640) {
    if (!sidebar.classList.contains("-translate-x-[100vh]")) {
      sidebar.classList.add("-translate-x-[100vh]");
    }
  }
});

// --- Fungsionalitas Search Bar ---
searchBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (window.innerWidth < 640) {
    // Hanya jalankan untuk layar mobile (<sm)
    searchBar.classList.toggle("hidden");
    if (!searchBar.classList.contains("hidden")) {
      searchBar.classList.add("flex");
    } else {
      searchBar.classList.remove("flex");
    }
  }
});

// Hanya sembunyikan searchbar saat klik di luar untuk layar mobile
document.addEventListener("click", () => {
  if (window.innerWidth < 640) {
    // Hanya jalankan untuk layar mobile (<sm)
    if (!searchBar.classList.contains("hidden")) {
      searchBar.classList.add("hidden");
      searchBar.classList.remove("flex");
    }
  }
});

// Mencegah searchbar tertutup ketika mengklik di dalamnya
searchBar.addEventListener("click", (e) => {
  e.stopPropagation();
});

// --- Fungsionalitas Modal (Card Form) ---
// Fungsi untuk menampilkan modal
function showModal() {
  // Pastikan modal memiliki 'display: none' ketika 'hidden' dan 'display: flex' ketika 'flex'.
  // Jika Tailwind dikonfigurasi dengan baik, toggle 'hidden' sudah cukup.
  cardForm.classList.remove("hidden");
  cardForm.classList.add("flex"); // Tambahkan 'flex' untuk memastikan display yang benar
}

// Fungsi untuk menyembunyikan modal
function hideModal() {
  cardForm.classList.remove("flex"); // Hapus 'flex'
  cardForm.classList.add("hidden"); // Tambahkan 'hidden'
}

// Event listener untuk tombol "Tambah" (membuka modal)
addButton.addEventListener("click", showModal);

// Event listener untuk tombol "Tutup" di dalam modal
closeModalBtn.addEventListener("click", hideModal);

// Tutup modal ketika mengklik di luar area modal (overlay)
cardForm.addEventListener("click", (event) => {
  // Periksa apakah elemen yang diklik adalah overlay modal itu sendiri,
  // bukan konten di dalamnya.
  if (event.target === cardForm) {
    hideModal();
  }
});

// Tutup modal ketika menekan tombol 'Esc'
document.addEventListener("keydown", (event) => {
  // Hanya sembunyikan modal jika tombol 'Esc' ditekan
  // DAN modal saat ini tidak memiliki kelas 'hidden' (artinya sedang terbuka).
  if (event.key === "Escape" && !cardForm.classList.contains("hidden")) {
    hideModal();
  }
});
