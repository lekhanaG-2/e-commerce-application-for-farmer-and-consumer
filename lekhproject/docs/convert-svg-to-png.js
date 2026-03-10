const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function svgToPng(inputPath, outputPath, width = 1920, height = 1080) {
  const absoluteInput = path.resolve(inputPath);
  if (!fs.existsSync(absoluteInput)) throw new Error('Input SVG not found: ' + absoluteInput);

  const svgContent = fs.readFileSync(absoluteInput, 'utf8');
  const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: parseInt(width, 10), height: parseInt(height, 10), deviceScaleFactor: 1 });
    await page.goto(dataUri);
    // wait a moment for fonts to settle
    await page.waitForTimeout(200);
    await page.screenshot({ path: outputPath, omitBackground: false });
    console.log('Saved PNG to', outputPath);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.error('Usage: node convert-svg-to-png.js <input.svg> <output.png> [width] [height]');
    process.exit(2);
  }
  const [inP, outP, w, h] = argv;
  svgToPng(inP, outP, w || 3000, h || 1750).catch(err => { console.error(err); process.exit(1); });
}
