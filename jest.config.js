module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  maxWorkers: 1,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@collections/(.*)$": "<rootDir>/src/collections/$1",
    "^@factories/(.*)$": "<rootDir>/src/factories/$1",
    "^@interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
    "^@interfaces": "<rootDir>/src/interfaces/index.ts",
    "^@iterators/(.*)$": "<rootDir>/src/iterators/$1",
    "^@operations/(.*)$": "<rootDir>/src/operations/$1",
    "^@util/(.*)$": "<rootDir>/src/util/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};
