import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';

const HEADER_NAME = 'x-request-id';

export function attachRequestId(req: IncomingMessage, res: ServerResponse): string {
  const existing = req.headers[HEADER_NAME] as string | undefined;
  const requestId = existing && existing.length > 0 ? existing : randomUUID();
  res.setHeader(HEADER_NAME, requestId);
  (req as IncomingMessage & { requestId?: string }).requestId = requestId;
  return requestId;
}

export function getRequestId(req: IncomingMessage): string | undefined {
  return (req as IncomingMessage & { requestId?: string }).requestId;
}
