import { translate } from './pipeline/translator/translationService.js';
import { search, predict, predictFile } from './pipeline/query/vectorQuery.js';

// Example usage of the search function
async function exampleSearch() {
  try {
    const query = "example query";
    const results = await search(query);
    console.log("Search results:", results);
  } catch (error) {
    console.error("Error during search:", error);
  }
}

// Example usage of the predict function
async function examplePredict() {
  try {
    const query = "example query";
    const results = await predict(query);
    console.log("Predict results:", results);
  } catch (error) {
    console.error("Error during predict:", error);
  }
}

// Example usage of the predictFile function
async function examplePredictFile() {
  try {
    const csvData = `crimeaditionalinfo
example query 1
example query 2`;

    const results = await predictFile(csvData);
    console.log("PredictFile results:", results);
  } catch (error) {
    console.error("Error during predictFile:", error);
  }
}

// Call the example functions
exampleSearch();
examplePredict();
// examplePredictFile();

(async () => {
    const result = await translate('translate', 'text here');
    console.log(result);
})();