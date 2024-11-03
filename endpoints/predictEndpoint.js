import express from 'express';
import { translate } from '../pipeline/translator/translationService.js';
import { predict } from '../pipeline/models/predictModel.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const query = req.body.query;
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }
    const translatedQuery = await translate('translate', query);
    const results = await predict(translatedQuery.translated_content);
    console.log("Here is query: ", query , "Here is translatedQuery: ", translatedQuery.translated_content );
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: "Error during predict" });
  }
});

export default router;