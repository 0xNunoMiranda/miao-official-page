export type Language = "pt" | "en" | "es" | "fr" | "de" | "zh" | "ar"

export const languages: { code: Language; name: string; flag: string; dir?: "rtl" | "ltr" }[] = [
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
]

export const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Nav
    "nav.home": "Início",
    "nav.tokenomics": "Tokenomics",
    "nav.community": "Comunidade",
    "nav.miaoAi": "Miao AI",
    "nav.nfts": "NFT's",
    "nav.menu": "Menu",
    "nav.christmasMode": "Modo Natal",

    // Header
    "header.connect": "Conectar",
    "header.connectWallet": "Conectar Carteira",
    "header.connected": "Conectado",
    "header.disconnect": "Desconectar",
    "header.buy": "Comprar $MIAO",

    // Hero
    "hero.tagline1": "Primeiro vieram os cães, depois os sapos...",
    "hero.tagline2": "Agora, as sombras pertencem ao",
    "hero.dexscreen": "Dexscreen",
    "hero.liveCharts": "Live Charts",
    "hero.view": "VER",
    "hero.pumpfun": "PumpFun",
    "hero.fairLaunch": "Fair Launch",
    "hero.apeIn": "APE IN",
    "hero.tools": "MIAO Tools",
    "hero.utilities": "Utilitários",
    "hero.open": "ABRIR",
    "hero.games": "MIAO Games",
    "hero.playEarn": "Jogar & Ganhar",
    "hero.play": "JOGAR",

    // About
    "about.text":
      "Quando os cães ladravam e os sapos saltavam, todos pensavam que as guerras dos memes tinham acabado. Mas nas sombras, algo paciente espreitava. Atrás de cada latido ou coaxar vinha um afiado e perspicaz",
    "about.text2": "que ninguém conseguia ignorar. As ruas não são seguras",

    // Tokenomics
    "tokenomics.title": "Tokenomics",
    "tokenomics.totalSupply": "Fornecimento Total",
    "tokenomics.liquidity": "Liquidez",
    "tokenomics.locked": "Bloqueada",
    "tokenomics.tax": "Taxa",
    "tokenomics.noTax": "Sem Taxas",
    "tokenomics.community": "Comunidade",
    "tokenomics.communityOwned": "100% Comunitário",
    "tokenomics.contractAddress": "Endereço do Contrato",
    "tokenomics.copied": "Copiado!",
    "tokenomics.clickToCopy": "Clique para copiar",

    // Community
    "community.title": "Junte-se à Comunidade",
    "community.subtitle": "Conecte-se com outros holders de MIAO",
    "community.telegram": "Telegram",
    "community.twitter": "Twitter",
    "community.discord": "Discord",

    // Cat Generator
    "generator.title": "Gerador de Gatos IA",
    "generator.subtitle": "Crie o seu próprio gato MIAO único",
    "generator.placeholder": "Descreva o seu gato dos sonhos...",
    "generator.generate": "Gerar Gato",
    "generator.generating": "A gerar...",
    "generator.download": "Descarregar",

    // NFT Section
    "nft.title": "Mint MIAO NFT",
    "nft.description":
      "Nascidos das sombras das guerras dos memes, os NFTs $MIAO incorporam furtividade e energia. Possua um símbolo de poder nas ruas.",
    "nft.mintV1": "MINT V1",
    "nft.mintV2": "MINT V2",

    // Footer
    "footer.disclaimer": "Aviso Legal",
    "footer.disclaimerText":
      "Miao Token é uma meme coin criada puramente para entretenimento e propósitos comunitários. Não representa um contrato de investimento, título ou garantia de lucro. Por favor, invista apenas o que pode perder. Ao participar, reconhece a natureza de alto risco das meme coins, incluindo a potencial perda total do seu investimento.",
    "footer.rights": "Todos os direitos reservados © Miao Token. 2025",
    "footer.sendEmail": "Enviar Email",

    // Wallet Modal
    "wallet.title": "Conectar Carteira",
    "wallet.selectWallet": "Selecione uma carteira Solana",
    "wallet.solanaNote": "O swap usa a rede Solana",
    "wallet.connecting": "A conectar...",
    "wallet.install": "Instalar",
    "wallet.comingSoon": "Em breve",
    "wallet.notSupported": "Solana não suportado",
    "wallet.timeout": "Tempo limite excedido. Verifique se a carteira está aberta.",
    "wallet.error": "Erro ao conectar. Tente novamente.",

    // Swap Modal
    "swap.title": "Swap Tokens",
    "swap.from": "De",
    "swap.to": "Para",
    "swap.balance": "Saldo",
    "swap.max": "MAX",
    "swap.searchToken": "Pesquisar token ou colar endereço",
    "swap.rate": "Taxa",
    "swap.priceImpact": "Impacto no Preço",
    "swap.minReceived": "Mínimo Recebido",
    "swap.connectFirst": "Conecte a carteira primeiro",
    "swap.swapNow": "Trocar Agora",
    "swap.swapping": "A trocar...",

    // Games Page
    "games.title": "MIAO Games",
    "games.subtitle": "Jogue e divirta-se com o MIAO",
    "games.back": "Voltar",
    "games.featured": "Destaque",
    "games.playNow": "Jogar Agora",
    "games.close": "Fechar",
    "games.fullscreen": "Ecrã Inteiro",

    // Tools Page
    "tools.title": "MIAO Tools",
    "tools.subtitle": "Utilitários para a comunidade",
    "tools.back": "Voltar",
    "tools.warningTitle": "Aviso Importante",
    "tools.warningText1": "Esta página apresenta apenas uma pequena ideia do que poderá vir a ser.",
    "tools.warningText2": "Ainda não tem qualquer utilidade e isto será um projeto a ser debatido pela comunidade.",
    "tools.warningText3":
      "Se tiveres ideias, passa pelo chat da comunidade e partilha-as, é esse mesmo o propósito do $MIAO Token.",
    "tools.warningThanks": "Obrigado pela compreensão!",
    "tools.understand": "Compreendo, continuar",
  },

  en: {
    // Nav
    "nav.home": "Home",
    "nav.tokenomics": "Tokenomics",
    "nav.community": "Community",
    "nav.miaoAi": "Miao AI",
    "nav.nfts": "NFT's",
    "nav.menu": "Menu",
    "nav.christmasMode": "Christmas Mode",

    // Header
    "header.connect": "Connect",
    "header.connectWallet": "Connect Wallet",
    "header.connected": "Connected",
    "header.disconnect": "Disconnect",
    "header.buy": "Buy $MIAO",

    // Hero
    "hero.tagline1": "First came the dogs, then the frogs...",
    "hero.tagline2": "Now, the shadows belong to",
    "hero.dexscreen": "Dexscreen",
    "hero.liveCharts": "Live Charts",
    "hero.view": "VIEW",
    "hero.pumpfun": "PumpFun",
    "hero.fairLaunch": "Fair Launch",
    "hero.apeIn": "APE IN",
    "hero.tools": "MIAO Tools",
    "hero.utilities": "Utilities",
    "hero.open": "OPEN",
    "hero.games": "MIAO Games",
    "hero.playEarn": "Play & Earn",
    "hero.play": "PLAY",

    // About
    "about.text":
      "When dogs barked and frogs leapt, everyone thought the meme wars were done. Yet in the shadows, something patient lingered. Behind every bark or croak came a sharp, knowing",
    "about.text2": "that no one could ignore. The streets aren't safe",

    // Tokenomics
    "tokenomics.title": "Tokenomics",
    "tokenomics.totalSupply": "Total Supply",
    "tokenomics.liquidity": "Liquidity",
    "tokenomics.locked": "Locked",
    "tokenomics.tax": "Tax",
    "tokenomics.noTax": "No Tax",
    "tokenomics.community": "Community",
    "tokenomics.communityOwned": "100% Community Owned",
    "tokenomics.contractAddress": "Contract Address",
    "tokenomics.copied": "Copied!",
    "tokenomics.clickToCopy": "Click to copy",

    // Community
    "community.title": "Join the Community",
    "community.subtitle": "Connect with other MIAO holders",
    "community.telegram": "Telegram",
    "community.twitter": "Twitter",
    "community.discord": "Discord",

    // Cat Generator
    "generator.title": "AI Cat Generator",
    "generator.subtitle": "Create your own unique MIAO cat",
    "generator.placeholder": "Describe your dream cat...",
    "generator.generate": "Generate Cat",
    "generator.generating": "Generating...",
    "generator.download": "Download",

    // NFT Section
    "nft.title": "Mint MIAO NFT",
    "nft.description":
      "Born from the shadows of the meme wars, the $MIAO NFTs embody stealth and energy. Own a symbol of power in the streets.",
    "nft.mintV1": "MINT V1",
    "nft.mintV2": "MINT V2",

    // Footer
    "footer.disclaimer": "Disclaimer",
    "footer.disclaimerText":
      "Miao Token is a meme coin created purely for entertainment and community purposes. It does not represent an investment contract, security, or guarantee of profit. Please invest only what you can afford to lose. By participating, you acknowledge the high-risk nature of meme coins, including potential loss of your entire investment.",
    "footer.rights": "All rights reserved © Miao Token. 2025",
    "footer.sendEmail": "Send Email",

    // Wallet Modal
    "wallet.title": "Connect Wallet",
    "wallet.selectWallet": "Select a Solana wallet",
    "wallet.solanaNote": "Swap uses Solana network",
    "wallet.connecting": "Connecting...",
    "wallet.install": "Install",
    "wallet.comingSoon": "Coming soon",
    "wallet.notSupported": "Solana not supported",
    "wallet.timeout": "Connection timed out. Check if wallet is open.",
    "wallet.error": "Connection error. Please try again.",

    // Swap Modal
    "swap.title": "Swap Tokens",
    "swap.from": "From",
    "swap.to": "To",
    "swap.balance": "Balance",
    "swap.max": "MAX",
    "swap.searchToken": "Search token or paste address",
    "swap.rate": "Rate",
    "swap.priceImpact": "Price Impact",
    "swap.minReceived": "Minimum Received",
    "swap.connectFirst": "Connect wallet first",
    "swap.swapNow": "Swap Now",
    "swap.swapping": "Swapping...",

    // Games Page
    "games.title": "MIAO Games",
    "games.subtitle": "Play and have fun with MIAO",
    "games.back": "Back",
    "games.featured": "Featured",
    "games.playNow": "Play Now",
    "games.close": "Close",
    "games.fullscreen": "Fullscreen",

    // Tools Page
    "tools.title": "MIAO Tools",
    "tools.subtitle": "Utilities for the community",
    "tools.back": "Back",
    "tools.warningTitle": "Important Notice",
    "tools.warningText1": "This page only presents a small idea of what it could become.",
    "tools.warningText2": "It has no utility yet and this will be a project to be discussed by the community.",
    "tools.warningText3":
      "If you have ideas, join the community chat and share them, that's the purpose of the $MIAO Token.",
    "tools.warningThanks": "Thank you for understanding!",
    "tools.understand": "I understand, continue",
  },

  es: {
    // Nav
    "nav.home": "Inicio",
    "nav.tokenomics": "Tokenomics",
    "nav.community": "Comunidad",
    "nav.miaoAi": "Miao AI",
    "nav.nfts": "NFT's",
    "nav.menu": "Menú",
    "nav.christmasMode": "Modo Navidad",

    // Header
    "header.connect": "Conectar",
    "header.connectWallet": "Conectar Cartera",
    "header.connected": "Conectado",
    "header.disconnect": "Desconectar",
    "header.buy": "Comprar $MIAO",

    // Hero
    "hero.tagline1": "Primero vinieron los perros, luego las ranas...",
    "hero.tagline2": "Ahora, las sombras pertenecen al",
    "hero.dexscreen": "Dexscreen",
    "hero.liveCharts": "Gráficos en Vivo",
    "hero.view": "VER",
    "hero.pumpfun": "PumpFun",
    "hero.fairLaunch": "Lanzamiento Justo",
    "hero.apeIn": "APE IN",
    "hero.tools": "MIAO Tools",
    "hero.utilities": "Utilidades",
    "hero.open": "ABRIR",
    "hero.games": "MIAO Games",
    "hero.playEarn": "Jugar & Ganar",
    "hero.play": "JUGAR",

    // About
    "about.text":
      "Cuando los perros ladraban y las ranas saltaban, todos pensaban que las guerras de memes habían terminado. Pero en las sombras, algo paciente acechaba. Detrás de cada ladrido o croar venía un agudo y perspicaz",
    "about.text2": "que nadie podía ignorar. Las calles no son seguras",

    // Tokenomics
    "tokenomics.title": "Tokenomics",
    "tokenomics.totalSupply": "Suministro Total",
    "tokenomics.liquidity": "Liquidez",
    "tokenomics.locked": "Bloqueada",
    "tokenomics.tax": "Impuesto",
    "tokenomics.noTax": "Sin Impuestos",
    "tokenomics.community": "Comunidad",
    "tokenomics.communityOwned": "100% Comunitario",
    "tokenomics.contractAddress": "Dirección del Contrato",
    "tokenomics.copied": "¡Copiado!",
    "tokenomics.clickToCopy": "Clic para copiar",

    // Community
    "community.title": "Únete a la Comunidad",
    "community.subtitle": "Conecta con otros holders de MIAO",
    "community.telegram": "Telegram",
    "community.twitter": "Twitter",
    "community.discord": "Discord",

    // Cat Generator
    "generator.title": "Generador de Gatos IA",
    "generator.subtitle": "Crea tu propio gato MIAO único",
    "generator.placeholder": "Describe tu gato soñado...",
    "generator.generate": "Generar Gato",
    "generator.generating": "Generando...",
    "generator.download": "Descargar",

    // NFT Section
    "nft.title": "Mint MIAO NFT",
    "nft.description":
      "Nacidos de las sombras de las guerras de memes, los NFTs $MIAO encarnan sigilo y energía. Posee un símbolo de poder en las calles.",
    "nft.mintV1": "MINT V1",
    "nft.mintV2": "MINT V2",

    // Footer
    "footer.disclaimer": "Descargo de Responsabilidad",
    "footer.disclaimerText":
      "Miao Token es una meme coin creada puramente para entretenimiento y propósitos comunitarios. No representa un contrato de inversión, valor o garantía de ganancias. Por favor, invierte solo lo que puedas perder. Al participar, reconoces la naturaleza de alto riesgo de las meme coins, incluyendo la potencial pérdida total de tu inversión.",
    "footer.rights": "Todos los derechos reservados © Miao Token. 2025",
    "footer.sendEmail": "Enviar Email",

    // Wallet Modal
    "wallet.title": "Conectar Cartera",
    "wallet.selectWallet": "Selecciona una cartera Solana",
    "wallet.solanaNote": "El swap usa la red Solana",
    "wallet.connecting": "Conectando...",
    "wallet.install": "Instalar",
    "wallet.comingSoon": "Próximamente",
    "wallet.notSupported": "Solana no soportado",
    "wallet.timeout": "Tiempo agotado. Verifica si la cartera está abierta.",
    "wallet.error": "Error de conexión. Inténtalo de nuevo.",

    // Swap Modal
    "swap.title": "Intercambiar Tokens",
    "swap.from": "De",
    "swap.to": "A",
    "swap.balance": "Saldo",
    "swap.max": "MAX",
    "swap.searchToken": "Buscar token o pegar dirección",
    "swap.rate": "Tasa",
    "swap.priceImpact": "Impacto en Precio",
    "swap.minReceived": "Mínimo Recibido",
    "swap.connectFirst": "Conecta la cartera primero",
    "swap.swapNow": "Intercambiar Ahora",
    "swap.swapping": "Intercambiando...",

    // Games Page
    "games.title": "MIAO Games",
    "games.subtitle": "Juega y diviértete con MIAO",
    "games.back": "Volver",
    "games.featured": "Destacado",
    "games.playNow": "Jugar Ahora",
    "games.close": "Cerrar",
    "games.fullscreen": "Pantalla Completa",

    // Tools Page
    "tools.title": "MIAO Tools",
    "tools.subtitle": "Utilidades para la comunidad",
    "tools.back": "Volver",
    "tools.warningTitle": "Aviso Importante",
    "tools.warningText1": "Esta página solo presenta una pequeña idea de lo que podría llegar a ser.",
    "tools.warningText2": "Aún no tiene utilidad y este será un proyecto a debatir por la comunidad.",
    "tools.warningText3":
      "Si tienes ideas, pasa por el chat de la comunidad y compártelas, ese es el propósito del $MIAO Token.",
    "tools.warningThanks": "¡Gracias por tu comprensión!",
    "tools.understand": "Entiendo, continuar",
  },

  fr: {
    // Nav
    "nav.home": "Accueil",
    "nav.tokenomics": "Tokenomics",
    "nav.community": "Communauté",
    "nav.miaoAi": "Miao AI",
    "nav.nfts": "NFT's",
    "nav.menu": "Menu",
    "nav.christmasMode": "Mode Noël",

    // Header
    "header.connect": "Connecter",
    "header.connectWallet": "Connecter Portefeuille",
    "header.connected": "Connecté",
    "header.disconnect": "Déconnecter",
    "header.buy": "Acheter $MIAO",

    // Hero
    "hero.tagline1": "D'abord vinrent les chiens, puis les grenouilles...",
    "hero.tagline2": "Maintenant, les ombres appartiennent au",
    "hero.dexscreen": "Dexscreen",
    "hero.liveCharts": "Graphiques en Direct",
    "hero.view": "VOIR",
    "hero.pumpfun": "PumpFun",
    "hero.fairLaunch": "Lancement Équitable",
    "hero.apeIn": "APE IN",
    "hero.tools": "MIAO Tools",
    "hero.utilities": "Utilitaires",
    "hero.open": "OUVRIR",
    "hero.games": "MIAO Games",
    "hero.playEarn": "Jouer & Gagner",
    "hero.play": "JOUER",

    // About
    "about.text":
      "Quand les chiens aboyaient et les grenouilles sautaient, tout le monde pensait que les guerres des mèmes étaient terminées. Mais dans l'ombre, quelque chose de patient guettait. Derrière chaque aboiement ou coassement venait un",
    "about.text2": "tranchant et perspicace que personne ne pouvait ignorer. Les rues ne sont pas sûres",

    // Tokenomics
    "tokenomics.title": "Tokenomics",
    "tokenomics.totalSupply": "Offre Totale",
    "tokenomics.liquidity": "Liquidité",
    "tokenomics.locked": "Verrouillée",
    "tokenomics.tax": "Taxe",
    "tokenomics.noTax": "Sans Taxe",
    "tokenomics.community": "Communauté",
    "tokenomics.communityOwned": "100% Communautaire",
    "tokenomics.contractAddress": "Adresse du Contrat",
    "tokenomics.copied": "Copié!",
    "tokenomics.clickToCopy": "Cliquez pour copier",

    // Community
    "community.title": "Rejoignez la Communauté",
    "community.subtitle": "Connectez-vous avec d'autres détenteurs de MIAO",
    "community.telegram": "Telegram",
    "community.twitter": "Twitter",
    "community.discord": "Discord",

    // Cat Generator
    "generator.title": "Générateur de Chats IA",
    "generator.subtitle": "Créez votre propre chat MIAO unique",
    "generator.placeholder": "Décrivez votre chat de rêve...",
    "generator.generate": "Générer Chat",
    "generator.generating": "Génération...",
    "generator.download": "Télécharger",

    // NFT Section
    "nft.title": "Mint MIAO NFT",
    "nft.description":
      "Nés des ombres des guerres des mèmes, les NFTs $MIAO incarnent furtivité et énergie. Possédez un symbole de pouvoir dans les rues.",
    "nft.mintV1": "MINT V1",
    "nft.mintV2": "MINT V2",

    // Footer
    "footer.disclaimer": "Avertissement",
    "footer.disclaimerText":
      "Miao Token est une meme coin créée uniquement à des fins de divertissement et communautaires. Elle ne représente pas un contrat d'investissement, un titre ou une garantie de profit. Veuillez n'investir que ce que vous pouvez vous permettre de perdre. En participant, vous reconnaissez la nature à haut risque des meme coins, y compris la perte potentielle de tout votre investissement.",
    "footer.rights": "Tous droits réservés © Miao Token. 2025",
    "footer.sendEmail": "Envoyer Email",

    // Wallet Modal
    "wallet.title": "Connecter Portefeuille",
    "wallet.selectWallet": "Sélectionnez un portefeuille Solana",
    "wallet.solanaNote": "Le swap utilise le réseau Solana",
    "wallet.connecting": "Connexion...",
    "wallet.install": "Installer",
    "wallet.comingSoon": "Bientôt",
    "wallet.notSupported": "Solana non supporté",
    "wallet.timeout": "Délai dépassé. Vérifiez si le portefeuille est ouvert.",
    "wallet.error": "Erreur de connexion. Veuillez réessayer.",

    // Swap Modal
    "swap.title": "Échanger Tokens",
    "swap.from": "De",
    "swap.to": "Vers",
    "swap.balance": "Solde",
    "swap.max": "MAX",
    "swap.searchToken": "Rechercher token ou coller adresse",
    "swap.rate": "Taux",
    "swap.priceImpact": "Impact sur le Prix",
    "swap.minReceived": "Minimum Reçu",
    "swap.connectFirst": "Connectez d'abord le portefeuille",
    "swap.swapNow": "Échanger Maintenant",
    "swap.swapping": "Échange en cours...",

    // Games Page
    "games.title": "MIAO Games",
    "games.subtitle": "Jouez et amusez-vous avec MIAO",
    "games.back": "Retour",
    "games.featured": "En Vedette",
    "games.playNow": "Jouer Maintenant",
    "games.close": "Fermer",
    "games.fullscreen": "Plein Écran",

    // Tools Page
    "tools.title": "MIAO Tools",
    "tools.subtitle": "Utilitaires pour la communauté",
    "tools.back": "Retour",
    "tools.warningTitle": "Avis Important",
    "tools.warningText1": "Cette page présente seulement une petite idée de ce qu'elle pourrait devenir.",
    "tools.warningText2": "Elle n'a pas encore d'utilité et ce sera un projet à discuter par la communauté.",
    "tools.warningText3":
      "Si vous avez des idées, passez par le chat communautaire et partagez-les, c'est le but du $MIAO Token.",
    "tools.warningThanks": "Merci de votre compréhension!",
    "tools.understand": "Je comprends, continuer",
  },

  de: {
    // Nav
    "nav.home": "Startseite",
    "nav.tokenomics": "Tokenomics",
    "nav.community": "Gemeinschaft",
    "nav.miaoAi": "Miao AI",
    "nav.nfts": "NFT's",
    "nav.menu": "Menü",
    "nav.christmasMode": "Weihnachtsmodus",

    // Header
    "header.connect": "Verbinden",
    "header.connectWallet": "Wallet Verbinden",
    "header.connected": "Verbunden",
    "header.disconnect": "Trennen",
    "header.buy": "$MIAO Kaufen",

    // Hero
    "hero.tagline1": "Zuerst kamen die Hunde, dann die Frösche...",
    "hero.tagline2": "Jetzt gehören die Schatten dem",
    "hero.dexscreen": "Dexscreen",
    "hero.liveCharts": "Live-Charts",
    "hero.view": "ANSEHEN",
    "hero.pumpfun": "PumpFun",
    "hero.fairLaunch": "Fairer Start",
    "hero.apeIn": "APE IN",
    "hero.tools": "MIAO Tools",
    "hero.utilities": "Werkzeuge",
    "hero.open": "ÖFFNEN",
    "hero.games": "MIAO Games",
    "hero.playEarn": "Spielen & Verdienen",
    "hero.play": "SPIELEN",

    // About
    "about.text":
      "Als die Hunde bellten und die Frösche sprangen, dachten alle, die Meme-Kriege seien vorbei. Doch im Schatten lauerte etwas Geduldiges. Hinter jedem Bellen oder Quaken kam ein scharfes, wissendes",
    "about.text2": "das niemand ignorieren konnte. Die Straßen sind nicht sicher",

    // Tokenomics
    "tokenomics.title": "Tokenomics",
    "tokenomics.totalSupply": "Gesamtangebot",
    "tokenomics.liquidity": "Liquidität",
    "tokenomics.locked": "Gesperrt",
    "tokenomics.tax": "Steuer",
    "tokenomics.noTax": "Keine Steuer",
    "tokenomics.community": "Gemeinschaft",
    "tokenomics.communityOwned": "100% Gemeinschaftseigentum",
    "tokenomics.contractAddress": "Vertragsadresse",
    "tokenomics.copied": "Kopiert!",
    "tokenomics.clickToCopy": "Klicken zum Kopieren",

    // Community
    "community.title": "Tritt der Gemeinschaft bei",
    "community.subtitle": "Verbinde dich mit anderen MIAO-Inhabern",
    "community.telegram": "Telegram",
    "community.twitter": "Twitter",
    "community.discord": "Discord",

    // Cat Generator
    "generator.title": "KI-Katzengenerator",
    "generator.subtitle": "Erstelle deine eigene einzigartige MIAO-Katze",
    "generator.placeholder": "Beschreibe deine Traumkatze...",
    "generator.generate": "Katze Generieren",
    "generator.generating": "Generierung...",
    "generator.download": "Herunterladen",

    // NFT Section
    "nft.title": "Mint MIAO NFT",
    "nft.description":
      "Geboren aus den Schatten der Meme-Kriege, verkörpern die $MIAO NFTs Heimlichkeit und Energie. Besitze ein Symbol der Macht auf den Straßen.",
    "nft.mintV1": "MINT V1",
    "nft.mintV2": "MINT V2",

    // Footer
    "footer.disclaimer": "Haftungsausschluss",
    "footer.disclaimerText":
      "Miao Token ist eine Meme-Coin, die ausschließlich zu Unterhaltungs- und Gemeinschaftszwecken erstellt wurde. Sie stellt keinen Investitionsvertrag, kein Wertpapier oder keine Gewinngarantie dar. Bitte investieren Sie nur, was Sie sich leisten können zu verlieren. Durch Ihre Teilnahme erkennen Sie die risikoreiche Natur von Meme-Coins an, einschließlich des möglichen Verlusts Ihrer gesamten Investition.",
    "footer.rights": "Alle Rechte vorbehalten © Miao Token. 2025",
    "footer.sendEmail": "E-Mail Senden",

    // Wallet Modal
    "wallet.title": "Wallet Verbinden",
    "wallet.selectWallet": "Wähle eine Solana-Wallet",
    "wallet.solanaNote": "Swap nutzt das Solana-Netzwerk",
    "wallet.connecting": "Verbindung...",
    "wallet.install": "Installieren",
    "wallet.comingSoon": "Demnächst",
    "wallet.notSupported": "Solana nicht unterstützt",
    "wallet.timeout": "Zeitüberschreitung. Prüfe ob Wallet geöffnet ist.",
    "wallet.error": "Verbindungsfehler. Bitte erneut versuchen.",

    // Swap Modal
    "swap.title": "Token Tauschen",
    "swap.from": "Von",
    "swap.to": "Zu",
    "swap.balance": "Guthaben",
    "swap.max": "MAX",
    "swap.searchToken": "Token suchen oder Adresse einfügen",
    "swap.rate": "Kurs",
    "swap.priceImpact": "Preisauswirkung",
    "swap.minReceived": "Minimum Erhalten",
    "swap.connectFirst": "Zuerst Wallet verbinden",
    "swap.swapNow": "Jetzt Tauschen",
    "swap.swapping": "Tausche...",

    // Games Page
    "games.title": "MIAO Games",
    "games.subtitle": "Spiele und hab Spaß mit MIAO",
    "games.back": "Zurück",
    "games.featured": "Hervorgehoben",
    "games.playNow": "Jetzt Spielen",
    "games.close": "Schließen",
    "games.fullscreen": "Vollbild",

    // Tools Page
    "tools.title": "MIAO Tools",
    "tools.subtitle": "Werkzeuge für die Gemeinschaft",
    "tools.back": "Zurück",
    "tools.warningTitle": "Wichtiger Hinweis",
    "tools.warningText1": "Diese Seite zeigt nur eine kleine Idee dessen, was sie werden könnte.",
    "tools.warningText2":
      "Sie hat noch keinen Nutzen und dies wird ein Projekt sein, das von der Gemeinschaft diskutiert wird.",
    "tools.warningText3":
      "Wenn du Ideen hast, komm in den Community-Chat und teile sie, das ist der Zweck des $MIAO Tokens.",
    "tools.warningThanks": "Danke für dein Verständnis!",
    "tools.understand": "Ich verstehe, weiter",
  },

  zh: {
    // Nav
    "nav.home": "首页",
    "nav.tokenomics": "代币经济",
    "nav.community": "社区",
    "nav.miaoAi": "Miao AI",
    "nav.nfts": "NFT's",
    "nav.menu": "菜单",
    "nav.christmasMode": "圣诞模式",

    // Header
    "header.connect": "连接",
    "header.connectWallet": "连接钱包",
    "header.connected": "已连接",
    "header.disconnect": "断开连接",
    "header.buy": "购买 $MIAO",

    // Hero
    "hero.tagline1": "先是狗狗，然后是青蛙...",
    "hero.tagline2": "现在，阴影属于",
    "hero.dexscreen": "Dexscreen",
    "hero.liveCharts": "实时图表",
    "hero.view": "查看",
    "hero.pumpfun": "PumpFun",
    "hero.fairLaunch": "公平发行",
    "hero.apeIn": "冲！",
    "hero.tools": "MIAO 工具",
    "hero.utilities": "实用工具",
    "hero.open": "打开",
    "hero.games": "MIAO 游戏",
    "hero.playEarn": "边玩边赚",
    "hero.play": "开玩",

    // About
    "about.text":
      "当狗在叫，青蛙在跳，所有人都以为梗币战争结束了。然而在暗处，有什么东西在耐心等待。每一声吠叫或呱呱声背后，都传来一声尖锐而深知的",
    "about.text2": "没人能忽视。街道不再安全",

    // Tokenomics
    "tokenomics.title": "代币经济",
    "tokenomics.totalSupply": "总供应量",
    "tokenomics.liquidity": "流动性",
    "tokenomics.locked": "已锁定",
    "tokenomics.tax": "税费",
    "tokenomics.noTax": "零税费",
    "tokenomics.community": "社区",
    "tokenomics.communityOwned": "100%社区所有",
    "tokenomics.contractAddress": "合约地址",
    "tokenomics.copied": "已复制！",
    "tokenomics.clickToCopy": "点击复制",

    // Community
    "community.title": "加入社区",
    "community.subtitle": "与其他MIAO持有者联系",
    "community.telegram": "Telegram",
    "community.twitter": "Twitter",
    "community.discord": "Discord",

    // Cat Generator
    "generator.title": "AI猫咪生成器",
    "generator.subtitle": "创建你独特的MIAO猫咪",
    "generator.placeholder": "描述你梦想中的猫咪...",
    "generator.generate": "生成猫咪",
    "generator.generating": "生成中...",
    "generator.download": "下载",

    // NFT Section
    "nft.title": "铸造 MIAO NFT",
    "nft.description": "诞生于梗币战争的阴影中，$MIAO NFT体现了隐秘与能量。拥有街头权力的象征。",
    "nft.mintV1": "铸造 V1",
    "nft.mintV2": "铸造 V2",

    // Footer
    "footer.disclaimer": "免责声明",
    "footer.disclaimerText":
      "Miao Token是一个纯粹为娱乐和社区目的创建的梗币。它不代表投资合同、证券或利润保证。请只投资您能承受损失的金额。参与即表示您承认梗币的高风险性质，包括可能损失全部投资。",
    "footer.rights": "版权所有 © Miao Token. 2025",
    "footer.sendEmail": "发送邮件",

    // Wallet Modal
    "wallet.title": "连接钱包",
    "wallet.selectWallet": "选择Solana钱包",
    "wallet.solanaNote": "交换使用Solana网络",
    "wallet.connecting": "连接中...",
    "wallet.install": "安装",
    "wallet.comingSoon": "即将推出",
    "wallet.notSupported": "不支持Solana",
    "wallet.timeout": "连接超时。请检查钱包是否打开。",
    "wallet.error": "连接错误。请重试。",

    // Swap Modal
    "swap.title": "代币交换",
    "swap.from": "从",
    "swap.to": "到",
    "swap.balance": "余额",
    "swap.max": "最大",
    "swap.searchToken": "搜索代币或粘贴地址",
    "swap.rate": "汇率",
    "swap.priceImpact": "价格影响",
    "swap.minReceived": "最低收到",
    "swap.connectFirst": "请先连接钱包",
    "swap.swapNow": "立即交换",
    "swap.swapping": "交换中...",

    // Games Page
    "games.title": "MIAO 游戏",
    "games.subtitle": "与MIAO一起玩乐",
    "games.back": "返回",
    "games.featured": "精选",
    "games.playNow": "立即游玩",
    "games.close": "关闭",
    "games.fullscreen": "全屏",

    // Tools Page
    "tools.title": "MIAO 工具",
    "tools.subtitle": "社区工具",
    "tools.back": "返回",
    "tools.warningTitle": "重要提示",
    "tools.warningText1": "此页面只展示了它可能成为的一小部分想法。",
    "tools.warningText2": "它目前还没有任何实用功能，这将是一个由社区讨论的项目。",
    "tools.warningText3": "如果你有想法，请加入社区聊天并分享，这就是$MIAO代币的目的。",
    "tools.warningThanks": "感谢理解！",
    "tools.understand": "我明白了，继续",
  },

  ar: {
    // Nav
    "nav.home": "الرئيسية",
    "nav.tokenomics": "اقتصاد الرمز",
    "nav.community": "المجتمع",
    "nav.miaoAi": "Miao AI",
    "nav.nfts": "NFT's",
    "nav.menu": "القائمة",
    "nav.christmasMode": "وضع عيد الميلاد",

    // Header
    "header.connect": "اتصال",
    "header.connectWallet": "ربط المحفظة",
    "header.connected": "متصل",
    "header.disconnect": "قطع الاتصال",
    "header.buy": "شراء $MIAO",

    // Hero
    "hero.tagline1": "أولاً جاءت الكلاب، ثم الضفادع...",
    "hero.tagline2": "الآن، الظلال تنتمي إلى",
    "hero.dexscreen": "Dexscreen",
    "hero.liveCharts": "الرسوم البيانية المباشرة",
    "hero.view": "عرض",
    "hero.pumpfun": "PumpFun",
    "hero.fairLaunch": "إطلاق عادل",
    "hero.apeIn": "انطلق!",
    "hero.tools": "أدوات MIAO",
    "hero.utilities": "الأدوات",
    "hero.open": "فتح",
    "hero.games": "ألعاب MIAO",
    "hero.playEarn": "العب واربح",
    "hero.play": "العب",

    // About
    "about.text":
      "عندما نبحت الكلاب وقفزت الضفادع، اعتقد الجميع أن حروب الميم قد انتهت. لكن في الظلال، كان هناك شيء صبور يتربص. خلف كل نباح أو نقيق جاء",
    "about.text2": "حاد وواعٍ لم يستطع أحد تجاهله. الشوارع ليست آمنة",

    // Tokenomics
    "tokenomics.title": "اقتصاد الرمز",
    "tokenomics.totalSupply": "إجمالي العرض",
    "tokenomics.liquidity": "السيولة",
    "tokenomics.locked": "مقفل",
    "tokenomics.tax": "الضريبة",
    "tokenomics.noTax": "بدون ضريبة",
    "tokenomics.community": "المجتمع",
    "tokenomics.communityOwned": "100% ملك المجتمع",
    "tokenomics.contractAddress": "عنوان العقد",
    "tokenomics.copied": "تم النسخ!",
    "tokenomics.clickToCopy": "انقر للنسخ",

    // Community
    "community.title": "انضم إلى المجتمع",
    "community.subtitle": "تواصل مع حاملي MIAO الآخرين",
    "community.telegram": "تيليجرام",
    "community.twitter": "تويتر",
    "community.discord": "ديسكورد",

    // Cat Generator
    "generator.title": "مولد القطط بالذكاء الاصطناعي",
    "generator.subtitle": "أنشئ قطك MIAO الفريد",
    "generator.placeholder": "صف قطك الحلم...",
    "generator.generate": "إنشاء قط",
    "generator.generating": "جاري الإنشاء...",
    "generator.download": "تحميل",

    // NFT Section
    "nft.title": "سك MIAO NFT",
    "nft.description": "ولدت من ظلال حروب الميم، تجسد NFTs $MIAO التخفي والطاقة. امتلك رمز القوة في الشوارع.",
    "nft.mintV1": "سك V1",
    "nft.mintV2": "سك V2",

    // Footer
    "footer.disclaimer": "إخلاء المسؤولية",
    "footer.disclaimerText":
      "رمز Miao هو عملة ميم تم إنشاؤها بحتة لأغراض الترفيه والمجتمع. لا يمثل عقد استثمار أو ضمان أو ضمان ربح. يرجى الاستثمار فقط بما يمكنك تحمل خسارته. بالمشاركة، فإنك تقر بالطبيعة عالية المخاطر لعملات الميم، بما في ذلك الخسارة المحتملة لاستثمارك بالكامل.",
    "footer.rights": "جميع الحقوق محفوظة © Miao Token. 2025",
    "footer.sendEmail": "إرسال بريد إلكتروني",

    // Wallet Modal
    "wallet.title": "ربط المحفظة",
    "wallet.selectWallet": "اختر محفظة Solana",
    "wallet.solanaNote": "التبادل يستخدم شبكة Solana",
    "wallet.connecting": "جاري الاتصال...",
    "wallet.install": "تثبيت",
    "wallet.comingSoon": "قريباً",
    "wallet.notSupported": "Solana غير مدعوم",
    "wallet.timeout": "انتهت المهلة. تحقق مما إذا كانت المحفظة مفتوحة.",
    "wallet.error": "خطأ في الاتصال. يرجى المحاولة مرة أخرى.",

    // Swap Modal
    "swap.title": "تبادل الرموز",
    "swap.from": "من",
    "swap.to": "إلى",
    "swap.balance": "الرصيد",
    "swap.max": "الحد الأقصى",
    "swap.searchToken": "ابحث عن رمز أو الصق العنوان",
    "swap.rate": "السعر",
    "swap.priceImpact": "تأثير السعر",
    "swap.minReceived": "الحد الأدنى المستلم",
    "swap.connectFirst": "اربط المحفظة أولاً",
    "swap.swapNow": "تبادل الآن",
    "swap.swapping": "جاري التبادل...",

    // Games Page
    "games.title": "ألعاب MIAO",
    "games.subtitle": "العب واستمتع مع MIAO",
    "games.back": "رجوع",
    "games.featured": "مميز",
    "games.playNow": "العب الآن",
    "games.close": "إغلاق",
    "games.fullscreen": "ملء الشاشة",

    // Tools Page
    "tools.title": "أدوات MIAO",
    "tools.subtitle": "أدوات للمجتمع",
    "tools.back": "رجوع",
    "tools.warningTitle": "إشعار مهم",
    "tools.warningText1": "تقدم هذه الصفحة فكرة صغيرة فقط عما يمكن أن تصبح عليه.",
    "tools.warningText2": "ليس لها أي فائدة بعد وسيكون هذا مشروعًا يناقشه المجتمع.",
    "tools.warningText3": "إذا كانت لديك أفكار، انضم إلى دردشة المجتمع وشاركها، هذا هو الغرض من رمز $MIAO.",
    "tools.warningThanks": "شكراً لتفهمك!",
    "tools.understand": "أفهم، استمر",
  },
}

export const getTranslation = (lang: Language, key: string): string => {
  return translations[lang]?.[key] || translations["en"][key] || key
}
