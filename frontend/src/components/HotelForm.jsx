import { useEffect, useState } from 'react';

const EMPTY = { title: '', description: '', latitude: '', longitude: '', price: '' };
const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function Field({ name, label, error, children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function validate(values, imageFile, hasExistingImage) {
  const e = {};
  if (!values.title.trim()) e.title = 'Title is required';
  else if (values.title.trim().length > 150) e.title = 'Title must be 150 characters or fewer';

  if (!values.description.trim()) e.description = 'Description is required';
  else if (values.description.trim().length < 10) e.description = 'Description must be at least 10 characters';

  const lat = Number(values.latitude);
  if (values.latitude === '' || Number.isNaN(lat)) e.latitude = 'Latitude is required';
  else if (lat < -90 || lat > 90) e.latitude = 'Latitude must be between -90 and 90';

  const lng = Number(values.longitude);
  if (values.longitude === '' || Number.isNaN(lng)) e.longitude = 'Longitude is required';
  else if (lng < -180 || lng > 180) e.longitude = 'Longitude must be between -180 and 180';

  const price = Number(values.price);
  if (values.price === '' || Number.isNaN(price)) e.price = 'Price is required';
  else if (price < 0) e.price = 'Price cannot be negative';

  if (!imageFile && !hasExistingImage) e.image = 'Image is required';
  return e;
}

/**
 * Single reusable form used for both "Add" and "Edit".
 * Pass `initialValues` (a hotel) to switch into edit mode.
 */
export default function HotelForm({ initialValues, serverErrors = {}, submitting, onSubmit, onCancel }) {
  const isEdit = Boolean(initialValues);
  const [values, setValues] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [geoMsg, setGeoMsg] = useState('');

  // Populate when editing
  useEffect(() => {
    if (initialValues) {
      setValues({
        title: initialValues.title,
        description: initialValues.description,
        latitude: String(initialValues.latitude),
        longitude: String(initialValues.longitude),
        price: String(initialValues.price),
      });
      setPreview(initialValues.image_path);
    }
  }, [initialValues]);

  // Free the object URL when it changes / unmounts
  useEffect(
    () => () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const allErrors = { ...serverErrors, ...errors };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setErrors((er) => ({ ...er, image: 'Only JPG, PNG, WEBP or GIF images are allowed' }));
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrors((er) => ({ ...er, image: 'Image must be 5 MB or smaller' }));
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setErrors((er) => ({ ...er, image: undefined }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoMsg('Geolocation is not supported by your browser');
      return;
    }
    setGeoMsg('Locating…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValues((v) => ({
          ...v,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        }));
        setErrors((er) => ({ ...er, latitude: undefined, longitude: undefined }));
        setGeoMsg('Location filled in');
      },
      () => setGeoMsg('Could not get your location (permission denied?)')
    );
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(values, imageFile, isEdit && Boolean(initialValues.image_path));
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v.trim ? v.trim() : v));
    if (imageFile) fd.append('image', imageFile);
    onSubmit(fd);
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field error={allErrors.image} name="image" label="Hotel image">
        <input id="image" type="file" accept="image/*" onChange={handleImage} />
        {preview && (
          <img className="form__preview" src={preview} alt="Selected hotel preview" />
        )}
      </Field>

      <Field error={allErrors.title} name="title" label="Title">
        <input id="title" name="title" value={values.title} onChange={handleChange} maxLength={150} />
      </Field>

      <Field error={allErrors.description} name="description" label="Description">
        <textarea id="description" name="description" rows="5" value={values.description} onChange={handleChange} />
      </Field>

      <div className="form__row">
        <Field error={allErrors.latitude} name="latitude" label="Latitude">
          <input id="latitude" name="latitude" type="number" step="any" value={values.latitude} onChange={handleChange} />
        </Field>
        <Field error={allErrors.longitude} name="longitude" label="Longitude">
          <input id="longitude" name="longitude" type="number" step="any" value={values.longitude} onChange={handleChange} />
        </Field>
      </div>
      <div className="geo-row">
        <button type="button" className="btn btn--outline" onClick={useMyLocation}>
          📍 Use my current location
        </button>
        {geoMsg && <span className="geo-msg">{geoMsg}</span>}
      </div>

      <Field error={allErrors.price} name="price" label="Price per night (₹)">
        <input id="price" name="price" type="number" min="0" step="0.01" value={values.price} onChange={handleChange} />
      </Field>

      {serverErrors._form && <p className="field-error">{serverErrors._form}</p>}

      <div className="form__actions">
        <button type="button" className="btn btn--outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Update Hotel' : 'Add Hotel'}
        </button>
      </div>
    </form>
  );
}
