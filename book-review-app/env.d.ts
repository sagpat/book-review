interface ImportMetaEnv {
    readonly VITE_REACT_APP_API_URL: string;
    readonly VITE_REACT_APP_ENCRYPTION_KEY: string;
    readonly VITE_BOOK_APP_BE_MS_API_KEY: string;
    readonly VITE_MICROSERVICE_API_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }