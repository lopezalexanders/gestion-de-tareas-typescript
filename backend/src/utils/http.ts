import { IncomingMessage, ServerResponse } from 'http';

export interface HttpRequest extends IncomingMessage {
  body?: unknown;
  query?: Record<string, string>;
  params?: Record<string, string>;
  user?: { id: string };
}

export function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

export async function parseJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(chunk as Uint8Array);
    }
  }
  if (chunks.length === 0) {
    return undefined;
  }
  const rawBuffer = concatUint8Arrays(chunks);
  const raw = new TextDecoder('utf-8').decode(rawBuffer);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('INVALID_JSON');
  }
}

function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
}
