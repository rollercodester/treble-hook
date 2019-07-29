module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx'
  ],
  roots: [
    '<rootDir>/src'
  ],
  /*
  testMatch: [
    './src/__tests__/*.test.+(ts|tsx)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  */
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
}
