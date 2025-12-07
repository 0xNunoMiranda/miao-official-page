import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechSynthesisReturn {
  speak: (text: string, emotion?: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

export function useSpeechSynthesis(language: string = "pt", defaultEmotion: string = "excited"): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Mapear idiomas para códigos de idioma do navegador
      const langMap: Record<string, string> = {
        pt: "pt-BR",
        en: "en-US",
        es: "es-ES",
        fr: "fr-FR",
        de: "de-DE",
        zh: "zh-CN",
        ar: "ar-SA",
      };
      
      const targetLang = langMap[language] || language;
      const langPrefix = language.substring(0, 2);
      
      // Priorizar vozes masculinas
      // Palavras-chave que indicam vozes masculinas
      const maleKeywords = ["male", "masculine", "man", "homem", "masculino", "männlich", "homme", "masculino"];
      
      // Filtrar vozes do idioma correto
      const languageVoices = availableVoices.filter(
        (voice) => voice.lang.startsWith(langPrefix) || voice.lang === targetLang
      );
      
      // Priorizar vozes de menino/criança (geralmente têm nomes específicos ou são "child", "young", "teen")
      const boyVoiceKeywords = ["child", "young", "teen", "boy", "kid", "criança", "jovem", "niño", "garçon", "junge"];
      
      // Tentar encontrar voz de menino primeiro
      let matchingVoice = languageVoices.find(
        (voice) => {
          const voiceName = voice.name.toLowerCase();
          return boyVoiceKeywords.some(keyword => voiceName.includes(keyword));
        }
      );
      
      // Se não encontrar voz de menino, tentar vozes naturais/premium
      if (!matchingVoice) {
        const naturalVoiceKeywords = ["enhanced", "premium", "natural", "neural", "wavenet", "studio"];
        matchingVoice = languageVoices.find(
          (voice) => {
            const voiceName = voice.name.toLowerCase();
            return naturalVoiceKeywords.some(keyword => voiceName.includes(keyword));
          }
        );
      }
      
      // Se não encontrar, tentar vozes masculinas jovens
      if (!matchingVoice) {
        const youngMaleNames = ["david", "daniel", "james", "thomas", "joão", "carlos", "luis"];
        matchingVoice = languageVoices.find(
          (voice) => {
            const voiceName = voice.name.toLowerCase();
            return youngMaleNames.some(name => voiceName.includes(name));
          }
        );
      }
      
      // Fallback: usar primeira voz do idioma ou primeira voz disponível
      if (!matchingVoice) {
        matchingVoice = languageVoices[0] || availableVoices[0];
      }
      
      if (matchingVoice && !selectedVoice) {
        setSelectedVoice(matchingVoice);
      }
    };

    loadVoices();
    
    // Voices are loaded asynchronously in some browsers
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSupported, language, selectedVoice]);

  // Função para remover emojis e caracteres especiais do texto para áudio
  const cleanTextForSpeech = (text: string): string => {
    // Remover emojis (Unicode ranges para emojis)
    let cleaned = text.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Misc Symbols and Pictographs
    cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport and Map
    cleaned = cleaned.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Flags
    cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, ''); // Misc symbols
    cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, ''); // Dingbats
    cleaned = cleaned.replace(/[\u{FE00}-\u{FE0F}]/gu, ''); // Variation Selectors
    cleaned = cleaned.replace(/[\u{1F900}-\u{1F9FF}]/gu, ''); // Supplemental Symbols and Pictographs
    cleaned = cleaned.replace(/[\u{1FA00}-\u{1FAFF}]/gu, ''); // Chess Symbols
    cleaned = cleaned.replace(/[\u{1FAB0}-\u{1FAFF}]/gu, ''); // Extended Symbols
    
    // Remover outros caracteres especiais que não devem ser lidos
    cleaned = cleaned.replace(/[🎉🎊🎈🎁🎂🎃🎄🎅🎆🎇✨🌟💫⭐]/g, ''); // Emojis específicos comuns
    cleaned = cleaned.replace(/[🔥💯👍👎👏🙌👋🤝✊👊]/g, ''); // Gestos
    cleaned = cleaned.replace(/[❤️💛💚💙💜🖤🤍🤎💔💕💖💗💘💝]/g, ''); // Corações
    
    // Remover múltiplos espaços e limpar
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remover pontuação excessiva (manter apenas uma vírgula ou ponto seguido)
    cleaned = cleaned.replace(/[,]{2,}/g, ',');
    cleaned = cleaned.replace(/[.]{3,}/g, '...');
    
    return cleaned;
  };

  const speak = useCallback((text: string, emotion: string = defaultEmotion) => {
    if (!isSupported || !text.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Limpar texto: remover emojis e caracteres especiais antes de converter para áudio
    const cleanedText = cleanTextForSpeech(text);
    
    // Se após limpar não houver texto, não falar
    if (!cleanedText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Mapear idiomas para códigos de idioma do navegador
    const langMap: Record<string, string> = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      zh: "zh-CN",
      ar: "ar-SA",
    };
    
    // Ajustar parâmetros de voz conforme a emoção (voz de menino com emoções)
    const emotionSettings: Record<string, { rate: number; pitch: number; volume: number }> = {
      excited: { rate: 1.15, pitch: 1.15, volume: 1.0 }, // Rápido e agudo - empolgado
      happy: { rate: 1.1, pitch: 1.1, volume: 1.0 }, // Alegre e animado
      laugh: { rate: 1.2, pitch: 1.2, volume: 1.0 }, // Muito rápido e agudo - riso
      surprise: { rate: 1.15, pitch: 1.2, volume: 1.0 }, // Rápido e muito agudo - surpresa
      sad: { rate: 0.9, pitch: 0.85, volume: 0.9 }, // Lento e grave - triste
      mad: { rate: 1.0, pitch: 0.9, volume: 1.0 }, // Normal mas grave - bravo
      sleepy: { rate: 0.85, pitch: 0.9, volume: 0.85 }, // Muito lento e suave - sonolento
    };
    
    const settings = emotionSettings[emotion.toLowerCase()] || emotionSettings["excited"];
    
    utterance.rate = settings.rate; // Velocidade ajustada pela emoção
    utterance.pitch = settings.pitch; // Pitch ajustado pela emoção (mais agudo = menino)
    utterance.volume = settings.volume; // Volume ajustado pela emoção
    utterance.lang = langMap[language] || language;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, language, defaultEmotion]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    setVoice,
  };
}
