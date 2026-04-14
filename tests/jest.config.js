module.exports = {
  testEnvironment: 'node',
  reporters: [
    'default',
    [
      '../index.js',
      {
        outputPath: './report.html',
        pageTitle: 'Jest HTML Test Report — Local Demo',
        theme: 'dark',
        sort: 'status',
        includeFailureMsg: true,
        includeConsoleLog: true,
        executionTimeWarningThreshold: 3,
        durationThresholds: [2, 5, 10],
        openReport: true,
        showEnvironment: true,
        showSupportButton: false,
      },
    ],
  ],
};
