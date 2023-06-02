import { actions } from '@gdi/store-base';
import { call, put, takeEvery } from 'saga-ts';
import { getTranscript } from '../utils/axios';
import { getRequest } from '../utils/firebase';

type ActionRequestLoad = {
  type: 'REQUEST_LOAD';
  requestId: string;
};

export function* requestLoad(action: ActionRequestLoad) {
  const { requestId } = action;

  if (!requestId) {
    return;
  }

  const request = yield* call(getRequest, requestId);
  const { transcriptId, prompt } = request;

  yield put(actions.transcriptLines.clear());

  const transcript = yield* call(getTranscript as any, transcriptId);
  const { id, sentences } = transcript as any;

  yield put(
    actions.appState.patch({
      transcriptId: id,
      prompt: prompt as string,
    })
  );

  yield put(actions.transcriptLines.pushMany(sentences));
}

export function* root() {
  yield takeEvery('REQUEST_LOAD', requestLoad);
}
