export type ChatMessageInput = { content: string; conversationId?: string };
export type ChatErrorCode = 'INVALID_INPUT' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'INTERNAL_ERROR';
export type ChatError = { code: ChatErrorCode; message: string; requestId?: string };
export type StreamEvent =
  | { type: 'start'; requestId: string }
  | { type: 'delta'; content: string }
  | { type: 'complete' }
  | { type: 'error'; error: ChatError }
  | { type: 'heartbeat' };
