import axios, { AxiosInstance } from 'axios';
import { Json } from '../types';

export let ip = '',
  storageUrl: string = '';

export let instance: AxiosInstance;

export const initAxios = (baseStorageUrl: string) => {
  getIp();

  instance = axios.create({
    baseURL: baseStorageUrl,
  });

  storageUrl = baseStorageUrl;
};

export const getIp = () => {
  return axios('https://api.ipify.org/?format=json')
    .then((response) => {
      ip = response.data.ip;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

export const getBoard = (boardId: string) => {
  const filePath = `/boards%2F${boardId}.json?alt=media`;

  return instance
    .get(filePath)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

export const getTranscript = (transcriptId: string): Promise<Json> => {
  const filePath = `/%2Ftranscript-${transcriptId}%2Ftranscript.index.json?alt=media`;

  return instance
    .get(filePath)
    .then((response) => {
      return response.data as Json;
    })
    .catch((error) => {
      console.error('Error:', error);
      return {};
    });
};
