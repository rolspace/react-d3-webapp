import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  moduleDirectories: [__dirname],
  testEnvironment: 'jest-fixed-jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  transform: {
    "\\.[jt]sx?$": ['babel-jest', { cwd: __dirname }],
  },
  extensionsToTreatAsEsm: ['.jsx'],
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/coverage/**',
    '!**/public/**',
    '!**/*rc.js',
    '!**/webpack*.js',
    '!utils/testUtils.jsx',
    '!jest.config.js',
    '!main.js',
    '!run.js',
  ],
}
