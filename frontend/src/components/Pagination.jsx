export default function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  // Show a compact window of page numbers around the current page
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        «
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onChange(1)}>1</button>
          {start > 2 && <span className="pagination__gap">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? 'active' : ''}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="pagination__gap">…</span>}
          <button onClick={() => onChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        »
      </button>
    </nav>
  );
}
