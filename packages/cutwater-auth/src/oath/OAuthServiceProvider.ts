export enum OAuthServiceProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

export const toOAuthServiceProvider = (providerName: string): OAuthServiceProvider | undefined => {
  const key = Object.keys(OAuthServiceProvider).find(
    k => OAuthServiceProvider[k] === providerName.toLowerCase().trim(),
  );
  return key ? OAuthServiceProvider[key] : undefined;
};
