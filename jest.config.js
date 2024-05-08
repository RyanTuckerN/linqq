module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // verbose: true,
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  }
};