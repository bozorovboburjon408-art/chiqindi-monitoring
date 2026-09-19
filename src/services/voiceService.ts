// Voice Service: Uzbek Speech Recognition (STT), Speech Synthesis (TTS), and Speech-to-Speech engine

// Cyrillic to Uzbek Latin Transliterator Map
const cyrillicToLatinMap: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': "'",
  'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ў': "o'", 'қ': 'q', 'ғ': "g'", 'ҳ': 'h',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'J', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'X', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sh', 'Ъ': "'",
  'Ы': 'I', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  'Ў': "O'", 'Қ': 'Q', 'Ғ': "G'", 'Ҳ': 'H'
};

export function transliterateCyrillicToUzbekLatin(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += cyrillicToLatinMap[char] !== undefined ? cyrillicToLatinMap[char] : char;
  }
  return result;
}

// Convert Uzbek words for numbers into actual digits
const uzbekNumberWords: Record<string, number> = {
  'nol': 0, 'bir': 1, 'ikki': 2, 'uch': 3, 'to\'rt': 4, 'tort': 4, 'besh': 5,
  'olti': 6, 'yetti': 7, 'etti': 7, 'sakkiz': 8, 'to\'qqiz': 9, 'toqqiz': 9,
  'o\'n': 10, 'on': 10, 'yigirma': 20, 'o\'ttiz': 30, 'ottiz': 30, 'qirq': 40,
  'ellik': 50, 'oltmish': 60, 'yetmish': 70, 'ettimish': 70, 'sakson': 80,
  'to\'qson': 90, 'toqson': 90, 'yuz': 100, 'ming': 1000
};

export function parseUzbekNumberPhrases(text: string): string {
  // Replace spoken plate numbers like "sakson besh yetti yuz o'n to'rt" -> "85 714"
  let replaced = text;

  // Specific common plate substitutions
  replaced = replaced.replace(/sakson\s*besh/gi, '85');
  replaced = replaced.replace(/yetmish\s*besh/gi, '75');
  replaced = replaced.replace(/yetti\s*yuz\s*(o['‘]n\s*)?to['‘]rt/gi, '714');
  replaced = replaced.replace(/ikki\s*yuz\s*oltmish\s*to['‘]qqiz/gi, '269');
  replaced = replaced.replace(/sakkiz\s*yuz\s*yigirma/gi, '820');

  return replaced;
}

// Normalizes spoken Uzbek speech input to maximize intent matching
export function normalizeUzbekSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText.trim();
  // Transliterate if Cyrillic characters are detected
  if (/[а-яёўқғҳ]/i.test(text)) {
    text = transliterateCyrillicToUzbekLatin(text);
  }

  // Normalize apostrophes
  text = text.replace(/[`ʻ‘’'ʹ]/g, "'");

  // Number phrases
  text = parseUzbekNumberPhrases(text);

  return text;
}

// Prepares Uzbek text for natural TTS pronunciation
export function prepareTextForUzbekTTS(text: string): string {
  if (!text) return '';

  let speech = text
    .replace(/\[ACTION:[^\]]+\]/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/•/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  // Spoken expansions for natural sound
  speech = speech.replace(/\bkm\/soat\b/gi, 'kilometr soatiga');
  speech = speech.replace(/\bkm\b/gi, 'kilometr');
  speech = speech.replace(/\bMFY\b/g, "Mahalla fuqarolar yig'ini");
  speech = speech.replace(/\bmfy\b/g, "mahalla");
  speech = speech.replace(/\bЧЙМ\b/g, "Chiqindilarni yig'ish maydonchasi");
  speech = speech.replace(/\bCHYM\b/g, "Chiqindilarni yig'ish maydonchasi");
  speech = speech.replace(/\bGPS\b/gi, "ji pi es");
  speech = speech.replace(/\bISUZU\b/gi, "Isuzu");
  speech = speech.replace(/\bNPR\b/gi, "en pe er");

  // License plates phonetics
  speech = speech.replace(/85\s*714\s*UZA/gi, "sakson besh, yetti yuz o'n to'rt, U Z A");
  speech = speech.replace(/75\s*269\s*LAA/gi, "yetmish besh, ikki yuz oltmish to'qqiz, L A A");
  speech = speech.replace(/85\s*820\s*BAA/gi, "sakson besh, sakkiz yuz yigirma, B A A");

  // Currency
  speech = speech.replace(/\+(\d+[\s\d]*)\s*so['‘]m/gi, "ortiqcha $1 so'm");
  speech = speech.replace(/(\d+[\s\d]*)\s*so['‘]m/gi, "$1 so'm");

  return speech;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

class VoiceService {
  private recognition: any = null;
  private isContinuousS2S: boolean = false;
  private currentState: VoiceState = 'idle';
  private stateListeners: ((state: VoiceState) => void)[] = [];
  private interimTranscriptListener: ((transcript: string) => void) | null = null;

  public subscribeState(listener: (state: VoiceState) => void): () => void {
    this.stateListeners.push(listener);
    listener(this.currentState);
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== listener);
    };
  }

  private setState(state: VoiceState) {
    this.currentState = state;
    this.stateListeners.forEach((l) => l(state));
  }

  public getState(): VoiceState {
    return this.currentState;
  }

  public setContinuousS2S(enabled: boolean) {
    this.isContinuousS2S = enabled;
  }

  public getContinuousS2S(): boolean {
    return this.isContinuousS2S;
  }

  public setInterimTranscriptListener(listener: ((transcript: string) => void) | null) {
    this.interimTranscriptListener = listener;
  }

  // Find best natural voice for Uzbek or Turkish phonetic clarity
  public getBestVoice(): SpeechSynthesisVoice | null {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Direct Uzbek voice
    const uzVoice = voices.find((v) => v.lang.toLowerCase().includes('uz'));
    if (uzVoice) return uzVoice;

    // 2. Turkish voice (Turkish phonetic engine pronounces Uzbek Latin vowels and consonants near perfectly)
    const trVoice = voices.find((v) => v.lang.toLowerCase().includes('tr') && !v.name.includes('eSpeak'));
    if (trVoice) return trVoice;

    // 3. Natural / Neural multilingual voice
    const naturalVoice = voices.find(
      (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Microsoft')) && (v.lang.includes('tr') || v.lang.includes('ru') || v.lang.includes('en'))
    );
    if (naturalVoice) return naturalVoice;

    return voices[0] || null;
  }

  // Speak Uzbek text with TTS and optional callback
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        onEnd?.();
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const cleanSpeech = prepareTextForUzbekTTS(text);
      if (!cleanSpeech) {
        onEnd?.();
        resolve();
        return;
      }

      this.setState('speaking');
      onStart?.();

      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.lang = 'uz-UZ';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voice = this.getBestVoice();
      if (voice) {
        utterance.voice = voice;
        // If using Turkish fallback voice, set language for proper phonetic synthesis
        if (voice.lang.includes('tr')) {
          utterance.lang = 'tr-TR';
        }
      }

      utterance.onend = () => {
        this.setState('idle');
        onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.setState('idle');
        onEnd?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentState === 'speaking') {
      this.setState('idle');
    }
  }

  // Start Speech-to-Text listening
  public startListening(onResult: (finalText: string) => void): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Kechirasiz, brauzeringizda ovoz yozish (Web Speech API) mavjud emas. Google Chrome yoki Microsoft Edge brauzeridan foydalaning.");
      return false;
    }

    this.stopSpeaking();

    try {
      if (this.recognition) {
        try { this.recognition.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'uz-UZ';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        this.setState('listening');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }

        if (interim && this.interimTranscriptListener) {
          this.interimTranscriptListener(interim);
        }

        if (final) {
          const normalized = normalizeUzbekSpeech(final);
          this.setState('processing');
          if (this.interimTranscriptListener) {
            this.interimTranscriptListener(normalized);
          }
          onResult(normalized);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          this.setState('idle');
        }
      };

      recognition.onend = () => {
        if (this.currentState === 'listening') {
          this.setState('idle');
        }
      };

      this.recognition = recognition;
      recognition.start();
      return true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      this.setState('idle');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    if (this.currentState === 'listening') {
      this.setState('idle');
    }
  }
}

export const voiceService = new VoiceService();
