import { eventChannel } from 'redux-saga';
import { listenToEvents } from '../../utils/firebase';

export function firebaseChannel(requestId: string) {
  return eventChannel((emitter) => {
    const unListen = listenToEvents(requestId, (event) => {
      emitter({ event });
    });

    return () => {
      unListen();
    };
  });
}
