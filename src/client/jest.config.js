module.exports = {
  setupFiles: ['./jest.setup.js'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.js$': ['babel-jest', { cwd: __dirname }],
  },
  testURL: 'http://localhost',
}
