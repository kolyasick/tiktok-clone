// auth.d.ts

declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    name: string;
    role: string;
  }

  interface UserSession {}

  interface SecureSessionData {
    // Add your own fields
  }
}

export {};
