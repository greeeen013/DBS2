import * as STATUS from '../../statuses.js';

export async function uploadPhoto({ store, api, payload }) {
  const { file } = payload;
  try {
    const result = await api.profile.uploadPhoto(file);
    store.setState((state) => ({
      ...state,
      memberProfile: { ...(state.memberProfile ?? {}), photo_url: result.photo_url },
      ui: {
        ...state.ui,
        notification: { type: STATUS.OK, message: 'Fotka byla úspěšně nahrána.' },
      },
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        notification: { type: STATUS.ERR, message: error.message ?? 'Nepodařilo se nahrát fotku.' },
      },
    }));
  }
}
