/**
 * The default TypeScript libs do not include `crypto.randomUUID`.
 * So we explicitly declare it here.
 * @see {@link https://github.com/denoland/deno/issues/12754#issuecomment-968170353 | TypeScript issue}
 */
declare global {
  interface Crypto {
    randomUUID: () => string
  }
}

/**
 * The body of the request being sent to the search engine.
 */
export interface IndexNowBody {
  host: string
  key: string
  keyLocation?: string
  urlList: string[]
}

/**
 * The key verifies ownership of the host.
 */
export interface Ownership {
  key: string
  /** Optional value for key file location */
  keyLocation?: string
}

/**
 * Currently, only the following search engines are supported:
 * - Bing
 * - Yandex
 * @see {@link https://www.indexnow.org/faq | Supported search engines}
 */
export const SEARCH_ENGINES = {
  BING: 'https://www.bing.com/indexnow',
  YANDEX: 'https://yandex.com/indexnow',
}

/**
 * Generate a key to be used for IndexNow.
 * @returns A random string of characters to be used as a key.
 */
export function generateKey() {
  return crypto.randomUUID().replaceAll('-', '')
}

/**
 * The IndexNow class is used to access the IndexNow API.
 */
export default class IndexNow {
  readonly engine: string
  private ownership: Ownership

  /**
   * Create a new IndexNow instance.
   * @param engine The search engine's IndexNow url.
   * @param key The key to be used for IndexNow.
   * @param keyLocation Optional value for key file location.
   */
  constructor(engine: string, key: string, keyLocation?: string) {
    if (!engine.startsWith('https://')) throw new Error(`Invalid search engine url '${engine}'. Must use 'https://'`)
    this.engine = engine.endsWith('/') ? engine.substr(0, engine.length - 1) : engine
    this.ownership = { key, keyLocation }
  }

  /**
   * Submit a url to the search engine.
   * @param url The url to be indexed.
   * @returns A promise that resolves if the url was successfully submitted.
   * @throws {Error} If the request fails.
   */
  async submitUrl(url: string) {
    const res = await fetch(`${this.engine}?url=${url}&key=${this.ownership.key}${this.ownership.keyLocation ? `&keyLocation=${this.ownership.keyLocation}` : ''}`)
    if (res.status === 200) return
    throw new Error(`Failed to submit url '${url}' to search engine. Status: ${res.status} ${await res.text()}`)
  }

  /**
   * Submit a list of urls to the search engine IndexNow API.
   * @param host The host to be indexed.
   * @param urlList The list of urls to be indexed.
   * @returns A promise that resolves if the urls were successfully submitted.
   * @throws {Error} If no urls were supplied.
   * @throws {Error} If more than 10,000 urls were supplied.
   * @throws {Error} If the request fails.
   */
  async submitUrls(host: string, urlList: string[]) {
    if (urlList.length === 0) throw new Error('No urls to submit')
    if (urlList.length > 10_000) throw new Error('Cannot submit more than 10,000 urls at once')

    const body: IndexNowBody = {
      host,
      key: this.ownership.key,
      keyLocation: this.ownership.keyLocation,
      urlList,
    }

    const res = await fetch(`${this.engine}/indexnow`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    if (res.status === 200) return
    throw new Error(`Failed to submit urls to search engine. Status: ${res.status} ${await res.text()}`)
  }
}

/**
 * Perform an IndexNow request.
 * @param toIndex The url or list of urls to be indexed. If a list of urls is supplied, the first url will be used as the host and not submitted.
 * @param engine The search engine IndexNow url.
 * @param key The key to be used for IndexNow.
 * @param keyLocation Optional value for key file location.
 * @returns A promise that resolves if the urls were successfully submitted.
 */
export function indexNow(toIndex: string | string[], engine: string, key: string, keyLocation?: string) {
  const indexNow = new IndexNow(engine, key, keyLocation)
  if (typeof toIndex === 'string') return indexNow.submitUrl(toIndex)
  return indexNow.submitUrls(toIndex[0], toIndex.slice(1))
}
