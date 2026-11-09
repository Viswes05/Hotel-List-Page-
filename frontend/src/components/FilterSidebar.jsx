import { useEffect, useState } from 'react';

export default function FilterSidebar({ filters, onApply, onClear }) {
  const [search, setSearch] = useState(filters.search);
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearch(filters.search);
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
  }, [filters.search, filters.minPrice, filters.maxPrice]);

  const submit = (e) => {
    e.preventDefault();
    if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) {
      setError('Min price cannot be greater than max price');
      return;
    }
    setError('');
    onApply({ search: search.trim(), minPrice, maxPrice });
  };

  const clear = () => {
    setError('');
    onClear();
  };

  return (
    <aside className="sidebar">
      <form onSubmit={submit}>
        <div className="sidebar__section">
          <h4>Search</h4>
          <input
            type="search"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search by title"
          />
        </div>

        <div className="sidebar__section">
          <h4>Price range (₹)</h4>
          <div className="price-row">
            <label>
              Min
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </label>
            <label>
              Max
              <input
                type="number"
                min="0"
                placeholder="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </label>
          </div>
          {error && <p className="field-error">{error}</p>}
        </div>

        <button type="submit" className="btn btn--primary btn--block">
          Apply
        </button>
        <button type="button" className="btn btn--outline btn--block" onClick={clear}>
          Clear filters
        </button>
      </form>
    </aside>
  );
}
