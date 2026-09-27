import type { NextConfig } from "next";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Resolves the signing secret used when NEXTAUTH_SECRET is not set in the
 * environment.
 *
 * A secret must never be committed to source control, so when the environment
 * does not provide one we generate it here and inline it into the build. It is
 * stable for a given checkout (persisted outside version control, reused on
 * later builds) and never appears in the repository. A real NEXTAUTH_SECRET
 * always takes precedence, so setting one later is a drop-in upgrade.
 *
 * Returns undefined when a real secret is already configured, in which case
 * nothing is injected and the environment value is used directly.
 */
function resolveBuildTimeSecret(): string | undefined {
  if (process.env.NEXTAUTH_SECRET) return undefined;

  const dir = path.join(process.cwd(), ".data");
  const file = path.join(dir, "auth-secret");

  try {
    if (fs.existsSync(file)) {
      const existing = fs.readFileSync(file, "utf-8").trim();
      if (existing) return existing;
    }
  } catch {
    // Fall through and generate a fresh secret.
  }

  const generated = randomBytes(32).toString("base64");

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, generated, { encoding: "utf-8", mode: 0o600 });
  } catch {
    // Read-only build environment: the secret is still valid for this build.
  }

  return generated;
}

const buildTimeSecret = resolveBuildTimeSecret();

if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
  console.warn(
    "[auth] NEXTAUTH_SECRET is not set. Using a build-time generated secret. " +
      "Set NEXTAUTH_SECRET in the deployment environment to manage it explicitly."
  );
}

const nextConfig: NextConfig = {
  // Inlined at build time. Only ever read from server-side code, never from a
  // client component, so it stays out of browser bundles.
  env: buildTimeSecret ? { NEXTAUTH_SECRET_GENERATED: buildTimeSecret } : undefined,

  async redirects() {
    return [
      {
        source: "/contests",
        destination: "/events",
        permanent: true,
      },
      {
        source: "/contest/:slug",
        destination: "/events/:slug",
        permanent: true,
      },
      {
        source: "/event/:slug",
        destination: "/events/:slug",
        permanent: true,
      },
      {
        source: "/create-contest",
        destination: "/dashboard/events/new",
        permanent: true,
      },
      {
        source: "/create-event",
        destination: "/dashboard/events/new",
        permanent: true,
      },
      {
        source: "/contestant/:id",
        destination: "/nominees/:id",
        permanent: true,
      },
      {
        source: "/nominee/:id",
        destination: "/nominees/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
