import { vi } from "vitest"

export function createMockDb() {
  const mock = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }
 
  mock.select.mockReturnValue(mock)
  mock.from.mockReturnValue(mock)
  mock.where.mockReturnValue(mock)
  
  mock.insert.mockReturnValue(mock)
  mock.values.mockReturnValue(mock)
  mock.returning.mockReturnValue(mock)
  
  mock.update.mockReturnValue(mock)
  mock.set.mockReturnValue(mock)

  mock.delete.mockReturnValue(mock)

  return mock
}
