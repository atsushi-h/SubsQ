/**
 * Service Workerのすべてのキャッシュをクリアする
 *
 * ログアウトや退会時にキャッシュされた認証済みページを削除するために使用。
 * 共有デバイスで次のユーザーが前のユーザーのデータを見ることを防止する。
 *
 * @returns キャッシュクリアが完了したときに解決されるPromise
 */
export async function clearServiceWorkerCache(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  }
}
