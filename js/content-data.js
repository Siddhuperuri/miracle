/* ------------------------------------------------------------------
   content-data.js  -  material for the parts of the world that have
   not yet been given a surface.

   This file creates no DOM and changes no world state. It is a small,
   editable record for a future content layer to read.

   CONTENT RULE
   ------------
   RECORD     = supported by the current README or source.
   SYSTEM     = true of this artwork itself.
   DIRECTIVE  = an authorial intention from the expansion brief; it is
                not biographical evidence.
   OPEN       = an honest absence. Render it as a question, a dashed
                object, or leave it quiet. Never promote it to fact
                without replacing it with a verified record.

   UPDATE POINTS
   -------------
   1. Add verified first-person material to `origin.fragments` and to
      a dossier's `layers`. Keep its `truth` as RECORD.
   2. Replace the OPEN entries in `current` whenever Siddhartha gives
      a real current state. Do not infer one from a tool or a project.
   3. SYNCHRO and AETHER are named only by the expansion directive at
      present. Their dossiers deliberately contain questions, not
      descriptions. Fill them only when source material exists.
   4. Add graph edges when a relationship is documented. `truth` lets
      a renderer distinguish a solid relation from a conceptual or
      proposed one.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var SID = (window.SID = window.SID || {});

  /* A renderer can use these as its key. The words are deliberately
     short because much of this material will live on the type grid. */
  var TRUTH = {
    RECORD: 'RECORD',
    SYSTEM: 'SYSTEM',
    DIRECTIVE: 'DIRECTIVE',
    OPEN: 'OPEN'
  };

  /* Every dossier has these layers, even when the record does not yet
     fill them. `dossierLayer()` below supplies the appropriate open
     state for a layer missing from an individual dossier. */
  var DOSSIER_LAYERS = [
    'origin', 'question', 'experiment', 'process', 'failure',
    'breakthrough', 'system', 'visualLanguage', 'lesson', 'future'
  ];

  var OPEN_LAYERS = {
    origin: {
      label: 'ORIGIN',
      state: 'UNRECORDED',
      text: 'NO VERIFIED ORIGIN HAS BEEN PLACED HERE.',
      truth: TRUTH.OPEN
    },
    question: {
      label: 'QUESTION',
      state: 'OPEN',
      text: 'THE QUESTION HAS NOT YET BEEN RECORDED.',
      truth: TRUTH.OPEN
    },
    experiment: {
      label: 'EXPERIMENT',
      state: 'UNRECORDED',
      text: 'NO VERIFIED EXPERIMENT HAS BEEN PLACED HERE.',
      truth: TRUTH.OPEN
    },
    process: {
      label: 'PROCESS',
      state: 'UNRECORDED',
      text: 'THE PROCESS REMAINS UNRECORDED.',
      truth: TRUTH.OPEN
    },
    failure: {
      label: 'FAILURE',
      state: 'UNRECORDED',
      text: 'NO FAILURE IS CLAIMED WITHOUT A RECORD.',
      truth: TRUTH.OPEN
    },
    breakthrough: {
      label: 'BREAKTHROUGH',
      state: 'UNRECORDED',
      text: 'NO BREAKTHROUGH IS CLAIMED WITHOUT A RECORD.',
      truth: TRUTH.OPEN
    },
    system: {
      label: 'SYSTEM',
      state: 'UNRECORDED',
      text: 'THE SYSTEM HAS NOT YET BEEN DESCRIBED.',
      truth: TRUTH.OPEN
    },
    visualLanguage: {
      label: 'VISUAL LANGUAGE',
      state: 'UNRECORDED',
      text: 'NO VISUAL INTENT IS CLAIMED WITHOUT A RECORD.',
      truth: TRUTH.OPEN
    },
    lesson: {
      label: 'LESSON',
      state: 'UNRECORDED',
      text: 'NO LESSON IS ATTRIBUTED WITHOUT WORDS FROM ITS AUTHOR.',
      truth: TRUTH.OPEN
    },
    future: {
      label: 'FUTURE',
      state: 'OPEN',
      text: 'THE NEXT FORM IS LEFT OPEN.',
      truth: TRUTH.OPEN
    }
  };

  var DATA = {
    version: 1,
    title: 'SIDDHARTHA: CONTENT FIELD',
    truth: TRUTH,
    dossierLayers: DOSSIER_LAYERS,
    openLayers: OPEN_LAYERS,

    /* This is an origin field, not an origin story. It starts with
       what is actually known and lets the unrecorded remain spacious. */
    origin: {
      mode: 'FRAGMENTS, NOT BIOGRAPHY',
      fragments: [
        {
          id: 'name',
          text: 'PERURI / JAI / SAI / SIDDHARTHA',
          note: 'THE FULL NAME AS RECORDED IN THE EXISTING PROJECT DATA.',
          truth: TRUTH.RECORD,
          reveal: 'VANTAGE'
        },
        {
          id: 'vantage',
          text: 'FIVE LAYERS. ONE VANTAGE.',
          note: 'THE NAME RESOLVES ONLY FROM ONE VIEWPOINT AND IN STILLNESS.',
          truth: TRUTH.SYSTEM,
          reveal: 'FIRST STILLNESS'
        },
        {
          id: 'made-of',
          text: 'MADE OF HTML CSS AND JAVASCRIPT.',
          note: 'THE PIECE USES NO FRAMEWORK, BACKEND, NETWORK REQUEST, FONT FILE, OR IMAGE ASSET.',
          truth: TRUTH.SYSTEM,
          reveal: 'TOP OF THE WALL'
        },
        {
          id: 'record-before',
          text: 'BEFORE THIS: UNRECORDED.',
          note: 'THE CURRENT ORIGIN SHEET HOLDS NO BIOGRAPHICAL ORIGIN FACTS.',
          truth: TRUTH.RECORD,
          reveal: 'ORIGIN SHEET'
        },
        {
          id: 'identity-field',
          text: 'DESIGN / CODE / AI / SYSTEMS / VISUAL CULTURE / CREATIVE TECHNOLOGY',
          note: 'A DECLARED FIELD OF RELATIONSHIPS FROM THE AUTHORIAL EXPANSION DIRECTIVE.',
          truth: TRUTH.DIRECTIVE,
          reveal: 'WALL RELATIONSHIPS'
        },
        {
          id: 'cse-question',
          text: 'CSE → CREATIVE TECHNOLOGY?',
          note: 'THE DIRECTIVE ASKS FOR THIS TRANSITION TO BE EXPLORED; NO PERSONAL HISTORY IS RECORDED HERE YET.',
          truth: TRUTH.OPEN,
          reveal: 'OPTIONAL DEPTH'
        },
        {
          id: 'absence',
          text: 'THE NAME IS ALSO AN ABSENCE.',
          note: 'AT THE BOTTOM OF THIS PIECE, DUST IS ABSENT WHERE THE NAME WOULD BE.',
          truth: TRUTH.SYSTEM,
          reveal: 'FINAL VOID'
        }
      ],
      questions: [
        {
          id: 'why-begin',
          text: 'WHAT WAS THE FIRST QUESTION?',
          truth: TRUTH.OPEN
        },
        {
          id: 'first-tool',
          text: 'WHAT FIRST MADE MAKING FEEL NECESSARY?',
          truth: TRUTH.OPEN
        },
        {
          id: 'turn',
          text: 'WHEN DID THE TECHNICAL BECOME SPATIAL, VISUAL, OR PERSONAL?',
          truth: TRUTH.OPEN
        }
      ]
    },

    /* The requested stages are held as an archaeological vocabulary.
       Their order is readable, but it does not assert a dated sequence
       in Siddhartha's life. */
    evolution: {
      mode: 'LIVING FIELD, NOT A CHRONOLOGY',
      stages: [
        {
          id: 'discover',
          title: 'DISCOVER',
          text: 'A QUESTION IS HELD LONG ENOUGH TO BECOME VISIBLE.',
          truth: TRUTH.DIRECTIVE,
          anchors: ['curiosity', 'origin-cse-question']
        },
        {
          id: 'experiment',
          title: 'EXPERIMENT',
          text: 'MAKE A SMALL SYSTEM TO SEE WHAT IT DOES.',
          truth: TRUTH.DIRECTIVE,
          anchors: ['lab-gravity', 'lab-liquid-sphere', 'lab-type']
        },
        {
          id: 'design',
          title: 'DESIGN',
          text: 'COMPOSITION GIVES THE SYSTEM A PLACE TO SPEAK.',
          truth: TRUTH.DIRECTIVE,
          anchors: ['petponks', 'creative-design', 'typography']
        },
        {
          id: 'code',
          title: 'CODE',
          text: 'BEHAVIOUR BECOMES MATERIAL.',
          truth: TRUTH.DIRECTIVE,
          anchors: ['orbit', 'cosmos-engine', 'vigil-88']
        },
        {
          id: 'build',
          title: 'BUILD',
          text: 'THE WORK RECEIVES A BODY, A RULE, AND A RESPONSE.',
          truth: TRUTH.DIRECTIVE,
          anchors: ['cosmos-engine', 'travelease', 'siddhartha-world']
        },
        {
          id: 'break',
          title: 'BREAK',
          text: 'WHAT IS NOT READY REMAINS DASHED.',
          truth: TRUTH.SYSTEM,
          anchors: ['orbit', 'spectra', 'evidence-ceilings']
        },
        {
          id: 'learn',
          title: 'LEARN',
          text: 'A CLAIM STOPS WHERE ITS EVIDENCE STOPS.',
          truth: TRUTH.SYSTEM,
          anchors: ['evidence-ceilings', 'current-open']
        },
        {
          id: 'rebuild',
          title: 'REBUILD',
          text: 'RETURNING CHANGES THE TRACE, NOT THE RECORD OF THE PAST.',
          truth: TRUTH.SYSTEM,
          anchors: ['visitor-trace', 'memory-reconstruction']
        },
        {
          id: 'integrate',
          title: 'INTEGRATE',
          text: 'DESIGN, CODE, AI, AND SYSTEMS SHARE A FIELD.',
          truth: TRUTH.DIRECTIVE,
          anchors: ['design', 'code-concept', 'ai', 'systems']
        },
        {
          id: 'create',
          title: 'CREATE',
          text: 'THE ENVIRONMENT BECOMES THE RECORD OF THE QUESTION.',
          truth: TRUTH.DIRECTIVE,
          anchors: ['siddhartha-world', 'visitor-trace', 'well']
        }
      ]
    },

    /* Each dossier holds only what its record can support. The fields
       absent from `layers` are intentionally filled by OPEN_LAYERS. */
    projects: [
      {
        id: 'orbit',
        title: 'ORBIT',
        state: 'IN DEVELOPMENT',
        stateTruth: TRUTH.RECORD,
        record: 'THE CURRENT RECORD CONFIRMS A FIVE-STAGE PIPELINE; RETRIEVAL AND CHAT DO NOT EXIST YET.',
        artifactRefs: ['retrieval', 'chat'],
        toolRefs: ['PYTHON'],
        layers: {
          question: {
            label: 'QUESTION',
            state: 'DIRECTIVE TERRITORY',
            text: 'HOW CAN AI, SOLAR PREDICTION, DATA, WEATHER, ENERGY, AND HUMAN DECISION-MAKING MEET WITHOUT HIDING UNCERTAINTY?',
            truth: TRUTH.DIRECTIVE
          },
          experiment: {
            label: 'EXPERIMENT',
            state: 'DOCUMENTED',
            text: 'PARSE → NORMALIZE → CHUNK → EMBED → INDEX.',
            truth: TRUTH.RECORD
          },
          system: {
            label: 'SYSTEM',
            state: 'DOCUMENTED BOUNDARY',
            text: 'THE PULSE REACHES INDEX. RETRIEVAL AND CHAT REMAIN UNLIT.',
            truth: TRUTH.RECORD
          },
          future: {
            label: 'FUTURE',
            state: 'OPEN QUESTION',
            text: 'WHAT WOULD MAKE A PREDICTION LEGIBLE, USEFUL, AND HONEST TO A PERSON?',
            truth: TRUTH.OPEN
          }
        }
      },
      {
        id: 'spectra',
        title: 'SPECTRA',
        state: 'NOT YET',
        stateTruth: TRUTH.RECORD,
        record: 'SPECTRA IS NAMED IN THE PROFILE RECORD, BUT NO PROJECT CODE WAS FOUND. THE CURRENT PIECE REPRESENTS IT AS AN INTENTION.',
        artifactRefs: ['spectra'],
        toolRefs: [],
        layers: {
          question: {
            label: 'QUESTION',
            state: 'DIRECTIVE TERRITORY',
            text: 'WHAT DOES A MACHINE NOTICE, MISS, OR MISTAKE WHEN IT LOOKS?',
            truth: TRUTH.DIRECTIVE
          },
          system: {
            label: 'CURRENT MARK',
            state: 'IN-PIECE REPRESENTATION',
            text: 'AN IMAGE, A TEXT, AND A SIGNAL APPROACH A LINE AND STOP SHORT.',
            truth: TRUTH.SYSTEM
          },
          future: {
            label: 'FUTURE',
            state: 'OPEN QUESTION',
            text: 'CAN MULTIMODAL PERCEPTION STAY AMBIGUOUS ENOUGH TO SHOW ITS LIMITS?',
            truth: TRUTH.OPEN
          }
        }
      },
      {
        id: 'synchro',
        title: 'SYNCHRO',
        state: 'OPEN RECORD',
        stateTruth: TRUTH.OPEN,
        record: 'THE EXPANSION DIRECTIVE NAMES SYNCHRO. THE CURRENT REPOSITORY PROVIDES NO PROJECT EVIDENCE.',
        artifactRefs: [],
        toolRefs: [],
        layers: {
          question: {
            label: 'QUESTION',
            state: 'DIRECTIVE TERRITORY',
            text: 'HOW DO STATE, LATENCY, CONCURRENCY, AND COORDINATION FEEL WHEN SYSTEMS MOVE TOGETHER?',
            truth: TRUTH.DIRECTIVE
          },
          future: {
            label: 'FUTURE',
            state: 'OPEN RECORD',
            text: 'ADD A VERIFIED PROJECT DESCRIPTION BEFORE THIS BECOMES A DOSSIER.',
            truth: TRUTH.OPEN
          }
        }
      },
      {
        id: 'aether',
        title: 'AETHER',
        state: 'OPEN RECORD',
        stateTruth: TRUTH.OPEN,
        record: 'THE EXPANSION DIRECTIVE NAMES AETHER. THE CURRENT REPOSITORY PROVIDES NO PROJECT EVIDENCE.',
        artifactRefs: [],
        toolRefs: [],
        layers: {
          question: {
            label: 'QUESTION',
            state: 'DIRECTIVE TERRITORY',
            text: 'WHAT HAPPENS WHEN CREATIVE COMPUTING, WEBGL, GENERATIVE SYSTEMS, AND SPATIAL INTERFACES BECOME AN ATMOSPHERE?',
            truth: TRUTH.DIRECTIVE
          },
          future: {
            label: 'FUTURE',
            state: 'OPEN RECORD',
            text: 'ADD A VERIFIED PROJECT DESCRIPTION BEFORE THIS BECOMES A DOSSIER.',
            truth: TRUTH.OPEN
          }
        }
      },
      {
        id: 'cosmos-engine',
        title: 'COSMOS ENGINE',
        state: 'DOCUMENTED ARTIFACT',
        stateTruth: TRUTH.RECORD,
        record: 'THE RECORD DESCRIBES A GRAVITY PLAYGROUND WITH A CUSTOM ENGINE FOR FORCES, VELOCITY, ORBITS, COLLISIONS, AND BODY GENERATION.',
        artifactRefs: ['workspace', 'controls', 'feedback'],
        toolRefs: ['HTML', 'CSS', 'JAVASCRIPT'],
        layers: {
          experiment: {
            label: 'EXPERIMENT',
            state: 'DOCUMENTED',
            text: 'A POINTER CAN ACT AS A MASS; PRESSING CREATES A BODY.',
            truth: TRUTH.RECORD
          },
          system: {
            label: 'SYSTEM',
            state: 'DOCUMENTED',
            text: 'FORCES, VELOCITY, ORBITS, COLLISIONS, AND BODY GENERATION. COLLISIONS MERGE WITH MOMENTUM CONSERVED.',
            truth: TRUTH.RECORD
          },
          visualLanguage: {
            label: 'ARCHIVE MARK',
            state: 'IN-PIECE REPRESENTATION',
            text: 'WORKSPACE / CONTROLS / SYSTEM FEEDBACK.',
            truth: TRUTH.SYSTEM
          }
        }
      },
      {
        id: 'travelease',
        title: 'TRAVELEASE',
        state: 'DOCUMENTED ARTIFACT',
        stateTruth: TRUTH.RECORD,
        record: 'THE RECORD SUPPORTS A LOCATION-BASED TREASURE-HUNT MECHANIC.',
        artifactRefs: ['discovery', 'loop', 'planning'],
        toolRefs: ['HTML', 'CSS', 'JAVASCRIPT'],
        layers: {
          experiment: {
            label: 'EXPERIMENT',
            state: 'DOCUMENTED',
            text: 'PLACES REVEAL THEMSELVES ONLY AS THE VISITOR APPROACHES.',
            truth: TRUTH.RECORD
          },
          system: {
            label: 'SYSTEM',
            state: 'DOCUMENTED',
            text: 'A LOCATION-BASED TREASURE-HUNT MECHANIC.',
            truth: TRUTH.RECORD
          },
          visualLanguage: {
            label: 'ARCHIVE MARK',
            state: 'IN-PIECE REPRESENTATION',
            text: 'DESTINATION DISCOVERY / EXPLORATION LOOP / PLANNING SUPPORT.',
            truth: TRUTH.SYSTEM
          }
        }
      },
      {
        id: 'petponks',
        title: 'PETPONKS',
        state: 'DOCUMENTED ARTIFACT',
        stateTruth: TRUTH.RECORD,
        record: 'THE RECORD SUPPORTS LOW- AND HIGH-FIDELITY WIREFRAMES. IT DOES NOT SUPPORT A CLAIM ABOUT THE LOGO ITSELF.',
        artifactRefs: ['brand', 'structure', 'language'],
        toolRefs: ['FIGMA', 'FRAMER'],
        layers: {
          experiment: {
            label: 'EXPERIMENT',
            state: 'DOCUMENTED',
            text: 'A WIREFRAME SHARPENS FROM ROUGH TO EXACT AS THE POINTER MOVES.',
            truth: TRUTH.SYSTEM
          },
          system: {
            label: 'SYSTEM',
            state: 'DOCUMENTED',
            text: 'LOW- AND HIGH-FIDELITY WIREFRAMES.',
            truth: TRUTH.RECORD
          },
          visualLanguage: {
            label: 'ARCHIVE MARK',
            state: 'CAREFUL REPRESENTATION',
            text: 'BRAND FOUNDATION / PLATFORM STRUCTURE / VISUAL LANGUAGE. THE MARK IS LEFT AS CONSTRUCTION GEOMETRY.',
            truth: TRUTH.SYSTEM
          }
        }
      },
      {
        id: 'vigil-88',
        title: 'VIGIL-88',
        state: 'DOCUMENTED ARTIFACT',
        stateTruth: TRUTH.RECORD,
        record: 'THE RECORD DESCRIBES A PYQT6 APP USING PYTORCH, TORCHVISION, AND RESNET-18 FOR IMAGE CLASSIFICATION.',
        artifactRefs: ['dashboard', 'pipeline', 'defense'],
        toolRefs: ['PYTHON', 'PYQT6', 'PYTORCH', 'TORCHVISION', 'RESNET-18'],
        layers: {
          experiment: {
            label: 'EXPERIMENT',
            state: 'DOCUMENTED',
            text: 'AN APERTURE OPENS, A PUPIL FOLLOWS, AND AN IMAGE RESOLVES OUT OF NOISE.',
            truth: TRUTH.SYSTEM
          },
          system: {
            label: 'SYSTEM',
            state: 'DOCUMENTED',
            text: 'IMAGE CLASSIFICATION IN A PYQT6 APP USING PYTORCH / TORCHVISION / RESNET-18.',
            truth: TRUTH.RECORD
          },
          visualLanguage: {
            label: 'ARCHIVE MARK',
            state: 'IN-PIECE REPRESENTATION',
            text: 'MONITORING DASHBOARD / COMPUTER-VISION PIPELINE / DIGITAL-DEFENSE IDENTITY.',
            truth: TRUTH.SYSTEM
          }
        }
      },
      {
        id: 'creative-design',
        title: 'CREATIVE DESIGN COLLECTION',
        state: 'DOCUMENTED ARTIFACT',
        stateTruth: TRUTH.RECORD,
        record: 'THE ARCHIVE RECORDS LOGO AND IDENTITY EXPLORATIONS, POSTERS AND CAMPAIGN ASSETS, AND TYPOGRAPHY AND COMPOSITION.',
        artifactRefs: ['logos', 'posters', 'typo'],
        toolRefs: [],
        layers: {
          experiment: {
            label: 'EXPERIMENT',
            state: 'DOCUMENTED',
            text: 'LOGO AND IDENTITY EXPLORATIONS / POSTERS AND CAMPAIGN ASSETS / TYPOGRAPHY AND COMPOSITION.',
            truth: TRUTH.RECORD
          }
        }
      },
      {
        id: 'helios',
        title: 'HELIOS',
        state: 'IN DEVELOPMENT',
        stateTruth: TRUTH.RECORD,
        record: 'THE RECORD NAMES IRRADIANCE FORECASTING, A CLEAR-SKY INDEX, AND CALIBRATED PREDICTION INTERVALS.',
        artifactRefs: [],
        toolRefs: [],
        layers: {
          experiment: {
            label: 'EXPERIMENT',
            state: 'DOCUMENTED',
            text: 'A CLEAR-SKY CURVE, A MODELLED FORECAST, OBSERVED POINTS, AND A HATCHED UNCERTAINTY BAND.',
            truth: TRUTH.SYSTEM
          },
          system: {
            label: 'SYSTEM',
            state: 'DOCUMENTED',
            text: 'IRRADIANCE FORECASTING / CLEAR-SKY INDEX / CALIBRATED PREDICTION INTERVALS.',
            truth: TRUTH.RECORD
          }
        }
      }
    ],

    /* These are studies, not polished case studies. They answer the
       directive's request for a laboratory without inventing outcomes. */
    lab: {
      mode: 'SPECIMENS, TESTS, AND UNFINISHED FORMS',
      studies: [
        {
          id: 'lab-gravity',
          title: 'GRAVITY STUDY',
          state: 'DOCUMENTED',
          question: 'WHAT DOES INTERACTION FEEL LIKE WHEN THE POINTER HAS MASS?',
          material: 'FORCES / VELOCITY / ORBITS / COLLISIONS / BODY GENERATION.',
          linked: ['cosmos-engine', 'systems'],
          truth: TRUTH.RECORD
        },
        {
          id: 'lab-solar',
          title: 'SOLAR FORECAST STUDY',
          state: 'IN DEVELOPMENT',
          question: 'HOW CAN A FORECAST SHOW WHAT IT DOES NOT KNOW?',
          material: 'CLEAR-SKY CURVE / MODELLED FORECAST / OBSERVATIONS / UNCERTAINTY BAND.',
          linked: ['helios', 'orbit'],
          truth: TRUTH.RECORD
        },
        {
          id: 'lab-liquid-sphere',
          title: 'LIQUID SPHERE',
          state: 'DOCUMENTED',
          question: 'WHAT CAN A FORM REVEAL WHEN THE POINTER CAN DISTURB IT?',
          material: 'A MORPHING WEBGL WIREFRAME FROM THE EARLIER WEBGL PORTFOLIO.',
          linked: ['3d', 'experiments'],
          truth: TRUTH.RECORD
        },
        {
          id: 'lab-type',
          title: 'TYPE CONSTRUCTION',
          state: 'DOCUMENTED',
          question: 'WHEN DOES A LETTER BECOME A MEASUREMENT?',
          material: 'A LETTER CONSTRUCTED FROM A CIRCLE AND RULES; ITS BOWL WIDTH IS LIVE.',
          linked: ['typography', 'design'],
          truth: TRUTH.SYSTEM
        },
        {
          id: 'lab-orbit-pipeline',
          title: 'PIPELINE THRESHOLD',
          state: 'DOCUMENTED BOUNDARY',
          question: 'WHAT SHOULD STAY VISIBLE WHEN A SYSTEM IS INCOMPLETE?',
          material: 'PARSE / NORMALIZE / CHUNK / EMBED / INDEX; RETRIEVAL AND CHAT ARE DASHED.',
          linked: ['orbit', 'evidence-ceilings'],
          truth: TRUTH.RECORD
        },
        {
          id: 'lab-spectra-threshold',
          title: 'PERCEPTION THRESHOLD',
          state: 'NOT YET',
          question: 'WHERE DOES OBSERVATION STOP?',
          material: 'IMAGE / TEXT / SIGNAL APPROACH A LINE AND STOP SHORT.',
          linked: ['spectra', 'ai'],
          truth: TRUTH.SYSTEM
        },
        {
          id: 'memory-reconstruction',
          title: 'MEMORY RECONSTRUCTION',
          state: 'DOCUMENTED',
          question: 'WHAT RETURNS WHEN A VISIT IS REMEMBERED IMPERFECTLY?',
          material: 'LOCAL VISIT STATE DECAYS, JITTERS, AND RETAINS THE SHAPE OF A TRACE.',
          linked: ['visitor-trace', 'siddhartha-world'],
          truth: TRUTH.SYSTEM
        }
      ]
    },

    /* These are the work's declared principles. The DIRECTIVE marker
       keeps a clear difference between authored intention and evidence
       about a person's past. */
    principles: [
      {
        id: 'meaning',
        text: 'MEANING SETS THE FORM.',
        note: 'EVERY PIXEL, TRANSITION, AND DISTORTION MUST EARN ITS PLACE.',
        truth: TRUTH.DIRECTIVE
      },
      {
        id: 'composition',
        text: 'COMPOSITION BEFORE SPECTACLE.',
        note: 'THE DIRECTIVE PREFERS BETTER COMPOSITION TO MORE EFFECTS.',
        truth: TRUTH.DIRECTIVE
      },
      {
        id: 'motion-purpose',
        text: 'MOTION HAS A CAUSE.',
        note: 'MOTION SHOULD RESPOND TO CONTEXT, VELOCITY, PROXIMITY, DEPTH, OR NARRATIVE STATE.',
        truth: TRUTH.DIRECTIVE
      },
      {
        id: 'stillness',
        text: 'STILLNESS IS AN INTERFACE.',
        note: 'THE NAME AND ARCHIVE RESOLVE WHEN ATTENTION RESTS.',
        truth: TRUTH.SYSTEM
      },
      {
        id: 'evidence',
        text: 'EVIDENCE SETS THE RESOLUTION.',
        note: 'UNSUPPORTED CLAIMS STAY INCOMPLETE OR DASHED.',
        truth: TRUTH.SYSTEM
      },
      {
        id: 'system-expression',
        text: 'THE SYSTEM CARRIES THE EXPRESSION.',
        note: 'THE WORLD IS ASKED TO EXPRESS IDENTITY THROUGH BEHAVIOUR, NOT A LIST OF FACTS.',
        truth: TRUTH.DIRECTIVE
      },
      {
        id: 'technology-expression',
        text: 'TECHNOLOGY SERVES EXPRESSION.',
        note: 'SPATIAL AND WEBGL WORK ARE REQUESTED ONLY WHEN THEY MAKE A MEANINGFUL MOMENT POSSIBLE.',
        truth: TRUTH.DIRECTIVE
      },
      {
        id: 'visitor-trace-principle',
        text: 'THE VISITOR LEAVES A TRACE.',
        note: 'RETURNING VISITS CHANGE THE LOCAL MEMORY OF THE WORLD.',
        truth: TRUTH.SYSTEM
      },
      {
        id: 'unfinished',
        text: 'THE UNFINISHED STAYS VISIBLE.',
        note: 'FAILURE, ABSENCE, AND NOT YET ARE MATERIAL, NOT EMBARRASSMENT.',
        truth: TRUTH.DIRECTIVE
      }
    ],

    /* CURRENTLY is deliberately modest. One declared state is known;
       all other fields are visible editing slots, never invented status. */
    current: {
      title: 'CURRENTLY',
      updateRule: 'REPLACE OPEN SLOTS WITH A VERIFIED, DATED AUTHOR STATE.',
      entries: [
        {
          id: 'current-building-world',
          kind: 'BUILDING',
          text: 'SIDDHARTHA — THIS INTERACTIVE WORLD.',
          state: 'AUTHOR-DECLARED',
          truth: TRUTH.DIRECTIVE
        },
        {
          id: 'current-learning',
          kind: 'LEARNING',
          text: 'OPEN — ADD A VERIFIED CURRENT PRACTICE.',
          state: 'AWAITING AUTHOR INPUT',
          truth: TRUTH.OPEN
        },
        {
          id: 'current-exploring',
          kind: 'EXPLORING',
          text: 'OPEN — ADD A VERIFIED CURRENT QUESTION.',
          state: 'AWAITING AUTHOR INPUT',
          truth: TRUTH.OPEN
        },
        {
          id: 'current-questioning',
          kind: 'QUESTIONING',
          text: 'OPEN — ADD A VERIFIED CURRENT UNCERTAINTY.',
          state: 'AWAITING AUTHOR INPUT',
          truth: TRUTH.OPEN
        }
      ]
    },

    /* NEXT names vectors and questions, never promises or achievements. */
    next: {
      title: 'NEXT',
      mode: 'OPEN VECTORS',
      entries: [
        {
          id: 'next-origin',
          text: 'WHAT VERIFIED ORIGIN MATERIAL SHOULD ENTER THE EMPTY SHEET?',
          linked: ['origin-cse-question'],
          truth: TRUTH.OPEN
        },
        {
          id: 'next-orbit',
          text: 'WHAT WOULD LET ORBIT TURN A FORECAST INTO A HUMAN DECISION WITHOUT FALSE CERTAINTY?',
          linked: ['orbit', 'helios'],
          truth: TRUTH.DIRECTIVE
        },
        {
          id: 'next-spectra',
          text: 'WHAT SHOULD SPECTRA REVEAL ABOUT THE GAP BETWEEN HUMAN AND MACHINE OBSERVATION?',
          linked: ['spectra', 'ai'],
          truth: TRUTH.DIRECTIVE
        },
        {
          id: 'next-synchro',
          text: 'CAN SYNCHRO MAKE LATENCY, CONCURRENCY, AND COORDINATION FEEL PHYSICAL?',
          linked: ['synchro', 'systems'],
          truth: TRUTH.DIRECTIVE
        },
        {
          id: 'next-aether',
          text: 'CAN AETHER BECOME A LABORATORY FOR PROCEDURAL ATMOSPHERE AND SPATIAL INTERFACES?',
          linked: ['aether', '3d'],
          truth: TRUTH.DIRECTIVE
        },
        {
          id: 'next-return',
          text: 'HOW SHOULD A RETURNING TRACE CHANGE THE WORLD WITHOUT PRETENDING TO KNOW ITS VISITOR?',
          linked: ['visitor-trace', 'memory-reconstruction'],
          truth: TRUTH.OPEN
        }
      ]
    },

    /* The graph is a map of evidence, concepts, and open proposals.
       Solid edges should be RECORD or SYSTEM; DIRECTIVE and OPEN edges
       should use a visibly different treatment in any future renderer. */
    graph: {
      nodes: [
        { id: 'siddhartha-world', label: 'SIDDHARTHA', type: 'WORLD', truth: TRUTH.SYSTEM },
        { id: 'vantage', label: 'VANTAGE', type: 'SYSTEM', truth: TRUTH.SYSTEM },
        { id: 'well', label: 'WELL', type: 'SYSTEM', truth: TRUTH.SYSTEM },
        { id: 'visitor-trace', label: 'VISITOR TRACE', type: 'SYSTEM', truth: TRUTH.SYSTEM },
        { id: 'evidence-ceilings', label: 'EVIDENCE CEILINGS', type: 'SYSTEM', truth: TRUTH.SYSTEM },
        { id: 'design', label: 'DESIGN', type: 'CONCEPT', truth: TRUTH.DIRECTIVE },
        { id: 'code-concept', label: 'CODE', type: 'CONCEPT', truth: TRUTH.DIRECTIVE },
        { id: 'ai', label: 'AI', type: 'CONCEPT', truth: TRUTH.DIRECTIVE },
        { id: 'systems', label: 'SYSTEMS', type: 'CONCEPT', truth: TRUTH.DIRECTIVE },
        { id: 'curiosity', label: 'CURIOSITY', type: 'CONCEPT', truth: TRUTH.DIRECTIVE },
        { id: '3d', label: '3D', type: 'CONCEPT', truth: TRUTH.DIRECTIVE },
        { id: 'experiments', label: 'EXPERIMENTS', type: 'CONCEPT', truth: TRUTH.DIRECTIVE },
        { id: 'typography', label: 'TYPOGRAPHY', type: 'STUDY', truth: TRUTH.SYSTEM },
        { id: 'orbit', label: 'ORBIT', type: 'DOSSIER', truth: TRUTH.RECORD },
        { id: 'spectra', label: 'SPECTRA', type: 'DOSSIER', truth: TRUTH.RECORD },
        { id: 'synchro', label: 'SYNCHRO', type: 'DOSSIER', truth: TRUTH.OPEN },
        { id: 'aether', label: 'AETHER', type: 'DOSSIER', truth: TRUTH.OPEN },
        { id: 'cosmos-engine', label: 'COSMOS ENGINE', type: 'DOSSIER', truth: TRUTH.RECORD },
        { id: 'travelease', label: 'TRAVELEASE', type: 'DOSSIER', truth: TRUTH.RECORD },
        { id: 'petponks', label: 'PETPONKS', type: 'DOSSIER', truth: TRUTH.RECORD },
        { id: 'vigil-88', label: 'VIGIL-88', type: 'DOSSIER', truth: TRUTH.RECORD },
        { id: 'creative-design', label: 'CREATIVE DESIGN', type: 'DOSSIER', truth: TRUTH.RECORD },
        { id: 'helios', label: 'HELIOS', type: 'DOSSIER', truth: TRUTH.RECORD }
      ],
      edges: [
        { from: 'siddhartha-world', to: 'vantage', relation: 'RESOLVES THROUGH', truth: TRUTH.SYSTEM },
        { from: 'siddhartha-world', to: 'well', relation: 'DESCENDS INTO', truth: TRUTH.SYSTEM },
        { from: 'siddhartha-world', to: 'visitor-trace', relation: 'REMEMBERS LOCALLY', truth: TRUTH.SYSTEM },
        { from: 'siddhartha-world', to: 'evidence-ceilings', relation: 'LIMITS CLAIMS BY', truth: TRUTH.SYSTEM },
        { from: 'cosmos-engine', to: 'systems', relation: 'WORKS WITH', truth: TRUTH.RECORD },
        { from: 'cosmos-engine', to: 'code-concept', relation: 'USES', truth: TRUTH.RECORD },
        { from: 'travelease', to: 'curiosity', relation: 'REVEALS THROUGH APPROACH', truth: TRUTH.RECORD },
        { from: 'petponks', to: 'design', relation: 'EXPLORES THROUGH WIREFRAMES', truth: TRUTH.RECORD },
        { from: 'vigil-88', to: 'ai', relation: 'USES IMAGE CLASSIFICATION', truth: TRUTH.RECORD },
        { from: 'creative-design', to: 'design', relation: 'CONTAINS EXPLORATIONS OF', truth: TRUTH.RECORD },
        { from: 'creative-design', to: 'typography', relation: 'CONTAINS', truth: TRUTH.RECORD },
        { from: 'helios', to: 'experiments', relation: 'HOLDS A FORECAST STUDY', truth: TRUTH.RECORD },
        { from: 'orbit', to: 'ai', relation: 'IS FRAMED BY', truth: TRUTH.RECORD },
        { from: 'orbit', to: 'helios', relation: 'SHARES AN OPEN QUESTION ABOUT FORECASTS', truth: TRUTH.DIRECTIVE },
        { from: 'spectra', to: 'ai', relation: 'ASKS ABOUT PERCEPTION', truth: TRUTH.DIRECTIVE },
        { from: 'synchro', to: 'systems', relation: 'PROPOSES QUESTIONS ABOUT SYNCHRONIZATION', truth: TRUTH.DIRECTIVE },
        { from: 'aether', to: '3d', relation: 'PROPOSES A SPATIAL LABORATORY', truth: TRUTH.DIRECTIVE },
        { from: 'design', to: 'code-concept', relation: 'SHARES A FIELD WITH', truth: TRUTH.DIRECTIVE },
        { from: 'ai', to: 'systems', relation: 'SHARES A FIELD WITH', truth: TRUTH.DIRECTIVE },
        { from: 'visitor-trace', to: 'well', relation: 'IS STORED AS RINGS', truth: TRUTH.SYSTEM }
      ]
    }
  };

  function indexById(items) {
    var out = {}, i;
    for (i = 0; i < items.length; i++) out[items[i].id] = items[i];
    return out;
  }

  /* Small read helpers keep later rendering modules declarative while
     leaving all authorable content above in ordinary arrays and objects. */
  DATA.projectById = indexById(DATA.projects);
  DATA.labById = indexById(DATA.lab.studies);
  DATA.principleById = indexById(DATA.principles);
  DATA.nodeById = indexById(DATA.graph.nodes);
  DATA.dossierLayer = function (projectId, layerId) {
    var project = DATA.projectById[projectId];
    if (!project || DOSSIER_LAYERS.indexOf(layerId) === -1) return null;
    return project.layers[layerId] || OPEN_LAYERS[layerId];
  };

  SID.ContentData = DATA;
})();
