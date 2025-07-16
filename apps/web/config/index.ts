import { cleanEnv, str } from 'envalid';

const rawEnv = cleanEnv(process.env, {
  DATABASE_URL: str(),
  AUTH_SECRET: str(),
  AUTH_GITHUB_ID: str(),
  AUTH_GITHUB_SECRET: str(),
  NEXT_PUBLIC_GITHUB_PROFILE_LINK: str(),
  DEVELOPMENT_TOKEN: str(),
  GITHUB_WEBHOOK_SECRET: str(),
  GITHUB_PERSONAL_ACCESS_TOKEN: str(),
  NEXTAUTH_URL: str(),
});

const config = Object.fromEntries(
  Object.entries(rawEnv).map(([key, value]) =>  [key, typeof value === 'string' ? value.trim() : value])
) as typeof rawEnv;

export default config;