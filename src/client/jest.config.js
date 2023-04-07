module.exports = {
  moduleDirectories: [__dirname],
  testEnvironment: 'jsdom',
  transform: {
    '\\.js$': ['babel-jest', { cwd: __dirname }],
  },
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
}
