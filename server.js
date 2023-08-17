const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
   secret: 'your-secret-key',
   resave: true,
   saveUninitialized: true
}));

const db = new sqlite3.Database('./users.db');

// Inisialisasi tabel pengguna
db.run(`
   CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL
   )
`);

// Route untuk halaman utama
app.get('/', (req, res) => {
   res.send('Selamat datang di Karman Store!');
});

// Route untuk pendaftaran akun
app.post('/register', async (req, res) => {
   const { username, email, password } = req.body;
   const hashedPassword = await bcrypt.hash(password, 10);

   db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      (err) => {
         if (err) {
            console.error(err);
            res.status(500).send('Terjadi kesalahan saat mendaftar');
         } else {
            res.redirect('/');
         }
      }
   );
});

// Route untuk masuk
app.post('/login', async (req, res) => {
   const { username, password } = req.body;

   db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, row) => {
         if (err || !row) {
            console.error(err);
            res.status(500).send('Pengguna tidak ditemukan');
         } else {
            const match = await bcrypt.compare(password, row.password);
            if (match) {
               req.session.userId = row.id;
               res.redirect('/');
            } else {
               res.status(401).send('Kredensial tidak valid');
            }
         }
      }
   );
});

app.listen(port, () => {
   console.log(`Server berjalan pada port ${port}`);
});

//install : npm install express express-session body-parser bcrypt sqlite3-->
//bhasStartl : node server.js
