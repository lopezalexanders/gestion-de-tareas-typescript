declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
  exit(code?: number): never;
  cwd(): string;
  on(event: 'SIGINT' | 'SIGTERM', listener: () => void): void;
  on(event: string, listener: (...args: unknown[]) => void): void;
};

declare module 'node:fs' {
  export function existsSync(path: string): boolean;
  export function readFileSync(path: string, options: { encoding: 'utf8' } | 'utf8'): string;
}

declare module 'node:path' {
  export function resolve(...paths: string[]): string;
}

declare module 'node:crypto' {
  export function randomUUID(): string;
}

declare module 'node:perf_hooks' {
  export const performance: {
    now(): number;
  };
}
