import { useState, useEffect, useCallback, useRef } from "react";

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
  maxAlternatives?: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
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

export function useSpeechRecognition(language: string = "pt"): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef("");

  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Initialize recognition instance - only runs once on mount (if supported)
  useEffect(() => {
    if (!isSupported) return;

    const win = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "pt-BR"; // Default, will be updated by language effect
    recognition.maxAlternatives = 1; // Usar apenas a melhor alternativa para melhor precisão

    recognition.onresult = (event) => {
      let currentInterim = "";
      let finalText = "";

      // Processar todos os resultados
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || "";
        
        if (result.isFinal) {
          // Resultado final - adicionar ao transcript final
          finalText += transcript + " ";
        } else {
          // Resultado intermediário - mostrar em tempo real
          currentInterim += transcript;
        }
      }

      // Atualizar o transcript final acumulado
      if (finalText) {
        finalTranscriptRef.current += finalText;
      }

      // Combinar transcript final com resultado intermediário atual
      const combinedTranscript = (finalTranscriptRef.current + currentInterim).trim();
      setTranscript(combinedTranscript);
    };

    recognition.onerror = (event) => {
      console.log("[SpeechRecognition] Error:", event.error);
      
      // Tratamento específico para diferentes tipos de erro
      switch (event.error) {
        case "no-speech":
          // Não há fala detectada - não é um erro crítico
          console.log("[SpeechRecognition] No speech detected");
          break;
        case "aborted":
          // Reconhecimento foi abortado manualmente - não é um erro
          console.log("[SpeechRecognition] Recognition aborted");
          break;
        case "audio-capture":
          // Não foi possível capturar áudio
          setError("Microfone não encontrado ou sem permissão");
          setIsListening(false);
          break;
        case "network":
          // Erro de rede
          setError("Erro de conexão. Verifique sua internet.");
          setIsListening(false);
          break;
        case "not-allowed":
          // Permissão negada
          setError("Permissão de microfone negada");
          setIsListening(false);
          break;
        case "service-not-allowed":
          // Serviço não permitido
          setError("Serviço de reconhecimento não disponível");
          setIsListening(false);
          break;
        default:
          // Outros erros
          if (event.error !== "no-speech" && event.error !== "aborted") {
            setError(event.error);
            setIsListening(false);
          }
      }
    };

    recognition.onend = () => {
      console.log("[SpeechRecognition] Recognition ended");
      setIsListening(false);
    };

    recognition.onstart = () => {
      console.log("[SpeechRecognition] Recognition started");
      setError(null);
    };

    recognition.onspeechend = () => {
      console.log("[SpeechRecognition] Speech ended");
      // Não parar automaticamente - deixar o usuário controlar
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported]); // Removed language dependency to prevent recreation

  // Update language dynamically without recreating the instance
  useEffect(() => {
    if (recognitionRef.current) {
      const langMap: Record<string, string> = {
        "pt": "pt-BR",
        "en": "en-US",
        "es": "es-ES",
        "fr": "fr-FR",
        "de": "de-DE",
        "ar": "ar-SA",
        "zh": "zh-CN",
      };
      recognitionRef.current.lang = langMap[language] || language || "pt-BR";
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setError(null);
    setTranscript("");
    finalTranscriptRef.current = "";
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      // Ignore error if already started
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

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

