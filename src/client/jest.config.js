module.exports = {
  moduleDirectories: [__dirname],
  testEnvironment: 'jsdom',
  transform: {
    '\\.jsx?$': ['babel-jest', { cwd: __dirname }],
  },
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
}
