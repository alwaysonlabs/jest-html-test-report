'use strict';

/**
 * Adapts a Jest `--json` output object into the shapes that generator.js expects:
 *
 *   aggregatedResult  →  results   (first arg of onRunComplete)
 *   testFileResults[] →  testResults (second arg of onRunComplete, i.e. the array
 *                         collected from onTestFileResult calls)
 *
 * Key differences between the JSON format and the reporter API:
 *   JSON                          Reporter API
 *   ─────────────────────────── ──────────────────────────────
 *   testResults[i].name          testResult.testFilePath
 *   testResults[i].startTime     testResult.perfStats.start
 *   testResults[i].endTime       testResult.perfStats.end
 *   testResults[i].assertionResults  testResult.testResults
 *   (counts derived from above)  testResult.numPassingTests, etc.
 */
function adaptJsonOutput(jsonData) {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid Jest JSON output: expected an object.');
  }

  /* ── Aggregated result (mirrors AggregatedResult) ── */
  const results = {
    numTotalTests:        jsonData.numTotalTests        || 0,
    numPassedTests:       jsonData.numPassedTests       || 0,
    numFailedTests:       jsonData.numFailedTests       || 0,
    numPendingTests:      jsonData.numPendingTests      || 0,
    numTodoTests:         jsonData.numTodoTests         || 0,
    numTotalTestSuites:   jsonData.numTotalTestSuites   || 0,
    numPassedTestSuites:  jsonData.numPassedTestSuites  || 0,
    numFailedTestSuites:  jsonData.numFailedTestSuites  || 0,
    numPendingTestSuites: jsonData.numPendingTestSuites || 0,
    startTime:            jsonData.startTime            || Date.now(),
    success:              jsonData.success              || false,
  };

  /* ── Per-file test results (mirrors TestResult) ── */
  const testResults = (jsonData.testResults || []).map(suite => {
    const assertions = suite.assertionResults || [];

    // Derive per-suite counts from assertions (the JSON format sometimes omits them
    // at the suite level, or uses different field names across Jest versions).
    const numPassingTests = assertions.filter(t => t.status === 'passed').length;
    const numFailingTests = assertions.filter(t => t.status === 'failed').length;
    const numPendingTests = assertions.filter(
      t => t.status === 'pending' || t.status === 'todo',
    ).length;

    return {
      testFilePath:     suite.name || '',
      numPassingTests,
      numFailingTests,
      numPendingTests,
      perfStats: {
        start: suite.startTime || results.startTime,
        end:   suite.endTime   || (suite.startTime ? suite.startTime + 1 : Date.now()),
      },
      // Normalise to the shape the reporter API produces
      testResults: assertions.map(t => ({
        title:           t.title           || '',
        fullName:        t.fullName        || t.title || '',
        ancestorTitles:  t.ancestorTitles  || [],
        status:          t.status          || 'unknown',
        duration:        t.duration        || 0,
        failureMessages: t.failureMessages || [],
        failureDetails:  t.failureDetails  || [],
      })),
      console:          suite.console      || [],
      failureMessage:   suite.message      || '',
    };
  });

  return { results, testResults };
}

module.exports = { adaptJsonOutput };
