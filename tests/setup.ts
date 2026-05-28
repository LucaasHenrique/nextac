import { vi } from 'vitest'

const bcryptMock = {
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}

vi.mock('bcrypt', () => ({
  default: bcryptMock,
  ...bcryptMock,
}))

const jwtMock = {
  sign: vi.fn().mockReturnValue('fake-jwt-token'),
  verify: vi.fn().mockReturnValue({ id: '123', email: 'test@test.com' }),
}

vi.mock('jsonwebtoken', () => ({
  default: jwtMock,
  ...jwtMock,
}))
