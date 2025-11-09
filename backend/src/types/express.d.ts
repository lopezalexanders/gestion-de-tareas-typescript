declare module 'express' {
  export interface Request {
    params: Record<string, string>;
    query: Record<string, string | string[]>;
    body?: unknown;
    headers: Record<string, string | undefined>;
    method: string;
    path: string;
    id?: string;
    user?: {
      id: string;
      scopes?: string[];
    };
  }

  export interface Response {
    statusCode: number;
    status(code: number): this;
    json(body: unknown): this;
    send(body?: unknown): this;
    end(): this;
    set(field: string, value: string): this;
  }

  export type NextFunction = (err?: unknown) => void;

  export type RequestHandler = (req: Request, res: Response, next: NextFunction) => unknown;

  export interface Router {
    use(path: string, ...handlers: RequestHandler[]): Router;
    use(...handlers: RequestHandler[]): Router;
    get(path: string, ...handlers: RequestHandler[]): Router;
    post(path: string, ...handlers: RequestHandler[]): Router;
    put(path: string, ...handlers: RequestHandler[]): Router;
    delete(path: string, ...handlers: RequestHandler[]): Router;
    patch(path: string, ...handlers: RequestHandler[]): Router;
  }

  export interface Application extends Router {
    listen(...args: unknown[]): unknown;
  }

  export default function express(): Application;
  export function Router(): Router;
}
