'use strict';

function getStyles() {
  return `
/* ─── Reset ─────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }

/* ─── Design tokens: dark (default) ─────────────────────────────────────── */
:root {
  --bg-body:        #050b17;
  --bg-header:      #030810;
  --bg-card:        #09152280;
  --bg-card-solid:  #091522;
  --bg-card-hover:  #0c1c30;
  --bg-input:       #060d1a;
  --bg-inset:       #040b16;

  --accent:         #00d4c8;
  --accent-bright:  #00ede4;
  --accent-glow:    rgba(0, 212, 200, 0.18);
  --accent-border:  rgba(0, 212, 200, 0.22);
  --accent-border2: rgba(0, 212, 200, 0.40);

  --success:        #00e676;
  --success-dim:    rgba(0, 230, 118, 0.70);
  --success-glow:   rgba(0, 230, 118, 0.14);
  --success-border: rgba(0, 230, 118, 0.30);

  --danger:         #ff4757;
  --danger-dim:     rgba(255, 71, 87, 0.70);
  --danger-glow:    rgba(255, 71, 87, 0.14);
  --danger-border:  rgba(255, 71, 87, 0.30);

  --warning:        #ffa502;
  --warning-dim:    rgba(255, 165, 2, 0.70);
  --warning-glow:   rgba(255, 165, 2, 0.14);
  --warning-border: rgba(255, 165, 2, 0.30);

  --text-1:  #f0f6ff;
  --text-2:  #b8ccdf;
  --text-3:  #6b87a4;
  --text-4:  #344e66;

  --border-1: rgba(0, 212, 200, 0.07);
  --border-2: rgba(0, 212, 200, 0.14);
  --border-3: rgba(0, 212, 200, 0.28);

  --radius-sm: 6px;
  --radius:    10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  --shadow-sm:   0 2px 8px rgba(0,0,0,0.35);
  --shadow-md:   0 4px 24px rgba(0,0,0,0.45);
  --shadow-lg:   0 8px 48px rgba(0,0,0,0.55);
  --shadow-glow: 0 0 40px rgba(0, 212, 200, 0.06);

  --font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
}

/* ─── Design tokens: light override ─────────────────────────────────────── */
body.light-theme {
  --bg-body:        #eef2f8;
  --bg-header:      #ffffff;
  --bg-card:        rgba(255,255,255,0.85);
  --bg-card-solid:  #ffffff;
  --bg-card-hover:  #f7faff;
  --bg-input:       #f0f4f8;
  --bg-inset:       #e8edf5;

  --text-1:  #0f1923;
  --text-2:  #243346;
  --text-3:  #5a7898;
  --text-4:  #9cb3c9;

  --border-1: rgba(0,0,0,0.06);
  --border-2: rgba(0,0,0,0.11);
  --border-3: rgba(0,0,0,0.22);

  --shadow-sm:   0 2px 8px rgba(0,0,0,0.08);
  --shadow-md:   0 4px 24px rgba(0,0,0,0.12);
  --shadow-lg:   0 8px 48px rgba(0,0,0,0.16);
  --shadow-glow: none;
}
body.light-theme .btn-primary {
  background: #ffffff;
  border-color: var(--accent-border2);
  color: var(--accent-bright);
  box-shadow: 0 0 16px rgba(0,212,200,0.08);
}
body.light-theme .btn-primary:hover {
  background: #f0fdfc;
}

/* ─── Base body ──────────────────────────────────────────────────────────── */
body {
  background-color: var(--bg-body);
  color: var(--text-2);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif;
  line-height: 1.6;
  min-height: 100vh;
}

/* Subtle grid pattern for dark theme */
body.dark-theme::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,212,200,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,200,0.025) 1px, transparent 1px);
  background-size: 52px 52px;
  pointer-events: none;
  z-index: 0;
}

.app { position: relative; z-index: 1; }

/* ─── Layout ─────────────────────────────────────────────────────────────── */
.main      { padding: 24px 16px 60px; }
.container { max-width: 1440px; margin: 0 auto; }

/* ─── Header ─────────────────────────────────────────────────────────────── */
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  height: 64px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-2);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.header-logo {
  height: 36px;
  width: auto;
  border-radius: var(--radius-sm);
}

.logo-placeholder {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #0088ff);
  box-shadow: 0 0 12px var(--accent-glow), 0 0 24px var(--accent-glow);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.logo-placeholder svg { width: 20px; height: 20px; color: #fff; }

.header-title { line-height: 1.2; }
.header-title h1 {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  background: linear-gradient(120deg, var(--text-1) 40%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
body.dark-theme .header-title-text {
  -webkit-text-fill-color: #ffffff !important;
  color: #ffffff !important;
  background: none !important;
}
.header-title .subtitle {
  font-size: 0.72rem;
  color: var(--text-3);
}

.header-center { flex: 1; display: flex; justify-content: center; }

.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-input);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-xl);
  padding: 6px 14px;
  width: 100%;
  max-width: 380px;
  transition: border-color 0.2s;
}
.search-wrap:focus-within {
  border-color: var(--accent-border2);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.search-wrap svg { color: var(--text-3); flex-shrink: 0; }
.search-input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-1);
  font-size: 0.85rem;
  width: 100%;
}
.search-input::placeholder { color: var(--text-4); }

.header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.bmc-btn {
  display: flex; align-items: center;
  text-decoration: none;
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: 34px; height: 34px;
  flex-shrink: 0;
  transition: opacity 0.2s, transform 0.15s;
}
.bmc-btn:hover { opacity: 0.85; transform: translateY(-1px); }
.bmc-gif { display: block; width: 34px; height: 34px; object-fit: cover; }

.icon-btn {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: 1px solid var(--border-2);
  border-radius: var(--radius-sm);
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover {
  border-color: var(--accent-border2);
  color: var(--accent);
  background: var(--accent-glow);
}
.icon-btn svg { width: 16px; height: 16px; }

/* ─── Section spacing ────────────────────────────────────────────────────── */
.section { margin-bottom: 20px; }

/* ─── Card ───────────────────────────────────────────────────────────────── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md), var(--shadow-glow);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* ─── Execution Summary ──────────────────────────────────────────────────── */
.summary-card {
  padding: 28px 28px 22px;
}

.summary-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.summary-heading { flex: 1; }
.summary-heading h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.summary-heading p { font-size: 0.82rem; color: var(--text-3); }

/* Donut chart */
.risk-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.risk-label-top {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-3);
  text-transform: uppercase;
}
.donut-wrap { position: relative; width: 90px; height: 90px; }
.donut-svg   { width: 90px; height: 90px; transform: rotate(-90deg); }
.donut-track { fill: none; stroke: var(--border-1); stroke-width: 4; }
.donut-ring  {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease;
}
.donut-pct {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  line-height: 1;
}
.donut-pct .pct-num {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.donut-pct .pct-sym { font-size: 0.65rem; color: var(--text-3); }

.risk-label-bottom {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.risk-low    { color: var(--success); }
.risk-medium { color: var(--warning); }
.risk-high   { color: var(--danger);  }

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--bg-inset);
  border: 1px solid var(--border-1);
  border-radius: var(--radius);
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.stat-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 3px 0 0 3px;
  background: var(--stat-color, var(--accent));
}
.stat-card:hover {
  border-color: var(--border-2);
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--stat-color, var(--text-1));
  line-height: 1;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 0.72rem;
  color: var(--text-3);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.stat-sub {
  font-size: 0.68rem;
  color: var(--text-4);
  margin-top: 2px;
}

/* ─── Performance cards ──────────────────────────────────────────────────── */
.perf-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.perf-card {
  padding: 20px 22px;
}

.perf-card-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 16px;
}

/* Duration distribution */
.dist-list { display: flex; flex-direction: column; gap: 10px; }

.dist-row {
  display: grid;
  grid-template-columns: 10px 90px 1fr 70px 44px;
  align-items: center;
  gap: 10px;
}

.dist-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dist-label {
  font-size: 0.78rem;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.dist-bar-wrap {
  height: 7px;
  background: var(--bg-inset);
  border-radius: 4px;
  overflow: hidden;
}

.dist-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.dist-count {
  font-size: 0.75rem;
  color: var(--text-2);
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.dist-pct {
  font-size: 0.72rem;
  color: var(--text-4);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Slowest tests */
.slow-list { display: flex; flex-direction: column; gap: 8px; }

.slow-row {
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  background: var(--bg-inset);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-1);
}

.slow-rank {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-4);
  text-align: center;
}

.slow-name {
  position: relative;
  min-width: 0;
}

.slow-name-text {
  font-size: 0.77rem;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.slow-name::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: var(--bg-card-solid);
  color: var(--text-1);
  border: 1px solid var(--border-3);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 0.76rem;
  line-height: 1.55;
  white-space: normal;
  word-break: break-word;
  max-width: 340px;
  min-width: 180px;
  box-shadow: var(--shadow-md);
  z-index: 200;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.slow-name:hover::after {
  opacity: 1;
}

.slow-dur {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--warning);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.perf-empty {
  font-size: 0.78rem;
  color: var(--text-4);
}

@media (max-width: 700px) {
  .perf-cards-grid { grid-template-columns: 1fr; }
  .dist-row { grid-template-columns: 10px 80px 1fr 60px 40px; }
}

/* ─── Warning banner ─────────────────────────────────────────────────────── */
.warning-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(255, 165, 2, 0.07);
  border: 1px solid var(--warning-border);
  border-left: 3px solid var(--warning);
  border-radius: var(--radius);
  margin-bottom: 16px;
  color: var(--text-1);
  font-size: 0.88rem;
}
.warning-banner svg { color: var(--warning); flex-shrink: 0; }
.warning-banner strong { color: var(--warning); }

/* ─── Action bar ─────────────────────────────────────────────────────────── */
.action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  border-radius: var(--radius);
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, rgba(0,212,200,0.2), rgba(0,136,255,0.15));
  border-color: var(--accent-border2);
  color: var(--accent-bright);
  box-shadow: 0 0 16px rgba(0,212,200,0.08);
}
.btn-primary:hover {
  background: linear-gradient(135deg, rgba(0,212,200,0.3), rgba(0,136,255,0.25));
  box-shadow: 0 0 24px rgba(0,212,200,0.18);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); }

.btn-ghost {
  background: transparent;
  border-color: var(--border-2);
  color: var(--text-3);
}
.btn-ghost:hover {
  border-color: var(--border-3);
  color: var(--text-2);
  background: var(--bg-card);
}

.btn svg { width: 15px; height: 15px; }

/* ─── Filter cards ───────────────────────────────────────────────────────── */
.filter-section { margin-bottom: 20px; }

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.filter-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.filter-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.2s;
  background: radial-gradient(ellipse at 50% -20%, var(--fc-glow, var(--accent-glow)), transparent 70%);
}
.filter-card:hover::after,
.filter-card.active::after { opacity: 1; }
.filter-card:hover {
  border-color: var(--fc-border, var(--accent-border));
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.filter-card.active {
  border-color: var(--fc-border, var(--accent-border2));
  box-shadow: var(--shadow-md), 0 0 0 1px var(--fc-border, var(--accent-border));
}

.fc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.fc-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
}
.fc-icon {
  width: 26px; height: 26px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--fc-glow, var(--accent-glow));
  border: 1px solid var(--fc-border, var(--accent-border));
}
.fc-icon svg { width: 14px; height: 14px; color: var(--fc-color, var(--accent)); }

.fc-value {
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: var(--fc-color, var(--accent));
  line-height: 1;
  margin-bottom: 6px;
  position: relative; z-index: 1;
}

.fc-bar {
  height: 4px;
  background: var(--border-1);
  border-radius: 4px;
  overflow: hidden;
}
.fc-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--fc-color, var(--accent));
  box-shadow: 0 0 8px var(--fc-glow, var(--accent-glow));
  transition: width 0.8s ease;
}

/* ─── Test suites ────────────────────────────────────────────────────────── */
.suites-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
}
.suites-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
}
.suites-actions { display: flex; gap: 8px; }

.suite-card {
  background: var(--bg-card);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-lg);
  margin-bottom: 10px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: var(--shadow-sm);
}
.suite-card:hover { border-color: var(--border-2); }
.suite-card.suite-failed { border-left: 3px solid var(--danger); }
.suite-card.suite-passed { border-left: 3px solid var(--success); }
.suite-card.suite-skipped { border-left: 3px solid var(--warning); }

.suite-card.hidden { display: none; }

.suite-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}
.suite-header:hover { background: var(--bg-card-hover); }

.suite-status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.suite-failed .suite-status-dot  { background: var(--danger);  box-shadow: 0 0 6px var(--danger-glow); }
.suite-passed .suite-status-dot  { background: var(--success); box-shadow: 0 0 6px var(--success-glow); }
.suite-skipped .suite-status-dot { background: var(--warning); box-shadow: 0 0 6px var(--warning-glow); }

.suite-name {
  flex: 1;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-1);
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suite-badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 0.70rem;
  font-weight: 700;
}
.badge-passed  { background: var(--success-glow); color: var(--success); border: 1px solid var(--success-border); }
.badge-failed  { background: var(--danger-glow);  color: var(--danger);  border: 1px solid var(--danger-border);  }
.badge-skipped { background: var(--warning-glow); color: var(--warning); border: 1px solid var(--warning-border); }

.suite-duration {
  font-size: 0.72rem;
  color: var(--text-3);
  flex-shrink: 0;
  font-family: var(--font-mono);
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-3);
  flex-shrink: 0;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: color 0.2s, transform 0.25s;
}
.expand-btn svg { width: 16px; height: 16px; }
.suite-card.expanded .expand-btn { transform: rotate(180deg); color: var(--accent); }

/* Suite body (collapsible) */
.suite-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: 0 solid var(--border-1);
}
.suite-card.expanded .suite-body {
  max-height: 8000px;
  border-top-width: 1px;
}

/* Individual test rows */
.test-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px 10px 36px;
  border-bottom: 1px solid var(--border-1);
  transition: background 0.15s;
}
.test-row:last-child { border-bottom: none; }
.test-row:hover { background: var(--bg-card-hover); }
.test-row.test-hidden { display: none; }

.test-status-icon {
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.test-passed  .test-status-icon { background: var(--success-glow); color: var(--success); }
.test-failed  .test-status-icon { background: var(--danger-glow);  color: var(--danger);  }
.test-skipped .test-status-icon { background: var(--warning-glow); color: var(--warning); }
.test-status-icon svg { width: 10px; height: 10px; }

.test-info { flex: 1; min-width: 0; }
.test-name {
  font-size: 0.83rem;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.test-ancestors {
  font-size: 0.72rem;
  color: var(--text-3);
  margin-bottom: 2px;
}

.test-duration {
  font-size: 0.70rem;
  color: var(--text-3);
  font-family: var(--font-mono);
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 2px;
}
.test-duration.slow { color: var(--warning); }

/* Failure messages */
.failure-block {
  margin: 8px 36px 10px;
  background: rgba(255, 71, 87, 0.06);
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.failure-block pre {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.6;
  padding: 12px 14px;
  color: var(--text-2);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
.failure-block pre .err-line { color: var(--danger); }

/* Console output */
.console-block {
  margin: 0 36px 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-sm);
}
.console-title {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
  padding: 6px 12px 4px;
  border-bottom: 1px solid var(--border-1);
}
.console-block pre {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  line-height: 1.6;
  padding: 10px 12px;
  color: var(--text-2);
  overflow-x: auto;
  white-space: pre-wrap;
}

/* ─── No results ──────────────────────────────────────────────────────────── */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-3);
  font-size: 0.9rem;
  display: none;
}
.no-results svg { width: 40px; height: 40px; margin: 0 auto 12px; display: block; opacity: 0.4; }

/* ─── Environment ────────────────────────────────────────────────────────── */
.env-card {
  padding: 20px 24px;
  margin-top: 20px;
}
.env-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: var(--text-3);
  margin-bottom: 16px;
}
.env-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.env-item {}
.env-key {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-4);
  margin-bottom: 2px;
}
.env-val {
  font-size: 0.82rem;
  color: var(--text-2);
  font-family: var(--font-mono);
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: var(--bg-card-solid);
  border: 1px solid var(--accent-border2);
  border-radius: var(--radius);
  padding: 12px 20px;
  font-size: 0.84rem;
  color: var(--text-1);
  box-shadow: var(--shadow-lg), 0 0 20px var(--accent-glow);
  z-index: 9999;
  transform: translateY(80px);
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
  pointer-events: none;
}
.toast.visible {
  transform: translateY(0);
  opacity: 1;
}

/* ─── Scrollbar ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-3); }

/* ─── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 860px) {
  .filter-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 700px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .summary-top { flex-direction: column-reverse; align-items: flex-start; }
  .risk-widget { flex-direction: row; align-items: center; gap: 14px; }
  .header-center { display: none; }
}
@media (max-width: 480px) {
  .stats-grid  { grid-template-columns: 1fr; }
  .filter-grid { grid-template-columns: 1fr 1fr; }
  .main { padding: 16px 10px 40px; }
  .summary-card { padding: 18px; }
}

/* ─── Utility ────────────────────────────────────────────────────────────── */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }

/* ─── Footer ─────────────────────────────────────────────────────────────── */
.report-footer {
  text-align: center;
  padding: 16px;
  font-size: 0.75rem;
  color: var(--text-4);
  border-top: 1px solid var(--border-1);
}
`;
}

module.exports = { getStyles };
