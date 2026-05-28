import {vi} from 'vitest'

vi.mock('@/queues/review.session.queue', () => ({
  scheduleSessionEnd: vi.fn().mockResolvedValue(undefined),
  cancelScheduledSessionEnd: vi.fn().mockResolvedValue(undefined),
}))
