import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/**/*.spec.ts'],
        exclude: ['node_modules', 'lib'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: ['node_modules/', 'lib/', 'src/**/*.spec.ts', 'src/playground.ts'],
        },
    },
});
