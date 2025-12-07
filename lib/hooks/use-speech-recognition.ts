import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Speech Recognition Hook - Web Speech API Integration
 * 
 * This hook provides real-time speech-to-text transcription using the browser's
 * native Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 * 
 * Provider: Browser-native (Google Cloud Speech-to-Text backend in Chrome)
 * Cost: 100% FREE (no API keys required)
 * 
 * Browser Compatibility:
 * - Chrome/Edge: Full support (uses Google Cloud Speech-to-Text)
 * - Safari: Partial support (webkitSpeechRecognition)
 * - Firefox: Not supported (no Web Speech API)
 * 
 * Limitations:
 * - Requires internet connection (audio sent to cloud for processing)
 * - Language must be set per session
 * - No offline mode available
 */

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

/**
 * Speech Recognition Hook using Web Speech API
 * 
 * Features:
 * - Real-time transcription with interim results
 * - Continuous listening mode
 * - Multi-language support (7 languages)
 * - Graceful error handling
 * 
 * @param language - Language code (pt, en, es, fr, de, ar, zh)
 * @returns Speech recognition state and controls
 */
export function useSpeechRecognition(language: string = "pt"): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");

  // Check browser support for Web Speech API
  // Supports both standard (Chrome) and webkit (Safari) implementations
  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    // Initialize Speech Recognition API
    // Use standard API (Chrome) or webkit prefix (Safari)
    const win = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    // Configuration matching documentation:
    // - continuous: true - Keep listening until manually stopped
    // - interimResults: true - Show partial results as user speaks
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Map language codes to Web Speech API format
    // Supports all 7 languages from the application
    const langMap: Record<string, string> = {
      "pt": "pt-BR",  // Portuguese (Brazil)
      "en": "en-US",  // English (United States)
      "es": "es-ES",  // Spanish (Spain)
      "fr": "fr-FR",  // French (France)
      "de": "de-DE",  // German (Germany)
      "ar": "ar-SA",  // Arabic (Saudi Arabia)
      "zh": "zh-CN",  // Chinese (Simplified, China)
    };
    recognition.lang = langMap[language] || language || "pt-BR";

    // Event handler: Process speech results
    // Follow exact pattern from documentation:
    // Final results are accumulated in a ref
    // Display combines final + current interim
    recognition.onresult = (event) => {
      let currentInterim = "";

      // Process only NEW results (from resultIndex onwards) to avoid duplication
      // The event.resultIndex tells us where new results start
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          // Final result: Complete phrase recognized (high confidence)
          // Accumulate in ref as per documentation pattern
          finalTranscriptRef.current += result[0].transcript + " ";
        } else {
          // Interim result: Still processing (lower confidence)
          // Add to current interim (temporary, will be replaced on next event)
          currentInterim += result[0].transcript;
        }
      }

      // Display combines final + current interim (exact pattern from documentation)
      setTranscript(finalTranscriptRef.current + currentInterim);
    };

    // Event handler: Handle recognition errors
    recognition.onerror = (event) => {
      // Don't log as error for temporary/normal errors
      // Check error type first before logging
      
      if (event.error === "no-speech") {
        // This is normal - no speech detected yet, continue listening
        // Don't log as error, just continue silently
        return;
      }
      
      if (event.error === "aborted") {
        // Aborted by user or system - normal operation
        // Don't log as error
        return;
      }
      
      if (event.error === "network") {
        // Network errors are temporary, will retry automatically
        console.warn("Network error in speech recognition, will retry...");
        return;
      }
      
      // Only log actual errors (not temporary/normal conditions)
      console.error("Speech recognition error:", event.error);
      
      // Report only important errors with user-friendly messages
      if (event.error === "audio-capture" || event.error === "not-allowed") {
        // Multi-language error messages
        const errorMessages: Record<string, Record<string, string>> = {
          pt: {
            "audio-capture": "Microfone não encontrado. Verifica as permissões do microfone.",
            "not-allowed": "Permissão do microfone negada. Permite o acesso ao microfone nas definições do navegador.",
          },
          en: {
            "audio-capture": "Microphone not found. Please check your microphone permissions.",
            "not-allowed": "Microphone permission denied. Please allow microphone access in your browser settings.",
          },
          es: {
            "audio-capture": "Micrófono no encontrado. Verifica los permisos del micrófono.",
            "not-allowed": "Permiso de micrófono denegado. Permite el acceso al micrófono en la configuración del navegador.",
          },
          fr: {
            "audio-capture": "Microphone introuvable. Vérifie les permissions du microphone.",
            "not-allowed": "Permission du microphone refusée. Autorise l'accès au microphone dans les paramètres du navigateur.",
          },
          de: {
            "audio-capture": "Mikrofon nicht gefunden. Bitte überprüfe die Mikrofonberechtigungen.",
            "not-allowed": "Mikrofonberechtigung verweigert. Erlaube den Mikrofonzugriff in den Browsereinstellungen.",
          },
          ar: {
            "audio-capture": "لم يتم العثور على الميكروفون. يرجى التحقق من أذونات الميكروفون.",
            "not-allowed": "تم رفض إذن الميكروفون. يرجى السماح بالوصول إلى الميكروفون في إعدادات المتصفح.",
          },
          zh: {
            "audio-capture": "未找到麦克风。请检查麦克风权限。",
            "not-allowed": "麦克风权限被拒绝。请在浏览器设置中允许麦克风访问。",
          },
        };
        
        const langMessages = errorMessages[language] || errorMessages["en"];
        setError(langMessages[event.error] || langMessages["audio-capture"]);
        setIsListening(false);
      } else {
        // For other errors, just log but continue trying
        console.warn("Speech recognition warning:", event.error);
      }
    };

    // Event handler: Recognition ended
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, language]);

  /**
   * Start listening for speech input
   * 
   * Clears previous transcript and starts recognition.
   * Sets up continuous listening mode.
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setError(null);
    setTranscript("");
    finalTranscriptRef.current = "";
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
      console.log("Speech recognition started, language:", recognitionRef.current.lang);
    } catch (err: any) {
      console.error("Failed to start recognition:", err);
      
      // Multi-language error messages
      const errorMessages: Record<string, string> = {
        pt: "Falha ao iniciar o reconhecimento de voz. Tenta novamente.",
        en: "Failed to start speech recognition. Please try again.",
        es: "Error al iniciar el reconocimiento de voz. Inténtalo de nuevo.",
        fr: "Échec du démarrage de la reconnaissance vocale. Réessayez.",
        de: "Spracherkennung konnte nicht gestartet werden. Bitte versuche es erneut.",
        ar: "فشل في بدء التعرف على الصوت. يرجى المحاولة مرة أخرى.",
        zh: "启动语音识别失败。请重试。",
      };
      
      setError(errorMessages[language] || errorMessages["en"]);
      setIsListening(false);
    }
  }, [language]);

  /**
   * Stop listening for speech input
   * 
   * Gracefully stops recognition and updates state.
   */
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  /**
   * Reset transcript to empty
   * 
   * Clears both final and interim transcripts.
   */
  const resetTranscript = useCallback(() => {
    setTranscript("");
    finalTranscriptRef.current = "";
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
}

// TypeScript declarations for Web Speech API
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: SpeechRecognitionConstructor;
  webkitSpeechRecognition: SpeechRecognitionConstructor;
}
