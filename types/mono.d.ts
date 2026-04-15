// src/types/mono.d.ts
declare module "@mono.co/connect.js" {
  interface Customer {
    name?: string;
    email?: string;
    id?: string;
    identity?: {
      type: "bvn";
      number: string;
    };
  }

  interface ConnectConfig {
    key: string;
    scope?: "auth" | "reauth" | "payments";
    data?: {
      customer: Customer;
    };
    onSuccess: (data: { code: string }) => void;
    onClose?: () => void;
    onLoad?: () => void;
    onEvent?: (eventName: string, data: any) => void;
  }

  class MonoConnect {
    constructor(config: ConnectConfig);
    setup(): void;
    open(): void;
    close(): void;
    reauthorise(accountId: string): void;
  }

  export default MonoConnect;
}