import { Response } from 'express';

export function setSSEHeaders(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

export function writeSSE(res: Response, data: string): void {
  if (!res.writableEnded) {
    res.write(`data: ${data}\n\n`);
  }
}

export function writeSSEJson(res: Response, obj: unknown): void {
  writeSSE(res, JSON.stringify(obj));
}

export function writeOpenAIContentDelta(res: Response, content: string): void {
  writeSSEJson(res, {
    id: `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    choices: [{
      index: 0,
      delta: { content },
      finish_reason: null,
    }],
  });
}

export function writeDone(res: Response): void {
  if (!res.writableEnded) {
    res.write('data: [DONE]\n\n');
  }
}
