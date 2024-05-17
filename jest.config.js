// how to make tests run in sequence ?
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true, // log all tests
  maxWorkers: 1, // this will make tests run in sequence, preventing the resource contention
  transform: { 
    '^.+\\.(ts)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  }
};
