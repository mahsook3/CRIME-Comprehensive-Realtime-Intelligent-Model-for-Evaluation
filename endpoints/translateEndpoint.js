import express from 'express';
import { translate } from '../pipeline/translator/translationService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, modelType } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text in request body" });
    }
    const result = await translate(modelType || 'translate', text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error during translate" });
  }
});

export default router;