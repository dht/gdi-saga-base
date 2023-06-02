import { actions } from '@gdi/store-base';
import { put, takeEvery } from 'redux-saga/effects';
import { call, delay } from 'saga-ts';
import { getIp, storageUrl } from '../utils/axios';
import { newRequest } from '../utils/firebase';
import { firebaseChannel } from './channels/channel.firebase';

let channel: any;

export function* incomingEvent(incoming: any) {
  const { event } = incoming;
  yield put(actions.logs.push(event));
}

export function* startListeningToRequest(requestId: string) {
  if (channel) {
    channel.close();
  }
  channel = yield* call(firebaseChannel, requestId);
  yield takeEvery(channel, incomingEvent);
}

export function* prompt(action: any) {
  const { prompt } = action;

  yield put(actions.logs.clear());
  yield put(actions.appState.patch({ flavour: 'prepare' }));

  const response = yield* call(newRequest, prompt, 'board-c001');

  document.location.hash = '#' + response.id;

  if (response.id) {
    yield put(
      actions.currentIds.patch({
        requestId: response.id,
      })
    );

    yield call(startListeningToRequest, response.id);
  }
}

export function* root() {
  if (storageUrl) {
    yield put(actions.appState.patch({ storageUrl }));
  }

  yield delay(10);
  yield call(getIp);
  yield takeEvery('PROMPT', prompt);
}

export default root;
