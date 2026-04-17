'use strict';

const path = require('path');
const { getStyles  } = require('./styles');
const { getScripts } = require('./scripts');

/* ─────────────────────────────────────────────────────────────────────────
   Public API
───────────────────────────────────────────────────────────────────────── */
function buildHtml(options, results, testResults, logoData, customStyle, bmcGifData) {
  const data = processData(options, results, testResults, logoData, bmcGifData);
  return renderPage(data, customStyle || '');
}

/* ─────────────────────────────────────────────────────────────────────────
   Data processing
───────────────────────────────────────────────────────────────────────── */
function processData(options, results, testResults, logoData, bmcGifData) {
  const numTotal   = results.numTotalTests    || 0;
  const numPassed  = results.numPassedTests   || 0;
  const numFailed  = results.numFailedTests   || 0;
  const numSkipped = (results.numPendingTests || 0) + (results.numTodoTests || 0);

  const numSuitesTotal   = results.numTotalTestSuites   || 0;
  const numSuitesPassed  = results.numPassedTestSuites  || 0;
  const numSuitesFailed  = results.numFailedTestSuites  || 0;
  const numSuitesSkipped = results.numPendingTestSuites || 0;

  const perfEnds  = testResults.map(tr => tr.perfStats && tr.perfStats.end).filter(Boolean);
  const actualEnd = perfEnds.length > 0 ? Math.max(...perfEnds) : Date.now();
  const startTime = results.startTime || (actualEnd - 1000);
  const totalSec  = (actualEnd - startTime) / 1000;
  const avgSec    = numTotal > 0 ? totalSec / numTotal : 0;
  const successRate  = numTotal > 0
    ? (numPassed / numTotal) * 100
    : (numFailed === 0 ? 100 : 0);

  // Risk classification
  const { low = 90, medium = 70 } = options.riskThresholds || {};
  let riskLevel, riskClass;
  if      (successRate >= low)    { riskLevel = 'Low';    riskClass = 'risk-low';    }
  else if (successRate >= medium) { riskLevel = 'Medium'; riskClass = 'risk-medium'; }
  else                            { riskLevel = 'High';   riskClass = 'risk-high';   }

  // Sort suites
  let suiteData = [...testResults];
  if (options.sort === 'status') {
    const order = { failed: 0, passed: 1, skipped: 2 };
    suiteData.sort((a, b) => {
      const aS = a.numFailingTests > 0 ? 'failed' : a.numPassingTests > 0 ? 'passed' : 'skipped';
      const bS = b.numFailingTests > 0 ? 'failed' : b.numPassingTests > 0 ? 'passed' : 'skipped';
      return order[aS] - order[bS];
    });
  } else if (options.sort === 'duration') {
    suiteData.sort((a, b) => {
      const aD = a.perfStats ? (a.perfStats.end - a.perfStats.start) : 0;
      const bD = b.perfStats ? (b.perfStats.end - b.perfStats.start) : 0;
      return bD - aD;
    });
  } else if (options.sort === 'alphabetical') {
    suiteData.sort((a, b) => a.testFilePath.localeCompare(b.testFilePath));
  }

  const suites = suiteData.map(tr => {
    const fp          = tr.testFilePath || '';
    const displayName = path.relative(process.cwd(), fp).replace(/\\/g, '/');
    const durMs       = tr.perfStats ? (tr.perfStats.end - tr.perfStats.start) : 0;
    const numP        = tr.numPassingTests || 0;
    const numF        = tr.numFailingTests || 0;
    const numS        = tr.numPendingTests || 0;
    const status      = numF > 0 ? 'failed' : numP === 0 ? 'skipped' : 'passed';

    const tests = (tr.testResults || []).map(t => {
      const st        = (t.status === 'pending' || t.status === 'todo') ? 'skipped' : (t.status || 'unknown');
      const ancestors = t.ancestorTitles || [];
      const fullName  = [...ancestors, t.title || ''].filter(Boolean).join(' \u203a ');
      return {
        title:           t.title         || '',
        fullName:        fullName         || '(unnamed)',
        ancestorTitles:  ancestors,
        status:          st,
        duration:        t.duration      || 0,
        failureMessages: options.includeFailureMsg
          ? (t.failureMessages || []).map(function (msg) {
              return options.includeConsoleLog ? msg : truncateStackTrace(msg);
            })
          : [],
      };
    });

    const consoleOutput = options.includeConsoleLog
      ? (tr.console || []).map(c => ({ type: c.type, message: c.message }))
      : [];

    return {
      displayName,
      fullPath:      fp,
      status,
      duration:      durMs / 1000,
      passed:        numP,
      failed:        numF,
      skipped:       numS,
      total:         numP + numF + numS,
      tests,
      consoleOutput,
    };
  });

  // Performance metrics
  const durationThresholds = ((options.durationThresholds || [300, 1000, 2000])
    .map(Number)).sort((a, b) => a - b);
  const allTests       = suites.flatMap(s => s.tests);
  const durationBuckets = computeDurationBuckets(allTests, durationThresholds);
  const slowestTests   = [...allTests]
    .filter(t => t.duration > 0)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .map(t => ({ fullName: t.fullName, duration: t.duration }));

  // Timestamp
  const now       = new Date();
  const timestamp = now.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  // Jest version (best-effort)
  let jestVersion = 'unknown';
  try { jestVersion = require(path.join(process.cwd(), 'node_modules', 'jest', 'package.json')).version; } catch (_) {}
  let reporterVersion = 'unknown';
  try { reporterVersion = require('../package.json').version; } catch (_) {}

  return {
    pageTitle:       options.pageTitle || 'Jest Test Report',
    logoData:        logoData || null,
    bmcGifData:      bmcGifData || null,
    timestamp,
    numTotal, numPassed, numFailed, numSkipped,
    numSuitesTotal, numSuitesPassed, numSuitesFailed, numSuitesSkipped,
    totalDuration:   formatDuration(totalSec),
    avgDuration:     formatDuration(avgSec),
    successRate:     successRate.toFixed(1),
    successRateInt:  Math.round(successRate),
    riskLevel, riskClass,
    suites,
    durationBuckets,
    slowestTests,
    options,
    nodeVersion:     process.version,
    platform:        process.platform,
    jestVersion,
    reporterVersion,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Page assembler
───────────────────────────────────────────────────────────────────────── */
function renderPage(data, customStyle) {
  const clientData = safeJson({
    suites:  data.suites,
    options: {
      executionTimeWarningThreshold: data.options.executionTimeWarningThreshold || 5,
    },
  });

  const summaryData = safeJson({
    pageTitle:       data.pageTitle,
    timestamp:       data.timestamp,
    numTotal:        data.numTotal,
    numPassed:       data.numPassed,
    numFailed:       data.numFailed,
    numSkipped:      data.numSkipped,
    numSuitesTotal:  data.numSuitesTotal,
    numSuitesPassed: data.numSuitesPassed,
    numSuitesFailed: data.numSuitesFailed,
    totalDuration:   data.totalDuration,
    avgDuration:     data.avgDuration,
    successRate:     data.successRate,
    riskLevel:       data.riskLevel,
  });

  const themeClass = data.options.theme === 'light' ? 'light-theme' : 'dark-theme';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(data.pageTitle)}</title>
  <style>
${getStyles()}${customStyle ? '\n/* ── Custom Styles ─────────────────────────────────────────────────── */\n' + customStyle : ''}
  </style>
</head>
<body class="${themeClass}">
  <div class="app">
    ${renderHeader(data)}
    <main class="main">
      <div class="container">
        ${renderExecutionSummary(data)}
        ${renderPerformanceCards(data)}
        ${data.numFailed > 0 ? renderWarningBanner(data) : ''}
        ${renderActionBar()}
        ${renderFilterCards(data)}
        <div id="testSuites"><!-- rendered by JS --></div>
        ${data.options.showEnvironment !== false ? renderEnvironment(data) : ''}
      </div>
    </main>
    <footer class="report-footer">
      <span>Copyright &copy; 2026 Always On Labs, Inc.</span>
    </footer>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script>
    var REPORT_DATA  = ${clientData};
    var SUMMARY_DATA = ${summaryData};
${getScripts()}
  </script>

</body>
</html>`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Section renderers
───────────────────────────────────────────────────────────────────────── */
function renderHeader(data) {
  const logoHtml = data.logoData
    ? `<img src="${escHtml(data.logoData)}" alt="Logo" class="header-logo" />`
    : `<div class="logo-placeholder">${svgIcon('zap', 18)}</div>`;

  return `
  <header class="header">
    <div class="header-left">
      ${logoHtml}
      <div class="header-title">
        <h1 class="header-title-text">${escHtml(data.pageTitle)}</h1>
        <div class="subtitle">${escHtml(data.timestamp)}</div>
      </div>
    </div>
    <div class="header-center">
      <div class="search-wrap">
        ${svgIcon('search', 14)}
        <input
          type="search"
          class="search-input"
          id="searchInput"
          placeholder="Search tests\u2026"
          aria-label="Search tests"
          oninput="handleSearch(this.value)"
        />
      </div>
    </div>
    <div class="header-right">
      ${data.options.showSupportButton !== false && data.bmcGifData ? `<a class="bmc-btn" href="https://buymeacoffee.com/alwaysonlabs" target="_blank" rel="noopener noreferrer" title="Buy me a coffee">
        <img src="${data.bmcGifData}" alt="Buy me a coffee" class="bmc-gif" />
      </a>` : ''}
      <button class="icon-btn" id="themeBtn" title="Toggle theme" onclick="toggleTheme()" aria-label="Toggle theme">
        ${svgIcon('sun', 16)}
      </button>
    </div>
  </header>`;
}

function renderExecutionSummary(data) {
  const pct = data.successRateInt;

  // Donut SVG — radius 15.9155 makes circumference ≈ 100
  const r     = 15.9155;
  const circ  = 100;
  const filled = Math.min(pct, 100);
  const riskColorMap = {
    'risk-low':    'var(--success)',
    'risk-medium': 'var(--warning)',
    'risk-high':   'var(--danger)',
  };
  const riskColor = riskColorMap[data.riskClass] || 'var(--accent)';

  const donut = `
    <svg class="donut-svg" viewBox="0 0 42 42" aria-hidden="true">
      <circle class="donut-track" cx="21" cy="21" r="${r}" />
      <circle class="donut-ring"
        cx="21" cy="21" r="${r}"
        stroke="${riskColor}"
        stroke-dasharray="${filled} ${circ - filled}"
        stroke-dashoffset="25"
      />
    </svg>
    <div class="donut-pct">
      <span class="pct-num ${data.riskClass}">${pct}</span>
      <span class="pct-sym">%</span>
    </div>`;

  // Stats definitions
  const successColor = pct >= 90 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--danger)';
  const stats = [
    {
      value: data.numTotal,
      label: 'Tests Executed',
      color: 'var(--accent)',
    },
    {
      value: data.successRate + '%',
      label: 'Success Rate',
      color: successColor,
    },
    {
      value: data.numFailed,
      label: 'Failures',
      sub:   data.numFailed === 0 ? 'All clear' : 'Review required',
      color: data.numFailed > 0 ? 'var(--danger)' : 'var(--success)',
    },
    {
      value: data.totalDuration,
      label: 'Total Duration',
      color: 'var(--accent)',
    },
    {
      value: data.avgDuration,
      label: 'Avg per Test',
      color: 'var(--accent)',
    },
    {
      value: data.numSuitesPassed + '/' + data.numSuitesTotal,
      label: 'Suites Passed',
      sub:   data.numSuitesFailed > 0 ? data.numSuitesFailed + ' failed' : 'All passed',
      color: data.numSuitesFailed > 0 ? 'var(--warning)' : 'var(--success)',
    },
  ];

  const statsHtml = stats.map(s => `
    <div class="stat-card" style="--stat-color:${s.color}">
      <div class="stat-value">${escHtml(String(s.value))}</div>
      <div class="stat-label">${escHtml(s.label)}</div>
      ${s.sub ? `<div class="stat-sub">${escHtml(s.sub)}</div>` : ''}
    </div>`).join('');

  return `
  <section class="section card summary-card">
    <div class="summary-top">
      <div class="summary-heading">
        <h2>Execution Summary</h2>
        <p>${escHtml(data.options.executionSummarySubtitle || 'Quality metrics at a glance for stakeholders')}</p>
      </div>
      <div class="risk-widget">
        <span class="risk-label-top">Risk Level</span>
        <div class="donut-wrap">${donut}</div>
        <span class="risk-label-bottom ${data.riskClass}">${escHtml(data.riskLevel)}</span>
      </div>
    </div>
    <div class="stats-grid">
      ${statsHtml}
    </div>
  </section>`;
}

function renderPerformanceCards(data) {
  // Bucket color palette aligned with the design system
  const bucketColors = [
    { color: 'var(--success)',        glow: 'var(--success-glow)',  border: 'var(--success-border)' },
    { color: 'var(--warning)',        glow: 'var(--warning-glow)',  border: 'var(--warning-border)' },
    { color: 'rgba(255,140,0,0.90)', glow: 'rgba(255,140,0,0.14)', border: 'rgba(255,140,0,0.30)' },
    { color: 'var(--danger)',         glow: 'var(--danger-glow)',   border: 'var(--danger-border)'  },
  ];

  const bucketRows = data.durationBuckets.map(function (b, i) {
    const palette = bucketColors[Math.min(i, bucketColors.length - 1)];
    return `
      <div class="dist-row">
        <span class="dist-dot" style="background:${palette.color}"></span>
        <span class="dist-label">${escHtml(b.label)}</span>
        <div class="dist-bar-wrap">
          <div class="dist-bar-fill" style="width:${b.pct}%;background:${palette.color};box-shadow:0 0 6px ${palette.glow}"></div>
        </div>
        <span class="dist-count">${b.count} test${b.count !== 1 ? 's' : ''}</span>
        <span class="dist-pct">(${b.pct}%)</span>
      </div>`;
  }).join('');

  const slowRows = data.slowestTests.length === 0
    ? '<p class="perf-empty">No test duration data available.</p>'
    : data.slowestTests.map(function (t, i) {
        return `
      <div class="slow-row">
        <span class="slow-rank">${i + 1}</span>
        <span class="slow-name" data-tooltip="${escHtml(t.fullName)}">
          <span class="slow-name-text">${escHtml(t.fullName)}</span>
        </span>
        <span class="slow-dur">${formatDuration(t.duration / 1000)}</span>
      </div>`;
      }).join('');

  return `
  <div class="perf-cards-grid">
    <div class="card perf-card">
      <div class="perf-card-title">Duration Distribution</div>
      <div class="dist-list">${bucketRows}</div>
    </div>
    <div class="card perf-card">
      <div class="perf-card-title">Top ${data.slowestTests.length} Slowest Tests</div>
      <div class="slow-list">${slowRows}</div>
    </div>
  </div>`;
}

function renderWarningBanner(data) {
  const plural = data.numFailed === 1 ? 'test' : 'tests';
  return `
  <div class="warning-banner" role="alert">
    ${svgIcon('alert-triangle', 18)}
    <span>
      <strong>${data.numFailed} ${plural} failed</strong> &mdash;
      Review the failures below before proceeding with release.
    </span>
  </div>`;
}

function renderActionBar() {
  return `
  <div class="action-bar">
    <button class="btn btn-primary" onclick="copySummaryToClipboard()">
      ${svgIcon('mail', 15)}
      Copy Summary to Clipboard
    </button>
  </div>`;
}

function renderFilterCards(data) {
  const total   = data.numTotal;
  const passed  = data.numPassed;
  const failed  = data.numFailed;
  const skipped = data.numSkipped;

  const pPassed  = total > 0 ? (passed  / total * 100).toFixed(0) : 0;
  const pFailed  = total > 0 ? (failed  / total * 100).toFixed(0) : 0;
  const pSkipped = total > 0 ? (skipped / total * 100).toFixed(0) : 0;

  const cards = [
    {
      filter:  'all',
      label:   'Total Tests',
      value:   total,
      pct:     100,
      icon:    'layers',
      cssVars: '--fc-color:var(--accent);--fc-glow:var(--accent-glow);--fc-border:var(--accent-border)',
    },
    {
      filter:  'passed',
      label:   'Passed',
      value:   passed,
      pct:     pPassed,
      icon:    'check-circle',
      cssVars: '--fc-color:var(--success);--fc-glow:var(--success-glow);--fc-border:var(--success-border)',
    },
    {
      filter:  'failed',
      label:   'Failed',
      value:   failed,
      pct:     pFailed,
      icon:    'x-circle',
      cssVars: '--fc-color:var(--danger);--fc-glow:var(--danger-glow);--fc-border:var(--danger-border)',
    },
    {
      filter:  'skipped',
      label:   'Skipped',
      value:   skipped,
      pct:     pSkipped,
      icon:    'skip-forward',
      cssVars: '--fc-color:var(--warning);--fc-glow:var(--warning-glow);--fc-border:var(--warning-border)',
    },
  ];

  const cardsHtml = cards.map((c, i) => `
    <button
      class="filter-card${i === 0 ? ' active' : ''}"
      data-filter="${c.filter}"
      style="${c.cssVars}"
      onclick="setFilter('${c.filter}')"
      aria-pressed="${i === 0}"
    >
      <div class="fc-header">
        <span class="fc-label">${escHtml(c.label)}</span>
        <span class="fc-icon">${svgIcon(c.icon, 13)}</span>
      </div>
      <div class="fc-value">${c.value}</div>
      <div class="fc-bar">
        <div class="fc-bar-fill" data-pct="${c.pct}" style="width:0%"></div>
      </div>
    </button>`).join('');

  return `
  <section class="filter-section">
    <div class="filter-grid">${cardsHtml}</div>
  </section>`;
}

function renderEnvironment(data) {
  const items = [
    { key: 'Node.js',          val: data.nodeVersion      },
    { key: 'Platform',         val: data.platform         },
    { key: 'Jest',             val: data.jestVersion      },
    { key: 'jest-test-report', val: data.reporterVersion  },
    { key: 'Generated',        val: data.timestamp        },
  ];
  return `
  <section class="section card env-card">
    <div class="env-title">Environment</div>
    <div class="env-grid">
      ${items.map(i => `
      <div class="env-item">
        <div class="env-key">${escHtml(i.key)}</div>
        <div class="env-val">${escHtml(i.val)}</div>
      </div>`).join('')}
    </div>
  </section>`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Utilities
───────────────────────────────────────────────────────────────────────── */
function computeDurationBuckets(tests, thresholds) {
  const counts = Array(thresholds.length + 1).fill(0);
  tests.forEach(function (t) {
    const ms = t.duration || 0;
    let placed = false;
    for (let i = 0; i < thresholds.length; i++) {
      if (ms < thresholds[i]) { counts[i]++; placed = true; break; }
    }
    if (!placed) { counts[thresholds.length]++; }
  });
  const total = tests.length || 1;
  return thresholds.concat([null]).map(function (upper, i) {
    const lower = i === 0 ? 0 : thresholds[i - 1];
    let label;
    if (i === 0)                    { label = '<' + thresholds[0] + 'ms'; }
    else if (upper === null)        { label = '>' + thresholds[thresholds.length - 1] + 'ms'; }
    else                            { label = lower + '\u2013' + upper + 'ms'; }
    return { label, count: counts[i], pct: Math.round(counts[i] / total * 100) };
  });
}

function truncateStackTrace(msg) {
  if (!msg) { return msg; }
  var lines = msg.split('\n');
  var result = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (/^\s+at\s+/.test(line) && line.indexOf('node_modules') !== -1) {
      break;
    }
    result.push(line);
  }
  return result.join('\n');
}

function escHtml(str) {
  if (str == null) { return ''; }
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeJson(obj) {
  return JSON.stringify(obj)
    .replace(/<\/script>/gi, '<\\/script>')
    .replace(/<!--/g,        '<\\!--');
}

function formatDuration(seconds) {
  const s = parseFloat(seconds) || 0;
  if (s < 0.001) { return '0ms'; }
  if (s < 1)     { return (s * 1000).toFixed(0) + 'ms'; }
  if (s < 60)    { return s.toFixed(2) + 's'; }
  const m   = Math.floor(s / 60);
  const rem = (s % 60).toFixed(1);
  return `${m}m ${rem}s`;
}

function svgIcon(name, size) {
  size = size || 16;
  const paths = {
    'zap':           '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'search':        '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'sun':           '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    'alert-triangle':'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'mail':          '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    'layers':        '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    'check-circle':  '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'x-circle':      '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    'skip-forward':  '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>',
  };
  const inner = paths[name] || '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

module.exports = { buildHtml };
