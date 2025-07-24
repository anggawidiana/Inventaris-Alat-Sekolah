// Import dependencies
require("dotenv").config(); // Memuat variabel dari file .env
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Untuk parsing body request dalam format JSON
app.use(express.urlencoded({ extended: true })); // Untuk parsing body request dari form
app.use(cookieParser()); // Untuk parsing cookie

// --- Konfigurasi Koneksi Database Pool ---
const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Cek koneksi database saat server dimulai
dbPool
  .getConnection()
  .then((connection) => {
    console.log("Successfully connected to the database. ✅");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err.stack);
  });

// =================================================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE 🔒
// =================================================================

/**
 * Middleware untuk mengautentikasi token JWT dari cookie.
 * Menambahkan `req.user` jika token valid.
 * Mengalihkan ke halaman login jika token tidak ada atau tidak valid.
 */
function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    // Jika tidak ada token, alihkan ke halaman login
    console.log("No token found, redirecting to /login.html");
    return res.redirect("/login.html");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Jika token tidak valid, hapus cookie dan alihkan ke login
      console.log(
        "Invalid token, clearing cookie and redirecting to /login.html"
      );
      res.clearCookie("token");
      return res.redirect("/login.html");
    }
    req.user = user; // Tambahkan payload token ke req.user (berisi id, email, role)
    console.log(`User authenticated: ${user.email} with role: ${user.role}`);
    next(); // Lanjutkan ke middleware/handler berikutnya
  });
}

/**
 * Middleware untuk otorisasi berdasarkan peran pengguna.
 * Menerima array peran yang diizinkan.
 */
function authorizeRoles(roles) {
  return (req, res, next) => {
    // Pastikan req.user sudah ada dari authenticateToken
    if (!req.user || !roles.includes(req.user.role)) {
      console.warn(
        `Access denied for user ${req.user ? req.user.email : "unknown"} with role ${req.user ? req.user.role : "N/A"}. Required roles: ${roles.join(", ")}`
      );
      // Jika pengguna tidak terautentikasi atau peran tidak diizinkan
      return res
        .status(403)
        .send(
          "Akses Ditolak: Anda tidak memiliki izin untuk mengakses halaman ini. 🚫"
        );
    }
    console.log(
      `User ${req.user.email} authorized for roles: ${roles.join(", ")}`
    );
    next(); // Lanjutkan jika peran diizinkan
  };
}

// =================================================================
// API ROUTES 🚀
// =================================================================

// --- Rute Registrasi (Sign Up) ---
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password harus diisi." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await dbPool.execute(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hashedPassword, "staff"] // Role default adalah 'staff'
    );

    res.status(201).json({
      message: "Registrasi berhasil! Silakan login.",
      userId: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// --- Rute Login ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password harus diisi." });
  }

  try {
    const [rows] = await dbPool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    // Payload JWT mencakup ID, email, dan peran pengguna
    const payload = {
      id: user.id_user,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token berlaku 1 jam
    });

    // Set cookie 'token' dengan opsi HttpOnly untuk keamanan
    res.cookie("token", token, {
      httpOnly: true, // Tidak bisa diakses oleh JavaScript di sisi klien
      secure: process.env.NODE_ENV === "production", // Hanya kirim via HTTPS di produksi
      sameSite: "strict", // Melindungi dari serangan CSRF
      maxAge: "3600000", // 1 jam dalam milidetik
    });

    res.status(200).json({
      message: "Login berhasil! 🎉",
      role: user.role,
      // Beri tahu klien ke mana harus dialihkan setelah login berhasil
      redirectTo:
        user.role === "admin"
          ? "/pages/admin/dashboard.html"
          : "/pages/pegawai/dashboard.html",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// --- Rute Logout ---
app.post("/api/logout", (req, res) => {
  res.clearCookie("token"); // Hapus cookie token
  res.status(200).json({ message: "Logout berhasil. 👋" });
});

// =================================================================
// PROTECTED HTML PAGES (Harus Ditempatkan SEBELUM `app.use(express.static(...))`)
// =================================================================

// Rute untuk halaman dashboard admin (dilindungi)
// Akses hanya untuk user dengan role 'admin'
app.get(
  "/pages/admin/dashboard.html",
  authenticateToken,
  authorizeRoles(["admin"]),
  (req, res) => {
    console.log("Serving admin dashboard.");
    // Asumsi file ini berada di `[direktori_root_server]/pages/admin/dashboard.html`
    res.sendFile(path.join(__dirname, "pages", "admin", "dashboard.html"));
  }
);

// Rute untuk halaman dashboard pegawai (dilindungi)
// Akses untuk user dengan role 'staff' atau 'admin'
app.get(
  "/pages/pegawai/dashboard.html",
  authenticateToken,
  authorizeRoles(["staff", "admin"]),
  (req, res) => {
    console.log("Serving pegawai dashboard.");
    // Asumsi file ini berada di `[direktori_root_server]/pages/pegawai/dashboard.html`
    res.sendFile(path.join(__dirname, "pages", "pegawai", "dashboard.html"));
  }
);

// --- Penanganan rute root (/) ---
// Ketika user mengakses http://localhost:3000/, cek status login dan arahkan
app.get("/", (req, res) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // Token tidak valid/kadaluwarsa, hapus dan arahkan ke login
        res.clearCookie("token");
        console.log("Invalid token on root, redirecting to /login.html");
        return res.sendFile(path.join(__dirname, "login.html"));
      }
      // Arahkan berdasarkan peran
      if (user.role === "admin") {
        console.log("Redirecting to admin dashboard from root.");
        return res.redirect("/pages/admin/dashboard.html");
      } else if (user.role === "staff") {
        console.log("Redirecting to pegawai dashboard from root.");
        return res.redirect("/pages/pegawai/dashboard.html");
      }
      // Jika peran tidak dikenali atau lainnya, arahkan ke login
      console.log("Unknown role on root, redirecting to /login.html");
      return res.sendFile(path.join(__dirname, "login.html"));
    });
  } else {
    // Tidak ada token, arahkan ke login
    console.log("No token on root, serving login.html");
    res.sendFile(path.join(__dirname, "login.html"));
  }
});

// =================================================================
// Static Files Serving (Ditempatkan SETELAH Rute Terproteksi)
// =================================================================
// Menyajikan file statis (HTML, CSS, JS frontend) dari direktori root
// Ini harus ditempatkan setelah rute spesifik yang ingin Anda lindungi
// agar middleware autentikasi/otorisasi dapat bekerja.
app.use(express.static(path.join(__dirname, "")));

// Menyajikan file statis dari direktori 'public' melalui '/public' prefix
// Ini akan tetap berfungsi untuk file-file seperti 'public/login.js', 'public/signup.js'
// dan aset lainnya yang ada di dalam folder 'public'.
app.use("/public", express.static(path.join(__dirname, "public")));

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} 🚀`);
  console.log(`Buka http://localhost:${PORT} di browser Anda.`);
});

module.exports = app; // Ekspor app untuk testing atau penggunaan lain
