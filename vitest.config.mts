import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],  // ← lcov потрібен для SonarQube
            reportsDirectory: './coverage',
            include: [
                'lib/**/*.ts',
                'components/**/*.tsx',
                'app/api/**/*.ts',
            ],
            exclude: [
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/*.config.*',
                'node_modules/**',
                '.next/**',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
})