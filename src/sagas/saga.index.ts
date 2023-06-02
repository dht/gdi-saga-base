import { fork } from 'saga-ts';
import { root as api } from './saga.api';
import { root as board } from './saga.board';
import { root as completed } from './saga.completed';
import { root as click } from './saga.click';
import { root as flow } from './saga.flow';
import { root as playback } from './saga.playback';
import { root as request } from './saga.request';

export function* root() {
  yield* fork(api);
  yield* fork(board);
  yield* fork(click);
  yield* fork(completed);
  yield* fork(flow);
  yield* fork(playback);
  yield* fork(request);
}
