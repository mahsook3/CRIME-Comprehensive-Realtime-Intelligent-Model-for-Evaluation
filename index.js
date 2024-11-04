import express from 'express';
import cors from 'cors';
import similaritySearchRouter from './endpoints/similaritySearch.js';
import predictEndpointRouter from './endpoints/predictEndpoint.js';
import predictFileEndpointRouter from './endpoints/predictFileEndpoint.js';
import translateEndpointRouter from './endpoints/translateEndpoint.js';
import forQuickDemo from './endpoints/forQuickDemo.js';

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS
app.use(express.json());

app.use('/search', similaritySearchRouter);
app.use('/predict', predictEndpointRouter);
app.use('/predictFile', predictFileEndpointRouter);
app.use('/translate', translateEndpointRouter);
app.use('/demo', forQuickDemo);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});