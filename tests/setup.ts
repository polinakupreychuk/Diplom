import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock OpenAI API during tests
vi.mock('openai', () => ({
    default: vi.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{
                        message: {
                            content: JSON.stringify({
                                sentiment: 'neutral',
                                entities: ['Тест']
                            })
                        }
                    }]
                })
            }
        }
    }))
}))

// Mock environment variables
process.env.OPENAI_API_KEY = 'sk-test-key-for-unit-tests'