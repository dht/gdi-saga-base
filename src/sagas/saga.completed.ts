import { selectors } from '@gdi/store-base';
import { takeEvery } from 'redux-saga/effects';
import { delay, put, select } from 'saga-ts';

export function* checkIfCompleted(action: any) {
  const { payload } = action;
  const { verb, source } = payload;

  if (verb === 'done' && source === 'server') {
    yield delay(1000);
    yield* onCompletion();
  }
}

export function* onCompletion() {
  const currentIds = yield* select(selectors.raw.$rawCurrentIds);
  const { boardId, requestId } = currentIds;

  yield delay(2000);
  yield put({ type: 'BOARD_LOAD', boardId, autoPlay: true });

  // tablet
  if (window.innerWidth < 1400) {
    window.open(`${document.location.origin}${document.location.pathname}#${requestId}`, '_blank');
  }
}

export function* root() {
  yield delay(10);
  yield takeEvery('PUSH_LOG', checkIfCompleted);
}

export default root;
