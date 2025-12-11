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
  
  // Carregar voz selecionada do localStorage se disponível
  const [selectedVoice, setSelectedVoiceState] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Função helper para verificar se é voz da Microsoft - DEFINIR FORA DO useEffect PARA REUTILIZAÇÃO
  function isMicrosoftVoice(voiceName: string): boolean {
    const lowerName = voiceName.toLowerCase();
    return lowerName.includes("microsoft") ||
           lowerName.includes("zira") ||
           lowerName.includes("mark") ||
           lowerName.includes("helen") ||
           lowerName.includes("hazel") ||
           lowerName.includes("david") ||
           lowerName.includes("steffan") ||
           lowerName.includes("sapi") ||
           lowerName.startsWith("ms-");
  }

  // Função helper para verificar se uma voz é REALMENTE árabe (baseado em voice.lang)
  function isArabicVoice(voice: SpeechSynthesisVoice | null): boolean {
    if (!voice || !voice.lang) return false;
    return voice.lang.toLowerCase().startsWith("ar");
  }

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Mapear idiomas para códigos de idioma do navegador
      // Garantir que cada idioma tenha uma voz configurada
      const langMap: Record<string, string[]> = {
        pt: ["pt-BR", "pt-PT"], // Português: Brasil e Portugal
        en: ["en-US", "en-GB", "en-AU"], // Inglês: US, UK, Australia
        es: ["es-ES", "es-US", "es-MX"], // Espanhol: Espanha, US, México
        fr: ["fr-FR", "fr-CA"], // Francês: França, Canadá
        de: ["de-DE"], // Alemão: Alemanha
        zh: ["zh-CN", "zh-TW", "zh-HK"], // Chinês: China, Taiwan, Hong Kong
        ar: ["ar-SA", "ar-XA", "ar-AE"], // Árabe: Arábia Saudita, região árabe
      };
      
      const targetLangs = langMap[language] || [language];
      const targetLang = targetLangs[0]; // Usar primeiro como padrão
      const langPrefix = language.substring(0, 2);
      
      // Nomes específicos de vozes masculinas do Google TTS por idioma
      // Baseado nos nomes reais das vozes do Google Cloud TTS
      const googleMaleVoiceNames: Record<string, string[]> = {
        "pt": [
          "pt-br-standaard-", "pt-br-neural-", "pt-br-wavenet-", "pt-br-standard-",
          "pt-pt-standaard-", "pt-pt-neural-", "pt-pt-wavenet-", "pt-pt-standard-",
          "português", "brazil", "portugal", "portuguese portugal", "portuguese brazil"
        ],
        "en": [
          "en-us-", "en-gb-", "en-au-", "en-in-",
          "neural-", "wavenet-", "standard-",
          "us english", "uk english", "australian english"
        ],
        "es": [
          "es-es-", "es-us-", "es-mx-",
          "neural-", "wavenet-", "standard-",
          "español", "spanish"
        ],
        "fr": [
          "fr-fr-", "fr-ca-",
          "neural-", "wavenet-", "standard-",
          "français", "french"
        ],
        "de": [
          "de-de-",
          "neural-", "wavenet-", "standard-",
          "deutsch", "german"
        ],
        "zh": [
          "zh-cn-", "zh-tw-", "zh-hk-",
          "neural-", "wavenet-", "standard-",
          "chinese", "mandarin", "cantonese", "中文"
        ],
        "ar": [
          "ar-xa-", "ar-sa-", "ar-ae-",
          "neural-", "wavenet-", "standard-",
          "arabic", "العربية", "عربى", "google arabic", "google العربية", "google عربى"
        ],
      };
      
      // Priorizar vozes masculinas jovens e extrovertidas
      // Palavras-chave que indicam vozes masculinas
      const maleKeywords = ["male", "masculine", "man", "homem", "masculino", "männlich", "homme", "masculino"];
      
      // PRIORIZAR VOZES DA GOOGLE (MASCULINAS) PARA TODOS OS IDIOMAS
      const googleKeywords = googleMaleVoiceNames[langPrefix] || [];
      
      // isMicrosoftVoice já está definida no escopo do componente (fora do useEffect)
      
      // Filtrar vozes do idioma correto
      // Para árabe, incluir Microsoft como fallback se necessário
      const languageVoices = availableVoices.filter(
        (voice) => {
          // Para árabe, incluir todas as vozes (incluindo Microsoft) para ter mais opções
          if (langPrefix === "ar") {
            const lowerLang = voice.lang?.toLowerCase() || "";
            const lowerName = voice.name.toLowerCase();
            // Verificar se a voz corresponde a algum dos códigos de idioma mapeados
            const matchesLang = targetLangs.some(lang => 
              voice.lang === lang || 
              (voice.lang && voice.lang.startsWith(lang.substring(0, 2) + "-"))
            ) || 
            (voice.lang && voice.lang.startsWith(langPrefix)) ||
            (voice.lang && lowerLang.includes("ar")) ||
            lowerName.includes("arabic") ||
            voice.name.includes("العربية") ||
            voice.name.includes("عربى");
            
            // Para árabe, incluir todas as vozes que possam funcionar (incluindo Microsoft)
            return matchesLang;
          }
          
          // Para outros idiomas, excluir Microsoft
          if (isMicrosoftVoice(voice.name)) return false;
          
          // Verificar se a voz corresponde a algum dos códigos de idioma mapeados
          return targetLangs.some(lang => 
            voice.lang === lang || 
            (voice.lang && voice.lang.startsWith(lang.substring(0, 2) + "-"))
          ) || (voice.lang && voice.lang.startsWith(langPrefix));
        }
      );
      
      // Função para verificar se é voz masculina
      const isMaleVoice = (voiceName: string): boolean => {
        const lowerName = voiceName.toLowerCase();
        // Verificar explicitamente se NÃO contém palavras femininas
        const isFemale = lowerName.includes("female") || 
                        lowerName.includes("woman") ||
                        lowerName.includes("feminine") ||
                        lowerName.includes("girl") ||
                        lowerName.includes("lady") ||
                        lowerName.includes("women") ||
                        lowerName.includes("fêmea") ||
                        lowerName.includes("fêmea");
        
        if (isFemale) return false;
        
        // Para vozes da Google, geralmente as masculinas têm códigos específicos
        // Por exemplo: pt-BR-Standard-B (B é masculina), en-US-Wavenet-D (D é masculina)
        // Padrões comuns: A, B, D, E são geralmente masculinas, C, F são femininas
        if (lowerName.includes("wavenet") || lowerName.includes("neural") || lowerName.includes("standard")) {
          // Verificar códigos de voz da Google (último caractere)
          const codeMatch = lowerName.match(/([a-z0-9])$/);
          if (codeMatch) {
            const code = codeMatch[1];
            // Códigos masculinos comuns: A, B, D, E
            if (['a', 'b', 'd', 'e'].includes(code)) {
              return true;
            }
            // Códigos femininos: C, F
            if (['c', 'f'].includes(code)) {
              return false;
            }
          }
        }
        
        // Verificar se contém palavras masculinas
        if (maleKeywords.some(keyword => lowerName.includes(keyword))) {
          return true;
        }
        
        // Por padrão, se não for claramente feminina, considerar masculina
        return true;
      };
      
      // Função MELHORADA para verificar se é voz da Google
      // As vozes da Google geralmente têm padrões específicos no nome
      const isGoogleVoice = (voiceName: string, voiceLang: string): boolean => {
        const lowerName = voiceName.toLowerCase();
        const lowerLang = voiceLang.toLowerCase();
        
        // Padrões muito comuns de vozes da Google:
        // - "Google" no início ou no nome
        // - "Wavenet" (vozes premium da Google)
        // - "Neural" (vozes neurais da Google)
        // - "Standard" (vozes padrão da Google)
        // - Códigos de idioma específicos com hífen (pt-BR, en-US, etc.)
        // - Nomes como "pt-BR-Standard-A", "en-US-Wavenet-D", etc.
        
        // Verificação direta no nome
        if (lowerName.includes("google")) return true;
        if (lowerName.includes("wavenet")) return true;
        if (lowerName.includes("neural")) return true;
        
        // Verificar padrões de código de idioma da Google (ex: pt-BR-Standard-A)
        const googleLangPatterns = [
          /^[a-z]{2}-[a-z]{2}-(standard|wavenet|neural)-[a-z]$/i,
          /^[a-z]{2}-[a-z]{2}-(standard|wavenet|neural)-[a-z0-9]+$/i,
        ];
        
        if (googleLangPatterns.some(pattern => pattern.test(voiceName))) {
          return true;
        }
        
        // Verificar se o código de idioma corresponde a algum dos códigos mapeados
        if (lowerLang.match(/^[a-z]{2}-[a-z]{2}$/)) {
          // Verificar se corresponde a algum dos códigos de idioma mapeados para este idioma
          if (targetLangs.some(lang => lowerLang === lang.toLowerCase() || lowerLang.startsWith(lang.substring(0, 2).toLowerCase() + "-"))) {
            return true;
          }
        }
        
        // Verificar palavras-chave específicas por idioma
        if (googleKeywords.some(keyword => lowerName.includes(keyword) || lowerLang.includes(keyword))) {
          return true;
        }
        
        return false;
      };
      
      // LÓGICA SIMPLIFICADA: Priorizar voz masculina do idioma
      // Se não houver masculina, usar primeira disponível
      // Sempre excluir Microsoft, priorizar Google
      
      // Separar vozes por tipo
      // Para árabe, incluir Microsoft nas "otherVoices" como fallback
      const googleVoices = languageVoices.filter(v => isGoogleVoice(v.name, v.lang));
      const otherVoices = languageVoices.filter(v => !isGoogleVoice(v.name, v.lang));
      
      // Priorizar variantes específicas por idioma
      // Para português: pt-PT primeiro, depois pt-BR
      // Para outros idiomas: manter ordem natural, mas garantir que haja vozes
      const prioritizeVoices = (voices: SpeechSynthesisVoice[]) => {
        if (langPrefix === "pt") {
          // Português: pt-PT primeiro, depois pt-BR
          const ptPT = voices.filter(v => v.lang.toLowerCase().includes("pt-pt"));
          const ptBR = voices.filter(v => v.lang.toLowerCase().includes("pt-br"));
          return [...ptPT, ...ptBR];
        } else if (langPrefix === "en") {
          // Inglês: priorizar en-US, depois en-GB, depois outras
          const enUS = voices.filter(v => v.lang.toLowerCase().startsWith("en-us"));
          const enGB = voices.filter(v => v.lang.toLowerCase().startsWith("en-gb"));
          const otherEN = voices.filter(v => v.lang.toLowerCase().startsWith("en-") && 
                                            !v.lang.toLowerCase().startsWith("en-us") && 
                                            !v.lang.toLowerCase().startsWith("en-gb"));
          return [...enUS, ...enGB, ...otherEN];
        } else if (langPrefix === "es") {
          // Espanhol: priorizar es-ES, depois es-US, depois outras
          const esES = voices.filter(v => v.lang.toLowerCase().startsWith("es-es"));
          const esUS = voices.filter(v => v.lang.toLowerCase().startsWith("es-us"));
          const otherES = voices.filter(v => v.lang.toLowerCase().startsWith("es-") && 
                                            !v.lang.toLowerCase().startsWith("es-es") && 
                                            !v.lang.toLowerCase().startsWith("es-us"));
          return [...esES, ...esUS, ...otherES];
        } else if (langPrefix === "fr") {
          // Francês: priorizar fr-FR, depois fr-CA
          const frFR = voices.filter(v => v.lang.toLowerCase().startsWith("fr-fr"));
          const frCA = voices.filter(v => v.lang.toLowerCase().startsWith("fr-ca"));
          return [...frFR, ...frCA];
        } else if (langPrefix === "zh") {
          // Chinês: priorizar zh-CN, depois zh-TW, depois zh-HK
          const zhCN = voices.filter(v => v.lang.toLowerCase().startsWith("zh-cn"));
          const zhTW = voices.filter(v => v.lang.toLowerCase().startsWith("zh-tw"));
          const zhHK = voices.filter(v => v.lang.toLowerCase().startsWith("zh-hk"));
          return [...zhCN, ...zhTW, ...zhHK];
        } else if (langPrefix === "ar") {
          // Árabe: priorizar ar-SA, depois ar-XA, depois ar-AE
          const arSA = voices.filter(v => v.lang.toLowerCase().startsWith("ar-sa"));
          const arXA = voices.filter(v => v.lang.toLowerCase().startsWith("ar-xa"));
          const arAE = voices.filter(v => v.lang.toLowerCase().startsWith("ar-ae"));
          return [...arSA, ...arXA, ...arAE];
        }
        // Para outros idiomas, retornar como estão
        return voices;
      };
      
      // 1. PRIORIDADE: Vozes Google masculinas do idioma
      const googleMale = prioritizeVoices(googleVoices.filter(v => isMaleVoice(v.name.toLowerCase())));
      let matchingVoice = googleMale[0];
      
      // 2. Se não houver Google masculina, usar primeira Google disponível (feminina ou outra)
      if (!matchingVoice) {
        matchingVoice = prioritizeVoices(googleVoices)[0];
      }
      
      // 3. Se não houver Google, usar primeira voz masculina de outras fontes
      // Para árabe, incluir Microsoft aqui como opção válida
      if (!matchingVoice) {
        matchingVoice = prioritizeVoices(otherVoices.filter(v => isMaleVoice(v.name.toLowerCase())))[0];
      }
      
      // 4. Fallback: Primeira voz disponível (qualquer gênero)
      // Para árabe, NÃO usar fallback não-árabe - deixar matchingVoice como null
      // Para outros idiomas, excluir Microsoft
      if (!matchingVoice) {
        if (langPrefix === "ar") {
          // Para árabe, não usar fallback não-árabe
          // matchingVoice permanece null - será tratado depois
          console.log(`[Miao Voice] Arabic: No Arabic voice found in initial search, will try final fallback`);
        } else {
          // Para outros idiomas, excluir Microsoft
          matchingVoice = prioritizeVoices(languageVoices.filter(v => !isMicrosoftVoice(v.name)))[0];
        }
      }
      
      // 5. Para árabe, se ainda não encontrou, tentar uma última vez com busca REAL
      // Verificar voice.lang começando com "ar" (verificação real)
      if (!matchingVoice && language === "ar" && availableVoices.length > 0) {
        // PRIMEIRO: Buscar voz árabe REAL (voice.lang começa com "ar")
        matchingVoice = availableVoices.find(v => isArabicVoice(v));
        
        if (matchingVoice) {
          console.log(`[Miao Voice] ✅ Arabic: Found REAL Arabic voice: ${matchingVoice.name} (${matchingVoice.lang})`);
        } else {
          // Último recurso: Microsoft (pode ter suporte para árabe)
          matchingVoice = availableVoices.find(v => isMicrosoftVoice(v.name));
          if (matchingVoice) {
            console.warn(`[Miao Voice] ⚠️ Arabic: No REAL Arabic voice found (voice.lang doesn't start with 'ar'), using Microsoft as fallback: ${matchingVoice.name} (${matchingVoice.lang || 'default'})`);
            console.warn(`[Miao Voice] ⚠️ This is NOT a real Arabic voice - it may not sound correct in Arabic.`);
          } else {
            console.warn(`[Miao Voice] ❌ Arabic: No Arabic or Microsoft voice found. Will use system default with utterance.lang=ar-SA`);
          }
        }
      }
      
      // Sempre usar a voz encontrada automaticamente (sem localStorage)
      // Prioridade: Google masculina > Google qualquer > Outras masculinas > Primeira disponível > Qualquer (para árabe)
      // IMPORTANTE: Sempre atualizar a voz quando encontrar uma correspondente ao idioma
      if (availableVoices.length > 0 && matchingVoice) {
        // Verificar se a voz atual corresponde ao idioma correto
        const currentVoiceLang = selectedVoice?.lang?.substring(0, 2) || '';
        const targetLangPrefix = language.substring(0, 2);
        
        // Para árabe, verificar se é voz árabe REAL (voice.lang começa com "ar") OU Microsoft (fallback)
        const isCurrentVoiceArabic = language === "ar" && selectedVoice && (
          isArabicVoice(selectedVoice) || // Voz árabe REAL
          isMicrosoftVoice(selectedVoice.name) // Microsoft fallback
        );
        
        const isMatchingVoiceArabic = language === "ar" && (
          isArabicVoice(matchingVoice) || // Voz árabe REAL
          isMicrosoftVoice(matchingVoice.name) // Microsoft fallback
        );
        
        // Sempre atualizar se não há voz selecionada OU se a voz não corresponde ao idioma
        // Para árabe, atualizar se a voz atual não for árabe/Microsoft ou se encontrou uma voz árabe REAL melhor
        const shouldUpdate = !selectedVoice || 
                           (language === "ar" ? (
                             !isCurrentVoiceArabic || 
                             (isArabicVoice(matchingVoice) && !isArabicVoice(selectedVoice)) // Atualizar se encontrou voz árabe REAL e atual não é
                           ) : currentVoiceLang !== targetLangPrefix);
        
        if (shouldUpdate) {
          console.log(`[Miao Voice] Language: ${language}, Selected voice: ${matchingVoice.name} (${matchingVoice.lang}), Gender: ${isMaleVoice(matchingVoice.name.toLowerCase()) ? 'Male' : 'Other'}, Provider: ${isGoogleVoice(matchingVoice.name, matchingVoice.lang) ? 'Google' : 'Other'}`);
          setSelectedVoiceState(matchingVoice);
        } else {
          // Se a voz já corresponde, verificar se ainda está disponível
          const stillAvailable = availableVoices.find(v => v.name === selectedVoice.name && v.lang === selectedVoice.lang);
          if (!stillAvailable) {
            console.log(`[Miao Voice] Previous voice no longer available, updating to: ${matchingVoice.name} (${matchingVoice.lang})`);
            setSelectedVoiceState(matchingVoice);
          }
        }
      } else if (!matchingVoice && availableVoices.length > 0) {
        // Para árabe, usar Microsoft como último recurso
        if (language === "ar") {
          // Tentar uma última vez encontrar voz árabe REAL (voice.lang começa com "ar")
          const fallbackVoice = availableVoices.find(v => isArabicVoice(v)) ||
                               availableVoices.find(v => isMicrosoftVoice(v.name)); // Microsoft como último recurso
          if (fallbackVoice) {
            if (isArabicVoice(fallbackVoice)) {
              console.log(`[Miao Voice] ✅ Arabic: Found REAL Arabic voice in final fallback: ${fallbackVoice.name} (${fallbackVoice.lang})`);
            } else if (isMicrosoftVoice(fallbackVoice.name)) {
              console.warn(`[Miao Voice] ⚠️ Arabic: No REAL Arabic voice found, using Microsoft as final fallback: ${fallbackVoice.name} (${fallbackVoice.lang || 'default'})`);
              console.warn(`[Miao Voice] ⚠️ This is NOT a real Arabic voice - it may not sound correct in Arabic.`);
            }
            setSelectedVoiceState(fallbackVoice);
          } else {
            // Não encontrou nem voz árabe nem Microsoft
            // Deixar selectedVoice como null, o sistema usará utterance.lang=ar-SA
            console.warn(`[Miao Voice] ❌ Arabic: No Arabic or Microsoft voice found. Will use system default with utterance.lang=ar-SA. Available voices:`, availableVoices.map(v => `${v.name} (${v.lang})`));
            // Não definir selectedVoice - deixar como null
          }
        } else {
          console.warn(`[Miao Voice] Language: ${language}, No matching voice found. Available voices for ${language}:`, languageVoices.map(v => `${v.name} (${v.lang})`));
        }
      }
    };

    loadVoices();
    
    // Voices are loaded asynchronously in some browsers
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSupported, language]); // Remover selectedVoice das dependências para forçar recarregamento quando idioma mudar

  // Função para remover emojis e caracteres especiais do texto para áudio
  // Melhorada para melhor pronúncia natural - PRESERVAR caracteres árabes e outros scripts
  const cleanTextForSpeech = (text: string): string => {
    // Verificar se o texto contém árabe, chinês, ou outros scripts não latinos
    // Ranges: Árabe (0600-06FF, 0750-077F, 08A0-08FF, FB50-FDFF, FE70-FEFF)
    const hasNonLatinScript = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u4E00-\u9FFF\u3400-\u4DBF]/.test(text);
    
    // Se contém scripts não latinos (árabe, chinês, etc), preservar TODOS os caracteres de texto
    // Apenas remover emojis, mas manter todos os caracteres de texto e pontuação
    if (hasNonLatinScript) {
      let cleaned = text
        // Remover apenas emojis, preservar tudo mais (incluindo pontuação árabe)
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
        .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
        .replace(/[\u{FE00}-\u{FE0F}]/gu, '') // Variation Selectors
        .replace(/[\u{200D}]/gu, '') // Zero Width Joiner
        .replace(/[\u{1F900}-\u{1F9FF}]/gu, ''); // Supplemental Symbols
      
      // Para scripts não latinos, apenas normalizar espaços
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      return cleaned;
    }
    
    // Para texto latino, fazer limpeza mais agressiva
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
    
    // Converter risadas em texto falável para melhor expressividade
    cleaned = cleaned.replace(/\b(haha|hehe|hihi)\b/gi, 'risos');
    cleaned = cleaned.replace(/\b(lol|lmao|rofl)\b/gi, 'muito engraçado');
    
    // Remover múltiplos espaços e limpar
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remover pontuação excessiva (manter apenas uma vírgula ou ponto seguido)
    cleaned = cleaned.replace(/[,]{2,}/g, ',');
    cleaned = cleaned.replace(/[.]{3,}/g, '...');
    
    return cleaned;
  };

  const speak = useCallback((text: string, emotion: string = defaultEmotion) => {
    if (!isSupported || !text.trim()) return;

    // Cancel any ongoing speech - sempre cancelar para garantir que não há conflitos
    // O erro 'interrupted' será tratado no onerror handler
    window.speechSynthesis.cancel();

    // Limpar texto: remover emojis e caracteres especiais antes de converter para áudio
    const cleanedText = cleanTextForSpeech(text);
    
    // Se após limpar não houver texto, não falar
    if (!cleanedText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
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
    
    // Configurar idioma do utterance primeiro
    utterance.lang = langMap[language] || language;
    
    // IMPORTANTE: Verificar se a voz selecionada corresponde ao idioma atual
    // Se não corresponder, encontrar uma nova voz para o idioma correto
    const availableVoicesNow = window.speechSynthesis.getVoices();
    const currentVoiceLangPrefix = selectedVoice?.lang?.substring(0, 2) || '';
    const targetLangPrefix = language.substring(0, 2);
    
    // CRÍTICO: Verificar se a voz corresponde ao idioma ANTES de usar
    // Para árabe, aceitar voz árabe REAL OU Microsoft como fallback
    const isSelectedVoiceArabic = language === "ar" && selectedVoice && isArabicVoice(selectedVoice);
    const isSelectedVoiceMicrosoftFallback = language === "ar" && selectedVoice && isMicrosoftVoice(selectedVoice.name);
    const voiceMatchesLanguage = selectedVoice && (
      currentVoiceLangPrefix === targetLangPrefix || 
      isSelectedVoiceArabic || 
      isSelectedVoiceMicrosoftFallback
    );
    let voiceToUse: SpeechSynthesisVoice | null = null;
    
    // Tentar usar voz selecionada apenas se corresponder ao idioma
    if (voiceMatchesLanguage) {
      const voiceStillAvailable = availableVoicesNow.find(v => v.name === selectedVoice!.name && v.lang === selectedVoice!.lang);
      if (voiceStillAvailable) {
        voiceToUse = voiceStillAvailable;
        // Para árabe, usar lang da voz se for árabe real, senão manter ar-SA
        if (language === "ar") {
          if (isArabicVoice(voiceStillAvailable)) {
            utterance.lang = voiceStillAvailable.lang;
          } else {
            utterance.lang = langMap[language] || language; // Manter ar-SA para Microsoft fallback
          }
        } else if (voiceStillAvailable.lang && voiceStillAvailable.lang.substring(0, 2) === targetLangPrefix) {
          utterance.lang = voiceStillAvailable.lang;
        }
        const voiceType = isSelectedVoiceArabic ? "✅ REAL Arabic" : (isSelectedVoiceMicrosoftFallback ? "⚠️ Microsoft fallback" : "✅ Correct language");
        console.log(`[Miao Voice] Using selected voice: ${voiceToUse.name} (${voiceToUse.lang}) for language: ${language}, utterance.lang=${utterance.lang}, Type: ${voiceType}`);
      } else {
        console.warn(`[Miao Voice] Selected voice no longer available: ${selectedVoice.name} (${selectedVoice.lang})`);
      }
    } else if (selectedVoice) {
      console.warn(`[Miao Voice] CRITICAL: Selected voice (${selectedVoice.name}, ${selectedVoice.lang}) doesn't match language (${language}). Ignoring and finding new voice...`);
    }
    
    // Se não há voz válida, buscar nova voz
    if (!voiceToUse) {
      // Não há voz selecionada OU a voz não corresponde ao idioma atual
      if (selectedVoice && currentVoiceLangPrefix !== targetLangPrefix) {
        console.warn(`[Miao Voice] Selected voice language (${currentVoiceLangPrefix}) doesn't match current language (${targetLangPrefix}). Finding new voice for ${language}...`);
      } else {
        console.warn(`[Miao Voice] No voice selected for language: ${language}, finding voice with lang: ${utterance.lang}`);
      }
      
      // Tentar encontrar uma voz do idioma desejado (CRÍTICO para árabe)
      
      // Para árabe, buscar vozes que REALMENTE têm voice.lang começando com "ar"
      if (language === "ar") {
        // 1. PRIMEIRO: Tentar encontrar voz com voice.lang começando com "ar" (verificação real)
        let defaultVoice = availableVoicesNow.find(v => isArabicVoice(v));
        
        if (defaultVoice) {
          voiceToUse = defaultVoice;
          utterance.lang = defaultVoice.lang; // Usar o lang real da voz árabe
          console.log(`[Miao Voice] ✅ Found REAL Arabic voice: ${defaultVoice.name} (${defaultVoice.lang}), Utterance lang: ${utterance.lang}`);
        } else {
          // Não encontrou voz árabe REAL - usar Microsoft como último recurso
          const microsoftVoice = availableVoicesNow.find(v => isMicrosoftVoice(v.name));
          if (microsoftVoice) {
            voiceToUse = microsoftVoice;
            // Manter utterance.lang como ar-SA para o navegador tentar usar a melhor voz
            utterance.lang = langMap[language] || language;
            console.warn(`[Miao Voice] ⚠️ No REAL Arabic voice found (voice.lang doesn't start with 'ar'). Using Microsoft as fallback: ${microsoftVoice.name} (${microsoftVoice.lang}), utterance.lang=${utterance.lang}`);
            console.warn(`[Miao Voice] ⚠️ This is NOT a real Arabic voice - it will try to speak Arabic but may not sound correct.`);
          } else {
            // Se nem Microsoft tiver, deixar voiceToUse como null
            utterance.lang = langMap[language] || language;
            console.warn(`[Miao Voice] ❌ No Arabic or Microsoft voice found. Available voices:`, availableVoicesNow.map(v => `${v.name} (${v.lang})`));
            console.warn(`[Miao Voice] Using system default with utterance.lang=${utterance.lang} - browser will select best available voice for Arabic`);
          }
        }
      } else {
        // Para outros idiomas, manter a lógica anterior (excluir Microsoft)
        const defaultVoice = availableVoicesNow.find(v => 
          v.lang.startsWith(language.substring(0, 2)) && 
          !isMicrosoftVoice(v.name)
        );
        if (defaultVoice) {
          voiceToUse = defaultVoice;
          // Garantir que lang corresponde ao idioma atual
          if (defaultVoice.lang && defaultVoice.lang.substring(0, 2) === targetLangPrefix) {
            utterance.lang = defaultVoice.lang;
          }
          console.log(`[Miao Voice] Found default voice: ${defaultVoice.name} (${defaultVoice.lang}), Utterance lang: ${utterance.lang} (language: ${language})`);
        }
      }
    }
    
    // Atribuir voz ao utterance (se encontrou uma) - SEMPRE verificar que corresponde ao idioma
    if (voiceToUse) {
      // Verificação final de segurança: não usar voz de outro idioma
      const voiceLangPrefix = voiceToUse.lang?.substring(0, 2) || '';
      // Para árabe, verificar se é voz árabe REAL (voice.lang começa com "ar") OU Microsoft (fallback)
      const isRealArabicVoice = isArabicVoice(voiceToUse);
      const isMicrosoftFallback = language === "ar" && isMicrosoftVoice(voiceToUse.name);
      const voiceMatchesLanguage = voiceLangPrefix === targetLangPrefix || 
                                   (language === "ar" && (isRealArabicVoice || isMicrosoftFallback));
      
      if (voiceMatchesLanguage) {
        utterance.voice = voiceToUse;
        // Para árabe, sempre usar o lang da voz se for árabe REAL, senão manter ar-SA
        if (language === "ar") {
          if (isRealArabicVoice && voiceToUse.lang) {
            utterance.lang = voiceToUse.lang; // Usar o lang real da voz árabe
          } else {
            // Manter utterance.lang como ar-SA se a voz não for árabe real (incluindo Microsoft fallback)
            utterance.lang = langMap[language] || language;
          }
        } else if (voiceToUse.lang && voiceToUse.lang.substring(0, 2) === targetLangPrefix) {
          utterance.lang = voiceToUse.lang;
        }
        
        const voiceType = isRealArabicVoice ? "✅ REAL Arabic" : (isMicrosoftFallback ? "⚠️ Microsoft fallback" : "✅ Correct language");
        console.log(`[Miao Voice] Final: Using voice ${voiceToUse.name} (${voiceToUse.lang}) for language ${language}, utterance.lang=${utterance.lang}, Type: ${voiceType}`);
      } else {
        // Rejeitar voz que não corresponde ao idioma
        console.warn(`[Miao Voice] REJECTED: Voice ${voiceToUse.name} (${voiceToUse.lang}) doesn't match language ${language}. Not assigning voice, using utterance.lang=${utterance.lang} - browser will select best voice`);
        // Não atribuir a voz - deixar o navegador escolher baseado em utterance.lang
        utterance.lang = langMap[language] || language;
        // Limpar voiceToUse para não atribuir
        voiceToUse = null;
      }
    }
    
    // Se não há voz válida (ou foi rejeitada), garantir que utterance.lang está correto
    // e deixar o navegador escolher a melhor voz disponível
    if (!voiceToUse) {
      utterance.lang = langMap[language] || language;
      console.log(`[Miao Voice] No voice assigned, using system default with utterance.lang=${utterance.lang} - browser will select best available voice for ${language}`);
    }
    
    // Ajustar parâmetros de voz conforme a emoção (voz de rapaz extrovertido com emoções)
    // Valores ajustados para soar MUITO mais natural - menos robótico
    // Rate: 0.1 - 10 (1.0 = normal), Pitch: 0 - 2 (1.0 = normal), Volume: 0 - 1
    // IMPORTANTE: Valores próximos de 1.0 soam mais naturais, evitando extremos
    const emotionSettings: Record<string, { rate: number; pitch: number; volume: number }> = {
      excited: { rate: 1.08, pitch: 1.05, volume: 0.95 }, // Levemente rápido e agudo - empolgado mas natural
      happy: { rate: 1.05, pitch: 1.03, volume: 0.95 }, // Alegre e animado, muito próximo do natural
      laugh: { rate: 1.12, pitch: 1.08, volume: 0.95 }, // Rápido e agudo - riso natural (valores moderados)
      surprise: { rate: 1.1, pitch: 1.1, volume: 0.95 }, // Levemente rápido e agudo - surpresa natural
      sad: { rate: 0.92, pitch: 0.92, volume: 0.9 }, // Levemente lento e grave - triste mas natural
      mad: { rate: 1.02, pitch: 0.95, volume: 0.95 }, // Quase normal, um pouco grave - bravo mas natural
      sleepy: { rate: 0.88, pitch: 0.95, volume: 0.85 }, // Lento e suave - sonolento mas muito natural
    };
    
    const settings = emotionSettings[emotion.toLowerCase()] || emotionSettings["excited"];
    
    // Valores MUITO próximos de 1.0 para máxima naturalidade (menos robótico possível)
    // Limites mais restritos para evitar som robótico
    utterance.rate = Math.max(0.8, Math.min(1.2, settings.rate)); // Limitar entre 0.8-1.2 (mais natural)
    utterance.pitch = Math.max(0.85, Math.min(1.15, settings.pitch)); // Limitar entre 0.85-1.15 (mais natural)
    utterance.volume = Math.max(0.8, Math.min(1.0, settings.volume)); // Volume suave mas audível
    // NÃO redefinir utterance.lang aqui - já foi configurado acima

    // PROTEÇÃO: Verificar se há voz árabe REAL antes de falar em árabe
    if (language === "ar") {
      const finalVoice = utterance.voice || voiceToUse;
      const isRealArabicVoice = isArabicVoice(finalVoice);
      
      if (!isRealArabicVoice) {
        console.warn(`[Miao Voice] ⚠️ AVISO: Não há voz árabe REAL disponível (voice.lang não começa com 'ar').`);
        console.warn(`[Miao Voice] ⚠️ Voz que será usada: ${finalVoice?.name || 'none'} (${finalVoice?.lang || 'none'})`);
        console.warn(`[Miao Voice] ⚠️ utterance.lang=${utterance.lang} - O navegador tentará usar a melhor voz disponível, mas pode não soar correto em árabe.`);
        console.warn(`[Miao Voice] 💡 Para ter voz árabe real, instale o idioma árabe no Windows: Definições → Hora e idioma → Idioma & região → Adicionar idioma → Arabic`);
      }
    }

    // Event handlers para melhor controle da qualidade de voz
    utterance.onstart = () => {
      setIsSpeaking(true);
      // Log detalhado para debug - especialmente para árabe
      if (language === "ar") {
        const finalVoice = utterance.voice;
        const isRealArabicVoice = isArabicVoice(finalVoice);
        console.log(`[Miao Voice] STARTED speaking in Arabic:`, {
          voice: finalVoice?.name || 'none',
          voiceLang: finalVoice?.lang || 'none',
          utteranceLang: utterance.lang,
          isRealArabicVoice: isRealArabicVoice,
          text: cleanedText.substring(0, 50) + '...',
        });
        
        if (!isRealArabicVoice) {
          console.warn(`[Miao Voice] ⚠️ Esta NÃO é uma voz árabe real - pode não soar correto em árabe.`);
        }
      }
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    
    utterance.onerror = (event) => {
      // Ignorar erro 'interrupted' - é esperado quando cancelamos intencionalmente
      // Este erro é completamente normal e não deve ser tratado como erro
      if (event.error === 'interrupted') {
        setIsSpeaking(false);
        utteranceRef.current = null;
        // Silenciar completamente - não propagar o evento
        event.stopPropagation?.();
        event.preventDefault?.();
        return;
      }
      
      const errorInfo = {
        error: event.error,
        type: event.type,
        charIndex: event.charIndex,
        charLength: event.charLength,
        utterance: {
          text: event.utterance?.text?.substring(0, 50) + '...',
          lang: event.utterance?.lang,
          voice: event.utterance?.voice?.name,
        }
      };
      console.error("Speech synthesis error:", errorInfo);
      console.error("Full error event:", event);
      setIsSpeaking(false);
      utteranceRef.current = null;
      
      // Tentar novamente com configurações mais básicas se houver erro
      if (event.error === 'not-allowed' || event.error === 'network') {
        // Não tentar novamente automaticamente para evitar loops
        console.warn("Speech synthesis not allowed or network error - skipping retry");
        return;
      }
      
      // Log adicional para debugging
      if (event.error === 'synthesis-failed' || event.error === 'synthesis-unavailable') {
        console.warn("Speech synthesis failed - voice may not be available for this language or text");
        console.warn("Available voices:", window.speechSynthesis.getVoices().map(v => `${v.name} (${v.lang})`));
      }
    };
    
    utterance.onpause = () => {
      // Garantir que continue naturalmente
    };
    
    utterance.onresume = () => {
      // Retomar de forma natural
    };

    utteranceRef.current = utterance;
    
    // Delay maior para garantir que a síntese esteja completamente pronta
    // Isso ajuda a evitar cortes e melhora a qualidade da voz (menos robótica)
    // Também garante que a voz selecionada esteja totalmente carregada
    setTimeout(() => {
      try {
        // Garantir que não há outras sínteses em andamento que possam interferir
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          // Pequeno delay adicional após cancelar
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 100);
        } else {
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error("Error starting speech synthesis:", error);
        setIsSpeaking(false);
      }
    }, 150);
  }, [isSupported, selectedVoice, language, defaultEmotion]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    // Não salvar no localStorage - sempre usar seleção automática
    setSelectedVoiceState(voice);
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
