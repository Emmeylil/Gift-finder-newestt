import { parseSrcset } from 'srcset';
import type { iGenericCompetitor, iSKU, TCountryLocale } from './interfaces';

export interface iPageUrlStats {
    currentPage: number;
    maxPage: number;
    products: number;
}

export interface iProductSkuStats {
    valid: number;
    oos: number;
    products: number;
}

export class Finder {
    private static instance: Finder;
    private host = 'https://www.jumia';

    public fail = 0;
    public pass = 0;
    public total = 0;

    private constructor() { }

    static normalize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/gi, '') // Remove punctuation
            .split(/\s+/)
            .filter(Boolean);
    }

    static levenshtein(a: string, b: string): number {
        const dp = Array.from({ length: a.length + 1 }, (_, i) =>
            Array.from({ length: b.length + 1 }, (_, j) =>
                i === 0 ? j : j === 0 ? i : 0
            )
        );

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // deletion
                    dp[i][j - 1] + 1, // insertion
                    dp[i - 1][j - 1] + cost // substitution
                );
            }
        }

        return dp[a.length][b.length];
    }

    static fuzzyMatchScore(searchWord: string, targetWord: string): number {
        const distance = Finder.levenshtein(searchWord, targetWord);
        const maxLen = Math.max(searchWord.length, targetWord.length);
        return 1 - distance / maxLen; // similarity score between 0 and 1
    }

    static isFuzzyMatch(search: string, product: iGenericCompetitor, threshold = 0.7): boolean {
        const searchTokens = Finder.normalize(search);
        const title = product.title ?? product.name ?? '';
        const titleTokens = Finder.normalize(title);

        let matchCount = 0;

        for (const word of searchTokens) {
            const bestMatchScore = Math.max(
                ...titleTokens.map(token => Finder.fuzzyMatchScore(word, token))
            );
            if (bestMatchScore >= threshold) {
                matchCount++;
            }
        }

        return matchCount >= Math.floor(searchTokens.length * 0.9); // at least 70% match
    }

    static searchProducts(products: iGenericCompetitor[], query: string): iGenericCompetitor[] {
        return products.filter(product => Finder.isFuzzyMatch(query, product));
    }


    public static getUrl(locale: TCountryLocale, path: string) {
        return `https://www.jumia${locale}${path}`
    }

    public static getInstance(): Finder {
        if (!Finder.instance) {
            Finder.instance = new Finder();
        }
        return Finder.instance;
    }

    private getDefaultSKU(sku: string) {
        return {
            "sku": sku,
            "name": "out of stock",
            "displayName": "out of stock",
            "brand": "oos",
            "sellerId": 0,
            "isShopGlobal": true,
            "categories": ["out of stock"],
            "prices": {
                "rawPrice": "0",
                "price": "N 0,000",
                "priceEuro": "0",
                "taxEuro": "0",
                "oldPrice": "0",
                "oldPriceEuro": "0",
                "discount": "0"
            },
            "stock": {
                "percent": 0,
                "text": "0 items left"
            },
            "rating": {
                "average": 0,
                "totalRatings": 0
            },
            "image": "https://ng.jumia.is/cms/0-1-weekly-cps/onsite-report/floor-product-templatev2.jpg",
            "url": '/catalog/?q=' + sku,
            "isBuyable": true,
            "shopGlobal": {
                "identifier": "global",
                "name": "Shipped from abroad"
            },
            "selectedVariation": sku
        }
    }

    // 2
    private appendPageToUrl(href: string, page: number) {
        const url = new URL(href)
        url.searchParams.append("page", page.toString())
        return url.href
    }

    private PDP(products: any) {
        const fetched = document.getElementById('fetched') as HTMLDivElement;
        if (!fetched) {
            console.error("DOM Element #fetched not found!");
            return undefined;
        }
        fetched.innerHTML = products;
        const scripts = fetched.querySelectorAll('script');
        fetched.innerHTML = '';
        const script = Array.from(scripts).find(script => script.innerHTML.includes("window.__INITIAL_STATE__="));
        return script;
    }

    private extractPDP(text: string) {
        const script = this.PDP(text)
        return script
    }

    private async collectPDP(url: string) {
        try {
            const response = await fetch(url)
            const text = await response.text()
            const script = this.extractPDP(text)

            if (script) {
                const matches = Finder.extractValidPDPMatches(script.innerHTML)
                const match = matches[0] as any
                return match.viewData
            } else {
                console.info("Product details not found")
                return ''
            }
        } catch (error: any) {
            console.info(error.message)
            return ''
        }
    }

    // 3
    private async collect(url: string) {
        try {
            console.log(`Fetching ${url}...`);
            const response = await fetch(url);
            const text = await response.text();
            const extracted = this.extractProducts(text);
            console.log(`Extracted products: ${extracted?.length || 0}`);
            return extracted as iSKU[];
        } catch (error) {
            console.trace(error);
            return [];
        }
    }

    // 5
    private products(products: any) {
        const fetched = document.getElementById('fetched') as HTMLDivElement;
        if (!fetched) {
            console.error("DOM Element #fetched not found!");
            return "";
        }
        fetched.innerHTML = products;
        const scripts = fetched.querySelectorAll('script');
        fetched.innerHTML = '';
        const textC = Array.from(scripts).map(script => script.innerHTML);
        const foundIdx = textC.findIndex(script => script.indexOf('"products":[{') !== -1);

        // Fallback if index not found
        if (foundIdx === -1) {
            // Try finding INITIAL_STATE as a fallback similar to PDP
            const altIdx = textC.findIndex(script => script.includes("window.__INITIAL_STATE__="));
            if (altIdx !== -1) return textC[altIdx];
        }

        return textC[foundIdx];
    }

    private mobile(skus: string) {
        const products = Finder.extractValidJsonMatches<iSKU>(skus)
        return products
    }

    // 6
    private format(products: string) {

        if (!this.isMobileDevice()) {
            const productStr = this.desktop(products)
            if (!productStr) return [];
            try {
                return JSON.parse(productStr).products
            } catch (e) {
                return []
            }
        } else {
            return this.mobile(products)
        }
    }
    escape(str: string) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    }
    private braceIndices(str: string, brace: string) {
        var regex = new RegExp(brace, "gi"), result, indices = []
        while ((result = regex.exec(str))) {
            indices.push(result.index)
        }
        return indices
    }
    private desktop(rawProducts: string) {
        if (!rawProducts) return null;
        const start = rawProducts.indexOf('"products":')
        if (start === -1) return null;
        const products = '{' + rawProducts.substring(start, rawProducts.length)
        const closingBraceIndices = this.braceIndices(products, this.escape("}]"))
        const lastIdx = closingBraceIndices[closingBraceIndices.length - 1]
        return products.substring(0, lastIdx + 2) + '}'
    }

    // 4
    private extractProducts(text: string) {
        const rawProducts = this.products(text)
        const formatted = this.format(rawProducts)

        return formatted
    }
    rangeArray(n: number): number[] {
        if (n < 1) return []
        return Array.from({ length: n }, (_, i) => i + 1)
    }

    resetStats() {
        this.fail = 0
        this.pass = 0
        this.total = 0
    }

    async handleCollectUrl(url: string) {

        const result = await this.collect(url)

        if (result && result.length) {
            this.pass = this.pass + 1
        } else {
            this.fail = this.fail + 1
        }
        return result || [];
    }
    // 1
    async findProductsByUrl(href: string, page: number) {
        this.resetStats()
        this.total = page
        const urls = this.rangeArray(page).map(pg => this.appendPageToUrl(href, pg))
        const promises = urls.map(this.handleCollectUrl.bind(this))
        const results = await Promise.all(promises)
        let products: iSKU[] = []

        results.forEach(result => {
            products = [...products, ...result]
        })
        return products
    }

    isMobileDevice() {
        // Basic check inside browser or env
        if (typeof navigator === 'undefined') return false;
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // sku #1
    async findProductBySkus(list: string[]) {
        this.resetStats()
        this.total = list.length

        // We need to know locale?
        // The provided method uses skuStore. In this context, we'll try to guess or iterate?
        // For now, let's just pass empty locale and rely on caller to set it if needed
        // But since the original code relies on Svelte store, we will have to modify the signature.
        // However, the signature is mandated by the provided code: async findProductBySkus(list: string[])

        // The original code:
        // async findProductBySkus(list: string[]) {
        //    const results = await this.collectSKUData(list)
        //    return results
        // }

        // And collectSKUData calls handleCollectSKU which uses `get(skuStore)`.
        // Since we can't use `get(skuStore)`, we'll define a default locale or inject it.
        // I will mock the store for now with the default locale.

        const results = await this.collectSKUData(list)
        return results
    }

    async extractPDPDescription(url: any) {
        const pdp = await this.collectPDP(url)
        return this.stripHTMLTags(pdp?.description?.text) ?? ''
    }

    async getPDP(locale: TCountryLocale, list: iSKU[]) {
        const promise = async (product: iSKU) => {
            const path = product.url
            const url = Finder.getUrl(locale, path)

            try {
                const details = await this.extractPDPDescription(url)
                product.details = details
                return product
            } catch (error: any) {
                console.trace(error.message)
                return product
            }
        }

        const promises = list.map(promise)

        const products = await Promise.all(promises)

        return products
    }

    private buildProductUrl(locale: TCountryLocale, sku: string) {
        const href = this.host + locale + '/catalog/'
        const url = new URL(href)
        url.searchParams.set('q', sku)
        return url.href
    }

    // Need to mimic the store behavior or accept an argument.
    // I will make it accept an optional argument, but for the provided 'findProductBySkus', it has to default.
    private currentLocale: TCountryLocale = '.com.ng';

    private async handleCollectSKU(sku: string) {
        // Replaces store logic
        const locale = this.currentLocale;
        const url = this.buildProductUrl(locale, sku)
        try {
            const product = await this.collect(url)
            if (product && product.length) {
                this.pass = this.pass + 1
            } else {
                this.fail = this.fail + 1
            }
            return product && product[0] ? product[0] : null
        } catch (error: any) {
            console.trace(error.message)
            this.fail = this.fail + 1
            return this.getDefaultSKU(sku)
        }
    }
    // sku #2
    async collectSKUData(list: string[]) {
        const promises = list.map(this.handleCollectSKU.bind(this))
        const products = await Promise.all(promises)
        return products.filter(sku => sku !== undefined && sku !== null) as iSKU[]
    }

    /**
   * Removes all HTML/XML tags from a string.
   * @param str - The input string potentially containing HTML tags.
   * @returns A clean string without any HTML tags.
   */
    stripHTMLTags(str: string): string {
        if (!str) return '';
        return str.replace(/<[^>]*>/g, '');
    }

    static extractValidPDPMatches<T>(input: string): T[] {
        let matches: T[] = []
        let depth = 0
        let start = -1

        for (let i = 0; i < input.length; i++) {
            const char = input[i]

            if (char === '{') {
                if (depth === 0) start = i
                depth++
            } else if (char === '}') {
                depth--
                if (depth === 0 && start !== -1) {
                    const jsonString = input.slice(start, i + 1)
                    try {
                        const parsed = JSON.parse(jsonString)
                        if (parsed) {
                            matches.push(parsed)
                            break
                        }
                    } catch {

                    }
                    start = -1
                }
            }
        }

        return matches
    }

    static extractValidJsonMatches<T>(input: string): T[] {
        let matches: T[] = []
        let depth = 0
        let start = -1

        for (let i = 0; i < input.length; i++) {
            const char = input[i]

            if (char === '{') {
                if (depth === 0) start = i
                depth++
            } else if (char === '}') {
                depth--
                if (depth === 0 && start !== -1) {
                    const jsonString = input.slice(start, i + 1)
                    try {
                        const parsed = JSON.parse(jsonString)
                        if (parsed.viewData) {
                            matches = parsed.viewData ? parsed.viewData.products : []
                            break
                        }
                    } catch {

                    }
                    start = -1
                }
            }
        }

        return matches
    }

    static extractNumberFromPrice(price: string): number {
        return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    }

    static getLargestImageUrl(srcset: string): string | null {
        const parsed = parseSrcset(srcset);
        const withWidth = parsed.filter(entry => typeof entry.width === 'number');
        if (withWidth.length === 0) return null;
        withWidth.sort((a, b) => b.width! - a.width!);
        return withWidth[0].url;
    }
}

export const finder = Finder.getInstance();
