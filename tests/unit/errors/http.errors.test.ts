import {describe, it, expect} from 'vitest'
import { AppError, BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '../../../src/errors/http.errors.js'

describe('HTTP Errors', () => {
    it('BadRequestError deve ter status 400 e code "BAD_REQUEST"', () =>{
        const error = new BadRequestError("Erro de teste")
        expect(error.statusCode).toBe(400)
        expect(error.code).toBe("BAD_REQUEST")
    })

    it('UnauthorizedError deve ter status 401, code "UNAUTHORIZED" e mensagem default', () =>{
        const error = new UnauthorizedError()
        expect(error.statusCode).toBe(401)
        expect(error.code).toBe("UNAUTHORIZED")
        expect(error.message).toBe("Unauthorized")
    })

    it('ForbiddenError deve ter status 403, code "FORBIDDEN" e mensagem default', () =>{
        const error = new ForbiddenError()
        expect(error.statusCode).toBe(403)
        expect(error.code).toBe("FORBIDDEN")
        expect(error.message).toBe("Forbidden")
    })

    it('NotFoundError deve ter status 404, code "NOT_FOUND" e mensagem customizada', () => {
        const error = new NotFoundError('Não encontrado')
        expect(error.statusCode).toBe(404)
        expect(error.code).toBe("NOT_FOUND")
        expect(error.message).toBe('Não encontrado')
    })

    it('ConflictError deve ter status 409, code "CONFLICT" e mensagem customizada', () =>{
        const error = new ConflictError("Conflito de dados")
        expect(error.statusCode).toBe(409)
        expect(error.code).toBe("CONFLICT")
        expect(error.message).toBe("Conflito de dados")
    })

    it('ValidationError deve ter status 422, code "VALIDATION_ERROR" e mensagem customizada', () =>{
        const error = new ValidationError("Erro de validação")
        expect(error.statusCode).toBe(422)
        expect(error.code).toBe("VALIDATION_ERROR")
        expect(error.message).toBe("Erro de validação")
    })
    
    it('AppError com details deve preservar details', () => {
        const details = { field: "email", reason: "invalid" }
        const error = new AppError(400, "BAD_REQUEST", "Erro de teste", details)
        expect(error.statusCode).toBe(400)
        expect(error.code).toBe("BAD_REQUEST")
        expect(error.details).toEqual(details)
    })
})
