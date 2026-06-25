import qs from 'qs';
import axios from 'axios';
import { CLIENT_KEY, CLIENT_SECRET } from '@config';
import { HttpException } from '@/exceptions/HttpException';
import { logger } from '@utils/logger';
import { API_BASE_URL } from '@config';

export interface Token {
  access_token: string;
  expires_in: number;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

// Tokens cachas i minnet per scope. Standardtoken (utan scope) ligger under nyckeln '' och används
// av alla vanliga gateway-anrop. Scope-specifika tokens (t.ex. CitizenRelationAccess) cachas separat
// så att ett extra scope för en enskild resurs aldrig påverkar de andra anropen.
const tokenCache = new Map<string, CachedToken>();

class ApiTokenService {
  public async getToken(scope?: string): Promise<string> {
    const key = scope ?? '';
    const cached = tokenCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.accessToken;
    }
    logger.info(`Getting oauth API token${scope ? ` (scope: ${scope})` : ''}`);
    return this.fetchToken(scope);
  }

  public async fetchToken(scope?: string): Promise<string> {
    const authString = Buffer.from(`${CLIENT_KEY}:${CLIENT_SECRET}`, 'utf-8').toString('base64');
    // Begär scope bara när det uttryckligen efterfrågas — standardtoken förblir oförändrad.
    const requestBody: Record<string, string> = { grant_type: 'client_credentials' };
    if (scope) requestBody.scope = scope;

    try {
      const { data } = await axios({
        timeout: 30000, // NOTE: milliseconds
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + authString,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify(requestBody),
        url: `${API_BASE_URL}/token`,
      });
      const token = data as Token;

      if (!token?.access_token) throw new HttpException(502, 'Bad Gateway');

      // Förnya 10 sekunder före utgång som marginal.
      const expiresAt = Date.now() + (token.expires_in * 1000 - 10000);
      tokenCache.set(scope ?? '', { accessToken: token.access_token, expiresAt });
      logger.info(`Token${scope ? ` (scope: ${scope})` : ''} valid for ${token.expires_in}s, expires at ${new Date(expiresAt)}`);

      return token.access_token;
    } catch (error) {
      logger.error(`Failed to fetch JWT access token: ${JSON.stringify(error)}`);
      throw new HttpException(502, 'Bad Gateway');
    }
  }
}

export default ApiTokenService;
