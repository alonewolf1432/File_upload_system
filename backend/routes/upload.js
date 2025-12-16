// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const fs = require('fs');

// configure storage for three categories based on route
const storage = (subfolder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', subfolder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // make filename unique
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const uploadReference = multer({ storage: storage('reference') });
const uploadStudents = multer({ storage: storage('students') });
const uploadQuestions = multer({ storage: storage('questions') });

// helper to save DB entry
async function saveFileRecord(userId, category, filename, filepath) {
  await db.query(
    'INSERT INTO files (user_id, category, filename, filepath) VALUES ($1, $2, $3, $4)',
    [userId, category, filename, filepath]
  );
}

// routes
router.post('/reference', auth, uploadReference.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filepath = `/uploads/reference/${req.file.filename}`;
    await saveFileRecord(req.user.id, 'reference', req.file.originalname, filepath);
    res.json({ message: 'Reference file uploaded', file: { original: req.file.originalname, stored: req.file.filename, path: filepath }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/students', auth, uploadStudents.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filepath = `/uploads/students/${req.file.filename}`;
    await saveFileRecord(req.user.id, 'students', req.file.originalname, filepath);
    res.json({ message: 'Student file uploaded', file: { original: req.file.originalname, stored: req.file.filename, path: filepath }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/questions', auth, uploadQuestions.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filepath = `/uploads/questions/${req.file.filename}`;
    await saveFileRecord(req.user.id, 'questions', req.file.originalname, filepath);
    res.json({ message: 'Question file uploaded', file: { original: req.file.originalname, stored: req.file.filename, path: filepath }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
