import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
        },
        isolatedModules: true,
      },
    ],
  },

  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  
  clearMocks: true,
};

export default config;