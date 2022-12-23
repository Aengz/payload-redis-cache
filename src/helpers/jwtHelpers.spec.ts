import { parse } from 'cookie'
import { extractToken, getTokenPayload } from './jwtHelpers'

jest.mock('cookie')

describe('jwtHelpers', () => {
  describe('extractToken', () => {
    describe('extractToken', () => {
      it('should return null if the cookies string is invalid', () => {
        ;(<jest.Mock>parse).mockReturnValue('invalid')
        expect(extractToken('invalid_cookies')).toBeNull()
      })

      it('should return the payload-token value if the cookies string is valid', () => {
        ;(<jest.Mock>parse).mockReturnValue({ 'payload-token': 'abc123' })
        expect(extractToken('payload-token=abc123; other_cookie=def456')).toEqual('abc123')
      })

      it('should return undefined if the payload-token cookie is not present', () => {
        ;(<jest.Mock>parse).mockReturnValue({ other_cookie: 'abc123' })
        expect(extractToken('other_cookie=abc123')).toBeUndefined()
      })
    })

    describe('getTokenPayload', () => {
      it('should return the token payload when given a valid token', () => {
        const token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        const expectedPayload = {
          sub: '1234567890',
          name: 'John Doe',
          iat: 1516239022
        }

        expect(getTokenPayload(token)).toEqual(expectedPayload)
      })

      it('should throw an error when given an invalid token', () => {
        const token = 'invalid.token'

        expect(() => getTokenPayload(token)).toThrowError()
      })
    })
  })
})
