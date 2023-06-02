import { actions } from '@gdi/store-base';
import { BoardIntro, prompt } from '@gdi/ui';
import type { IBoard } from 'igrid';
import { call, delay, put, takeEvery } from 'saga-ts';
import { getBoard } from '../utils/axios';

type ActionBoardLoad = {
  type: 'BOARD_LOAD';
  boardId: string;
  autoPlay?: boolean;
};

export function* boardLoad(action: ActionBoardLoad) {
  const { boardId, autoPlay } = action;

  const board = yield* call(getBoard, boardId);
  const requestId = document.location.hash.replace('#', '');
  yield put({ type: 'REQUEST_LOAD', requestId });

  yield put(actions.board.setAll(board));

  yield delay(100);

  yield put(
    actions.camera.patch({
      radius: 25,
      alpha: 1,
      beta: 1,
      target: { x: 0, y: 0, z: 0 },
    })
  );

  if (autoPlay) {
    yield put({ type: 'PLAY' });
  } else {
    yield call(showIntro, boardId, board);
  }
}

export function* showIntro(boardId: string, board: IBoard) {
  if (!board) {
    return;
  }

  const { didCancel } = yield prompt.custom({
    title: 'AI Board Intro',
    component: BoardIntro,
    componentProps: {
      boardId,
      boardInfo: board.boardInfo,
    },
  });

  if (didCancel) {
    return;
  }

  yield put({ type: 'PLAY' });
}

export function* root() {
  yield takeEvery('BOARD_LOAD', boardLoad);
}
