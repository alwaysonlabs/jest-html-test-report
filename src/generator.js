'use strict';

const fs   = require('fs');
const path = require('path');
const { buildHtml } = require('./template');

function generateReport(options, results, testResults) {
  const outputPath = path.resolve(process.cwd(), options.outputPath);
  const outputDir  = path.dirname(outputPath);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    try {
      fs.mkdirSync(outputDir, { recursive: true });
    } catch (e) {
      console.error('[jest-test-report] Failed to create output directory:', e.message);
      return;
    }
  }

  // Optionally encode the logo image as a base64 data URI
  let logoData = null;
  if (options.logo) {
    const logoPath = path.resolve(process.cwd(), options.logo);
    if (fs.existsSync(logoPath)) {
      try {
        const ext  = path.extname(logoPath).slice(1).toLowerCase();
        const mime = ext === 'svg'
          ? 'image/svg+xml'
          : (ext === 'jpg' || ext === 'jpeg')
            ? 'image/jpeg'
            : 'image/' + ext;
        const b64 = fs.readFileSync(logoPath).toString('base64');
        logoData = 'data:' + mime + ';base64,' + b64;
      } catch (e) {
        console.warn('[jest-test-report] Could not load logo:', e.message);
      }
    } else {
      console.warn('[jest-test-report] Logo file not found:', logoPath);
    }
  }

  // Optionally load custom CSS override
  let customStyle = '';
  if (options.customStylePath) {
    const stylePath = path.resolve(process.cwd(), options.customStylePath);
    if (fs.existsSync(stylePath)) {
      try {
        customStyle = fs.readFileSync(stylePath, 'utf8');
      } catch (e) {
        console.warn('[jest-test-report] Could not load custom style:', e.message);
      }
    }
  }

  // Load the Buy Me a Coffee GIF (bundled with the package)
  let bmcGifData = null;
  if (options.showSupportButton !== false) {
    try {
      const gifPath = path.join(__dirname, '../assets/giphy.gif');
      const b64 = fs.readFileSync(gifPath).toString('base64');
      bmcGifData = 'data:image/gif;base64,' + b64;
    } catch (e) {
      console.warn('[jest-test-report] Could not load Buy Me a Coffee GIF:', e.message);
    }
  }

  // Build and write the HTML
  let html;
  try {
    html = buildHtml(options, results, testResults, logoData, customStyle, bmcGifData);
  } catch (e) {
    console.error('[jest-test-report] Failed to build report:', e.message);
    return;
  }

  try {
    fs.writeFileSync(outputPath, html, 'utf8');
    const relPath = path.relative(process.cwd(), outputPath);
    console.log('\n[jest-html-test-report] Report saved → ' + relPath + '\n');
  } catch (e) {
    console.error('[jest-html-test-report] Failed to write report:', e.message);
    return;
  }

  if (options.openReport) {
    const cmd = process.platform === 'darwin' ? 'open'
              : process.platform === 'win32'  ? 'start'
              : 'xdg-open';
    require('child_process').exec(cmd + ' "' + outputPath + '"');
  }
}

module.exports = { generateReport };
