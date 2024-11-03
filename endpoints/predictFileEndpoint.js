import express from 'express';
import multer from 'multer';
import { predictFile } from '../pipeline/models/predictFileModel.js';

const router = express.Router();
const upload = multer();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Missing file in request' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const results = await predictFile(csvData);

    res.json(results);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error during predictFile' });
  }
});

export default router;
