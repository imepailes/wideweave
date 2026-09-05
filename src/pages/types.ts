// Shared type for every page module.
export interface PageModule {
  html: string;
  init: () => Promise<(() => void) | void>;
}
