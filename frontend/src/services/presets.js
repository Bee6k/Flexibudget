import api from './api';

export const getPreset = (archetype) =>
  api.get(`/presets/${archetype}`).then((r) => r.data);
