/* Minimal client-side i18n helper
   - adds window.t(key, vars)
   - adds window.setLang(lang)
   - automatically initializes from localStorage or browser locale
   - replaces elements with `data-i18n` attributes
*/
(function(){
  var translations = {
    en: {
      logo: 'SO YOU',
      home: 'Home',
      prototype: 'Prototype',
      documents: 'Documents',
      accessibility: 'Accessibility',
      sources: 'Sources',
      about: 'About',
      hero_title: 'SO YOU',
      subheading: "Discover what energizes you — and find your place in Ghent's student community.",
      try_proto: '→ Try the Prototype',
      fill_credentials: 'Please fill both email and password.',
      logged_in: 'Successfully logged in as {email} (mock).',
      back_home: '← Back to home',
      placeholder_note: 'This is placeholder content — replace with your real text.',
      login_title: 'Login to So You',
      email_label: 'Email',
      password_label: 'Password',
      login_button: 'Login',
      built_for_you: 'Built for You',
      built_list_1: '<strong>Clear navigation</strong> — A bottom bar that stays put, so you always know where you are',
      built_list_2: '<strong>Generous spacing</strong> — Room to breathe between every element',
      built_list_3: '<strong>Calm aesthetics</strong> — Soft colors, rounded edges, and no visual clutter',
      built_list_4: '<strong>Neurodivergent-friendly</strong> — Created with ADHD, autism, and sensory sensitivities in mind',
      what_you_can_do: 'What You Can Do',
      feature1_title: 'Explore Your Interests',
      feature1_text: 'Discover what genuinely excites and energizes you through guided exploration.',
      feature2_title: 'Find Your Match',
      feature2_text: 'Connect with student associations across UGent, Artevelde, and HOGENT that align with your passions and curiosities.',
      feature3_title: 'Discover Patterns',
      feature3_text: 'See themes emerge in what you\'re drawn to—helping you understand yourself better.',
      get_started: 'Get Started',
      get_started_text: 'Add your content here for the prototype, documents, accessibility info, and sources. Click the sidebar links to view placeholder pages that you can replace later.'
    },
    nl: {
      logo: 'SO YOU',
      home: 'Home',
      prototype: 'Prototype',
      documents: 'Documenten',
      accessibility: 'Toegankelijkheid',
      sources: 'Bronnen',
      about: 'Over',
      hero_title: 'SO YOU',
      subheading: 'Ontdek wat je energie geeft — en vind je plek in de studentencommunity van Gent.',
      try_proto: '→ Probeer het prototype',
      fill_credentials: 'Vul zowel e-mail als wachtwoord in.',
      logged_in: 'Succesvol ingelogd als {email} (mock).',
      back_home: '← Terug naar home',
      placeholder_note: 'Dit is tijdelijke inhoud — vervang met je eigen teksten.',
      login_title: 'Inloggen bij So You',
      email_label: 'E-mail',
      password_label: 'Wachtwoord',
      login_button: 'Inloggen',
      built_for_you: 'Gemaakt voor jou',
      built_list_1: '<strong>Duidelijke navigatie</strong> — Een onderste balk die blijft staan, zodat je altijd weet waar je bent',
      built_list_2: '<strong>Gulle ruimte</strong> — Ruimte tussen elk element',
      built_list_3: '<strong>Rustige esthetiek</strong> — Zachte kleuren, afgeronde hoeken en geen visuele rommel',
      built_list_4: '<strong>Neurodivergent-vriendelijk</strong> — Ontworpen met ADHD, autisme en sensorische gevoeligheden in gedachten',
      what_you_can_do: 'Wat je kunt doen',
      feature1_title: 'Ontdek je interesses',
      feature1_text: 'Ontdek wat je echt aanspreekt en energie geeft via gerichte verkenning.',
      feature2_title: 'Vind je match',
      feature2_text: 'Verbind met studentenverenigingen van UGent, Artevelde en HOGENT die bij je passies passen.',
      feature3_title: 'Ontdek patronen',
      feature3_text: 'Zie thema\'s terugkomen in waar je door wordt aangetrokken — dit helpt je jezelf beter te begrijpen.',
      get_started: 'Beginnen',
      get_started_text: 'Voeg hier je inhoud toe voor het prototype, documenten, toegankelijkheidsinfo en bronnen. Klik op de zijbalklinks om tijdelijke pagina\'s te bekijken die je later kunt vervangen.'
    }
  };

  function getStored(){ return localStorage.getItem('soyou_lang') || navigator.language.split('-')[0] || 'en'; }

  function apply(lang){
    var dict = translations[lang] || translations.en;
    // merge shared keys (if present in translations.json). Support shared as per-language object.
    var shared = {};
    if(translations.shared){
      if(translations.shared[lang]) shared = translations.shared[lang];
      else if(typeof translations.shared === 'object') shared = translations.shared;
    }
    dict = Object.assign({}, shared, dict);
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if(!key) return;
      var txt = dict[key];
      if(txt===undefined) return;
      // preserve placeholders like inner HTML for richtext
      if(el.tagName==='INPUT' || el.tagName==='TEXTAREA') el.placeholder = txt;
      else el.innerHTML = txt;
    });
    // set title/aria-label from data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(function(el){
      var key = el.getAttribute('data-i18n-title'); if(!key) return; var txt = dict[key]; if(txt===undefined) return; el.title = txt; if(!el.getAttribute('aria-label')) el.setAttribute('aria-label', txt);
    });
    // set document lang
    document.documentElement.lang = lang;
    // update selector if present
    var sel = document.getElementById('languageSelect'); if(sel) sel.value = lang;
  }

  window.t = function(key, vars){
    var lang = localStorage.getItem('soyou_lang') || getStored();
    var dict = translations[lang] || translations.en;
    var s = dict[key] || translations.en[key] || key;
    if(vars){ Object.keys(vars).forEach(function(k){ s = s.replace('{'+k+'}', vars[k]); }); }
    return s;
  };

  window.setLang = function(lang){
    localStorage.setItem('soyou_lang', lang);
    apply(lang);
  };

  // attempt to load translations.json (overrides/extends built-in translations)
  function loadRemote(){
    return fetch('translations.json').then(function(r){ if(!r.ok) throw new Error('no-trans'); return r.json(); }).then(function(remote){
      // merge remote languages into existing translations
      Object.keys(remote).forEach(function(lang){ translations[lang] = Object.assign({}, translations[lang]||{}, remote[lang]); });
      return true;
    }).catch(function(){ return false; });
  }

  // initialize on DOMContentLoaded (wait for remote if possible)
  document.addEventListener('DOMContentLoaded', function(){
    loadRemote().then(function(){
      var lang = localStorage.getItem('soyou_lang') || (navigator.language && navigator.language.split('-')[0]) || 'en';
      if(!translations[lang]) lang = 'en';
      apply(lang);
      // bind selector
      var sel = document.getElementById('languageSelect');
      if(sel){ sel.addEventListener('change', function(){ setLang(this.value); }); }
    });
  });

})();
