import {describe, it, expect} from 'vitest'
    import { BadRequestError, NotFoundError, UnauthorizedError } from '../../../src/errors/http.errors.js'

describe('HTTP Errors', () => {
    it('BadRequest deve ter status 400', () =>{
        const error = new BadRequestError("Erro de teste")
        expect(error.statusCode).toBe(400)
    })

    it('NotFoundError deve ter status 404', () => {
        const error = new NotFoundError('Não encontrado')
        expect(error.statusCode).toBe(404)
    })
})
