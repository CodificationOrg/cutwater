export enum OAuthServiceProvider {
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT',
}

export type OAuthServiceProviderLike = string | OAuthServiceProvider;

export const toOAuthServiceProvider = (provider?: OAuthServiceProviderLike): OAuthServiceProvider | undefined => {
  if (!provider || typeof provider !== 'string') {
    return provider as OAuthServiceProvider;
  }
  const key = Object.keys(OAuthServiceProvider).find((k) => OAuthServiceProvider[k] === provider.toUpperCase().trim());
  return key ? OAuthServiceProvider[key] : undefined;
};
