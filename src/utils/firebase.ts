import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  DocumentData,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
} from 'firebase/firestore';
import { getBoolean, guid4 } from 'shared-base';
import { Json } from '../types';
import { ip } from './axios';

let app: FirebaseApp;
let db: Firestore;

export const initFirebase = (firebaseConfig: Json) => {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
};

type Callback = (data?: DocumentData) => void;

export const listenToEvents = (requestId: string, callback: Callback) => {
  return listenToSubCollection('requests', requestId, 'items', callback);
};

// listen to subCollection
export const listenToSubCollection = (
  collectionName: string,
  documentId: string,
  subCollectionName: string,
  callback: Callback
) => {
  const ref = collection(db, collectionName, documentId, subCollectionName);

  // get ref data

  return onSnapshot(
    ref,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          callback(change.doc.data());
        }
      });
    },
    (error: any) => {
      console.error('Error getting document:', error);
    }
  );
};

export const newRequest = (prompt: string, boardId: string) => {
  const requestId = guid4();

  const debugModeOn = getBoolean('debugModeOn');

  return setDoc(doc(db, 'requests', requestId), {
    id: requestId,
    prompt,
    boardId,
    ip,
    timestamp: Date.now(),
    debugModeOn,
  }).then(
    () => {
      return {
        id: requestId,
      };
    },
    (error) => {
      console.error('Error adding document: ', error);
      return {
        id: null,
      };
    }
  );
};

export const getItems = async (requestId: string) => {
  const q = query(collection(db, 'requests', requestId, 'items'));
  const querySnapshot = await getDocs(q);

  const output: Json[] = [];

  querySnapshot.forEach((doc) => {
    output.push(doc.data());
  });

  return output;
};

export const getRequest = (requestId: string) => {
  const ref = doc(db, 'requests', requestId);

  return getDoc(ref).then(async (doc) => {
    const data = await doc.data();

    const items = await getItems(requestId);

    return {
      ...(data as Json),
      items,
    } as Json;
  });
};
