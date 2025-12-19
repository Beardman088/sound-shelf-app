import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PrismaClient } from './generated/prisma/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'audio');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /audio\//;
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

app.use(cors());
app.use(express.json());
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API route to create audio record with file upload
app.post('/api/audio', upload.single('file'), async (req, res) => {
  try {
    console.log('Received request:', {
      hasFile: !!req.file,
      body: req.body,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : null
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract form fields - multer puts them in req.body
    const id = req.body.id;
    const name = req.body.name;
    const artist = req.body.artist || null;
    const album = req.body.album || null;
    const duration = req.body.duration ? parseFloat(req.body.duration) : null;
    const userId = req.body.userId;

    if (!name || !userId) {
      // Delete uploaded file if validation fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Validation failed:', { 
        name: name || 'MISSING', 
        userId: userId || 'MISSING', 
        body: req.body 
      });
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: `name: ${name ? 'provided' : 'missing'}, userId: ${userId ? 'provided' : 'missing'}`,
        receivedBody: req.body
      });
    }

    // Create URL for the uploaded file
    const fileUrl = `/uploads/audio/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    console.log('Creating audio record:', {
      id: id || 'auto-generated',
      name,
      artist,
      album,
      duration,
      userId,
      url: fullUrl
    });

    const audio = await prisma.audio.create({
      data: {
        id: id || undefined, // Let Prisma generate UUID if not provided
        name,
        artist: artist || null,
        album: album || null,
        duration: duration ? Math.round(duration) : null,
        url: fullUrl,
        filePath: req.file.originalname || null,
        fileSize: req.file.size || null,
        mimeType: req.file.mimetype || null,
        userId,
      },
    });

    console.log('Audio record created successfully:', audio.id);

    res.json(audio);
  } catch (error) {
    // Delete uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error creating audio:', error);
    res.status(500).json({ error: 'Failed to create audio record', details: error.message });
  }
});

// API route to get all audio records
app.get('/api/audio', async (req, res) => {
  try {
    const audio = await prisma.audio.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(audio);
  } catch (error) {
    console.error('Error fetching audio:', error);
    res.status(500).json({ error: 'Failed to fetch audio records', details: error.message });
  }
});

// API route to delete audio record
app.delete('/api/audio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get audio record to find file path
    const audio = await prisma.audio.findUnique({
      where: { id },
    });

    if (audio) {
      // Delete the file from filesystem
      // Extract filename from URL (handles both full URLs and relative paths)
      const urlPath = audio.url.includes('/uploads/') 
        ? audio.url.split('/uploads/')[1] 
        : audio.url.replace(/^\/uploads\//, '');
      const filePath = path.join(__dirname, 'uploads', urlPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    await prisma.audio.delete({
      where: { id },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting audio:', error);
    res.status(500).json({ error: 'Failed to delete audio record', details: error.message });
  }
});

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Your DATABASE_URL is set in .env file');
    console.error('   2. PostgreSQL is running');
    console.error('   3. The database exists and is accessible');
    console.error('\nExample DATABASE_URL:');
    console.error('   DATABASE_URL="postgresql://user:password@localhost:5432/database_name"');
    process.exit(1);
  });

