// POST /api/support/contact — public-facing support form endpoint.
// Persists every submission to D1 (`support_messages`) so admins never miss a
// ticket. Lightly rate-limited per-IP via KV to deter spam.
//
// Optional Firebase auth: if the caller sends a valid Authorization: Bearer
// token we record their user_id, but the endpoint also accepts unauthenticated
// requests so logged-out users can still reach support.
import type { Env } from '../../lib/types';
import { jsonResponse, badRequest, rateLimited, serverError } from '../../lib/respond';
import { newId, nowSeconds } from '../../lib/ids';
import { clientIp, userAgent } from '../../lib/clientip';
import { verifyFirebaseAuthHeader } from '../../lib/firebase';
import { ensureUserFromFirebase } from '../../lib/d1';

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
}

const NAME_MAX = 120;
const EMAIL_MAX = 200;
const MESSAGE_MAX = 4000;

// Crude but effective: 5 submissions / IP / 10 minutes.
const RATE_LIMIT_PER_IP = 5;
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;

function isPlausibleEmail(s: string): boolean {
  if (s.length < 5 || s.length > EMAIL_MAX) return false;
  // Intentionally simple — Cloudflare workers don't ship a regex engine that
  // handles full RFC 5322; bouncing on the obviously-invalid covers > 99% of
  // typo cases without false positives.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = clientIp(request);
  const ua = userAgent(request);

  // Per-IP rate limit using RATE_LIMIT_KV. Best-effort — if KV is unavailable
  // we still accept the submission rather than refusing all support traffic.
  if (ip && env.RATE_LIMIT_KV) {
    const rlKey = `support:ip:${ip}`;
    try {
      const raw = await env.RATE_LIMIT_KV.get(rlKey);
      const count = raw ? Number(raw) : 0;
      if (count >= RATE_LIMIT_PER_IP) {
        return rateLimited(
          'Too many support requests from this IP — please try again in a few minutes.',
          RATE_LIMIT_WINDOW_SECONDS,
          request,
          env
        );
      }
      await env.RATE_LIMIT_KV.put(rlKey, String(count + 1), {
        expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
      });
    } catch {
      // ignore — never let KV outages take down the support form.
    }
  }

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return badRequest('invalid_json', request, env);
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();

  if (!name || name.length > NAME_MAX) {
    return badRequest(`Name is required (max ${NAME_MAX} characters).`, request, env);
  }
  if (!isPlausibleEmail(email)) {
    return badRequest('Please provide a valid email address.', request, env);
  }
  if (!message || message.length > MESSAGE_MAX) {
    return badRequest(
      `Message is required (max ${MESSAGE_MAX} characters).`,
      request,
      env
    );
  }

  // If a Firebase token is supplied, attribute the ticket to that user. We
  // don't require it — anonymous submissions are explicitly supported.
  let userId: string | null = null;
  try {
    const claims = await verifyFirebaseAuthHeader(env, request);
    if (claims?.sub) {
      const user = await ensureUserFromFirebase(env, {
        firebase_uid: claims.sub,
        email: claims.email || email,
        display_name: claims.name || name,
        last_ip: ip,
        last_ua: ua,
      });
      userId = user.id;
    }
  } catch {
    // Token invalid / expired — proceed as anonymous.
  }

  const id = newId();
  const ts = nowSeconds();
  try {
    await env.DB.prepare(
      `INSERT INTO support_messages
         (id, user_id, name, email, message, ip, ua, status, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'open', ?8)`
    )
      .bind(id, userId, name, email, message, ip, ua, ts)
      .run();
  } catch (err) {
    return serverError(
      `support_persist_failed: ${(err as Error).message || 'db_error'}`,
      request,
      env
    );
  }

  return jsonResponse(
    {
      ok: true,
      ticket_id: id,
      received_at: ts,
    },
    { status: 201 },
    request,
    env
  );
};

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
  return jsonResponse({}, { status: 204 }, request, env);
};
