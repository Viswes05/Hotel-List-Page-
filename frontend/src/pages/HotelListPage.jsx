import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  PAGE_SIZE,
  fetchHotels,
  deleteHotel,
  setFilters,
  setPage,
  clearFilters,
  dismissDeleteSuccess,
} from '../store/hotelsSlice';
import HotelCard from '../components/HotelCard';
import Pagination from '../components/Pagination';
import FilterSidebar from '../components/FilterSidebar';
import ConfirmDialog from '../components/ConfirmDialog';
import SuccessPopup from '../components/SuccessPopup';

export default function HotelListPage() {
  const dispatch = useDispatch();
  const { items, total, filters, loading, error, deleteSuccess } = useSelector((s) => s.hotels);
  const [toDelete, setToDelete] = useState(null);

  // Re-fetch whenever any filter or the page changes
  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch, filters]);

  const confirmDelete = async () => {
    const id = toDelete.id;
    setToDelete(null);
    const result = await dispatch(deleteHotel(id));
    if (deleteHotel.fulfilled.match(result)) {
      // If the last item of a page was removed, step back a page; otherwise refresh
      if (items.length === 1 && filters.page > 1) dispatch(setPage(filters.page - 1));
      else dispatch(fetchHotels());
    }
  };

  const closePopup = useCallback(() => dispatch(dismissDeleteSuccess()), [dispatch]);

  return (
    <>
      <Helmet>
        <title>Hotels | HotelManager</title>
        <meta name="description" content="Browse and filter hotels by title and price range." />
        <meta property="og:title" content="Hotels | HotelManager" />
      </Helmet>

      <div className="page-head">
        <h1>Hotels</h1>
        <p className="muted">{loading ? 'Loading…' : `${total} hotel${total === 1 ? '' : 's'} found`}</p>
      </div>

      <div className="layout">
        <FilterSidebar
          filters={filters}
          onApply={(f) => dispatch(setFilters(f))}
          onClear={() => dispatch(clearFilters())}
        />

        <section className="list">
          {error && <p className="state-msg state-msg--error">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="state-msg">No hotels match your search. Try changing the filters or add a new hotel.</p>
          )}

          {items.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} onDelete={setToDelete} />
          ))}

          <Pagination
            page={filters.page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={(p) => {
              dispatch(setPage(p));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </section>
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete hotel?"
          message={`"${toDelete.title}" will be permanently removed.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {deleteSuccess && <SuccessPopup message="Hotel deleted successfully" onClose={closePopup} />}
    </>
  );
}
