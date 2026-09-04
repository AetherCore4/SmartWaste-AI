const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TESTING_DIR = path.join(__dirname, 'Testing');

async function runTests() {
  console.log("Launching test environment...");
  const browser = await puppeteer.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  
  // Navigate to localhost to avoid CORS issues when fetching the model
  await page.goto('http://localhost:8765/');

  // The page already includes tfjs and teachablemachine in its HTML

  // Initialize the model inside the page
  console.log("Loading model from localhost...");
  const modelLoaded = await page.evaluate(async () => {
    try {
      const URL = 'http://localhost:8765/Model/';
      window.testModel = await tmImage.load(URL + 'model.json', URL + 'metadata.json');
      return { success: true, labels: window.testModel.getClassLabels() };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  if (!modelLoaded.success) {
    console.error("Failed to load model in test environment. Make sure the python server is running on port 8765.");
    console.error(modelLoaded.error);
    await browser.close();
    process.exit(1);
  }

  const labels = modelLoaded.labels;
  console.log(`Model loaded! Classes: ${labels.join(', ')}\n`);

  // Read subdirectories
  const subdirs = fs.readdirSync(TESTING_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let totalCount = 0;
  let correctCount = 0;
  const classStats = {};
  labels.forEach(l => classStats[l] = { total: 0, correct: 0 });

  const resultsTable = [];
  console.log("Starting batch test...\n");

  for (const subdir of subdirs) {
    const trueLabelObj = labels.find(l => l.toLowerCase() === subdir.toLowerCase());
    const trueLabel = trueLabelObj || subdir;

    const classDir = path.join(TESTING_DIR, subdir);
    const files = fs.readdirSync(classDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));

    for (const file of files) {
      const filePath = path.join(classDir, file);
      // Read file as base64
      const ext = path.extname(file).slice(1);
      const mime = ext === 'jpg' ? 'jpeg' : ext;
      const b64 = fs.readFileSync(filePath).toString('base64');
      const dataUrl = `data:image/${mime};base64,${b64}`;

      // Run prediction in browser
      const maxPred = await page.evaluate(async (dataUrl) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = async () => {
            const preds = await window.testModel.predict(img);
            const best = preds.reduce((a, b) => a.probability > b.probability ? a : b);
            resolve({ className: best.className, probability: best.probability });
          };
          img.src = dataUrl;
        });
      }, dataUrl);

      const predictedLabel = maxPred.className;
      const isCorrect = (predictedLabel.toLowerCase() === trueLabel.toLowerCase());
      const confidence = (maxPred.probability * 100).toFixed(1) + '%';

      totalCount++;
      if (isCorrect) correctCount++;
      if (classStats[trueLabel]) {
        classStats[trueLabel].total++;
        if (isCorrect) classStats[trueLabel].correct++;
      }

      resultsTable.push({
        File: file,
        'Actual': trueLabel,
        'Predicted': predictedLabel,
        'Confidence': confidence,
        'Result': isCorrect ? '✅ PASS' : '❌ FAIL'
      });
    }
  }

  await browser.close();

  // Print results
  console.table(resultsTable);

  console.log("\n========================================");
  console.log("            TESTING SUMMARY            ");
  console.log("========================================");
  console.log(`Total Images:        ${totalCount}`);
  console.log(`Correct Predictions: ${correctCount}`);
  console.log(`Incorrect:           ${totalCount - correctCount}`);
  console.log(`Overall Accuracy:    ${((correctCount / totalCount) * 100).toFixed(1)}%\n`);

  console.log("Accuracy by Class:");
  for (const label of labels) {
    const stats = classStats[label];
    if (stats && stats.total > 0) {
      const acc = ((stats.correct / stats.total) * 100).toFixed(1);
      console.log(` - ${label.padEnd(10)}: ${acc}% (${stats.correct}/${stats.total})`);
    } else {
      console.log(` - ${label.padEnd(10)}: N/A (0 images)`);
    }
  }
  console.log("========================================\n");
}

runTests().catch(console.error);
