import { parse } from 'cookie'
import decode from 'jwt-decode'
import { isString } from 'lodash'
import { JwtToken } from '../types'

export function extractToken(cookies: string): string | null | undefined {
  const parsedCookies = parse(cookies)
  if (isString(parsedCookies)) {
    return null
  }
  return parsedCookies['payload-token']
}

export function getTokenPayload(token: string): JwtToken {
  return decode(token)
}
