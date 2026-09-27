/**
 * Resolves the NextAuth signing secret.
 *
 * Kept free of Node built-ins so it is safe to import from the Edge middleware
 * bundle as well as the Node runtime.
 *
 * Order of preference:
 *   1. NEXTAUTH_SECRET / AUTH_SECRET from the environment (explicit, managed)
 *   2. NEXTAUTH_SECRET_GENERATED, inlined by next.config.ts at build time
 *
 * There is deliberately no hardcoded fallback. A committed default signing key
 * lets anyone with repository access forge a session cookie for any account,
 * including a super admin, so a missing secret must be a hard error.
 */
export function resolveAuthSecret(): string {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET_GENERATED;

  if (!secret) {
    throw new Error(
      "Missing NextAuth secret. Set NEXTAUTH_SECRET in the deployment environment."
    );
  }

  return secret;
}
