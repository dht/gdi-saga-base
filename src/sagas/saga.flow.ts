import { Json, actions, selectors } from '@gdi/store-base';
import { put, select, takeEvery } from 'saga-ts';

type ActionLog = {
  type: 'ADD_LOG';
  payload: Json;
};

export function* checkStages(action: ActionLog) {
  const { payload } = action;
  const { isRunning, stage } = payload;

  const allNodes = yield* select(selectors.raw.$rawFlowNodes);

  const node = Object.values(allNodes).find((node) => node.label === stage);

  if (!node) {
    return;
  }

  yield put(actions.flowNodes.patch(node.id, { isRunning }));

  if (node.id === 'n5' && isRunning) {
    console.log('done');
  }
}

export function* root() {
  yield takeEvery('PUSH_LOG', checkStages);
}
