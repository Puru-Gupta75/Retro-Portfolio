/**
 * scripts/seedFirestore.mjs
 *
 * Seeds all static site content into Firestore under the `siteConfig` collection.
 * Run once (or re-run to overwrite) with:
 *   node scripts/seedFirestore.mjs
 *
 * Requires FIREBASE_SERVICE_ACCOUNT in .env.local
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local manually (no dotenv dep needed) ──────────────────────────
const envPath = resolve(__dirname, '../.env.local');
const envLines = readFileSync(envPath, 'utf-8').split('\n');
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  // Strip surrounding single quotes (used for JSON values)
  if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
  process.env[key] = val;
}

// ── Firebase Admin init ───────────────────────────────────────────────────────
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const IDENTITY = {
  // Hero (home page)
  systemName: 'PURU_GUPTA',
  systemStatus: 'SYSTEM_ONLINE',
  systemTagline: 'CREATIVE_CODE_HANDSHAKE: IN_PROGRESS',

  // Profile page identity panel
  profileSystemId: 'USER_772090',
  profileRole: 'FULL_STACK_ENGINEER',
  profileTagline: 'OPTIMIZING_HUMAN_COMPUTER_INTERACTIONS',
  profileStatus: 'ACTIVE_NODE',
};

const PAGE_CONTENT = {
  home: {
    title: 'HOME',
    description: 'PRIMARY INTERFACE :: ROOT ACCESS GRANTED. SELECT MODULE TO CONTINUE.',
  },
  profile: {
    title: 'PROFILE',
    description: 'BIOMETRIC AND PROFESSIONAL PROFILE // SYSTEM_CORE_DATA',
  },
  archive: {
    title: 'ARCHIVE',
    description: 'CENTRAL REPOSITORY OF VERSION-CONTROLLED NODES AND SYSTEM ASSETS.',
  },
  uplink: {
    title: 'UPLINK',
    description: 'EXTERNAL COMMUNICATION CHANNELS :: ESTABLISHING SECURE DATA HANDSHAKE.',
  },
  system: {
    title: 'SYSTEM',
    description:
      'RUNTIME DIAGNOSTICS :: LIVE PERFORMANCE METRICS, EVENT LOGS, AND SYSTEM CONTROLS.',
  },
  admin: {
    title: 'ADMIN',
    description:
      'CONTROL CENTER :: SECURE ADMINISTRATIVE ACCESS FOR MANUAL DATA OVERRIDES AND SYSTEM SETTINGS.',
  },
};

const SYSTEM_STATS = [
  { label: 'MODULES', value: '06_ACTIVE' },
  { label: 'STATUS', value: 'OPERATIONAL' },
  { label: 'SECURITY', value: 'LEVEL_4' },
  { label: 'SYNC', value: 'STABLE' },
  { label: 'NODES', value: '01_LOCAL' },
];

const NAV_ITEMS = [
  { id: '01', label: 'HOME', path: '/' },
  { id: '02', label: 'PROFILE', path: '/profile' },
  { id: '03', label: 'ARCHIVE', path: '/archive' },
  { id: '04', label: 'UPLINK', path: '/uplink' },
  { id: '05', label: 'SYSTEM', path: '/system' },
];

const SKILLS = {
  frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Three.js', 'SCSS'],
  backend: ['Node.js', 'Go', 'Rust', 'FastAPI', 'gRPC', 'GraphQL'],
  data: ['PostgreSQL', 'MongoDB', 'Redis', 'PyTorch', 'NumPy', 'Polars'],
  tools: ['Docker', 'Kubernetes', 'Git', 'Vercel', 'AWS', 'Linux_zsh'],
};

const EXPERIENCE = [
  {
    year: '2025',
    role: 'LEAD_DEV @ NEPTUNE_CORP',
    description:
      'Orchestrating localized LLM edge runners and real-time DSP pipelines.',
  },
  {
    year: '2024',
    role: 'JUNIOR_ENGINEER @ CYBER_SEC',
    description:
      'Optimized distributed ledger consistency protocols and P2P validation nodes.',
  },
  {
    year: '2023',
    role: 'INTERN @ DATA_STREAM',
    description:
      'Assisted in streamlining high-throughput gRPC communication pipelines.',
  },
];

const EDUCATION = [
  {
    degree: 'B.TECH COMPUTER SCIENCE',
    institution: 'TECH_INSTITUTE_OF_DELHI',
    year: '2021-2025',
  },
  {
    degree: 'ADVANCED_MATHEMATICS_CERT',
    institution: 'QUANTUM_ACADEMY',
    year: '2020',
  },
];

const ACHIEVEMENTS = [
  '1ST_PLACE @ GLOBAL_SYSTEMS_HACKATHON',
  'TOP_CONTRIBUTOR @ CORE_KERNEL_OPTIMIZER',
  'RESEARCH_FELLOW @ AI_ACCELERATOR',
  'DEPLOYED_42_OPEN_SOURCE_MODULES',
];

const UPLINK = {
  commands: [
    { cmd: 'GITHUB', label: 'OPEN_G_HUB_PROFILE', url: 'https://github.com/PuruGupta' },
    {
      cmd: 'LINKEDIN',
      label: 'LINK_TO_PROFESSIONAL_NODE',
      url: 'https://linkedin.com/in/PuruGupta',
    },
    { cmd: 'EMAIL', label: 'COPY_CONTACT_STRING', action: 'COPY', value: 'puru@system.local' },
    { cmd: 'RESUME', label: 'FETCH_IDENTITY_DOC', url: '/resume.pdf' },
  ],
  statusMsgs: [
    '[INIT] HANDSHAKE_ESTABLISHED... OK',
    '[DATA] PACKET_STAGING_COMPLETE',
    '[SEC] ENCRYPTING_VIA_AES_256',
    '[NET] UPLOADING_TO_ORBITAL_NODE',
    '[OK] TRANSMISSION_COMMITTED',
  ],
  errors: [
    'ERR_VOID: PACKET_CONTENT_EMPTY',
    'ERR_AUTH: HANDSHAKE_TIMEOUT',
    'ERR_NET: UPLINK_INTERRUPTED_BY_PEER',
  ],
};

const LAB_MODULES = [
  {
    id: 'LAB-01',
    name: 'SENTIMENT_NODE',
    type: 'ANALYZER',
    status: 'TESTING',
    description: 'Neural mapping of text input to frequency resonance.',
  },
  {
    id: 'LAB-02',
    name: 'FLUX_VISUALIZER',
    type: 'DATA_VISUAL',
    status: 'PROTOTYPE',
    description: 'Visual stream of pseudo-random entropy pool distribution.',
  },
  {
    id: 'LAB-03',
    name: 'KERNEL_STRESS',
    type: 'SIMULATOR',
    status: 'EXPERIMENTAL',
    description: 'Simulated resource allocation and task scheduling cycles.',
  },
];

// Projects — seeded as fallback; real data comes from GitHub sync
const PROJECTS = [
  {
    id: 'seed-0x001',
    name: 'NEURAL_RESONANCE',
    status: 'ACTIVE',
    category: 'AI',
    description: 'Real-time audio processing using localized LLMs for sentiment mapping.',
    longDescription:
      'A sophisticated audio-to-frequency engine that utilizes localized Large Language Models to analyze sentiment in real-time and map it to specific hardware-driven resonance frequencies.',
    techStack: {
      frontend: ['React', 'Three.js', 'Tailwind'],
      backend: ['FastAPI', 'PyTorch', 'Python'],
      database: ['Redis'],
      other: [],
    },
    features: [
      'LOCAL_INFERENCE_ENGINE',
      'ZERO_LATENCY_HANDSHAKE',
      'SPECTRAL_ANALYSIS_MOD',
      'HASH_STORAGE_PROTOCOL',
    ],
    systemFlow:
      'AUDIO_IN -> DSP_PROCESS -> NEURAL_CORE -> RESONANCE_GATE -> FREQUENCY_OUT',
    // Manual admin fields
    displayName: 'Neural Resonance',
    customDesc: '',
    tags: ['AI', 'AUDIO', 'LLM'],
    isFeatured: true,
    isHidden: false,
    sortOrder: 1,
    // GitHub stub fields (sync will overwrite these)
    stars: 0,
    forks: 0,
    language: 'Python',
    topics: [],
    url: '',
    lastUpdated: new Date().toISOString(),
    priorityScore: 0,
  },
  {
    id: 'seed-0x002',
    name: 'SHADOW_REGISTRY',
    status: 'DEPLOYED',
    category: 'SYSTEM',
    description:
      'Distributed immutable ledger for hardware asset tracking across nodes.',
    longDescription:
      'An industrial-grade asset registry leveraging a custom distributed ledger protocol to ensure absolute consistency and immutability of hardware inventory across global nodes.',
    techStack: {
      frontend: ['Next.js', 'TypeScript'],
      backend: ['Go', 'Rust', 'gRPC'],
      database: ['PostgreSQL'],
      other: [],
    },
    features: [
      'AES-256_GCM_ENCRYPTION',
      'BYZANTINE_FAULT_TOLERANCE',
      'SYSTEM_EXPOSURE_API',
      'REALTIME_METRIC_HUD',
    ],
    systemFlow:
      'REQUEST -> P2P_VALIDATION -> CONSENSUS_STAGING -> LEDGER_COMMIT -> BROADCAST',
    displayName: 'Shadow Registry',
    customDesc: '',
    tags: ['SYSTEM', 'DISTRIBUTED', 'LEDGER'],
    isFeatured: false,
    isHidden: false,
    sortOrder: 2,
    stars: 0,
    forks: 0,
    language: 'Go',
    topics: [],
    url: '',
    lastUpdated: new Date().toISOString(),
    priorityScore: 0,
  },
  {
    id: 'seed-0x003',
    name: 'VORTEX_DB',
    status: 'PROTOTYPE',
    category: 'DATA',
    description:
      'High-throughput temporal database for CRT-style visual stream logging.',
    longDescription:
      'A specialized temporal database architecture optimized for high-velocity streaming of screen-space artifacts and legacy visual state data in real-time environments.',
    techStack: {
      frontend: ['SolidJS', 'WebGL'],
      backend: ['Rust', 'Node.js'],
      database: [],
      other: ['Docker', 'Kubernetes'],
    },
    features: [
      'STREAM_COMPRESSION_L4',
      'TIMELINE_INDEX_OPTIMIZER',
      'SNAPSHOT_RECOVERY_MOD',
      'CLI_MANAGEMENT_SHELL',
    ],
    systemFlow:
      'DATA_STREAM -> BUFFER_POOL -> TIMELINE_INDEXER -> PERSISTENCE_LAYER -> QUERY_API',
    displayName: 'Vortex DB',
    customDesc: '',
    tags: ['DATA', 'DATABASE', 'STREAMING'],
    isFeatured: false,
    isHidden: false,
    sortOrder: 3,
    stars: 0,
    forks: 0,
    language: 'Rust',
    topics: [],
    url: '',
    lastUpdated: new Date().toISOString(),
    priorityScore: 0,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 SEEDING FIRESTORE...\n');

  const siteConfig = db.collection('siteConfig');

  // 1. identity
  await siteConfig.doc('identity').set({ ...IDENTITY, pageContent: PAGE_CONTENT });
  console.log('  ✓ siteConfig/identity');

  // 2. navigation
  await siteConfig.doc('navigation').set({ items: NAV_ITEMS });
  console.log('  ✓ siteConfig/navigation');

  // 3. systemStats
  await siteConfig.doc('systemStats').set({ stats: SYSTEM_STATS });
  console.log('  ✓ siteConfig/systemStats');

  // 4. skills
  await siteConfig.doc('skills').set(SKILLS);
  console.log('  ✓ siteConfig/skills');

  // 5. experience
  await siteConfig.doc('experience').set({ entries: EXPERIENCE });
  console.log('  ✓ siteConfig/experience');

  // 6. education
  await siteConfig.doc('education').set({ entries: EDUCATION });
  console.log('  ✓ siteConfig/education');

  // 7. achievements
  await siteConfig.doc('achievements').set({ items: ACHIEVEMENTS });
  console.log('  ✓ siteConfig/achievements');

  // 8. uplink
  await siteConfig.doc('uplink').set(UPLINK);
  console.log('  ✓ siteConfig/uplink');

  // 9. labModules
  await siteConfig.doc('labModules').set({ modules: LAB_MODULES });
  console.log('  ✓ siteConfig/labModules');

  // 10. seed projects (only if collection is empty — don't overwrite real sync data)
  const existingProjects = await db.collection('projects').limit(1).get();
  if (existingProjects.empty) {
    for (const project of PROJECTS) {
      await db.collection('projects').doc(project.id).set(project);
    }
    console.log(`  ✓ projects (seeded ${PROJECTS.length} entries)`);
  } else {
    console.log('  ↷ projects (skipped — collection already has data)');
  }

  console.log('\n✅ SEED COMPLETE\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ SEED FAILED:', err);
  process.exit(1);
});
