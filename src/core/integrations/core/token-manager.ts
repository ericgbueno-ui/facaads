/**
 * TOKEN MANAGER
 * Gerencia tokens de forma segura com criptografia
 * NUNCA salva tokens em plain text
 */

import crypto from 'crypto';
import { ProviderToken, TokenRefreshResponse, EncryptedToken } from '../types';

export class TokenManager {
  private encryptionKey: string;
  private algorithm = 'aes-256-gcm';

  constructor(encryptionKey?: string) {
    // IMPORTANT: Em produção, isso deve vir de env var segura
    this.encryptionKey = encryptionKey || process.env.TOKEN_ENCRYPTION_KEY || '';

    if (!this.encryptionKey || this.encryptionKey.length < 32) {
      throw new Error(
        'TOKEN_ENCRYPTION_KEY deve ter mínimo 32 caracteres. ' +
        'Configure em .env.local'
      );
    }
  }

  /**
   * Criptografa um token antes de salvar
   */
  encryptToken(plainToken: string): EncryptedToken {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey.slice(0, 32)),
        iv
      );

      let encrypted = cipher.update(plainToken, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();

      return {
        iv: iv.toString('hex'),
        encrypted: encrypted + ':' + authTag.toString('hex'),
        algorithm: this.algorithm,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Erro ao criptografar token: ${(error as Error).message}`);
    }
  }

  /**
   * Descriptografa um token criptografado
   */
  decryptToken(encrypted: EncryptedToken): string {
    try {
      const iv = Buffer.from(encrypted.iv, 'hex');
      const [encryptedData, authTag] = encrypted.encrypted.split(':');

      const decipher = crypto.createDecipheriv(
        encrypted.algorithm,
        Buffer.from(this.encryptionKey.slice(0, 32)),
        iv
      );

      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Erro ao descriptografar token: ${(error as Error).message}`);
    }
  }

  /**
   * Gera um hash para verificação de integridade
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verifica se um token expirou
   */
  isTokenExpired(token: ProviderToken): boolean {
    if (!token.expiresAt) return false;
    return new Date() >= token.expiresAt;
  }

  /**
   * Verifica se um token expira em breve (próximas 24h)
   */
  isTokenExpiringSoon(token: ProviderToken): boolean {
    if (!token.expiresAt) return false;
    const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return token.expiresAt <= oneDayFromNow;
  }

  /**
   * Valida a estrutura de um token criptografado
   */
  validateEncryptedToken(encrypted: EncryptedToken): boolean {
    try {
      if (!encrypted.iv || !encrypted.encrypted || !encrypted.algorithm) {
        return false;
      }

      // Tenta descriptografar para validar
      this.decryptToken(encrypted);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cria um token de revoke (para desconexão)
   */
  createRevokeToken(token: string): string {
    return crypto
      .createHmac('sha256', this.encryptionKey)
      .update(token)
      .digest('hex');
  }

  /**
   * Verifica se um token foi revogado
   */
  isTokenRevoked(revokeList: string[], token: string): boolean {
    const revokeToken = this.createRevokeToken(token);
    return revokeList.includes(revokeToken);
  }

  /**
   * Sanitiza um token para logs (mostra apenas primeiros/últimos chars)
   */
  sanitizeToken(token: string): string {
    if (token.length <= 8) return '****';
    return token.slice(0, 4) + '****' + token.slice(-4);
  }

  /**
   * Gera um refreshToken válido
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Calcula quando um token expira baseado em expiresIn (segundos)
   */
  calculateExpiresAt(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000);
  }

  /**
   * Valida um OAuth2 state para prevenir CSRF
   */
  generateOAuthState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verifica a validade de um OAuth2 state
   */
  validateOAuthState(state: string, expectedState: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(state),
      Buffer.from(expectedState)
    );
  }

  /**
   * Extrai informações seguras de um token para logging
   */
  getTokenInfo(token: ProviderToken): {
    id: string;
    type: string;
    sanitized: string;
    expiresIn?: number;
    expired: boolean;
    expiringsoon: boolean;
  } {
    const expiresIn = token.expiresAt
      ? Math.round((token.expiresAt.getTime() - Date.now()) / 1000)
      : undefined;

    return {
      id: token.id,
      type: token.type,
      sanitized: this.sanitizeToken(token.accessToken),
      expiresIn,
      expired: this.isTokenExpired(token),
      expiringsoon: this.isTokenExpiringSoon(token),
    };
  }
}

/**
 * Singleton global
 */
let tokenManagerInstance: TokenManager | null = null;

export function getTokenManager(): TokenManager {
  if (!tokenManagerInstance) {
    tokenManagerInstance = new TokenManager();
  }
  return tokenManagerInstance;
}

export function initTokenManager(encryptionKey: string): TokenManager {
  tokenManagerInstance = new TokenManager(encryptionKey);
  return tokenManagerInstance;
}
