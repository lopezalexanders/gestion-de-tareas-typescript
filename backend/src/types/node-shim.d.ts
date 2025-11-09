declare module 'http' {
  export interface IncomingMessage extends AsyncIterable<any> {
    headers: Record<string, string | string[] | undefined>;
    method?: string;
    url?: string | null;
    socket: { remoteAddress?: string | null };
    on(event: string, listener: (...args: any[]) => void): this;
  }
  export interface ServerResponse {
    statusCode: number;
    setHeader(name: string, value: string | number): void;
    end(data?: any): void;
    on(event: string, listener: (...args: any[]) => void): this;
  }
  export type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;
  export function createServer(listener: RequestListener): {
    listen(port: number, cb: () => void): void;
  };
}

declare module 'url' {
  export function parse(urlStr: string, parseQueryString?: boolean, slashesDenoteHost?: boolean): {
    pathname?: string | null;
    query?: Record<string, string | string[]>;
  };
}

declare module 'crypto' {
  export function randomUUID(): string;
}

declare module 'perf_hooks' {
  export const performance: {
    now(): number;
  };
}

declare module 'child_process' {
  export function execFile(
    file: string,
    args: readonly string[],
    callback: (error: Error | null, stdout: string, stderr: string) => void,
  ): void;
}

declare module 'util' {
  export function promisify<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => Promise<ReturnType<T>>;
}

declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options: { recursive: boolean }): void;
}

declare module 'path' {
  export function dirname(path: string): string;
}

declare const Buffer: {
  byteLength(input: string): number;
  concat(buffers: Uint8Array[]): Uint8Array;
  from(input: string | ArrayBuffer): Uint8Array;
};

declare const process: {
  env: Record<string, string | undefined>;
  cwd(): string;
  exit(code?: number): never;
};
