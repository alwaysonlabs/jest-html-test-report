'use strict';

function getScripts() {
  // NOTE: This string is embedded verbatim inside a <script> tag in the HTML output.
  // Do NOT use ES6 template literals here — they would conflict with the Node.js
  // template literals used to build the surrounding HTML string.
  return `
(function () {
  'use strict';

  /* ── State ────────────────────────────────────────────────────────────── */
  var currentFilter   = 'all';
  var currentSearch   = '';
  var expandedSuites  = {};
  var toastTimer      = null;

  /* ── Bootstrap ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Auto-expand failed suites
    REPORT_DATA.suites.forEach(function (suite, i) {
      if (suite.status === 'failed') {
        expandedSuites[i] = true;
      }
    });
    renderSuites();
    animateBars();
  });

  /* ── Filtering ────────────────────────────────────────────────────────── */
  window.setFilter = function (filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-card').forEach(function (el) {
      el.classList.toggle('active', el.dataset.filter === filter);
    });
    renderSuites();
  };

  /* ── Search ───────────────────────────────────────────────────────────── */
  window.handleSearch = function (query) {
    currentSearch = query.toLowerCase().trim();
    renderSuites();
  };

  /* ── Expand / Collapse ────────────────────────────────────────────────── */
  window.toggleSuite = function (index) {
    expandedSuites[index] = !expandedSuites[index];
    var card = document.getElementById('suite-' + index);
    if (card) {
      card.classList.toggle('expanded', !!expandedSuites[index]);
    }
  };

  window.expandAll = function () {
    REPORT_DATA.suites.forEach(function (_, i) { expandedSuites[i] = true; });
    document.querySelectorAll('.suite-card').forEach(function (c) { c.classList.add('expanded'); });
  };

  window.collapseAll = function () {
    REPORT_DATA.suites.forEach(function (_, i) { expandedSuites[i] = false; });
    document.querySelectorAll('.suite-card').forEach(function (c) { c.classList.remove('expanded'); });
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  window.renderSuites = function () {
    var container = document.getElementById('testSuites');
    if (!container) { return; }

    var html = '<div class="suites-header">'
      + '<span class="suites-title">Test Suites</span>'
      + '<div class="suites-actions">'
      + '<button class="btn btn-ghost" onclick="expandAll()" style="font-size:0.75rem;padding:5px 12px;">'
      + svgIcon('maximize-2') + 'Expand all</button>'
      + '<button class="btn btn-ghost" onclick="collapseAll()" style="font-size:0.75rem;padding:5px 12px;">'
      + svgIcon('minimize-2') + 'Collapse all</button>'
      + '</div></div>';

    var visibleCount = 0;
    var threshold = (REPORT_DATA.options && REPORT_DATA.options.executionTimeWarningThreshold) || 5;

    REPORT_DATA.suites.forEach(function (suite, idx) {
      var suiteVisible = isSuiteVisible(suite);
      if (!suiteVisible) { return; }

      visibleCount++;
      var isExpanded = !!expandedSuites[idx];
      var statusClass = 'suite-' + suite.status;
      var expandClass = isExpanded ? ' expanded' : '';

      html += '<div class="suite-card ' + statusClass + expandClass + '" id="suite-' + idx + '">';

      /* ── Suite header ── */
      html += '<div class="suite-header" onclick="toggleSuite(' + idx + ')" role="button" tabindex="0"'
        + ' onkeydown="if(event.key===\\'Enter\\'||event.key===\\' \\')toggleSuite(' + idx + ')">';
      html += '<div class="suite-status-dot"></div>';
      html += '<div class="suite-name" title="' + escHtml(suite.fullPath) + '">' + escHtml(suite.displayName) + '</div>';
      html += '<div class="suite-badges">';
      if (suite.passed  > 0) { html += '<span class="badge badge-passed">'  + svgIcon('check', 10) + suite.passed  + '</span>'; }
      if (suite.failed  > 0) { html += '<span class="badge badge-failed">'  + svgIcon('x',     10) + suite.failed  + '</span>'; }
      if (suite.skipped > 0) { html += '<span class="badge badge-skipped">' + svgIcon('minus', 10) + suite.skipped + '</span>'; }
      html += '</div>';
      html += '<span class="suite-duration">' + fmtMs(suite.duration * 1000) + '</span>';
      html += '<button class="expand-btn" aria-label="toggle">' + svgIcon('chevron-down') + '</button>';
      html += '</div>'; /* /suite-header */

      /* ── Suite body ── */
      html += '<div class="suite-body">';

      suite.tests.forEach(function (test) {
        var testVisible = isTestVisible(test);
        var hiddenClass = testVisible ? '' : ' test-hidden';
        var testClass   = 'test-' + test.status;
        var isSlow      = test.duration > threshold * 1000;

        html += '<div class="test-row ' + testClass + hiddenClass + '">';
        html += '<div class="test-status-icon">' + statusIcon(test.status) + '</div>';
        html += '<div class="test-info">';
        if (test.ancestorTitles && test.ancestorTitles.length) {
          html += '<div class="test-ancestors">' + escHtml(test.ancestorTitles.join(' \u203a ')) + '</div>';
        }
        html += '<div class="test-name">' + escHtml(test.title || test.fullName) + '</div>';
        html += '</div>'; /* /test-info */

        if (test.duration !== undefined && test.duration !== null) {
          html += '<div class="test-duration' + (isSlow ? ' slow' : '') + '">'
            + fmtMs(test.duration) + (isSlow ? ' \u26a0\ufe0f' : '') + '</div>';
        }
        html += '</div>'; /* /test-row */

        /* Failure messages */
        if (test.failureMessages && test.failureMessages.length && testVisible) {
          test.failureMessages.forEach(function (msg) {
            html += '<div class="failure-block' + hiddenClass + '"><pre>' + escHtml(stripAnsi(msg)) + '</pre></div>';
          });
        }
      });

      /* Console output */
      if (suite.consoleOutput && suite.consoleOutput.length) {
        html += '<div class="console-block">';
        html += '<div class="console-title">Console output</div>';
        html += '<pre>';
        suite.consoleOutput.forEach(function (entry) {
          html += '[' + (entry.type || 'log').toUpperCase() + '] ' + escHtml(stripAnsi(entry.message)) + '\\n';
        });
        html += '</pre></div>';
      }

      html += '</div>'; /* /suite-body */
      html += '</div>'; /* /suite-card */
    });

    /* No results message */
    html += '<div class="no-results" id="noResults" style="' + (visibleCount === 0 ? 'display:block' : 'display:none') + '">'
      + svgIcon('search')
      + '<p>No tests match the current filter or search.</p>'
      + '</div>';

    container.innerHTML = html;
    animateBars();
  };

  /* ── Visibility helpers ───────────────────────────────────────────────── */
  function isSuiteVisible(suite) {
    // Search filter
    if (currentSearch) {
      var nameMatch = suite.displayName.toLowerCase().indexOf(currentSearch) !== -1;
      var testMatch = suite.tests.some(function (t) {
        return (t.fullName || '').toLowerCase().indexOf(currentSearch) !== -1
            || (t.title  || '').toLowerCase().indexOf(currentSearch) !== -1;
      });
      if (!nameMatch && !testMatch) { return false; }
    }
    // Status filter
    if (currentFilter === 'all') { return true; }
    return suite.tests.some(function (t) { return t.status === currentFilter; });
  }

  function isTestVisible(test) {
    if (currentFilter !== 'all' && test.status !== currentFilter) { return false; }
    if (currentSearch) {
      var n = ((test.fullName || '') + ' ' + (test.title || '')).toLowerCase();
      if (n.indexOf(currentSearch) === -1) { return false; }
    }
    return true;
  }

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  function fmtMs(ms) {
    var n = parseFloat(ms) || 0;
    if (n < 1000) { return n.toFixed(0) + 'ms'; }
    if (n < 60000) { return (n / 1000).toFixed(2) + 's'; }
    var m = Math.floor(n / 60000);
    var s = ((n % 60000) / 1000).toFixed(1);
    return m + 'm ' + s + 's';
  }

  function stripAnsi(s) {
    if (s == null) { return ''; }
    // Remove ANSI escape sequences (e.g. \x1b[31m, \x1b[1;32m, \x1b[0m)
    return String(s).replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  }

  function escHtml(s) {
    if (s == null) { return ''; }
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function svgIcon(name, size) {
    size = size || 14;
    var paths = {
      'check':       '<polyline points="20 6 9 17 4 12"/>',
      'x':           '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      'minus':       '<line x1="5" y1="12" x2="19" y2="12"/>',
      'chevron-down':'<polyline points="6 9 12 15 18 9"/>',
      'maximize-2':  '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
      'minimize-2':  '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>',
      'search':      '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      'copy':        '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
      'sun':         '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
      'moon':        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
      'mail':        '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    };
    var inner = paths[name] || '';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size
      + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"'
      + ' stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }

  function statusIcon(status) {
    if (status === 'passed')  { return svgIcon('check', 10); }
    if (status === 'failed')  { return svgIcon('x',     10); }
    if (status === 'skipped') { return svgIcon('minus', 10); }
    return '';
  }

  /* ── Animate filter bar fills ─────────────────────────────────────────── */
  function animateBars() {
    document.querySelectorAll('.fc-bar-fill[data-pct]').forEach(function (el) {
      el.style.width = el.dataset.pct + '%';
    });
  }

  /* ── Theme toggle ─────────────────────────────────────────────────────── */
  window.toggleTheme = function () {
    var body = document.body;
    var isDark = body.classList.contains('dark-theme');
    body.classList.toggle('dark-theme',  !isDark);
    body.classList.toggle('light-theme',  isDark);
    var btn = document.getElementById('themeBtn');
    if (btn) { btn.title = isDark ? 'Switch to dark theme' : 'Switch to light theme'; }
  };

  /* ── Copy summary to clipboard ───────────────────────────────────────── */
  window.copySummaryToClipboard = function () {
    var d = window.SUMMARY_DATA || {};
    var lines = [
      '='.repeat(52),
      'TEST REPORT: ' + (d.pageTitle || 'Test Report'),
      '='.repeat(52),
      'Date: ' + (d.timestamp || ''),
      '',
      'SUMMARY',
      '-'.repeat(52),
      'Tests:    ' + d.numTotal + ' total  |  ' + d.numPassed + ' passed  |  ' + d.numFailed + ' failed  |  ' + d.numSkipped + ' skipped',
      'Suites:   ' + d.numSuitesTotal + ' total  |  ' + d.numSuitesPassed + ' passed  |  ' + d.numSuitesFailed + ' failed',
      'Duration: ' + d.totalDuration + ' total  |  ' + d.avgDuration + ' avg per test',
      'Success:  ' + d.successRate + '%  |  Risk Level: ' + d.riskLevel.toUpperCase(),
    ];

    if (d.numFailed > 0) {
      lines.push('');
      lines.push('\u26a0 FAILURES');
      lines.push('-'.repeat(52));
      REPORT_DATA.suites.forEach(function (suite) {
        var failedTests = suite.tests.filter(function (t) { return t.status === 'failed'; });
        if (!failedTests.length) { return; }
        lines.push(suite.displayName);
        failedTests.forEach(function (t) {
          lines.push('  \u2717 ' + (t.fullName || t.title));
        });
      });
    }

    lines.push('');
    lines.push('-'.repeat(52));
    lines.push('Generated by jest-html-test-report');

    var text = lines.join('\\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Summary copied to clipboard!');
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Summary copied to clipboard!');
    } catch (e) {
      showToast('Could not copy — check browser permissions.');
    }
    document.body.removeChild(ta);
  }

  function showToast(msg) {
    var el = document.getElementById('toast');
    if (!el) { return; }
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('visible'); }, 3000);
  }

}());
`;
}

module.exports = { getScripts };
