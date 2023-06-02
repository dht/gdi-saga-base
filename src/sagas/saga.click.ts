import { put, takeEvery } from 'saga-ts';
import { createMouseClickChannel } from './channels/channel.click';

export function* click() {
  yield put({ type: 'CLICK' });
}

export function* root() {
  const channel = createMouseClickChannel();
  yield takeEvery(channel, click);
}
