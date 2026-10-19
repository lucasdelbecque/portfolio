/* Portfolio content. `**text**` marks bold/highlighted words. */
window.PORTFOLIO = {
  links: {
    linkedin: 'https://www.linkedin.com/in/lucas-delbecque-96863a21b/',
    github: 'https://github.com/lucasdelbecque',
    email: 'lucas.delbecque78@gmail.com',
    cv: 'assets/cv-lucas-delbecque.pdf'
  },

  projects: [
    {
      id: 'heartbit', title: 'HeartBit', yt: 'VzZkU2pbt2c',
      tags: ['Unreal Engine', 'Blueprints', 'C++', 'Game Design'],
      colors: ['#ff4d6d', '#2b0612'],
      desc: {
        en: 'An emotional platformer in which a robot gradually learns to feel human emotions. Each level unlocks a new feeling that alters the gameplay mechanics — fear, joy, anger — exploring the boundary between **artificial intelligence and consciousness**.',
        fr: 'Jeu de plateforme émotionnel dans lequel un robot apprend progressivement à ressentir des émotions humaines. Chaque niveau débloque un nouveau sentiment qui modifie les mécaniques de gameplay — peur, joie, colère — explorant la frontière entre **intelligence artificielle et conscience**.'
      }
    },
    {
      id: 'dreammaze', title: 'DreamMaze', yt: 'dCYOSyWmizg',
      tags: ['Unreal Engine', 'Blueprints', 'Game Design'],
      colors: ['#7c5cff', '#0a0630'],
      desc: {
        en: 'A 3-level maze game where each stage is a **speed challenge** in a dreamlike universe. The player navigates procedurally generated mazes with distinct atmospheres, with a timer and leaderboard system to push speedrunning.',
        fr: 'Jeu de labyrinthe en 3 niveaux où chaque stage est un **défi de vitesse** dans un univers onirique. Le joueur navigue dans des labyrinthes procéduraux aux ambiances distinctes, avec un système de chrono et de classement pour pousser le speedrun.'
      }
    },
    {
      id: 'picasso', title: 'Picasso', yt: '8m37P7Qz_DM',
      tags: ['Unreal Engine', '3D Modeling', 'Blueprints', 'Game Design'],
      colors: ['#ff9f1c', '#2a1204'],
      desc: {
        en: "An interactive recreation of the **Pic'Asso** bar in faithful 3D — full spatial modelling, ambient lighting and characters. The Teddy bear mascot is playable, with a **drunkenness effect** that progressively warps the camera and controls based on consumption.",
        fr: "Recréation interactive du bar **Pic'Asso** en 3D fidèle à l'original — modélisation de l'espace, éclairages d'ambiance et personnages. La mascotte Teddy bear est jouable, avec un système d'**effet d'ivresse** qui déforme progressivement la caméra et les contrôles selon la consommation."
      }
    },
    {
      id: 'hippic', title: 'Trailer Hippic', yt: '-25Uwa_oVKk',
      tags: ['Unreal Engine', 'DaVinci Resolve', 'Cinematic'],
      colors: ['#2ec4b6', '#04211f'],
      desc: {
        en: 'Cinematic trailer announcing the **transition of the insPicteur association to Hippic**. Sequence fully produced in Unreal Engine and edited in DaVinci Resolve — art direction, motion design and sound design to create a hard-hitting announcement.',
        fr: "Trailer cinématique annonçant la **transition de l'association insPicteur vers Hippic**. Séquence entièrement réalisée dans Unreal Engine puis montée sous DaVinci Resolve — direction artistique, motion design et sound design pour créer une annonce percutante."
      }
    },
    {
      id: 'nasa', title: 'Trailer NASA Pyjama', yt: 'Fz16symxm_U',
      tags: ['Unreal Engine', 'DaVinci Resolve', 'Motion Design'],
      colors: ['#4361ee', '#0a0f33'],
      desc: {
        en: 'Reveal trailer for a **semester-end event** (NASA) with a pyjama party theme. Designed in Unreal Engine and edited in DaVinci Resolve, cinematic effects and a soundtrack for an unforgettable reveal.',
        fr: 'Trailer de révélation pour une **Soirée de fin de semestre** (NASA) sur le thème soirée pyjama. Conçu dans Unreal Engine et monté sous DaVinci Resolve, effets cinématiques et bande-son pour une révélation mémorable.'
      }
    },
    {
      id: 'piclandtrailer', title: 'Trailer Picasso A26 — Pic Land', yt: '01cJXPFH3HQ',
      tags: ['Trailer', 'Cinematic'],
      colors: ['#ffb703', '#3a0ca3'],
      desc: {
        en: "Trailer for **Pic'Asso A26**, themed around a **fairground** — welcome to **Pic Land**.",
        fr: "Trailer du **Pic'Asso A26** sur le thème de la **fête foraine** — bienvenue à **Pic Land**."
      }
    },
    {
      id: 'blackhole', title: { en: 'BlackHole — Real-time Simulation', fr: 'BlackHole — Simulation temps réel' },
      img: 'assets/BlackHole.png', github: 'https://github.com/lucasdelbecque/BlackHole',
      tags: ['C++', 'GPU', 'Simulation', 'Ray Tracing'],
      colors: ['#f77f00', '#150600'],
      desc: {
        en: 'Physically accurate real-time black hole simulation — spacetime curvature modelled by the **Schwarzschild equations**, matter accretion and gravitational lensing. GPU rendering via iterative ray tracing, developed entirely in C++.',
        fr: "Simulation physiquement correcte d'un trou noir en temps réel — courbure de l'espace-temps modélisée par les **équations de Schwarzschild**, accrétion de matière et lentille gravitationnelle. Rendu GPU par ray tracing itératif, développé entièrement en C++."
      }
    },
    {
      id: 'pathtracer', title: 'GPU Path Tracer',
      img: 'assets/GPUPathTracer.png', github: 'https://github.com/lucasdelbecque/gpu-pathtracer',
      tags: ['C++', 'Metal', 'Path Tracing', 'GPU Compute'],
      colors: ['#9d4edd', '#16052b'],
      desc: {
        en: "Monte Carlo path tracer built from scratch, GPU-accelerated via Apple's **Metal compute shaders**. Implements physically correct BRDF, global illumination, reflections and refractions — with progressive denoising frame by frame.",
        fr: "Path tracer Monte Carlo développé from scratch, accéléré sur GPU via les **Metal compute shaders** d'Apple. Implémente la BRDF physiquement correcte, l'illumination globale, les réflexions et réfractions — avec débruitage progressif frame par frame."
      }
    },
    {
      id: 'mall', title: { en: 'Shopping Mall Simulation — Multi-agents', fr: 'Simulation de centre commercial — Multi-agents' },
      noPoster: true,
      img: 'assets/Simulation_go.png', github: 'https://github.com/lucasdelbecque/simulation_mall',
      tags: ['Go', 'Multi-agents', 'Simulation'],
      colors: ['#06d6a0', '#04201a'],
      desc: {
        en: 'Multi-agent shopping mall simulation in **Go** with a concurrent system: customers, vendors and security guards coexist with their own behaviours, queues and autonomous decisions. Leverages goroutines and channels to model real-time interactions.',
        fr: "Simulation d'un centre commercial en **Go** avec un système multi-agents concurrent : clients, vendeurs et vigiles coexistent avec leurs propres comportements, files d'attente et décisions autonomes. Exploite les goroutines et channels pour modéliser les interactions en temps réel."
      }
    }
  ],

  films: [
    {
      id: 'kitkat', title: 'KIT-KAT', yt: '6JTWz-3mWow',
      tags: [],
      colors: ['#e63946', '#2b0509'],
      role: { en: 'Writing · Directing · Editing', fr: 'Écriture · Réalisation · Montage' },
      desc: {
        en: 'A short film written, directed and edited by **Lucas Delbecque**.',
        fr: 'Un court métrage écrit, réalisé et monté par **Lucas Delbecque**.'
      }
    },
    {
      id: 'pokerface', title: 'Poker Face', yt: 'DbV-DD5waxI',
      tags: [],
      colors: ['#d4af37', '#1f1704'],
      role: { en: 'Writing · Directing · Editing', fr: 'Écriture · Réalisation · Montage' },
      desc: {
        en: 'A short film written, directed and edited by **Lucas Delbecque**.',
        fr: 'Un court métrage écrit, réalisé et monté par **Lucas Delbecque**.'
      }
    }
  ],

  about: {
    p1: {
      en: 'Student at **UTC Compiègne** in computer engineering, specialising in **Artificial Intelligence & Data Science** (2022–2027), with a university exchange at **UFSC Florianopolis** in 2026.',
      fr: "Étudiant à l'**UTC Compiègne** en génie informatique, spécialisation **Intelligence Artificielle & Sciences des Données** (2022–2027), avec un échange universitaire à l'**UFSC Florianopolis** en 2026."
    },
    p2: {
      en: 'During an internship at **SoWhen?** (Montreuil), I designed augmented reality experiences and developed a **gesture recognition system in AR with Unreal Engine**. Previously, videographer and technician at **Blue Spirit** (Parisian animation studio).',
      fr: "En stage chez **SoWhen?** (Montreuil), j'ai conçu des expériences de réalité augmentée et développé un système de **reconnaissance de gestes en AR avec Unreal Engine**. Auparavant, vidéaste et technicien chez **Blue Spirit** (studio d'animation parisien)."
    },
    p3: {
      en: 'What drives me: building systems where **GPU rendering, AI, visuals and game design** converge to create interactive experiences that push the limits of real time.',
      fr: "Ce qui m'anime : construire des systèmes où le **rendu GPU, l'IA, l'image et le game design** convergent pour créer des expériences interactives qui repoussent les limites du temps réel."
    },
    skills: [
      {
        title: { en: 'Game Dev & GPU Rendering', fr: 'Game Dev & Rendu GPU' },
        tags: ['Unreal Engine', 'OpenGL / GLSL', 'Metal', 'Ray Tracing', 'Path Tracing', 'DaVinci Resolve']
      },
      {
        title: { en: 'AI & Machine Learning', fr: 'IA & Machine Learning' },
        tags: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'CNN', 'RAG / LangChain', 'Hugging Face', 'Ollama']
      },
      {
        title: { en: 'Systems & Low-level', fr: 'Systèmes & Bas niveau' },
        tags: ['C++', 'C', 'Python', 'Go', 'Java', 'SQL', 'Raspberry Pi', 'Docker']
      },
      {
        title: { en: 'Web & Frameworks', fr: 'Web & Frameworks' },
        tags: ['HTML / CSS / JS', 'React', 'SpringBoot', 'Qt', 'JavaFX']
      }
    ]
  },

  contact: {
    desc: {
      en: "Open to anything touching applied AI — game development, computer vision, robotics, neuromorphic sensors, real-time 3D rendering… If your project puts intelligence at the service of creation or perception, let's talk.",
      fr: "Ouvert à tout ce qui touche à l'IA appliquée — game development, computer vision, robotique, capteurs neuromorphiques, rendu 3D temps réel… Si ton projet met l'intelligence au service de la création ou de la perception, parlons-en."
    }
  }
};
