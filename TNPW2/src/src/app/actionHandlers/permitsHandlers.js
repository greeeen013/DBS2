import * as CONST from '../../constants.js';

export function permitsHandlers(dispatch, viewState) {
  return {
    onGoToReservations: () => dispatch({ type: CONST.ENTER_RESERVATION_LIST }),

    onPurchase: (tariffId) =>
      dispatch({ type: CONST.PURCHASE_MEMBERSHIP, payload: { tariffId } }),

    onCreateTariff: (data) =>
      dispatch({ type: CONST.CREATE_TARIFF, payload: data }),

    onDeleteTariff: (tariffId) =>
      dispatch({ type: CONST.DELETE_TARIFF, payload: { tariffId } }),

    onRestoreTariff: (tariffId) =>
      dispatch({ type: CONST.RESTORE_TARIFF, payload: { tariffId } }),
  };
}
