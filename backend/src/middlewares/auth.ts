import { IncomingMessage } from 'http';

export interface AuthenticatedRequest extends IncomingMessage {
  user?: { id: string };
}

export function checkAuth(req: AuthenticatedRequest): void {
  req.user = { id: 'demo-user' };
}
