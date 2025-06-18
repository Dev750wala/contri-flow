declare global {
  declare namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      AUTH_SECRET: string;
      AUTH_GITHUB_ID: string;
      AUTH_GITHUB_SECRET: string;
      NEXT_PUBLIC_GITHUB_PROFILE_LINK: string;
    }
  }
}

export { NodeJS };
