export type PlayAudioResponse = {
  audio: HTMLAudioElement;
  duration: number;
};

let currentAudio: HTMLAudioElement;

export const stopAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
  }
};

export const playAudio = (audioUrl: string, isAmbience?: boolean): Promise<PlayAudioResponse> => {
  return new Promise((resolve) => {
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    if (isAmbience) {
      audio.loop = true;
    }

    audio.addEventListener(
      'canplaythrough',
      function () {
        setTimeout(() => {
          let duration = audio.duration * 1000;

          // if infinity duration then set to 10 seconds

          if (duration === Infinity) {
            duration = 10000;
          }

          resolve({
            audio,
            duration,
          });
        }, 100);
      },
      false
    );
  });
};

const ambience: Record<string, HTMLAudioElement> = {};

export const playAmbience = (id: string, audioUrl: string) => {
  ambience[id] = new Audio(audioUrl);
  ambience[id].loop = true;
  ambience[id].play();
};

export const stopAmbience = (audioUrl: string) => {
  if (ambience[audioUrl]) {
    ambience[audioUrl].pause();
  }
};
