const { removeImage } = require('./upload');

/**
 * Validates and normalises hotel fields.
 * `isCreate` makes the image mandatory (on update the old image is kept).
 */
function validateHotel(isCreate) {
  return (req, res, next) => {
    const { title, description, latitude, longitude, price } = req.body;
    const errors = {};

    if (!title || !String(title).trim()) errors.title = 'Title is required';
    else if (String(title).trim().length > 150) errors.title = 'Title must be 150 characters or fewer';

    if (!description || !String(description).trim()) errors.description = 'Description is required';
    else if (String(description).trim().length < 10)
      errors.description = 'Description must be at least 10 characters';

    const lat = Number(latitude);
    if (latitude === undefined || latitude === '' || Number.isNaN(lat))
      errors.latitude = 'Latitude is required and must be a number';
    else if (lat < -90 || lat > 90) errors.latitude = 'Latitude must be between -90 and 90';

    const lng = Number(longitude);
    if (longitude === undefined || longitude === '' || Number.isNaN(lng))
      errors.longitude = 'Longitude is required and must be a number';
    else if (lng < -180 || lng > 180) errors.longitude = 'Longitude must be between -180 and 180';

    const p = Number(price);
    if (price === undefined || price === '' || Number.isNaN(p))
      errors.price = 'Price is required and must be a number';
    else if (p < 0) errors.price = 'Price cannot be negative';

    if (isCreate && !req.file) errors.image = 'Image is required';

    if (Object.keys(errors).length) {
      if (req.file) removeImage(req.file.filename); // don't leave orphan uploads
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    req.hotel = {
      title: String(title).trim(),
      description: String(description).trim(),
      latitude: lat,
      longitude: lng,
      price: p,
    };
    next();
  };
}

module.exports = { validateHotel };
