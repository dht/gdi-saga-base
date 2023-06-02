import { actions, selectors } from '@gdi/store-base';
import { toast } from '@gdi/ui';
import { moveTorus } from 'isokit';
import { takeLatest } from 'redux-saga/effects';
import { call, cancel, delay, fork, put, select, takeEvery } from 'saga-ts';
import { playAmbience, playAudio, stopAmbience, stopAudio } from '../utils/audio';
import { DataItem, mouthShapesBackMap, mouthShapesMap } from '../utils/phonetics';

let scene: any, task: any;

export function* startAnimation() {
  const transcript = yield* select(selectors.base.$transcriptForAnimation);

  yield call(playAmbience, 'park1', '/park-1.mp3');
  yield call(playAmbience, 'park2', '/park-2.mp3');

  let index = 0;

  for (let item of transcript) {
    yield call(talk, item!, index);
    yield delay(500);
    index++;
  }

  yield delay(1000);

  toast.show("That's it folks!");

  yield call(wrapUp);
}

function* talk(item: DataItem, index: number) {
  const { sentence, audioUrl, characterId } = item;

  const response = yield* call(playAudio, audioUrl);

  yield put(
    actions.appState.patch({
      lineIndex: index,
    })
  );

  const { audio, duration } = response;

  moveSpeakingStone(characterId);
  audio.play();

  const mouthShapeMap = item.isBack ? mouthShapesBackMap : mouthShapesMap;

  const mouthShapes = sentence
    .split('')
    .map((char) => (mouthShapeMap as any)[char])
    .filter((mouthShape) => mouthShape && mouthShape !== 'none');

  const shapesCount = mouthShapes.length;
  const interval = duration / (shapesCount + 4);

  for (let mouthShape of mouthShapes) {
    changeMouth(characterId, mouthShape);
    yield delay(interval);
  }

  changeMouth(characterId, item.isBack ? 'n' : 'mbp');
}

const changeMouth = (characterId: string, mouthShapeId: string) => {
  const sm = scene.spriteManagers.find((sm: any) => sm.name === characterId);

  if (sm && sm.sprites.length > 0) {
    sm.sprites[0].cellRef = mouthShapeId + '.svg';
  }
};

const moveSpeakingStone = (characterId: string) => {
  const sm = scene.spriteManagers.find((sm: any) => sm.name === characterId);

  if (sm && sm.sprites.length > 0) {
    const { x, z } = sm.sprites[0].position;
    moveTorus(scene, { x, z });
  }
};

type ActionSpeech = {
  type: 'BABYLON_LOADED';
  scene: any;
  debugBabylon?: boolean;
};

export function* sceneLoaded(action: ActionSpeech) {
  scene = action.scene;

  if (action.debugBabylon) {
    scene.debugLayer.show();
  }
}

type ActionPlay = {
  type: 'PLAY';
};

export function* wrapUp() {
  yield call(stopAmbience, 'park1');
  yield call(stopAmbience, 'park2');

  yield put(
    actions.appState.patch({
      flavour: 'default',
    })
  );

  yield put(
    actions.playback.patch({
      playbackStatus: 'idle',
      startTime: Date.now(),
    })
  );

  yield put(
    actions.camera.patch({
      radius: 25,
      alpha: 1,
      beta: 1,
      target: { x: 0, y: 0, z: 0 },
    })
  );
}

export function* play(action: ActionPlay) {
  toast.show('Starting playback');

  yield put(
    actions.appState.patch({
      flavour: 'outcome',
    })
  );

  yield put(
    actions.playback.patch({
      playbackStatus: 'playing',
      startTime: Date.now(),
    })
  );

  yield put(
    actions.camera.patch({
      radius: 6,
      alpha: 1,
      beta: 1,
      target: { x: -5, y: 1, z: 10 },
    })
  );
}

export function* start() {
  task = yield* fork(startAnimation);
}

export function* stop() {
  stopAudio();
  yield* cancel(task as any);
  yield fork(wrapUp);
}

export function* root() {
  yield takeEvery('BABYLON_LOADED', sceneLoaded);
  yield takeLatest('PLAY', start);
  yield takeLatest('PLAY', play);
  yield takeEvery('STOP', stop);
}
