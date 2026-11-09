import { Link } from 'react-router-dom';

export const formatPrice = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const snippet = (text, max = 140) => (text.length > max ? `${text.slice(0, max).trim()}…` : text);

export default function HotelCard({ hotel, onDelete }) {
  return (
    <article className="card">
      <Link to={`/hotels/${hotel.id}`} className="card__image">
        <img src={hotel.image_path} alt={`${hotel.title} hotel`} loading="lazy" />
      </Link>

      <div className="card__body">
        <Link to={`/hotels/${hotel.id}`} className="card__title">
          {hotel.title}
        </Link>
        <p className="card__desc">{snippet(hotel.description)}</p>
      </div>

      <div className="card__side">
        <div className="card__price">
          {formatPrice(hotel.price)}
          <small>per night</small>
        </div>
        <div className="card__actions">
          <Link to={`/hotels/${hotel.id}/edit`} className="btn btn--outline">
            Edit
          </Link>
          <button className="btn btn--danger" onClick={() => onDelete(hotel)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
