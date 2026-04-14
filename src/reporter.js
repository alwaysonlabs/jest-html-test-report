'use strict';

const { generateReport } = require('./generator');

const DEFAULT_OPTIONS = {
  /** Path (relative to cwd) where the HTML report will be written. */
  outputPath: './jest-test-report.html',
  /** Title displayed at the top of the report. */
  pageTitle: 'Jest Test Report',
  /** Path to a logo image (PNG, JPG, SVG). It will be base64-embedded in the HTML. */
  logo: null,
  /** Include failure messages in the report. */
  includeFailureMsg: true,
  /** Include console.log output captured during tests. */
  includeConsoleLog: false,
  /**
   * Sort order for test suites.
   * 'default' | 'status' | 'duration' | 'alphabetical'
   */
  sort: 'default',
  /** Execution time (seconds) above which a test is highlighted as slow. */
  executionTimeWarningThreshold: 5,
  /** Automatically open the report in the default browser after generation. */
  openReport: false,
  /** UI color theme: 'dark' (default) or 'light'. */
  theme: 'dark',
  /**
   * Pass-rate thresholds that map to a risk level label.
   *   >= low    => Low Risk    (green)
   *   >= medium => Medium Risk (amber)
   *   <  medium => High Risk   (red)
   */
  riskThresholds: {
    low: 90,
    medium: 70,
  },
  /** Render the Environment section at the bottom of the report. */
  showEnvironment: true,
  /**
   * Duration thresholds (ms) used to bucket tests in the Distribution card.
   * Creates N+1 buckets from the N provided values.
   * Default: [300, 1000, 2000]  →  <300ms | 300–1000ms | 1000–2000ms | >2000ms
   */
  durationThresholds: [300, 1000, 2000],
  /** Show the support button in the header. */
  showSupportButton: true,
  /** Path to a custom CSS file whose contents are appended after the built-in styles. */
  customStylePath: null,
};

class JestTestReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = Object.assign({}, DEFAULT_OPTIONS, options || {});
    if (options && options.riskThresholds) {
      this._options.riskThresholds = Object.assign(
        {},
        DEFAULT_OPTIONS.riskThresholds,
        options.riskThresholds
      );
    }
    this._testResults = [];
    this._seenPaths = new Set();
  }

  onRunStart() {
    // Nothing needed — Jest passes aggregate timing via onRunComplete.
  }

  // Jest 28+
  onTestFileResult(_test, testResult) {
    if (!this._seenPaths.has(testResult.testFilePath)) {
      this._seenPaths.add(testResult.testFilePath);
      this._testResults.push(testResult);
    }
  }

  // Jest < 28 compatibility alias
  onTestResult(test, testResult) {
    this.onTestFileResult(test, testResult);
  }

  onRunComplete(_contexts, results) {
    generateReport(this._options, results, this._testResults);
  }
}

module.exports = JestTestReporter;
