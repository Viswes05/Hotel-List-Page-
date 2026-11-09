import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { clearCurrent, clearSaveErrors, fetchHotel, saveHotel } from '../store/hotelsSlice';
import HotelForm from '../components/HotelForm';

export default function HotelFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, loading, saving, saveErrors, error } = useSelector((s) => s.hotels);

  useEffect(() => {
    dispatch(clearSaveErrors());
    if (isEdit) dispatch(fetchHotel(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id, isEdit]);

  const handleSubmit = async (formData) => {
    const result = await dispatch(saveHotel({ id, formData }));
    if (saveHotel.fulfilled.match(result)) navigate(`/hotels/${result.payload.id}`);
  };

  const title = isEdit ? 'Edit Hotel' : 'Add Hotel';

  return (
    <>
      <Helmet>
        <title>{`${title} | HotelManager`}</title>
        <meta name="description" content={`${title} - manage hotel listings.`} />
      </Helmet>

      <div className="page-head">
        <h1>{title}</h1>
      </div>

      {isEdit && loading && !current && <p className="state-msg">Loading…</p>}
      {isEdit && error && <p className="state-msg state-msg--error">{error}</p>}

      {(!isEdit || current) && (
        <HotelForm
          initialValues={isEdit ? current : null}
          serverErrors={saveErrors}
          submitting={saving}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      )}
    </>
  );
}
