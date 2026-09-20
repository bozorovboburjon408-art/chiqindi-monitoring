// Voice Service: High-Fidelity Uzbek TTS (Text-to-Speech), STT, and Speech-to-Speech Engine

// Cyrillic to Uzbek Latin Transliterator Map
const cyrillicToLatinMap: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '',
  'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ў': "o", 'қ': 'q', 'ғ': "g", 'ҳ': 'h',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'J', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'X', 'Ц': 'Ts', 'Ч': 'Ch', 'Sh': 'Sh', 'Щ': 'Sh', 'Ъ': '',
  'Ы': 'I', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  'Ў': "O", 'Қ': 'Q', 'Ғ': "G", 'Ҳ': 'H'
};

export function transliterateCyrillicToUzbekLatin(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += cyrillicToLatinMap[char] !== undefined ? cyrillicToLatinMap[char] : char;
  }
  return result;
}

// Units & Tens configured for 100% natural, smooth TTS pronunciation
const unitsTTS = ['', 'bir', 'ikki', 'uch', "to‘rt", 'besh', 'olti', 'yetti', 'sakkiz', "to‘qqiz"];
const tensTTS = ['', "o‘n", 'yigirma', "o‘ttiz", 'qirq', 'ellik', 'oltmish', 'yetmish', 'sakson', "to‘qson"];

export function numberToUzbekWordsTTS(num: number): string {
  if (isNaN(num) || num === 0) return 'nol';
  if (num < 0) return 'minus ' + numberToUzbekWordsTTS(Math.abs(num));

  num = Math.floor(num);
  let words = '';

  if (Math.floor(num / 1000000) > 0) {
    words += numberToUzbekWordsTTS(Math.floor(num / 1000000)) + ' million ';
    num %= 1000000;
  }

  if (Math.floor(num / 1000) > 0) {
    const thousandPart = Math.floor(num / 1000);
    if (thousandPart === 1) {
      words += 'bir ming ';
    } else {
      words += numberToUzbekWordsTTS(thousandPart) + ' ming ';
    }
    num %= 1000;
  }

  if (Math.floor(num / 100) > 0) {
    const hundredPart = Math.floor(num / 100);
    if (hundredPart === 1) {
      words += 'bir yuz ';
    } else {
      words += unitsTTS[hundredPart] + ' yuz ';
    }
    num %= 100;
  }

  if (Math.floor(num / 10) > 0) {
    words += tensTTS[Math.floor(num / 10)] + ' ';
    num %= 10;
  }

  if (num > 0) {
    words += unitsTTS[num] + ' ';
  }

  return words.trim();
}

// Spoken numbers to digits
export function parseUzbekNumberPhrases(text: string): string {
  let replaced = text;
  replaced = replaced.replace(/sakson\s*besh/gi, '85');
  replaced = replaced.replace(/yetmish\s*besh/gi, '75');
  replaced = replaced.replace(/yetti\s*yuz\s*(o['‘`]?n\s*)?to['‘`]?rt/gi, '714');
  replaced = replaced.replace(/ikki\s*yuz\s*oltmish\s*to['‘`]?qqiz/gi, '269');
  replaced = replaced.replace(/sakkiz\s*yuz\s*yigirma/gi, '820');
  return replaced;
}

// Normalizes spoken Uzbek speech input to maximize intent matching
export function normalizeUzbekSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText.trim();
  if (/[а-яёўқғҳ]/i.test(text)) {
    text = transliterateCyrillicToUzbekLatin(text);
  }

  text = text.replace(/[`ʻ‘’'ʹ]/g, "'");
  text = parseUzbekNumberPhrases(text);

  return text;
}

// Prepares Uzbek text for fluent, ultra-natural vocalization (TTS) with 0 numeric glitches
export function prepareTextForUzbekTTS(text: string): string {
  if (!text) return '';

  // Clean non-breaking whitespace and formatting
  let speech = text
    .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .replace(/\[ACTION:[^\]]+\]/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/•/g, ', ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  // 1. Technical abbreviations expanded into natural Uzbek
  speech = speech.replace(/\bkm\/soat\b/gi, 'kilometr soatiga');
  speech = speech.replace(/\bkm\b/gi, 'kilometr');
  speech = speech.replace(/\bMFY\b/g, "mahallasi");
  speech = speech.replace(/\bmfy\b/g, "mahallasi");
  speech = speech.replace(/\bЧЙМ\b/g, "Chiqindilarni yig'ish maydonchasi");
  speech = speech.replace(/\bCHYM\b/g, "Chiqindilarni yig'ish maydonchasi");
  speech = speech.replace(/\bGPS\b/gi, "ji pi es");
  speech = speech.replace(/\bISUZU\b/gi, "Isuzu");
  speech = speech.replace(/\bNPR\b/gi, "en pe er");
  speech = speech.replace(/\bDK\b/g, "davlat korxonasi");
  speech = speech.replace(/\bDUK\b/g, "davlat unitar korxonasi");

  // 2. License plates with rhythmic pause
  speech = speech.replace(/85\s*714\s*UZA/gi, "sakson besh, yetti yuz o‘n to‘rt, U, Z, A");
  speech = speech.replace(/75\s*269\s*LAA/gi, "yetmish besh, ikki yuz oltmish to‘qqiz, L, A, A");
  speech = speech.replace(/85\s*820\s*BAA/gi, "sakson besh, sakkiz yuz yigirma, B, A, A");
  speech = speech.replace(/85\s*911\s*CAA/gi, "sakson besh, to‘qqiz yuz o‘n bir, S, A, A");
  speech = speech.replace(/85\s*455\s*EAA/gi, "sakson besh, to‘rt yuz ellik besh, E, A, A");

  // 3. Phone numbers (e.g. +998 91 582 76 22)
  speech = speech.replace(/\+998\s*(\d{2})\s*(\d{3})\s*(\d{2})\s*(\d{2})/g, (m, c, p1, p2, p3) => {
    return `to‘qqiz yuz to‘qson sakkiz, ${numberToUzbekWordsTTS(parseInt(c, 10))}, ${numberToUzbekWordsTTS(parseInt(p1, 10))}, ${numberToUzbekWordsTTS(parseInt(p2, 10))}, ${numberToUzbekWordsTTS(parseInt(p3, 10))}`;
  });

  // 4. Ordinal house numbers (e.g. 1-uy -> birinchi uy, 12-uy -> o‘n ikkinchi uy)
  speech = speech.replace(/(\d+)-uy/gi, (match, numStr) => {
    const n = parseInt(numStr, 10);
    const ordinals: Record<number, string> = {
      1: 'birinchi', 2: 'ikkinchi', 3: 'uchinchi', 4: 'to‘rtinchi', 5: 'beshinchi',
      6: 'oltinchi', 7: 'yettinchi', 8: 'sakkizinchi', 9: 'to‘qqizinchi', 10: 'o‘ninchi',
      11: 'o‘n birinchi', 12: 'o‘n ikkinchi', 13: 'o‘n uchinchi', 14: 'o‘n to‘rtinchi', 15: 'o‘n beshinchi',
      16: 'o‘n oltinchi', 17: 'o‘n yettinchi', 18: 'o‘n sakkizinchi', 19: 'o‘n to‘qqizinchi', 20: 'yigirmanchi'
    };
    return (ordinals[n] || `${numberToUzbekWordsTTS(n)}inchi`) + ' uy';
  });

  // 5. Quantities with 'tasi' or 'ta'
  speech = speech.replace(/(\d+)\s*tasi\b/gi, (m, numStr) => {
    const n = parseInt(numStr, 10);
    return `${numberToUzbekWordsTTS(n)}tasi`;
  });

  speech = speech.replace(/(\d+)\s*ta\b/gi, (m, numStr) => {
    const n = parseInt(numStr, 10);
    return `${numberToUzbekWordsTTS(n)} ta`;
  });

  // 6. Decimals (e.g. 42.6 km -> qirq ikki butun olti kilometr)
  speech = speech.replace(/(\d+)[.,](\d+)\s*(kilometr soatiga|kilometr)/gi, (m, w, f, unit) => {
    const whole = numberToUzbekWordsTTS(parseInt(w, 10));
    const frac = numberToUzbekWordsTTS(parseInt(f, 10));
    return `${whole} butun ${frac} ${unit}`;
  });

  // 7. Currency with so'm (handles +15 000, 15000, 18000, 34000, etc.)
  speech = speech.replace(/\+\s*(\d[\d\s]*)\s*so['‘`]?m/gi, (m, sumStr) => {
    const cleanNum = parseInt(sumStr.replace(/\s+/g, ''), 10);
    return `ortiqcha ${numberToUzbekWordsTTS(cleanNum)} so‘m`;
  });

  speech = speech.replace(/-\s*(\d[\d\s]*)\s*so['‘`]?m/gi, (m, sumStr) => {
    const cleanNum = parseInt(sumStr.replace(/\s+/g, ''), 10);
    return `${numberToUzbekWordsTTS(cleanNum)} so‘m qarzdorlik`;
  });

  speech = speech.replace(/(\d[\d\s]*)\s*so['‘`]?m/gi, (m, sumStr) => {
    const cleanNum = parseInt(sumStr.replace(/\s+/g, ''), 10);
    if (!isNaN(cleanNum)) {
      return `${numberToUzbekWordsTTS(cleanNum)} so‘m`;
    }
    return m;
  });

  // 8. Grouped space numbers (e.g. "15 000" -> "15000" -> "o‘n besh ming")
  speech = speech.replace(/\b(\d{1,3})\s+(\d{3})\s+(\d{3})\b/g, (m, a, b, c) => {
    const total = parseInt(a + b + c, 10);
    return numberToUzbekWordsTTS(total);
  });

  speech = speech.replace(/\b(\d{1,3})\s+(\d{3})\b/g, (m, a, b) => {
    const total = parseInt(a + b, 10);
    return numberToUzbekWordsTTS(total);
  });

  // 9. Convert ALL remaining numbers in the text to Uzbek words (e.g. 15000 -> o‘n besh ming)
  speech = speech.replace(/\b\d+\b/g, (m) => {
    const n = parseInt(m, 10);
    return numberToUzbekWordsTTS(n);
  });

  // 10. Smooth punctuation breathing
  speech = speech.replace(/\s*;\s*/g, ', ');
  speech = speech.replace(/\s*:\s*/g, ': ');
  speech = speech.replace(/([.?!])\s*/g, '$1 ');

  return speech.trim();
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

class VoiceService {
  private recognition: any = null;
  private isContinuousS2S: boolean = false;
  private currentState: VoiceState = 'idle';
  private stateListeners: ((state: VoiceState) => void)[] = [];
  private interimTranscriptListener: ((transcript: string) => void) | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private speechUtterance: SpeechSynthesisUtterance | null = null;

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

  public getBestVoice(): SpeechSynthesisVoice | null {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Direct Uzbek voice
    const uzVoice = voices.find((v) => v.lang.toLowerCase().includes('uz'));
    if (uzVoice) return uzVoice;

    // 2. Turkish voice
    const trVoice = voices.find((v) => v.lang.toLowerCase().includes('tr') && !v.name.includes('eSpeak'));
    if (trVoice) return trVoice;

    // 3. Natural / Neural voice
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Microsoft')) &&
        (v.lang.includes('tr') || v.lang.includes('ru') || v.lang.includes('en'))
    );
    if (naturalVoice) return naturalVoice;

    return voices[0] || null;
  }

  private chunkText(text: string, maxLen = 160): string[] {
    const clean = text.replace(/[\n\r]+/g, ' ').trim();
    if (clean.length <= maxLen) return [clean];

    const sentences = clean.split(/(?<=[.?!,])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const s of sentences) {
      if ((current + ' ' + s).trim().length <= maxLen) {
        current = (current + ' ' + s).trim();
      } else {
        if (current) chunks.push(current);
        current = s;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  // Speaks text with zero raw digit artifacts (15000 -> on besh ming)
  public async speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stopSpeaking();

    const cleanSpeech = prepareTextForUzbekTTS(text);
    if (!cleanSpeech) {
      onEnd?.();
      return;
    }

    this.setState('speaking');
    onStart?.();

    // Try Google Neural Uzbek Audio stream first
    const chunks = this.chunkText(cleanSpeech);
    let chunkIndex = 0;

    const playNextChunk = () => {
      if (chunkIndex >= chunks.length) {
        this.setState('idle');
        onEnd?.();
        return;
      }

      const chunk = chunks[chunkIndex++];
      const encoded = encodeURIComponent(chunk);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=uz&client=tw-ob&q=${encoded}`;

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        playNextChunk();
      };

      audio.onerror = () => {
        this.fallbackWebSpeech(cleanSpeech, onEnd);
      };

      audio.play().catch(() => {
        this.fallbackWebSpeech(cleanSpeech, onEnd);
      });
    };

    playNextChunk();
  }

  private fallbackWebSpeech(cleanText: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      this.setState('idle');
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'uz-UZ';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voice = this.getBestVoice();
    if (voice) {
      utterance.voice = voice;
      if (voice.lang.includes('tr')) {
        utterance.lang = 'tr-TR';
      }
    }

    utterance.onend = () => {
      this.setState('idle');
      onEnd?.();
    };

    utterance.onerror = () => {
      this.setState('idle');
      onEnd?.();
    };

    this.speechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.speechUtterance = null;

    if (this.currentState === 'speaking') {
      this.setState('idle');
    }
  }

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
