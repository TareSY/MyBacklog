const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // Path to Next.js app
    dir: './',
});

/** @type {import('jest').Config} */
const config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/e2e/',
    ],
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
    ],
};

module.exports = createJestConfig(config);
