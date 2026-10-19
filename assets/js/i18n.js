/* UI strings + language state. English by default, FR on toggle. */
(function () {
  'use strict';

  var strings = {
    en: {
      'intro.eyebrow': 'Portfolio 2026',
      'intro.sub': 'AI & Data Science student · 3D · Game Dev',
      'intro.enter': 'Enter the theatre',
      'intro.hint': 'Take a seat. Grab the remote. Press play.',
      'hud.take': 'Take the remote',
      'hud.drop': 'Put the remote down',
      'hud.play': 'Play',
      'hud.pause': 'Pause',
      'hud.hint.free': 'Move the mouse to look around — grab the remote to browse the screen',
      'hud.hint.remote': 'Mouse: pointer · Wheel: scroll · Click: select · Esc: put the remote down',
      'hud.hint.free.touch': 'Drag to look around — grab the remote to browse the screen',
      'hud.hint.remote.touch': 'Tap to select · Drag to scroll · Use the button to put the remote down',
      'hud.portrait': 'Rotate your device for the best experience',
      'fallback.title': 'WebGL is not available',
      'fallback.text': 'This portfolio is a 3D cinema and needs WebGL. Here are the essentials:',

      'tab.projects': 'Projects',
      'tab.films': 'Films',
      'tab.about': 'About',
      'tab.contact': 'Contact',
      'screen.watch': 'Watch',
      'screen.github': 'GitHub',
      'screen.project': 'Project',
      'screen.film': 'Short film',
      'screen.playing': 'Now playing',
      'screen.paused': 'Paused',
      'screen.resume': 'Resume',
      'screen.stop': 'Stop',
      'screen.menu': 'Menu',
      'screen.pause': 'Pause',
      'screen.play': 'Play',
      'screen.footer': 'Wheel to scroll · Click to select',
      'screen.footer.esc': 'Esc — put the remote down',
      'attract.showing': 'Now showing',
      'attract.cta': 'Grab the remote to browse',
      'attract.tag': 'AI & Data Science · 3D · Game Dev',
      'about.label': 'Who am I?',
      'about.title': 'AI Engineer, passionate about **3D, visuals & creation**',
      'contact.label': 'Get in touch',
      'contact.title': "Let's work **together**",
      'contact.cv': 'Download my CV',
      'contact.cv.sub': 'PDF',
      'contact.email': 'Email'
    },
    fr: {
      'intro.eyebrow': 'Portfolio 2026',
      'intro.sub': 'Étudiant IA & Data Science · 3D · Game Dev',
      'intro.enter': 'Entrer dans la salle',
      'intro.hint': 'Installe-toi. Prends la télécommande. Appuie sur play.',
      'hud.take': 'Prendre la télécommande',
      'hud.drop': 'Poser la télécommande',
      'hud.play': 'Lecture',
      'hud.pause': 'Pause',
      'hud.hint.free': "Bouge la souris pour regarder autour de toi — prends la télécommande pour naviguer sur l'écran",
      'hud.hint.remote': 'Souris : curseur · Molette : défiler · Clic : sélectionner · Échap : poser la télécommande',
      'hud.hint.free.touch': "Glisse pour regarder autour de toi — prends la télécommande pour naviguer sur l'écran",
      'hud.hint.remote.touch': 'Touche pour sélectionner · Glisse pour défiler · Utilise le bouton pour poser la télécommande',
      'hud.portrait': 'Tourne ton appareil pour une meilleure expérience',
      'fallback.title': "WebGL n'est pas disponible",
      'fallback.text': "Ce portfolio est un cinéma 3D et nécessite WebGL. Voici l'essentiel :",

      'tab.projects': 'Projets',
      'tab.films': 'Films',
      'tab.about': 'À propos',
      'tab.contact': 'Contact',
      'screen.watch': 'Regarder',
      'screen.github': 'GitHub',
      'screen.project': 'Projet',
      'screen.film': 'Court métrage',
      'screen.playing': 'En cours',
      'screen.paused': 'En pause',
      'screen.resume': 'Reprendre',
      'screen.stop': 'Arrêter',
      'screen.menu': 'Menu',
      'screen.pause': 'Pause',
      'screen.play': 'Lecture',
      'screen.footer': 'Molette : défiler · Clic : sélectionner',
      'screen.footer.esc': 'Échap — poser la télécommande',
      'attract.showing': "À l'affiche",
      'attract.cta': 'Prends la télécommande pour naviguer',
      'attract.tag': 'IA & Data Science · 3D · Game Dev',
      'about.label': 'Qui suis-je ?',
      'about.title': 'Ingénieur IA, passionné de **3D, image & création**',
      'contact.label': 'Me contacter',
      'contact.title': 'Travaillons **ensemble**',
      'contact.cv': 'Télécharger mon CV',
      'contact.cv.sub': 'PDF',
      'contact.email': 'Email'
    }
  };

  var lang = 'en';
  var listeners = [];

  function t(key) {
    var s = strings[lang][key];
    return s !== undefined ? s : (strings.en[key] !== undefined ? strings.en[key] : key);
  }

  function applyDom() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    document.documentElement.lang = lang;
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'fr' ? 'EN' : 'FR';
  }

  function set(next) {
    lang = next === 'fr' ? 'fr' : 'en';
    applyDom();
    listeners.forEach(function (fn) { fn(lang); });
  }

  window.I18N = {
    get lang() { return lang; },
    t: t,
    set: set,
    toggle: function () { set(lang === 'fr' ? 'en' : 'fr'); },
    onChange: function (fn) { listeners.push(fn); },
    apply: applyDom
  };

  applyDom();
})();
