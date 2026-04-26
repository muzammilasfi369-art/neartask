import * as Speech from 'expo-speech';

export const speak = (text, lang = 'ur-PK') => {
  Speech.speak(text, {
    language: lang,
    pitch: 1.0,
    rate: 0.9,
    onDone: () => console.log('Speech done'),
    onError: () => {
      // Fallback to English if Urdu not available
      Speech.speak(text, { language: 'en-US', pitch: 1.0, rate: 0.9 });
    },
  });
};

export const stopSpeaking = () => {
  Speech.stop();
};
