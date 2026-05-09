(function () {
  var lang = 'fr';

  var t = {
    fr: {
      'nav.about':        'À propos',
      'nav.projects':     'Projets',
      'nav.films':        'Films',
      'nav.contact':      'Contact',
      'hero.eyebrow':     'Portfolio 2026',
      'hero.title':       'Étudiant <span>IA &amp; Data Science</span> · <span>3D</span> · Game Dev',
      'hero.cta.primary': 'Voir mes projets',
      'hero.cta.secondary': 'Télécharger mon CV',
      'hero.scroll':      'Scroll',
      'about.label':      'Qui suis-je ?',
      'about.title':      'Ingénieur IA, passionné<br>de <span>3D, image &amp; création</span>',
      'about.p1':         "Étudiant à l'<strong>UTC Compiègne</strong> en génie informatique, spécialisation <strong>Intelligence Artificielle &amp; Sciences des Données</strong> (2022–2027), avec un échange universitaire à l'<strong>UFSC Florianopolis</strong> en 2026.",
      'about.p2':         "En stage chez <strong>SoWhen?</strong> (Montreuil), j'ai conçu des expériences de réalité augmentée et développé un système de <strong>reconnaissance de gestes en AR avec Unreal Engine</strong>. Auparavant, vidéaste et technicien chez <strong>Blue Spirit</strong> (studio d'animation parisien).",
      'about.p3':         "Ce qui m'anime : construire des systèmes où le <strong>rendu GPU, l'IA, l'image et le game design</strong> convergent pour créer des expériences interactives qui repoussent les limites du temps réel.",
      'about.skill1':     'Game Dev &amp; Rendu GPU',
      'about.skill2':     'IA &amp; Machine Learning',
      'about.skill3':     'Systèmes &amp; Bas niveau',
      'about.skill4':     'Web &amp; Frameworks',
      'projects.label':   "Ce que j'ai construit",
      'projects.title':   'Projets <span>sélectionnés</span>',
      'p01.num':  'Projet 01', 'p01.desc': "Jeu de plateforme émotionnel dans lequel un robot apprend progressivement à ressentir des émotions humaines. Chaque niveau débloque un nouveau sentiment qui modifie les mécaniques de gameplay — peur, joie, colère — explorant la frontière entre <strong>intelligence artificielle et conscience</strong>.",
      'p02.num':  'Projet 02', 'p02.desc': "Jeu de labyrinthe en 3 niveaux où chaque stage est un <strong>défi de vitesse</strong> dans un univers onirique. Le joueur navigue dans des labyrinthes procéduraux aux ambiances distinctes, avec un système de chrono et de classement pour pousser le speedrun.",
      'p03.num':  'Projet 03', 'p03.desc': "Recréation interactive du bar <strong>Pic'Asso</strong> en 3D fidèle à l'original — modélisation de l'espace, éclairages d'ambiance et personnages. La mascotte Teddy bear est jouable, avec un système d'<strong>effet d'ivresse</strong> qui déforme progressivement la caméra et les contrôles selon la consommation.",
      'p04.num':  'Projet 04', 'p04.desc': "Trailer cinématique annonçant la <strong>transition de l'association insPicteur vers Hippic</strong>. Séquence entièrement réalisée dans Unreal Engine puis montée sous DaVinci Resolve — direction artistique, motion design et sound design pour créer une annonce percutante.",
      'p05.num':  'Projet 05', 'p05.desc': "Trailer de révélation pour une <strong>Soirée de fin de semestre</strong> (NASA) sur le thème soirée pyjama. Conçu dans Unreal Engine et monté sous DaVinci Resolve, effets cinématiques et bande-son pour une révélation mémorable.",
      'p06.num':  'Projet 06', 'p06.title': 'BlackHole — Simulation temps réel',
      'p06.desc': "Simulation physiquement correcte d'un trou noir en temps réel — courbure de l'espace-temps modélisée par les <strong>équations de Schwarzschild</strong>, accrétion de matière et lentille gravitationnelle. Rendu GPU par ray tracing itératif, développé entièrement en C++.",
      'p07.num':  'Projet 07', 'p07.desc': "Path tracer Monte Carlo développé from scratch, accéléré sur GPU via les <strong>Metal compute shaders</strong> d'Apple. Implémente la BRDF physiquement correcte, l'illumination globale, les réflexions et réfractions — avec débruitage progressif frame par frame.",
      'p08.num':  'Projet 08', 'p08.title': 'Simulation de centre commercial — Multi-agents',
      'p08.desc': "Simulation d'un centre commercial en <strong>Go</strong> avec un système multi-agents concurrent : clients, vendeurs et vigiles coexistent avec leurs propres comportements, files d'attente et décisions autonomes. Exploite les goroutines et channels pour modéliser les interactions en temps réel.",
      'films.label': 'Réalisation',
      'films.title': 'Court <span>métrages</span>',
      'film.role':   'Écriture · Réalisation · Montage',
      'contact.label': 'Me contacter',
      'contact.title': 'Travaillons <span>ensemble</span>',
      'contact.desc':  "Ouvert à tout ce qui touche à l'IA appliquée — game development, computer vision, robotique, capteurs neuromorphiques, rendu 3D temps réel… Si ton projet met l'intelligence au service de la création ou de la perception, parlons-en.",
      'footer': '© 2026 Lucas Delbecque — Fait avec HTML/CSS/Three.js &bull; Hébergé sur GitHub Pages',
    },
    en: {
      'nav.about':        'About',
      'nav.projects':     'Projects',
      'nav.films':        'Films',
      'nav.contact':      'Contact',
      'hero.eyebrow':     'Portfolio 2026',
      'hero.title':       'Student <span>AI &amp; Data Science</span> · <span>3D</span> · Game Dev',
      'hero.cta.primary': 'See my projects',
      'hero.cta.secondary': 'Download my CV',
      'hero.scroll':      'Scroll',
      'about.label':      'Who am I?',
      'about.title':      'AI Engineer, passionate<br>about <span>3D, visuals &amp; creation</span>',
      'about.p1':         'Student at <strong>UTC Compiègne</strong> in computer engineering, specialising in <strong>Artificial Intelligence &amp; Data Science</strong> (2022–2027), with a university exchange at <strong>UFSC Florianopolis</strong> in 2026.',
      'about.p2':         'During an internship at <strong>SoWhen?</strong> (Montreuil), I designed augmented reality experiences and developed a <strong>gesture recognition system in AR with Unreal Engine</strong>. Previously, videographer and technician at <strong>Blue Spirit</strong> (Parisian animation studio).',
      'about.p3':         'What drives me: building systems where <strong>GPU rendering, AI, visuals and game design</strong> converge to create interactive experiences that push the limits of real time.',
      'about.skill1':     'Game Dev &amp; GPU Rendering',
      'about.skill2':     'AI &amp; Machine Learning',
      'about.skill3':     'Systems &amp; Low-level',
      'about.skill4':     'Web &amp; Frameworks',
      'projects.label':   "What I've built",
      'projects.title':   'Selected <span>projects</span>',
      'p01.num':  'Project 01', 'p01.desc': 'An emotional platformer in which a robot gradually learns to feel human emotions. Each level unlocks a new feeling that alters the gameplay mechanics — fear, joy, anger — exploring the boundary between <strong>artificial intelligence and consciousness</strong>.',
      'p02.num':  'Project 02', 'p02.desc': 'A 3-level maze game where each stage is a <strong>speed challenge</strong> in a dreamlike universe. The player navigates procedurally generated mazes with distinct atmospheres, with a timer and leaderboard system to push speedrunning.',
      'p03.num':  'Project 03', 'p03.desc': "An interactive recreation of the <strong>Pic'Asso</strong> bar in faithful 3D — full spatial modelling, ambient lighting and characters. The Teddy bear mascot is playable, with a <strong>drunkenness effect</strong> that progressively warps the camera and controls based on consumption.",
      'p04.num':  'Project 04', 'p04.desc': 'Cinematic trailer announcing the <strong>transition of the insPicteur association to Hippic</strong>. Sequence fully produced in Unreal Engine and edited in DaVinci Resolve — art direction, motion design and sound design to create a hard-hitting announcement.',
      'p05.num':  'Project 05', 'p05.desc': 'Reveal trailer for a <strong>semester-end event</strong> (NASA) with a pyjama party theme. Designed in Unreal Engine and edited in DaVinci Resolve, cinematic effects and a soundtrack for an unforgettable reveal.',
      'p06.num':  'Project 06', 'p06.title': 'BlackHole — Real-time Simulation',
      'p06.desc': 'Physically accurate real-time black hole simulation — spacetime curvature modelled by the <strong>Schwarzschild equations</strong>, matter accretion and gravitational lensing. GPU rendering via iterative ray tracing, developed entirely in C++.',
      'p07.num':  'Project 07', 'p07.desc': "Monte Carlo path tracer built from scratch, GPU-accelerated via Apple's <strong>Metal compute shaders</strong>. Implements physically correct BRDF, global illumination, reflections and refractions — with progressive denoising frame by frame.",
      'p08.num':  'Project 08', 'p08.title': 'Shopping Mall Simulation — Multi-agents',
      'p08.desc': 'Multi-agent shopping mall simulation in <strong>Go</strong> with a concurrent system: customers, vendors and security guards coexist with their own behaviours, queues and autonomous decisions. Leverages goroutines and channels to model real-time interactions.',
      'films.label': 'Filmmaking',
      'films.title': 'Short <span>films</span>',
      'film.role':   'Writing · Directing · Editing',
      'contact.label': 'Get in touch',
      'contact.title': "Let's work <span>together</span>",
      'contact.desc':  "Open to anything touching applied AI — game development, computer vision, robotics, neuromorphic sensors, real-time 3D rendering… If your project puts intelligence at the service of creation or perception, let's talk.",
      'footer': '© 2026 Lucas Delbecque — Made with HTML/CSS/Three.js &bull; Hosted on GitHub Pages',
    }
  };

  function applyLang(newLang) {
    lang = newLang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[lang][key] !== undefined) {
        el.innerHTML = t[lang][key];
      }
    });
    document.documentElement.lang = lang;
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'fr' ? 'EN' : 'FR';
  }

  document.getElementById('lang-toggle').addEventListener('click', function () {
    applyLang(lang === 'fr' ? 'en' : 'fr');
  });
})();
