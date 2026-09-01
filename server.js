'use strict';
const express = require('express');
const multer  = require('multer');
const crypto  = require('crypto');
const fs      = require('fs');
const path    = require('path');

/* ================= КОНФИГУРАЦИЯ ================= */
const PORT       = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || '123456';
const DATA_DIR   = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
const FILES_DIR  = path.join(DATA_DIR, 'files');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');

// Создаём папки если нет
try { fs.mkdirSync(FILES_DIR, { recursive: true }); } catch(e) {}

/* ================= СЕССИИ ================= */
const sessions = new Set();

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/* ================= EXPRESS ================= */
const app = express();
app.use(express.json({ limit: '100mb' }));

// Статические файлы (index.html, admin.html, app.js, admin.js, styles.css)
app.use(express.static(__dirname, {
  index: 'index.html',
  extensions: ['html'],
  setHeaders(res, filePath) {
    // Не кешировать HTML/JS для удобства разработки
    if (/\.(html|js|css)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

/* ================= AUTH ================= */
app.post('/api/auth', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASS) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.add(token);
    console.log('[AUTH] Admin logged in, active sessions:', sessions.size);
    res.json({ token });
  } else {
    res.status(403).json({ error: 'Wrong password' });
  }
});

/* ================= CONFIG API ================= */
app.get('/api/config', (req, res) => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      res.json(data);
    } else {
      res.json(null);
    }
  } catch (e) {
    console.error('[CONFIG] Read error:', e.message);
    res.json(null);
  }
});

app.put('/api/config', requireAuth, (req, res) => {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    console.error('[CONFIG] Write error:', e.message);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

/* ================= FILES API ================= */
// Безопасное имя файла из ID
function safeFileName(id) {
  return encodeURIComponent(id).replace(/\*/g, '%2A');
}

// Загрузка файла (multer принимает multipart/form-data)
const upload = multer({
  storage: multer.diskStorage({
    destination: FILES_DIR,
    filename: (req, file, cb) => cb(null, safeFileName(req.params.id))
  }),
  limits: { fileSize: 100 * 1024 * 1024 } // 100 МБ
});

// Получить файл
app.get('/api/files/:id', (req, res) => {
  const filePath = path.join(FILES_DIR, safeFileName(req.params.id));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  // Определяем Content-Type по контексту ID
  const id = req.params.id;
  let contentType = 'application/octet-stream';
  if (id.startsWith('theme:')) contentType = 'application/octet-stream';
  else if (id.startsWith('font:')) contentType = 'application/octet-stream';
  // Для медиа-файлов не знаем тип, но браузер справится сам
  res.setHeader('Content-Type', contentType);
  res.sendFile(filePath);
});

// Загрузить файл на сервер
app.post('/api/files/:id', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  console.log('[FILE] Saved:', req.params.id, '(' + req.file.size + ' bytes)');
  res.json({ ok: true });
});

// Удалить файл
app.delete('/api/files/:id', requireAuth, (req, res) => {
  const filePath = path.join(FILES_DIR, safeFileName(req.params.id));
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('[FILE] Deleted:', req.params.id);
    }
  } catch (e) {
    console.error('[FILE] Delete error:', e.message);
  }
  res.json({ ok: true });
});

// Удалить все файлы (для полного сброса)
app.delete('/api/reset', requireAuth, (req, res) => {
  try {
    // Удаляем все файлы
    const files = fs.readdirSync(FILES_DIR);
    for (const f of files) {
      fs.unlinkSync(path.join(FILES_DIR, f));
    }
    // Удаляем конфиг
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    console.log('[RESET] All data cleared');
    res.json({ ok: true });
  } catch (e) {
    console.error('[RESET] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

/* ================= СТАРТ ================= */
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('');
    console.log('  ╔═══════════════════════════════════════╗');
    console.log('  ║   XMB Server запущен                  ║');
    console.log('  ║   http://localhost:' + PORT + '                ║');
    console.log('  ║   Admin: http://localhost:' + PORT + '/admin   ║');
    console.log('  ╚═══════════════════════════════════════╝');
    console.log('');
    console.log('  Пароль админки:', ADMIN_PASS);
    console.log('  Данные:', DATA_DIR);
    console.log('');
  });
}

module.exports = app;
