const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// ✅ Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Debug Logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'levaku@2000',
  database: 'retail'
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

// ✅ Signup Route
app.post('/signup', (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const sql = 'INSERT INTO hotstar_signups (fullname, email, password) VALUES (?, ?, ?)';
  db.query(sql, [fullname, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting signup:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Signup successful' });
  });
});

// ✅ Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM hotstar_signups WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
});

// ✅ Contact Route
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO hotstar_contacts (name, email, message) VALUES (?, ?, ?)';
  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error('Error inserting contact message:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json({ message: 'Message received successfully!' });
  });
});

// ✅ Start Server on EC2 (Public Access)
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on 0.0.0.0:${port}`);
});
