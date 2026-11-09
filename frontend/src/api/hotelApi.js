const BASE = '/api/hotels';

async function handle(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || 'Request failed');
    err.errors = body.errors || {};
    err.status = res.status;
    throw err;
  }
  return body;
}

export const fetchHotelsApi = (params) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== undefined && v !== null) qs.set(k, v);
  });
  return fetch(`${BASE}?${qs.toString()}`).then(handle);
};

export const fetchHotelApi = (id) => fetch(`${BASE}/${id}`).then(handle);

export const createHotelApi = (formData) =>
  fetch(BASE, { method: 'POST', body: formData }).then(handle);

export const updateHotelApi = (id, formData) =>
  fetch(`${BASE}/${id}`, { method: 'PUT', body: formData }).then(handle);

export const deleteHotelApi = (id) => fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handle);
