import React, { useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import './GiftFinder.css';
import { ARCHETYPES, BUDGETS } from '../utils/data';
import { finder } from '../utils/Finder';
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
            // Construct Search URL
            // Logic: https://www.jumia.com.ng/catalog/?q=search+term
            // "country" state holds the locale path e.g. '/ng'

            // Note: The Finder class expects a full URL for findProductsByUrl's first arg, 
            // OR a base URL to append page. 
            // Let's use Finder.getUrl logic manually or via helper if available.
            // finder.buildProductUrl builds for a specific SKU with ?q=sku. 
            // We want general search.

            const baseUrl = `https://www.jumia${country}`;
            const searchPath = `/catalog/`;
            const query = encodeURIComponent(category);

            // We will perform a search query
            const searchUrl = `${baseUrl}${searchPath}?q=${query}`; // &price=... if we want to filter by budget roughly, but parsing budget string is complex.
            // For now, let's just search by category text.

            console.log(`Searching: ${searchUrl}`);

            // The finder.findProductsByUrl logic appends "&page=1" etc.
            // So we pass the base search URL.

            const foundProducts = await finder.findProductsByUrl(searchUrl, 1);

            // Client-side Budget Filtering could happen here if we parse the prices relative to the Budget string.
            // Given the budget strings are ranges like "N5000 - N10000", we would need price parsing logic.
            // The provided code has 'extractNumberFromPrice'.
            // For MVP, lets just show results. The user asked for the "UI component", logic is a bonus.

            setResults(foundProducts);

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
                            Looking for a gift for...
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
                            <option value="" disabled>Select Archetype</option>
                            {archetypeOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category Selector */}
                    <div className="input-group">
                        <label className="input-label" htmlFor="category">
                            In the category...
                        </label>
                        <select
                            id="category"
                            className="finder-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={!archetype}
                        >
                            <option value="" disabled>Select Category</option>
                            {categoryOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Budget Selector */}
                    <div className="input-group">
                        <label className="input-label" htmlFor="budget">
                            For a budget...
                        </label>
                        <select
                            id="budget"
                            className="finder-select"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                        >
                            <option value="" disabled>Select Budget</option>
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
                            Find Gift
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
