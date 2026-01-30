import React, { useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import './GiftFinder.css';
import { ARCHETYPES, BUDGETS } from '../utils/data';
import { finder, Finder } from '../utils/Finder';
import type { iSKU } from '../utils/interfaces';

const GiftFinder: React.FC = () => {
    const [archetype, setArchetype] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [budget, setBudget] = useState<string>('');
    const [country] = useState<string>('.com.ng'); // Default to Nigeria
    const [results, setResults] = useState<iSKU[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    const archetypeOptions = Object.keys(ARCHETYPES);
    const categoryOptions = archetype ? ARCHETYPES[archetype] : [];

    const handleFindGift = async () => {
        if (!category || !country) {
            alert("Please select at least a category and country!");
            return;
        }

        setLoading(true);
        setResults([]);
        setHasSearched(true);

        try {
            const parseBudget = (b: string) => {
                const numbers = b.replace(/[^0-9]/g, '-').split('-').filter(Boolean).map(Number);
                if (b.toLowerCase().includes('under')) return { min: 0, max: numbers[0] };
                if (b.toLowerCase().includes('above')) return { min: numbers[0], max: 2000000 }; // Use a large number instead of Infinity for URL
                return { min: numbers[0], max: numbers[1] };
            };

            const baseUrl = `https://www.jumia${country}`;
            const searchPath = `/catalog/`;
            const query = encodeURIComponent(category);
            let searchUrl = `${baseUrl}${searchPath}?q=${query}&shop_premium_services=shop_express`;

            let budgetLimit = { min: 0, max: Infinity };
            if (budget) {
                const { min, max } = parseBudget(budget);
                budgetLimit = { min, max };
                // Jumia URL parameters for price: price=min-max
                searchUrl += `&price=${min}-${max === Infinity ? '' : max}`;
            }

            console.log(`Searching: ${searchUrl}`);

            // Fetch up to 5 pages (reduced from 10 for speed, especially since we filtered by price in URL)
            const foundProducts = await finder.findProductsByUrl(searchUrl, 5);

            // Double check filter by budget in-memory (to be safe)
            let filteredProducts = foundProducts;
            if (budget) {
                filteredProducts = foundProducts.filter(p => {
                    const price = Finder.extractNumberFromPrice(p.prices.price);
                    return price >= budgetLimit.min && price <= budgetLimit.max;
                });
            }

            // Prioritize Jumia Express products
            const prioritizedProducts = [...filteredProducts].sort((a, b) => {
                const aExpress = a.isShopExpress || a.shopExpress ? 1 : 0;
                const bExpress = b.isShopExpress || b.shopExpress ? 1 : 0;
                return bExpress - aExpress;
            });

            setResults(prioritizedProducts);

        } catch (error) {
            console.error("Error finding gifts:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gift-finder-wrapper">
            <div className="gift-finder-container">
                <div className="gift-finder-form">
                    {/* Archetype Selector */}
                    <div className="input-group">
                        <label className="input-label" htmlFor="archetype">
                            Who is this for? ❤️
                        </label>
                        <select
                            id="archetype"
                            className="finder-select"
                            value={archetype}
                            onChange={(e) => {
                                setArchetype(e.target.value);
                                setCategory(''); // Reset category when archetype changes
                            }}
                        >
                            <option value="" disabled>Select a loved one...</option>
                            {archetypeOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category Selector */}
                    <div className="input-group">
                        <label className="input-label" htmlFor="category">
                            What do they love? 🎁
                        </label>
                        <select
                            id="category"
                            className="finder-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={!archetype}
                        >
                            <option value="" disabled>Select an interest...</option>
                            {categoryOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Budget Selector */}
                    <div className="input-group">
                        <label className="input-label" htmlFor="budget">
                            What's the budget? 💰
                        </label>
                        <select
                            id="budget"
                            className="finder-select"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        >
                            <option value="" disabled>Select range...</option>
                            {BUDGETS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Find Button */}
                    <div className="input-group" style={{ flex: '0 0 auto' }}>
                        <label className="input-label" style={{ visibility: 'hidden' }}>Action</label>
                        <button
                            className="find-gift-btn"
                            onClick={handleFindGift}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Gift size={20} />}
                            Spread Love
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Display */}
            {hasSearched && (
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                            <Loader2 className="animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} size={48} color="#ED8F03" />
                            <p>Searching for the perfect gift...</p>
                            <small>Fetching products from Jumia</small>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="results-container">
                            {results.map((product, idx) => (
                                <div key={idx} className="product-card">
                                    <div className="product-image-wrapper">
                                        {(product.isShopExpress || product.shopExpress) && (
                                            <div className="express-badge">Express</div>
                                        )}
                                        <img src={product.image} alt={product.name} className="product-image"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image'; }} />
                                    </div>
                                    <div className="product-info">
                                        <div className="product-brand">{product.brand}</div>
                                        <div className="product-title" title={product.name}>{product.name}</div>
                                        <div className="product-price">{product.prices.price}</div>
                                        <a href={product.url.startsWith('http') ? product.url : `https://www.jumia${country}${product.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="product-link">
                                            View Deal
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                            <p>No gifts found matching your criteria. Try a different category?</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GiftFinder;
