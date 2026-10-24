/**
 * Direct Actions Engine for Bilal King
 * Automatically and immediately executes user commands:
 * - Opening YouTube & playing songs
 * - Opening device Photo Gallery / Camera
 * - Opening WhatsApp, Google search, Phone calls
 * - Controlling Torch, Timers, and Battery
 */

export interface ActionExecutionResult {
  handled: boolean;
  actionType?: 'youtube' | 'gallery' | 'camera' | 'whatsapp' | 'google' | 'call' | 'torch' | 'timer' | 'music' | 'lock' | 'dialer' | 'callNotification' | 'backCall' | 'appBack';
  spokenResponse: string;
  data?: any;
}

/**
 * Parses and executes direct actions immediately from user speech
 */
export function executeDirectVoiceAction(
  rawText: string,
  helpers: {
    openGalleryPicker: () => void;
    toggleTorch: (turnOn: boolean) => Promise<boolean>;
    startTimer: (seconds: number, label: string) => void;
    playCyberMusic: () => void;
    lockScreen?: () => void;
    openDialer?: () => void;
    makeCall?: (phoneNumber: string) => void;
    checkCallerNotification?: () => string;
    makeBackCall?: () => void;
    appBack?: () => void;
  }
): ActionExecutionResult {
  const text = rawText.toLowerCase().trim();

  // Helper to extract phone number from text
  const extractPhoneDigits = (input: string): string => {
    // Convert common spoken words for digits
    let normalized = input
      .replace(/\b(sifar|shunya|zero|zeero)\b/gi, '0')
      .replace(/\b(ek|one)\b/gi, '1')
      .replace(/\b(do|two)\b/gi, '2')
      .replace(/\b(teen|three)\b/gi, '3')
      .replace(/\b(chaar|char|four)\b/gi, '4')
      .replace(/\b(paanch|panch|five)\b/gi, '5')
      .replace(/\b(chhe|che|six)\b/gi, '6')
      .replace(/\b(saat|sat|seven)\b/gi, '7')
      .replace(/\b(aath|ath|eight)\b/gi, '8')
      .replace(/\b(nau|nine)\b/gi, '9');

    // Find sequence of digits (including spaced or hyphenated e.g. "0300 1234567" or "+92 321 4455667")
    const digitMatch = normalized.match(/(?:\+?\d[\d\s\-]{4,16}\d|\d{5,15})/);
    if (digitMatch) {
      const clean = digitMatch[0].replace(/[\s\-]/g, '');
      if (clean.length >= 5) return clean;
    }
    return '';
  };

  // 1. Mobile Screen Lock
  if (
    text.includes('mobile lock') ||
    text.includes('phone lock') ||
    text.includes('screen lock') ||
    text === 'lock' ||
    text === 'lock karo' ||
    text === 'lock kro' ||
    text.includes('lock kar do') ||
    text.includes('lock kar dena') ||
    text.includes('lock kr do')
  ) {
    if (helpers.lockScreen) helpers.lockScreen();
    return {
      handled: true,
      actionType: 'lock',
      spokenResponse: 'Boss, mobile screen lock kar di gayi hai.',
    };
  }

  // 2. Specific Phone Call / Dial to a number ("is number pay call lagao [num]", "call lagao [num]", "cal lagao [num]")
  const isCallCommand =
    text.includes('call lagao') ||
    text.includes('cal lagao') ||
    text.includes('call lgao') ||
    text.includes('cal lgao') ||
    text.includes('call karo') ||
    text.includes('cal karo') ||
    text.includes('call kro') ||
    text.includes('cal kro') ||
    text.includes('phone lagao') ||
    text.includes('phone karo') ||
    text.includes('dial karo') ||
    text.includes('call milao') ||
    text.includes('cal milao') ||
    text.includes('is number pay') ||
    text.includes('is number par') ||
    text.includes('is number pe') ||
    text.includes('number pay call') ||
    text.includes('number par call') ||
    text.includes('number pe call') ||
    text.includes('number pe cal') ||
    text.includes('number pay cal');

  const extractedNumber = extractPhoneDigits(text);

  if (isCallCommand && extractedNumber) {
    if (helpers.makeCall) {
      helpers.makeCall(extractedNumber);
    } else {
      window.location.href = `tel:${extractedNumber}`;
    }
    return {
      handled: true,
      actionType: 'call',
      spokenResponse: `Ji Boss, ${extractedNumber} par call milai ja rahi hai...`,
    };
  }

  // 3. Open Mobile Dialer / "mere call wala kholo" / "call wala khola" / "call kholo" / "dialer kholo"
  if (
    text.includes('call wala khol') ||
    text.includes('call wala khola') ||
    text.includes('call wala nik') ||
    text.includes('call wala open') ||
    text.includes('call kholo') ||
    text.includes('cal wala khol') ||
    text.includes('cal kholo') ||
    text.includes('phone wala khol') ||
    text.includes('dialer nik') ||
    text.includes('dialer khol') ||
    text.includes('dialer open') ||
    text.includes('dialer') ||
    text.includes('number nik') ||
    text.includes('dial pad') ||
    text.includes('phone dialer') ||
    text.includes('call lagane wala')
  ) {
    if (helpers.openDialer) helpers.openDialer();
    return {
      handled: true,
      actionType: 'dialer',
      spokenResponse: 'Ji Boss, call dialer open kar diya hai. Aap yahan number dial kar sakte hain.',
    };
  }

  // 4. Call Notification / Kis ki call aayi
  if (
    text.includes('kis ki call') ||
    text.includes('kis ki cal') ||
    text.includes('kiska phone') ||
    text.includes('kiska call') ||
    text.includes('call notification') ||
    text.includes('notification dakh') ||
    text.includes('notification dekh') ||
    text.includes('missed call')
  ) {
    let callerInfo = 'Boss, Ali ki missed call aayi thi 5 minute pehle (+92 300 9876543). Kya aapko wapas call karni hai?';
    if (helpers.checkCallerNotification) {
      callerInfo = helpers.checkCallerNotification();
    }
    return {
      handled: true,
      actionType: 'callNotification',
      spokenResponse: callerInfo,
    };
  }

  // 5. Back Call / Call Back
  if (
    text.includes('back call') ||
    text.includes('back cal') ||
    text.includes('call back') ||
    text.includes('wapas call') ||
    text.includes('wapis call') ||
    (text.includes('osko call') && !extractedNumber) ||
    (text.includes('usko call') && !extractedNumber)
  ) {
    if (helpers.makeBackCall) helpers.makeBackCall();
    return {
      handled: true,
      actionType: 'backCall',
      spokenResponse: 'Boss, Ali ko wapas call milai ja rahi hai.',
    };
  }

  // 5. App Back Command
  if (
    text.includes('app back') ||
    text.includes('screen back') ||
    text === 'back' ||
    text === 'back karo' ||
    text === 'back jao' ||
    text.includes('peeche jao')
  ) {
    if (helpers.appBack) helpers.appBack();
    return {
      handled: true,
      actionType: 'appBack',
      spokenResponse: 'Boss, main screen par wapas aa gaye hain.',
    };
  }

  // 6. YouTube & Songs / Music
  const isYouTube = text.includes('youtube') || text.includes('yt');
  const isSong =
    text.includes('song') ||
    text.includes('gaana') ||
    text.includes('gana') ||
    text.includes('music') ||
    text.includes('chala do') ||
    text.includes('laga do');

  if (isYouTube || (isSong && !text.includes('timer') && !text.includes('torch') && !text.includes('note') && !text.includes('lock'))) {
    // Extract song or query name
    let searchQuery = text
      .replace(/(youtube|open|karo|kholo|chala do|chalao|laga do|lagao|song|koi|achha sa|gaana|gana|music|play|baja do|bja do|par|sunao)/gi, '')
      .trim();

    if (!searchQuery) {
      searchQuery = 'Top Bollywood Songs';
    }

    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    try {
      window.open(ytUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      // In case popup blocked, fallback to direct location or local music
      window.location.href = ytUrl;
    }

    return {
      handled: true,
      actionType: 'youtube',
      spokenResponse: `Boss, YouTube par "${searchQuery}" chala diya hai! Enjoy kijiye.`,
    };
  }

  // 7. Device Gallery / Photos
  if (
    text.includes('gallery') ||
    text.includes('gallary') ||
    text.includes('photo dikhao') ||
    text.includes('photos open') ||
    text.includes('images open') ||
    text.includes('picture dikhao')
  ) {
    helpers.openGalleryPicker();
    return {
      handled: true,
      actionType: 'gallery',
      spokenResponse: 'Boss, aapki phone gallery open kar di hai!',
    };
  }

  // 8. Google Search
  if (
    text.includes('google open') ||
    text.includes('google kholo') ||
    (text.startsWith('search ') && !text.includes('note')) ||
    text.includes('google par search')
  ) {
    let query = text
      .replace(/(google|open|karo|kholo|search|par|dhoondo)/gi, '')
      .trim();
    if (!query) query = 'Trending News';

    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    return {
      handled: true,
      actionType: 'google',
      spokenResponse: `Boss, Google par "${query}" search kar diya hai!`,
    };
  }

  // 9. WhatsApp
  if (text.includes('whatsapp') || text.includes('whats app')) {
    const msg = text.replace(/(whatsapp|open|karo|kholo|par|message|bhejo|send)/gi, '').trim() || 'Assalam-o-Alaikum';
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    return {
      handled: true,
      actionType: 'whatsapp',
      spokenResponse: 'Boss, WhatsApp open kar diya hai!',
    };
  }

  // 10. Fallback Phone Call / Dial
  if (text.includes('call') || text.includes('cal') || text.includes('phone') || text.includes('dial')) {
    const num = extractPhoneDigits(text);
    if (num) {
      if (helpers.makeCall) helpers.makeCall(num);
      else window.location.href = `tel:${num}`;
      return {
        handled: true,
        actionType: 'call',
        spokenResponse: `Ji Boss, ${num} par call milai ja rahi hai...`,
      };
    }
  }

  return { handled: false, spokenResponse: '' };
}
