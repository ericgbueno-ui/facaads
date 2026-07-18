/**
 * TIPOS PARA AUTENTICAÇÃO DE PROVEDORES
 */

import { ProviderType } from './provider';

export interface ProviderToken {
  id: string;
  connectionId: string;
  type: ProviderType;
  accessToken: string; // criptografado
  refreshToken?: string; // criptografado
  expiresAt?: Date;
  scope?: string[];
  tokenType?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

export interface OAuthFlowState {
  state: string;
  provider: ProviderType;
  companyId: string;
  redirectUri: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
  provider: ProviderType;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: Date;
}

export interface AuthorizationRequest {
  provider: ProviderType;
  companyId: string;
  scope: string[];
  redirectUri: string;
  state?: string;
}

export interface AuthorizationResponse {
  code: string;
  state: string;
  error?: string;
  errorDescription?: string;
}

export interface TokenExchangeRequest {
  code: string;
  provider: ProviderType;
  companyId: string;
  redirectUri: string;
}

export interface TokenExchangeResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: Date;
  scope: string[];
  tokenType: string;
  raw?: Record<string, any>;
}

export interface EncryptedToken {
  iv: string;
  encrypted: string;
  algorithm: string;
  timestamp: Date;
}

export interface ApiKeyAuth {
  apiKey: string;
  apiSecret?: string;
  endpoint?: string;
}

export interface BearerTokenAuth {
  token: string;
  expiresAt?: Date;
}

export interface OAuth2Auth {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType: string;
  scope: string[];
}

export type ProviderAuthMethod = 'oauth2' | 'api_key' | 'bearer_token' | 'basic_auth';

export interface AuthConfig {
  method: ProviderAuthMethod;
  oauth2?: OAuth2Config;
  apiKey?: ApiKeyConfig;
}

export interface OAuth2Config {
  authorizationUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
  scope: string[];
  grantType?: string;
}

export interface ApiKeyConfig {
  headerName: string;
  keyName?: string;
  secretName?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  expired: boolean;
  expiresIn?: number;
  error?: string;
}
