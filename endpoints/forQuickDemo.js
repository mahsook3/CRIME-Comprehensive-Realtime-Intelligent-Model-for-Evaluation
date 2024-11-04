import express from 'express';
import { translate } from '../pipeline/translator/translationService.js';
import { search } from '../pipeline/models/similaritySearchModel.js';
import { predict } from '../pipeline/models/predictModel.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { option, crimeInfo } = req.body;
    if (!option) {
      return res.status(400).json({ error: "Missing option parameter" });
    }
    if (!crimeInfo) {
      return res.status(400).json({ error: "Missing crimeInfo parameter" });
    }

    const translatedCrimeInfo = await translate('translate', crimeInfo);
    let results;

    if (option === 'search') {
      results = await search(translatedCrimeInfo.translated_content);
    } else if (option === 'predict') {
      results = await predict(translatedCrimeInfo.translated_content);
    } else {
      return res.status(400).json({ error: "Invalid option parameter" });
    }

    console.log("Here is crimeInfo: ", crimeInfo, "Here is translatedCrimeInfo: ", translatedCrimeInfo.translated_content);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: "Error during processing" });
  }
});

export default router;