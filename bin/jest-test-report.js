#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const { adaptJsonOutput } = require('../src/fromJson');
const { generateReport  } = require('../src/generator');

/* ─────────────────────────────────────────────────────────────────────────
   Minimal argument parser — no external deps
   Usage:
     jest-test-report <results.json> [options]

   Options:
     --output,  -o  <path>    Output HTML path  (default: ./jest-test-report.html)
     --title,   -t  <text>    Page title
     --logo,    -l  <path>    Logo image path
     --theme        dark|light (default: dark)
     --open                   Open the report in the browser after generation
     --no-env                 Omit the Environment section
     --sort         default|status|duration|alphabetical
     --help,    -h            Show this help message
───────────────────────────────────────────────────────────────────────── */

function parseArgs(argv) {
  const args  = argv.slice(2);
  const opts  = {};
  let jsonFile = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    } else if (a === '--output' || a === '-o') {
      opts.outputPath = args[++i];
    } else if (a === '--title' || a === '-t') {
      opts.pageTitle = args[++i];
    } else if (a === '--logo' || a === '-l') {
      opts.logo = args[++i];
    } else if (a === '--theme') {
      opts.theme = args[++i];
    } else if (a === '--open') {
      opts.openReport = true;
    } else if (a === '--no-env') {
      opts.showEnvironment = false;
    } else if (a === '--sort') {
      opts.sort = args[++i];
    } else if (!a.startsWith('-')) {
      jsonFile = a;
    } else {
      console.error('[jest-test-report] Unknown option: ' + a);
      process.exit(1);
    }
  }

  return { jsonFile, opts };
}

function printHelp() {
  console.log(`
Usage: jest-test-report <results.json> [options]

Generate a jest-test-report HTML report from a Jest JSON output file.

Produce the JSON file by running Jest with:
  jest --json --outputFile=jest-results.json

Arguments:
  <results.json>         Path to the Jest JSON output file (required)

Options:
  -o, --output  <path>     Output HTML file path   [default: ./jest-test-report.html]
  -t, --title   <text>     Report page title       [default: "Jest Test Report"]
  -l, --logo    <path>     Path to a logo image (PNG/JPG/SVG)
      --theme   dark|light Color theme             [default: dark]
      --open               Open the report in the browser after generation
      --no-env             Omit the Environment section
      --sort    default|status|duration|alphabetical
  -h, --help               Show this help message

Examples:
  jest-test-report jest-results.json
  jest-test-report jest-results.json -o reports/index.html -t "My App Tests"
  jest-test-report jest-results.json --logo ./logo.png --open
`);
}

/* ── Main ─────────────────────────────────────────────────────────────── */
(function main() {
  const { jsonFile, opts } = parseArgs(process.argv);

  if (!jsonFile) {
    console.error('[jest-test-report] Error: a Jest JSON results file is required.\n');
    printHelp();
    process.exit(1);
  }

  const jsonPath = path.resolve(process.cwd(), jsonFile);
  if (!fs.existsSync(jsonPath)) {
    console.error('[jest-test-report] File not found: ' + jsonPath);
    process.exit(1);
  }

  let rawJson;
  try {
    rawJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (e) {
    console.error('[jest-test-report] Failed to parse JSON: ' + e.message);
    process.exit(1);
  }

  let adapted;
  try {
    adapted = adaptJsonOutput(rawJson);
  } catch (e) {
    console.error('[jest-test-report] Invalid Jest JSON output: ' + e.message);
    process.exit(1);
  }

  const options = Object.assign(
    {
      outputPath:      './jest-test-report.html',
      pageTitle:       'Jest Test Report',
      logo:            null,
      theme:           'dark',
      openReport:      false,
      showEnvironment: true,
      sort:            'default',
      includeFailureMsg:  true,
      includeConsoleLog:  false,
      executionTimeWarningThreshold: 5,
      durationThresholds: [300, 1000, 2000],
    },
    opts,
  );

  generateReport(options, adapted.results, adapted.testResults);
}());
