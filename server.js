require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const db = require('./db');
const s3 = require('./s3');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Listar todos los contactos
app.get('/api/contacts', async (req, res) => {
  try {
    const [rows] = await db.pool.execute('SELECT * FROM contacts ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error leyendo contactos' });
  }
});

// Buscar por apellido
app.get('/api/contacts/search', async (req, res) => {
  const { apellido } = req.query;
  if (!apellido) return res.status(400).json({ error: 'Falta parametro apellido' });
  try {
    const [rows] = await db.pool.execute('SELECT * FROM contacts WHERE apellidos LIKE ?', [`%${apellido}%`]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
});

// Crear contacto (con foto opcional)
app.post('/api/contacts', upload.single('foto'), async (req, res) => {
  try {
    const { nombre, apellidos, correo, fecha_nac } = req.body;
    let foto_url = null;
    if (req.file) {
      const key = `contacts/${Date.now()}_${req.file.originalname}`;
      foto_url = await s3.uploadFile(req.file.buffer, key, req.file.mimetype);
    }

    const [result] = await db.pool.execute(
      'INSERT INTO contacts (nombre, apellidos, correo, fecha_nac, foto) VALUES (?,?,?,?,?)',
      [nombre, apellidos, correo, fecha_nac || null, foto_url]
    );
    const insertId = result.insertId;
    const [rows2] = await db.pool.execute('SELECT * FROM contacts WHERE id = ?', [insertId]);
    res.json(rows2[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando contacto' });
  }
});

// Modificar contacto (foto opcional)
app.put('/api/contacts/:id', upload.single('foto'), async (req, res) => {
  const id = req.params.id;
  try {
    const { nombre, apellidos, correo, fecha_nac } = req.body;
    let foto_url = null;
    if (req.file) {
      const key = `contacts/${Date.now()}_${req.file.originalname}`;
      foto_url = await s3.uploadFile(req.file.buffer, key, req.file.mimetype);
    }

    // Obtener el registro actual
    const [curRows] = await db.pool.execute('SELECT * FROM contacts WHERE id = ?', [id]);
    if (curRows.length === 0) return res.status(404).json({ error: 'Contacto no encontrado' });

    const current = curRows[0];
    const newFoto = foto_url || current.foto;

    await db.pool.execute(
      'UPDATE contacts SET nombre=?, apellidos=?, correo=?, fecha_nac=?, foto=? WHERE id=?',
      [nombre || current.nombre, apellidos || current.apellidos, correo || current.correo, fecha_nac || current.fecha_nac, newFoto, id]
    );
    const [rows] = await db.pool.execute('SELECT * FROM contacts WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando contacto' });
  }
});

// Eliminar contacto
app.delete('/api/contacts/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.pool.execute('DELETE FROM contacts WHERE id=?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Contacto no encontrado' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando contacto' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
