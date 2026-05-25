import { vi } from 'vitest'

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}))

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('fake-jwt-token'),
  verify: vi.fn().mockReturnValue({ id: '123', email: 'test@test.com' }),
}))
