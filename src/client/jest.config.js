module.exports = {
  moduleDirectories: [__dirname],
  testEnvironment: 'jsdom',
  transform: {
    '\\.jsx?$': ['babel-jest', { cwd: __dirname }],
  },
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/coverage/**',
    '!**/public/**',
    '!**/*rc.js',
    '!**/testUtils.jsx',
    '!**/jest.config.js',
    '!**/main.js',
    '!**/run.js',
    '!**/webpack*.js',
  ],
}
