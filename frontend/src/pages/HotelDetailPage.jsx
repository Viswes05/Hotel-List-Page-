import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { clearCurrent, fetchHotel } from '../store/hotelsSlice';
import HotelMap from '../components/HotelMap';
import { formatPrice } from '../components/HotelCard';

// Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HotelDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: hotel, loading, error } = useSelector((s) => s.hotels);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    dispatch(fetchHotel(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  // Browser Geolocation API: how far is this hotel from the visitor?
  useEffect(() => {
    if (!hotel || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setDistance(distanceKm(coords.latitude, coords.longitude, hotel.latitude, hotel.longitude)),
      () => setDistance(null)
    );
  }, [hotel]);

  if (loading && !hotel) return <p className="state-msg">Loading…</p>;
  if (error) {
    return (
      <>
        <p className="state-msg state-msg--error">{error}</p>
        <Link to="/" className="btn btn--outline">← Back to hotels</Link>
      </>
    );
  }
  if (!hotel) return null;

  return (
    <>
      <Helmet>
        <title>{`${hotel.title} | HotelManager`}</title>
        <meta name="description" content={hotel.description.slice(0, 155)} />
        <meta property="og:title" content={hotel.title} />
        <meta property="og:description" content={hotel.description.slice(0, 155)} />
        <meta property="og:image" content={hotel.image_path} />
      </Helmet>

      <Link to="/" className="back-link">← Back to hotels</Link>

      <article className="detail">
        <img className="detail__image" src={hotel.image_path} alt={`${hotel.title} hotel`} />

        <div className="detail__info">
          <h1>{hotel.title}</h1>
          <p className="detail__price">
            {formatPrice(hotel.price)} <small>per night</small>
          </p>
          <p className="detail__desc">{hotel.description}</p>
          <p className="muted">
            📍 {hotel.latitude.toFixed(5)}, {hotel.longitude.toFixed(5)}
            {distance !== null && ` · ${distance.toFixed(1)} km from you`}
          </p>
          <Link to={`/hotels/${hotel.id}/edit`} className="btn btn--primary">
            Edit hotel
          </Link>
        </div>
      </article>

      <section>
        <h2>Location</h2>
        <HotelMap latitude={hotel.latitude} longitude={hotel.longitude} title={hotel.title} />
      </section>
    </>
  );
}
