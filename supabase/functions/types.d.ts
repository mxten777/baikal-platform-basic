// =============================================================================
// Supabase Edge Functions — Deno runtime type declarations
// VS Code TypeScript 언어 서버용. Deno 확장 없이도 타입 오류를 최소화합니다.
// 실제 런타임은 Deno(Supabase Edge) 이므로 이 파일은 개발 편의용입니다.
// =============================================================================

// ── Deno 전역 ──────────────────────────────────────────────────────────────
declare namespace Deno {
  const env: {
    get(key: string): string | undefined
    set(key: string, value: string): void
    delete(key: string): void
    toObject(): Record<string, string>
  }
  function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { port?: number; hostname?: string }
  ): void
  function exit(code?: number): never
}

// ── URL 모듈 선언 (esm.sh / deno.land) ────────────────────────────────────

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export interface SupabaseClientOptions<T extends string = 'public'> {
    auth?: Record<string, unknown>
    global?: Record<string, unknown>
    db?: { schema?: T }
    realtime?: Record<string, unknown>
  }
  export type PostgrestResponse<T> = {
    data: T | null
    error: { message: string; code?: string } | null
    count?: number | null
    status: number
    statusText: string
  }
  export interface SupabaseClient {
    from(table: string): any
    rpc(fn: string, params?: Record<string, unknown>): any
    storage: any
    auth: any
  }
  export function createClient(
    url: string,
    key: string,
    options?: SupabaseClientOptions
  ): SupabaseClient
}

declare module 'https://esm.sh/xml2js@0.6.2' {
  export function parseStringPromise(
    str: string,
    options?: Record<string, unknown>
  ): Promise<any>
}

declare module 'https://deno.land/std@0.177.0/crypto/mod.ts' {
  export const crypto: Crypto
}
