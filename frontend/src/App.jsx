import { Link, Route, Routes } from 'react-router-dom';
import HotelListPage from './pages/HotelListPage';
import HotelDetailPage from './pages/HotelDetailPage';
import HotelFormPage from './pages/HotelFormPage';

export default function App() {
  return (
    <>
      <header className="navbar">
        <div className="container navbar__inner">
          <Link to="/" className="brand">
            🏨 Hotel<span>Manager</span>
          </Link>
          <Link to="/hotels/new" className="btn btn--primary">
            + Add Hotel
          </Link>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<HotelListPage />} />
          <Route path="/hotels/new" element={<HotelFormPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/hotels/:id/edit" element={<HotelFormPage />} />
          <Route path="*" element={<p className="state-msg">Page not found.</p>} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} HotelManager</footer>
    </>
  );
}
