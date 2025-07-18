// Ambil elemen yang diperlukan dari DOM
const toggleButton = document.getElementById("toggle-sidebar-btn");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content");

// Tambahkan event listener untuk 'click' pada tombol hamburger
toggleButton.addEventListener("click", () => {
  // Toggle (tambah/hapus) kelas 'hidden' pada sidebar
  sidebar.classList.toggle("hidden");

  // Sesuaikan margin pada konten utama
  // Jika sidebar sekarang memiliki kelas 'hidden', hapus margin kirinya.
  if (sidebar.classList.contains("hidden")) {
    mainContent.classList.remove("ml-[15px]");
  } else {
    // Jika tidak, tambahkan kembali margin kirinya.
    mainContent.classList.add("ml-[15px]");
  }
});

const addButton = document.getElementById("add-button");
const closeModalBtn = document.getElementById("closeModalBtn");
const cardForm = document.getElementById("card-form");

// Fungsi untuk menampilkan modal
function showModal() {
  cardForm.classList.remove("hidden"); // Hapus 'hidden'
  cardForm.classList.add("flex"); // Tambahkan 'flex' untuk display
}

// Fungsi untuk menyembunyikan modal
function hideModal() {
  cardForm.classList.remove("flex"); // Hapus 'flex'
  cardForm.classList.add("hidden"); // Tambahkan 'hidden'
}

// Tambahkan event listener ke tombol "Buka Modal"
addButton.addEventListener("click", showModal);

// Tambahkan event listener ke tombol "Tutup" di dalam modal
closeModalBtn.addEventListener("click", hideModal);

// (Opsional) Tutup modal ketika mengklik di luar area modal (overlay)
cardForm.addEventListener("click", (event) => {
  // Jika elemen yang diklik adalah modal overlay itu sendiri (bukan konten di dalamnya)
  if (event.target === cardForm) {
    hideModal();
  }
});

// (Opsional) Tutup modal ketika menekan tombol 'Esc'
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cardForm.classList.contains("hidden")) {
    hideModal();
  }
});
