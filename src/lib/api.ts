'use client';

// Auto-generated typed API client — the app's single fetch surface.
// Request bodies are typed against the database schema, so calling an
// endpoint with the wrong field names is a compile error. Do not hand-
// edit — regenerate from the API atlas + schema instead.

import { getToken } from '@/lib/authToken';

// Mock mode: the IDE preview boots before any database exists, so the
// single fetch surface answers locally instead of calling routes that
// would fail on a missing DATABASE_URL. Mirrors the demo session in
// @/lib/authContext so both auth surfaces agree.
// The `process.env.NEXT_PUBLIC_MOCK_MODE` form is deliberate: Next inlines
// that EXACT text at build time. `process.env?.X` or a computed key is not
// matched by the inliner, so it would compile to a lookup that is always
// undefined in the browser bundle — the same way a dynamic
// `process.env['NEXT_PUBLIC_' + name]` once left the preview inspector
// permanently inert. Do not add optional chaining here.
const __NEXEN_IS_MOCK__ =
  (typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_MOCK_MODE === 'true') ||
  (typeof process !== 'undefined' && process.env.MOCK_MODE === 'true') ||
  ((globalThis as unknown as { __NEXEN_MOCK__?: boolean }).__NEXEN_MOCK__ === true);

const __NEXEN_DEMO_USER__ = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'solo_freelance_makeup_artist',
};

const __NEXEN_MOCK_ROWS__: Record<string, any[]> = {
  "invoices": [
    {
      "id": "invoice_001",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z",
      "clientName": "Priya Raman",
      "eventDate": "2025-03-08T00:00:00.000Z",
      "dueDate": "2025-02-20T00:00:00.000Z",
      "totalFee": 48000,
      "advancePaid": 15000,
      "balanceDue": 33000,
      "pendingBalance": 33000,
      "status": "overdue"
    },
    {
      "id": "invoice_002",
      "createdAt": "2026-02-15T10:00:00Z",
      "updatedAt": "2026-02-15T10:00:00Z",
      "clientName": "Ananya Desai",
      "eventDate": "2025-03-22T00:00:00.000Z",
      "dueDate": "2025-03-10T00:00:00.000Z",
      "totalFee": 22000,
      "advancePaid": 8000,
      "balanceDue": 14000,
      "pendingBalance": 14000,
      "status": "pending"
    },
    {
      "id": "invoice_003",
      "createdAt": "2026-03-15T10:00:00Z",
      "updatedAt": "2026-03-15T10:00:00Z",
      "clientName": "Meera Kapoor (Bridal)",
      "eventDate": "2025-04-12T00:00:00.000Z",
      "dueDate": "2025-03-28T00:00:00.000Z",
      "totalFee": 75000,
      "advancePaid": 30000,
      "balanceDue": 45000,
      "pendingBalance": 45000,
      "status": "pending"
    },
    {
      "id": "invoice_004",
      "createdAt": "2026-04-15T10:00:00Z",
      "updatedAt": "2026-04-15T10:00:00Z",
      "clientName": "Ritika Shah",
      "eventDate": "2025-02-14T00:00:00.000Z",
      "dueDate": "2026-04-15T10:00:00Z",
      "totalFee": 12500,
      "advancePaid": 12500,
      "balanceDue": 0,
      "pendingBalance": 0,
      "status": "paid"
    },
    {
      "id": "invoice_005",
      "createdAt": "2026-05-15T10:00:00Z",
      "updatedAt": "2026-05-15T10:00:00Z",
      "clientName": "Sneha Iyer",
      "eventDate": "2025-01-30T00:00:00.000Z",
      "dueDate": "2025-02-05T00:00:00.000Z",
      "totalFee": 18000,
      "advancePaid": 0,
      "balanceDue": 18000,
      "pendingBalance": 18000,
      "status": "overdue"
    },
    {
      "id": "invoice_006",
      "createdAt": "2026-06-15T10:00:00Z",
      "updatedAt": "2026-06-15T10:00:00Z",
      "clientName": "Kavya Menon",
      "eventDate": "2025-04-26T00:00:00.000Z",
      "dueDate": "2025-04-19T00:00:00.000Z",
      "totalFee": 36000,
      "advancePaid": 10000,
      "balanceDue": 26000,
      "pendingBalance": 26000,
      "status": "pending"
    }
  ],
  "payments": [
    {
      "id": "payment_001",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z",
      "invoiceId": "invoice_001",
      "amount": 15000,
      "status": "received",
      "receivedOn": "2025-02-18T00:00:00.000Z",
      "receivedAt": "2025-02-18T10:30:00.000Z"
    },
    {
      "id": "payment_002",
      "createdAt": "2026-02-15T10:00:00Z",
      "updatedAt": "2026-02-15T10:00:00Z",
      "invoiceId": "invoice_002",
      "amount": 14000,
      "status": "expected",
      "receivedOn": "2026-02-15T10:00:00Z",
      "receivedAt": "2026-02-15T10:00:00Z"
    },
    {
      "id": "payment_003",
      "createdAt": "2026-03-15T10:00:00Z",
      "updatedAt": "2026-03-15T10:00:00Z",
      "invoiceId": "invoice_003",
      "amount": 45000,
      "status": "expected",
      "receivedOn": "2026-03-15T10:00:00Z",
      "receivedAt": "2026-03-15T10:00:00Z"
    },
    {
      "id": "payment_004",
      "createdAt": "2026-04-15T10:00:00Z",
      "updatedAt": "2026-04-15T10:00:00Z",
      "invoiceId": "invoice_004",
      "amount": 12500,
      "status": "received",
      "receivedOn": "2025-02-12T00:00:00.000Z",
      "receivedAt": "2025-02-12T16:05:00.000Z"
    },
    {
      "id": "payment_005",
      "createdAt": "2026-05-15T10:00:00Z",
      "updatedAt": "2026-05-15T10:00:00Z",
      "invoiceId": "invoice_005",
      "amount": 8000,
      "status": "received",
      "receivedOn": "2025-03-03T00:00:00.000Z",
      "receivedAt": "2025-03-03T13:47:00.000Z"
    },
    {
      "id": "payment_006",
      "createdAt": "2026-06-15T10:00:00Z",
      "updatedAt": "2026-06-15T10:00:00Z",
      "invoiceId": "invoice_006",
      "amount": 26000,
      "status": "expected",
      "receivedOn": "2026-06-15T10:00:00Z",
      "receivedAt": "2026-06-15T10:00:00Z"
    }
  ],
  "bills": [
    {
      "id": "bill_001",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z",
      "name": "Studio rent - Andheri West",
      "category": "rent",
      "amount": 28000,
      "dueDate": "2025-04-01T00:00:00.000Z",
      "status": "upcoming",
      "isPaid": false,
      "paidAt": "2026-01-15T10:00:00Z"
    },
    {
      "id": "bill_002",
      "createdAt": "2026-02-15T10:00:00Z",
      "updatedAt": "2026-02-15T10:00:00Z",
      "name": "Studio rent - Andheri West",
      "category": "rent",
      "amount": 28000,
      "dueDate": "2025-03-01T00:00:00.000Z",
      "status": "paid",
      "isPaid": true,
      "paidAt": "2025-02-28T11:20:00.000Z"
    },
    {
      "id": "bill_003",
      "createdAt": "2026-03-15T10:00:00Z",
      "updatedAt": "2026-03-15T10:00:00Z",
      "name": "Foundation and brush restock",
      "category": "restock",
      "amount": 6500,
      "dueDate": "2025-04-05T00:00:00.000Z",
      "status": "upcoming",
      "isPaid": false,
      "paidAt": "2026-03-15T10:00:00Z"
    },
    {
      "id": "bill_004",
      "createdAt": "2026-04-15T10:00:00Z",
      "updatedAt": "2026-04-15T10:00:00Z",
      "name": "Lash and adhesive restock",
      "category": "restock",
      "amount": 3200,
      "dueDate": "2025-03-15T00:00:00.000Z",
      "status": "paid",
      "isPaid": true,
      "paidAt": "2025-03-12T09:45:00.000Z"
    },
    {
      "id": "bill_005",
      "createdAt": "2026-05-15T10:00:00Z",
      "updatedAt": "2026-05-15T10:00:00Z",
      "name": "Assistant day rate - Rhea",
      "category": "other",
      "amount": 4500,
      "dueDate": "2025-04-10T00:00:00.000Z",
      "status": "upcoming",
      "isPaid": false,
      "paidAt": "2026-05-15T10:00:00Z"
    },
    {
      "id": "bill_006",
      "createdAt": "2026-06-15T10:00:00Z",
      "updatedAt": "2026-06-15T10:00:00Z",
      "name": "Fuel and bridal parking",
      "category": "other",
      "amount": 1800,
      "dueDate": "2025-03-20T00:00:00.000Z",
      "status": "upcoming",
      "isPaid": false,
      "paidAt": "2026-06-15T10:00:00Z"
    }
  ]
};

// ── Sample-data changes: kept for this browser tab ──────────────────────────
const __NEXEN_SAMPLE_KEY__ = 'nexen.sample.31b33f11dfee';
let __sampleLoaded = false;
const __sampleCreated = new Set<string>();
const __sampleAnswered = new WeakMap<object, any>();
function __sampleTables(): string[] {
  const keys = Object.keys(__NEXEN_MOCK_ROWS__);
  return keys.filter((k, i) => keys.findIndex((j) => __NEXEN_MOCK_ROWS__[j] === __NEXEN_MOCK_ROWS__[k]) === i);
}
function __sampleLoad(): void {
  if (__sampleLoaded) return;
  __sampleLoaded = true;
  try {
    const saved = JSON.parse(globalThis.sessionStorage?.getItem(__NEXEN_SAMPLE_KEY__) ?? 'null');
    if (!saved || typeof saved !== 'object') return;
    for (const t of __sampleTables()) {
      const kept = saved.rows?.[t];
      if (Array.isArray(kept)) __NEXEN_MOCK_ROWS__[t].splice(0, __NEXEN_MOCK_ROWS__[t].length, ...kept);
    }
    for (const id of Array.isArray(saved.created) ? saved.created : []) __sampleCreated.add(String(id));
  } catch { /* blocked or unreadable storage: the sample rows as shipped */ }
}
function __sampleSave(): void {
  try {
    const rows: Record<string, any[]> = {};
    for (const t of __sampleTables()) rows[t] = __NEXEN_MOCK_ROWS__[t];
    globalThis.sessionStorage?.setItem(__NEXEN_SAMPLE_KEY__, JSON.stringify({ rows, created: Array.from(__sampleCreated) }));
  } catch { /* full or blocked: kept until the page reloads */ }
  // The IDE preview says, once, that this went to sample data only.
  try {
    if (typeof window !== 'undefined' && window.parent !== window) window.parent.postMessage({ type: 'nexen:sample-write' }, '*');
  } catch { /* no preview around this page */ }
}
function __sampleFind(all: any[], id: string): number {
  return all.findIndex((r) => String(r.id) === String(id) || String(r.slug) === String(id));
}
/** A field the person did not fill, as a new row of theirs would hold it. Links and
 *  status-like values keep a sample row's (pages read them); its text, dates and counts do
 *  not: a new habit showed "Sample description for record 1" and its reminder. */
function __sampleBlank(k: string, v: any): any {
  if (/(Id|_id)$/.test(k) || /status|state|role|type|kind|priority|category|level|currency|unit|visibility/i.test(k)) return v;
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') return v;
  if (typeof v === 'number') return 0;
  if (typeof v === 'boolean') return false;
  return null;
}
/** A new row: a sample row's fields (what pages read), the person's values in them. */
function __sampleInsert(table: string, body: any, links?: Record<string, string>): any {
  if (body && typeof body === 'object' && __sampleAnswered.has(body)) return __sampleAnswered.get(body);
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? (__NEXEN_MOCK_ROWS__[table] = []);
  const like: any = all[0] ?? {};
  const now = new Date().toISOString();
  const row: any = {};
  for (const [k, v] of Object.entries(like)) row[k] = __sampleBlank(k, v);
  Object.assign(row, body && typeof body === 'object' ? body : {}, links ?? {});
  row.id = typeof like.id === 'number'
    ? all.reduce((m: number, r: any) => Math.max(m, Number(r.id) || 0), 0) + 1
    : (globalThis.crypto?.randomUUID?.() ?? `sample-${Date.now().toString(36)}`);
  if ('slug' in like && !(body && body.slug)) row.slug = String(row.id);
  for (const k of ['createdAt', 'updatedAt', 'created_at', 'updated_at']) if (k in like) row[k] = now;
  all.unshift(row);
  __sampleCreated.add(String(row.id));
  if (body && typeof body === 'object') __sampleAnswered.set(body, row);
  __sampleSave();
  return row;
}
function __sampleUpdate(table: string, id: string, body: any): any {
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? [];
  const changes: any = { ...(body && typeof body === 'object' ? body : {}) };
  delete changes.id;
  const i = __sampleFind(all, id);
  if (i < 0) return { ...__mockRow(table, id), ...changes };
  Object.assign(all[i], changes);
  for (const k of ['updatedAt', 'updated_at']) if (k in all[i]) all[i][k] = new Date().toISOString();
  __sampleSave();
  return all[i];
}
function __sampleDelete(table: string, id: string): undefined {
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? [];
  const i = __sampleFind(all, id);
  if (i >= 0) {
    all.splice(i, 1);
    __sampleSave();
  }
  return undefined;
}
/** A write no designed endpoint answers, applied to the table its path names. */
function __sampleWrite(method: string, path: string, body: any): any {
  const segs = path.split('/').filter(Boolean);
  for (let i = segs.length - 1; i >= 0; i -= 1) {
    if (!__NEXEN_MOCK_ROWS__[segs[i]]) continue;
    if (i === segs.length - 1 && method === 'POST') return __sampleInsert(segs[i], body);
    if (i === segs.length - 2 && (method === 'PATCH' || method === 'PUT')) return __sampleUpdate(segs[i], decodeURIComponent(segs[i + 1]), body);
    if (i === segs.length - 2 && method === 'DELETE') return __sampleDelete(segs[i], decodeURIComponent(segs[i + 1]));
    return undefined;
  }
  return undefined;
}

function __mockRows(table: string, where?: Record<string, string>): any[] {
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? [];
  if (!where || !Object.keys(where).length) return all;
  const hit = all.filter((r) => Object.entries(where).every(([k, v]) => String(r[k]) === String(v)));
  // A parent added in this tab has no children yet: none, not every sample row.
  return hit.length || Object.values(where).some((v) => __sampleCreated.has(String(v))) ? hit : all;
}

function __mockRow(table: string, id?: string): any {
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? [];
  return (id !== undefined && all.find((r) => String(r.id) === String(id) || String(r.slug) === String(id))) || all[0] || {};
}

/** One answer per designed endpoint, in the shape the API Layer declares for it. */
const __NEXEN_MOCK_ROUTES__: Array<[string, RegExp, (p: string[], body: any) => any]> = [
  ["GET", /^\/api\/invoice-defaults$/, (p, body) => ({ "event_date": "2026-01-15T10:00:00Z", "advance_paid": 3 })],
  ["GET", /^\/api\/cash-forecast$/, (p, body) => ({ "late_bridal_payment": true, "horizons": [({ "days": 3, "expected_inflows": 3, "upcoming_bills": 3, "net_cash": 3 })] })],
  ["GET", /^\/api\/who-owes-me$/, (p, body) => ({ "alerts": [({ "sentence": "sample_sentence_1", "invoice_id": "invoice__001", "bill_id": "bill__001", "outstanding_balance": 3 })], "overdue_clients": [({ "invoice_id": "invoice__001", "client_name": "sample_client_name_1", "outstanding_balance": 3, "days_overdue": 3 })] })],
  ["GET", /^\/api\/invoices$/, (p, body) => __mockRows("invoices")],
  ["POST", /^\/api\/invoices$/, (p, body) => __sampleInsert("invoices", body)],
  ["GET", /^\/api\/bills$/, (p, body) => __mockRows("bills")],
  ["POST", /^\/api\/bills$/, (p, body) => __sampleInsert("bills", body)],
  ["GET", /^\/api\/invoices\/([^\/]+)\/payments$/, (p, body) => __mockRows("payments", { invoiceId: p[0] })],
  ["POST", /^\/api\/invoices\/([^\/]+)\/payments$/, (p, body) => __sampleInsert("payments", body, { invoiceId: p[0] })],
  ["GET", /^\/api\/invoices\/([^\/]+)\/reminder$/, (p, body) => ({ "client_name": "sample_client_name_1", "outstanding_balance": 3, "can_remind": true, "reminder_text": "sample_reminder_text_1" })],
  ["POST", /^\/api\/payments\/([^\/]+)\/receive$/, (p, body) => __mockRow("payments", p[0])],
  ["POST", /^\/api\/bills\/([^\/]+)\/mark-paid$/, (p, body) => __mockRow("bills", p[0])],
  ["GET", /^\/api\/invoices\/([^\/]+)$/, (p, body) => ({ "invoice": __mockRow("invoices", p[0]), "payments": __mockRows("payments", { invoiceId: p[0] }), "remaining_balance": 3, "days_overdue": 3 })],
  ["PATCH", /^\/api\/invoices\/([^\/]+)$/, (p, body) => __sampleUpdate("invoices", p[0], body)],
  ["DELETE", /^\/api\/invoices\/([^\/]+)$/, (p, body) => __sampleDelete("invoices", p[0])],
  ["GET", /^\/api\/bills\/([^\/]+)$/, (p, body) => __mockRow("bills", p[0])],
  ["PATCH", /^\/api\/bills\/([^\/]+)$/, (p, body) => __sampleUpdate("bills", p[0], body)],
  ["DELETE", /^\/api\/bills\/([^\/]+)$/, (p, body) => __sampleDelete("bills", p[0])],
];

/** What `http()` returns in mock mode. Sign-in paths hand back the demo
 *  session @/lib/authContext uses. Every endpoint the API Layer designed
 *  answers in its own declared shape (`__NEXEN_MOCK_ROUTES__`), built from
 *  the same sample rows the database seed uses, and passed through the
 *  same `unwrap` a real answer gets — so a screen that works here reads
 *  the fields it will read against the real routes.
 *
 *  The `/me` rule is anchored to the END of the path: unanchored, it
 *  caught `/api/me/orders` and answered every "my ..." screen with the
 *  demo user. */
function __nexenMockResponse(url: string, init?: RequestInit): any {
  const method = (init?.method ?? 'GET').toUpperCase();
  const __path = String(url).split('?')[0].replace(/\/+$/, '') || '/';
  __sampleLoad();
  if (/\/(login|register|signup|sign-up|sign-in|signin)$/.test(__path)) {
    return { token: 'nexen-mock-token', user: __NEXEN_DEMO_USER__ };
  }
  if (/\/(logout|sign-out|signout)$/.test(__path)) return { ok: true };
  let __body: any = {};
  try { __body = init?.body ? JSON.parse(String(init.body)) : {}; } catch { __body = {}; }
  for (const [m, re, answer] of __NEXEN_MOCK_ROUTES__) {
    if (m !== method) continue;
    const hit = re.exec(__path);
    if (hit) return unwrap(answer(hit.slice(1).map(decodeURIComponent), __body));
  }
  if (method === 'GET' && /\/auth\/(me|session|user)$|^\/api\/(me|profile)$|\/users\/me$/.test(__path)) {
    return __NEXEN_DEMO_USER__;
  }
  // No designed answer: a write changes the rows its path names, kept for this
  // tab (`__sampleWrite`); else it echoes its body so optimistic UI still
  // renders. A read finds the rows its path names.
  if (method !== 'GET') {
    const written = __sampleWrite(method, __path, __body);
    if (written !== undefined || method === 'DELETE') return written;
  }
  if (method !== 'GET' && init?.body) return __body;
  const __segs = __path.split('/').filter(Boolean);
  for (let i = __segs.length - 1; i >= 0; i -= 1) {
    const rows = __NEXEN_MOCK_ROWS__[__segs[i]];
    if (!rows) continue;
    const isItem = i === __segs.length - 2;
    return isItem ? __mockRow(__segs[i], __segs[i + 1]) : rows;
  }
  return {};
}

import type { Bill } from '@/types/bill';
import type { Invoice } from '@/types/invoice';
import type { Payment } from '@/types/payment';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function withQuery(
  url: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  if (!query) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

// ONE envelope convention, applied here so nothing downstream has to think
// about it: route handlers return the entity WRAPPED — `{ task }`, `{ projects }`
// — matching the `{ error }` shape errors already use and leaving room for
// `{ data, meta }` later. This unwraps it, so hooks and pages only ever see
// entities.
//
// Without a single decision, some generated consumers unwrapped and some did
// not: `useTask` stored `{ task: {...} }` as the task itself while the page
// next to it got it right. Both were plausible readings of an unstated rule.
function unwrap(payload: any): any {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }
  const keys = Object.keys(payload);
  // A single-key object whose key is not a known envelope field IS the
  // envelope. Anything else is already the entity — unwrapping a real
  // one-field entity would be worse than leaving a wrapper on.
  if (keys.length === 1 && !['error', 'message', 'ok'].includes(keys[0])) {
    return payload[keys[0]];
  }
  return payload;
}

async function http(url: string, init?: RequestInit): Promise<any> {
  // No database exists during the preview — answer locally.
  if (__NEXEN_IS_MOCK__) return __nexenMockResponse(url, init);
  // Unified-Next: same-origin relative URLs. Auth is DUAL — the login route
  // sets an httpOnly session cookie AND returns the JWT, which the login form
  // persists via @/lib/authToken. We attach it as `Authorization: Bearer` here
  // because the cookie is withheld inside the IDE preview's cross-site iframe;
  // `credentials: 'include'` keeps the cookie working in a normal browser too.
  const token = typeof window !== 'undefined' ? getToken() : null;
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((init?.headers as Record<string, string> | undefined) ?? {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, await res.text().catch(() => res.statusText));
  }
  if (res.status === 204) return undefined;
  return unwrap(await res.json().catch(() => undefined));
}

export async function getWhoOwesMe(query?: Record<string, string | number | boolean | undefined>): Promise<{ alerts: Array<{ sentence: string; invoice_id: string; bill_id: string | null; outstanding_balance: number }>; overdue_clients: Array<{ invoice_id: string; client_name: string; outstanding_balance: number; days_overdue: number }> }> {
  return http(withQuery(`/api/who-owes-me`, query));
}
export async function getInvoices(query?: Record<string, string | number | boolean | undefined>): Promise<Invoice[]> {
  return http(withQuery(`/api/invoices`, query));
}
export async function createInvoice(input: Partial<Omit<Invoice, 'createdAt' | 'deletedAt' | 'id' | 'updatedAt'>>): Promise<Invoice> {
  return http(`/api/invoices`, { method: 'POST', body: JSON.stringify(input) });
}
export async function getInvoiceById(invoiceId: string, query?: Record<string, string | number | boolean | undefined>): Promise<{ invoice: Invoice; payments: Payment[]; remaining_balance: number; days_overdue: number }> {
  return http(withQuery(`/api/invoices/${invoiceId}`, query));
}
export async function updateInvoice(invoiceId: string, input: Partial<Omit<Invoice, 'createdAt' | 'deletedAt' | 'id' | 'updatedAt'>>): Promise<Invoice> {
  return http(`/api/invoices/${invoiceId}`, { method: 'PATCH', body: JSON.stringify(input) });
}
export async function deleteInvoice(invoiceId: string): Promise<void> {
  return http(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
}
export async function getInvoiceDefaults(query?: Record<string, string | number | boolean | undefined>): Promise<{ event_date: string; advance_paid: number }> {
  return http(withQuery(`/api/invoice-defaults`, query));
}
export async function getInvoicePayments(invoiceId: string, query?: Record<string, string | number | boolean | undefined>): Promise<Payment[]> {
  return http(withQuery(`/api/invoices/${invoiceId}/payments`, query));
}
export async function createInvoicePayment(invoiceId: string, input: Partial<Omit<Payment, 'createdAt' | 'deletedAt' | 'id' | 'updatedAt'>>): Promise<Payment> {
  return http(`/api/invoices/${invoiceId}/payments`, { method: 'POST', body: JSON.stringify(input) });
}
export async function createPaymentReceive(paymentId: string, input: Record<string, unknown>): Promise<Payment> {
  return http(`/api/payments/${paymentId}/receive`, { method: 'POST', body: JSON.stringify(input) });
}
export async function getInvoiceReminder(invoiceId: string, query?: Record<string, string | number | boolean | undefined>): Promise<{ client_name: string; outstanding_balance: number; can_remind: boolean; reminder_text: string }> {
  return http(withQuery(`/api/invoices/${invoiceId}/reminder`, query));
}
export async function getCashForecast(query?: { late_bridal_payment?: boolean }): Promise<{ late_bridal_payment: boolean; horizons: Array<{ days: number; expected_inflows: number; upcoming_bills: number; net_cash: number }> }> {
  return http(withQuery(`/api/cash-forecast`, query));
}
export async function getBills(query?: Record<string, string | number | boolean | undefined>): Promise<Bill[]> {
  return http(withQuery(`/api/bills`, query));
}
export async function createBill(input: Partial<Omit<Bill, 'createdAt' | 'deletedAt' | 'id' | 'updatedAt'>>): Promise<Bill> {
  return http(`/api/bills`, { method: 'POST', body: JSON.stringify(input) });
}
export async function getBillById(billId: string, query?: Record<string, string | number | boolean | undefined>): Promise<Bill> {
  return http(withQuery(`/api/bills/${billId}`, query));
}
export async function updateBill(billId: string, input: Partial<Omit<Bill, 'createdAt' | 'deletedAt' | 'id' | 'updatedAt'>>): Promise<Bill> {
  return http(`/api/bills/${billId}`, { method: 'PATCH', body: JSON.stringify(input) });
}
export async function deleteBill(billId: string): Promise<void> {
  return http(`/api/bills/${billId}`, { method: 'DELETE' });
}
export async function createBillMarkPaid(billId: string, input: Record<string, unknown>): Promise<Bill> {
  return http(`/api/bills/${billId}/mark-paid`, { method: 'POST', body: JSON.stringify(input) });
}

