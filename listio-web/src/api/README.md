API helpers

This folder contains a lightweight HTTP wrapper used by the Pinia stores.

How to enable the real backend

- Set the environment variable `VITE_API_BASE_URL` in your `.env` (for example `.env.development`):

  VITE_API_BASE_URL=http://localhost:8080

- The `src/api/index.js` module will prepend this base URL to requests.

Lists API

- `src/api/lists.js` provides: `getAll()`, `getById(id)`, `create(payload)`, `update(id,payload)`, `delete(id)`.
- `src/stores/lists.js` exposes remote methods: `fetchRemote()`, `createRemote()`, `updateRemote(id,patch)` and `deleteRemote(id)`. They call the API and keep the local store in sync when responses return.

Error handling

- The `api` wrapper throws an Error with `status` and `data` when the server responds with a non-2xx status. Callers should catch errors and show messaging to the user.
