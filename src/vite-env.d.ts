/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public production URL including the base path, with a trailing slash. */
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
