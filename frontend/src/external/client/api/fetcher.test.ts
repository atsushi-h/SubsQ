// @vitest-environment node
// node環境ではwindowが未定義になるため、サーバーサイドのcookie転送分岐をテストできる
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/shared/lib/env', () => ({
  env: { NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8080' },
}))

// モジュールはmock設定後にimport
const { customFetch } = await import('./fetcher')
const { cookies } = await import('next/headers')

const mockFetch = vi.fn()
global.fetch = mockFetch

function makeResponse(status: number, body: unknown, ok = status >= 200 && status < 300) {
  return {
    status,
    statusText: 'OK',
    ok,
    headers: new Headers(),
    text: vi.fn().mockResolvedValue(body !== null ? JSON.stringify(body) : null),
  } as unknown as Response
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('customFetch - サーバーサイド（node環境）', () => {
  it('subsq_tokenがある場合はCookieヘッダーを付与する', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'my-jwt-token' }),
    } as any)
    mockFetch.mockResolvedValue(makeResponse(200, { result: 'ok' }))

    await customFetch('/api/v1/test', { method: 'GET' })

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers.Cookie).toBe('subsq_token=my-jwt-token')
  })

  it('subsq_tokenがない場合はCookieヘッダーを付与しない', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as any)
    mockFetch.mockResolvedValue(makeResponse(200, { result: 'ok' }))

    await customFetch('/api/v1/test', { method: 'GET' })

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers.Cookie).toBeUndefined()
  })

  it('ベースURLを正しく使用してfetchを呼び出す', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) } as any)
    mockFetch.mockResolvedValue(makeResponse(200, {}))

    await customFetch('/api/v1/test', { method: 'GET' })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('http://localhost:8080/api/v1/test')
  })
})

describe('customFetch - レスポンス処理', () => {
  beforeEach(() => {
    vi.mocked(cookies).mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) } as any)
  })

  it('200レスポンスでdataとstatusを返す', async () => {
    const responseData = { id: '1', name: 'test' }
    mockFetch.mockResolvedValue(makeResponse(200, responseData))

    const result = await customFetch<{ data: unknown; status: number }>('/api/v1/test', { method: 'GET' })

    expect(result.data).toEqual(responseData)
    expect(result.status).toBe(200)
  })

  it('204レスポンスはbodyを読まずに空データを返す', async () => {
    mockFetch.mockResolvedValue({
      status: 204,
      statusText: 'No Content',
      ok: true,
      headers: new Headers(),
      text: vi.fn(),
    } as unknown as Response)

    const result = await customFetch<{ data: unknown; status: number }>('/api/v1/test', { method: 'DELETE' })

    expect(result.status).toBe(204)
    // text()は呼ばれない（bodyを読まない）
  })

  it('エラーレスポンスでdetailフィールドのメッセージをスローする', async () => {
    mockFetch.mockResolvedValue(makeResponse(400, { detail: '入力が不正です' }, false))

    await expect(customFetch('/api/v1/test', { method: 'POST' })).rejects.toThrow('入力が不正です')
  })

  it('エラーレスポンスでmessageフィールドのメッセージをスローする', async () => {
    mockFetch.mockResolvedValue(makeResponse(401, { message: '認証が必要です' }, false))

    await expect(customFetch('/api/v1/test', { method: 'GET' })).rejects.toThrow('認証が必要です')
  })

  it('エラーレスポンスにメッセージがない場合はステータスをスローする', async () => {
    mockFetch.mockResolvedValue(makeResponse(500, {}, false))

    await expect(customFetch('/api/v1/test', { method: 'GET' })).rejects.toThrow('500')
  })

  it('JSONパースに失敗した場合エラーをスローする', async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      ok: true,
      headers: new Headers(),
      text: vi.fn().mockResolvedValue('not-json'),
    } as unknown as Response)

    await expect(customFetch('/api/v1/test', { method: 'GET' })).rejects.toThrow('invalid response body')
  })

  it('options.headersが既存のCookieヘッダーを上書きできる', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'server-token' }),
    } as any)
    mockFetch.mockResolvedValue(makeResponse(200, {}))

    await customFetch('/api/v1/test', {
      method: 'GET',
      headers: { Cookie: 'custom=value' },
    })

    const [, options] = mockFetch.mock.calls[0]
    // options.headersが後に展開されるのでカスタムヘッダーが優先される
    expect(options.headers.Cookie).toBe('custom=value')
  })
})
