/**
 * CampusFix AI Categorization & Priority Engine
 * Analyzes complaint descriptions using multi-factor NLP heuristics,
 * hazard assessment, and keyword-semantic matching.
 */

const CATEGORY_RULES = {
  'Electrical & Power': {
    department: 'Electrical Maintenance & Power Wing',
    keywords: [
      'electric', 'electricity', 'wire', 'wiring', 'spark', 'shock', 'short circuit',
      'switch', 'switchboard', 'socket', 'outlet', 'plug', 'breaker', 'fuse',
      'light', 'lighting', 'bulb', 'tube', 'led', 'tube light', 'dark', 'blackout',
      'fan', 'ceiling fan', 'ac', 'air conditioner', 'cooling', 'hvac', 'voltage',
      'power cut', 'generator', 'transformer', 'tripped', 'phase'
    ],
    urgentKeywords: ['spark', 'shock', 'smoke', 'fire', 'burning smell', 'blast', 'flame', 'live wire']
  },
  'Plumbing & Water': {
    department: 'Water Supply & Plumbing Services',
    keywords: [
      'water', 'leak', 'leaking', 'leakage', 'pipe', 'pipeline', 'flood', 'flooding',
      'tap', 'faucet', 'washroom', 'toilet', 'flush', 'flush tank', 'drain', 'drainage',
      'sink', 'sewage', 'sewer', 'drinking water', 'water cooler', 'ro filter',
      'geyser', 'hot water', 'overflow', 'overflowing', 'restroom', 'urinal', 'commode',
      'clog', 'clogged', 'choked', 'choke', 'basin', 'water pressure', 'dry tap'
    ],
    urgentKeywords: ['major flood', 'burst pipe', 'sewer backup', 'contamination', 'drinking water poisoned', 'flooding lab']
  },
  'Infrastructure & Furniture': {
    department: 'Civil Works & Estate Maintenance',
    keywords: [
      'bench', 'desk', 'chair', 'table', 'seat', 'furniture', 'door', 'door handle',
      'hinge', 'lock', 'latch', 'window', 'windowpane', 'glass', 'broken glass',
      'crack', 'wall crack', 'ceiling', 'ceiling plaster', 'paint', 'plaster',
      'stairs', 'staircase', 'railing', 'handrail', 'roof', 'tile', 'tiles',
      'lift', 'elevator', 'whiteboard', 'blackboard', 'podium', 'floor', 'pothole',
      'concrete', 'pathway', 'shed', 'door frame', 'balcony'
    ],
    urgentKeywords: ['ceiling collapse', 'falling concrete', 'broken glass shard', 'stuck in lift', 'elevator freefall', 'stair collapse']
  },
  'IT & Campus Wi-Fi': {
    department: 'Campus IT & Network Infrastructure Centre',
    keywords: [
      'wifi', 'wi-fi', 'internet', 'network', 'ethernet', 'router', 'access point',
      'lan', 'connection', 'ping', 'slow internet', 'lab pc', 'computer', 'desktop',
      'monitor', 'keyboard', 'mouse', 'projector', 'hdmi', 'smart board', 'av setup',
      'audio', 'mic', 'microphone', 'speaker', 'sound system', 'printer', 'portal',
      'login error', 'server down', 'broadband', 'cable cut'
    ],
    urgentKeywords: ['server fire', 'exam hall projector down', 'campus wide outage', 'exam lab network failure']
  },
  'Cleanliness & Sanitation': {
    department: 'Campus Hygiene & Sanitation Department',
    keywords: [
      'garbage', 'trash', 'dustbin', 'waste', 'litter', 'dirty', 'stink', 'smell',
      'foul smell', 'pest', 'cockroach', 'rat', 'mice', 'mosquito', 'cleaning',
      'sweep', 'sweeping', 'mop', 'mopping', 'mold', 'fungus', 'food waste',
      'hygiene', 'dusty', 'stains', 'dump', 'sanitary', 'unclean', 'spider web'
    ],
    urgentKeywords: ['toxic waste', 'severe infestation', 'hazardous spill', 'medical waste']
  },
  'Safety & Security': {
    department: 'Campus Security & Emergency Response',
    keywords: [
      'safety', 'hazard', 'danger', 'dangerous', 'emergency', 'security', 'guard',
      'theft', 'stolen', 'robbery', 'cctv', 'camera', 'surveillance', 'fire extinguisher',
      'fire alarm', 'smoke detector', 'harassment', 'dark spot', 'trespasser',
      'intruder', 'stray dog', 'monkey', 'snake', 'broken lock', 'unauthorized entry',
      'emergency exit blocked', 'main gate'
    ],
    urgentKeywords: ['fire', 'intruder', 'assault', 'snake bite', 'gas leak', 'weapon', 'emergency exit locked']
  },
  'Hostel & Mess': {
    department: 'Hostel Administration & Dining Services',
    keywords: [
      'hostel', 'dorm', 'dormitory', 'room', 'bed', 'mattress', 'almirah', 'wardrobe',
      'cupboard', 'mess', 'dining', 'food', 'meal', 'breakfast', 'lunch', 'dinner',
      'caterer', 'kitchen', 'laundry', 'washing machine', 'dryer', 'warden', 'insects in food',
      'raw food', 'water heater', 'hostel mess', 'drinking water cooler hostel'
    ],
    urgentKeywords: ['food poisoning', 'contaminated food', 'hostel fire', 'gas cylinder leak']
  },
  'Library & Labs': {
    department: 'Academic Facilities & Laboratory Administration',
    keywords: [
      'library', 'reading room', 'study cubicle', 'bookshelf', 'book', 'librarian',
      'barcode', 'lab', 'laboratory', 'chemistry lab', 'physics lab', 'chemical',
      'fume hood', 'bunsen burner', 'microscope', 'centrifuge', 'apparatus',
      'lab equipment', 'glassware', 'specimen', 'silent room', 'library ac'
    ],
    urgentKeywords: ['chemical explosion', 'acid burn', 'toxic gas release', 'fire in lab']
  }
};

const HIGH_PRIORITY_TERMS = [
  'exam', 'test', 'midterm', 'final exam', 'auditorium', 'emergency',
  'blocked', 'unusable', 'overflowing', 'blackout', 'entire floor',
  'all students', 'dangerous', 'injury', 'hurt', 'deep crack'
];

/**
 * Perform Natural Language Analysis on Complaint Text
 * @param {string} title
 * @param {string} description
 * @param {string} location
 */
function analyzeComplaint(title = '', description = '', location = '') {
  const combinedText = `${title} ${description} ${location}`.toLowerCase();
  const titleText = title.toLowerCase();

  // Score each category
  const scores = {};
  const matchedKeywords = {};
  const urgentMatches = {};

  for (const [category, data] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    matchedKeywords[category] = [];
    urgentMatches[category] = [];

    // Check general category keywords
    for (const kw of data.keywords) {
      if (combinedText.includes(kw)) {
        const occurrences = (combinedText.match(new RegExp('\\b' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')) || []).length;
        const weight = titleText.includes(kw) ? 3 : 1.5;
        score += (occurrences || 1) * weight;
        matchedKeywords[category].push(kw);
      }
    }

    // Check urgent triggers for category
    for (const ukw of data.urgentKeywords) {
      if (combinedText.includes(ukw)) {
        score += 8;
        urgentMatches[category].push(ukw);
      }
    }

    scores[category] = score;
  }

  // Sort categories by score
  const sortedCategories = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const bestCategory = sortedCategories[0][1] > 0 ? sortedCategories[0][0] : 'Infrastructure & Furniture';
  const bestScore = sortedCategories[0][1];
  const runnerUp = sortedCategories[1] && sortedCategories[1][1] > 0 ? sortedCategories[1][0] : null;

  // Calculate confidence percentage
  let confidence = 75;
  if (bestScore >= 10) confidence = 96;
  else if (bestScore >= 6) confidence = 91;
  else if (bestScore >= 3) confidence = 84;
  else if (bestScore > 0) confidence = 74;
  else confidence = 55;

  // Assess Priority
  let suggestedPriority = 'Medium';
  let priorityReason = 'Standard campus maintenance issue that requires routine resolution within regular SLA.';
  let riskLevel = 'Moderate';
  let slaHours = 48;

  // Check for URGENT criteria
  const hasUrgentKeywords = Object.values(urgentMatches).some(arr => arr.length > 0) ||
    /spark|fire|flame|shock|smoke|gas leak|collapse|acid|poison|flood.*lab|burst pipe|live wire/i.test(combinedText);

  if (hasUrgentKeywords) {
    suggestedPriority = 'Urgent';
    riskLevel = 'Critical';
    slaHours = 4;
    const triggers = Object.values(urgentMatches).flat().slice(0, 3).join(', ') || 'safety critical trigger';
    priorityReason = `Urgent priority recommended! Active danger or severe disruption detected (${triggers}). Immediate dispatch required to prevent safety hazards.`;
  } else {
    // Check for HIGH criteria
    const hasHighTerms = HIGH_PRIORITY_TERMS.some(term => combinedText.includes(term));
    const isWaterOrPowerCut = /no water|no electricity|blackout|outage|overflowing|unusable|blocked/i.test(combinedText);

    if (hasHighTerms || isWaterOrPowerCut || bestScore >= 8) {
      suggestedPriority = 'High';
      riskLevel = 'Severe';
      slaHours = 18;
      priorityReason = 'High priority suggested due to significant student impact, examination disruption, or widespread facility blockage.';
    } else {
      // Check for LOW criteria
      const hasLowTerms = /minor|cosmetic|scratch|paint|squeak|small|extra|poster|suggestion|aesthetic/i.test(combinedText);
      if (hasLowTerms) {
        suggestedPriority = 'Low';
        riskLevel = 'Low';
        slaHours = 96;
        priorityReason = 'Low priority recommended. Issue appears non-critical, cosmetic, or a minor convenience request with negligible safety impact.';
      }
    }
  }

  // Location suggestions if location was detected in description
  const detectedLocation = extractLocationHint(combinedText);

  // Generate brief summary
  const summary = `Identified as ${bestCategory} with ${suggestedPriority.toUpperCase()} urgency. Assigned department: ${CATEGORY_RULES[bestCategory].department}.`;

  return {
    category: bestCategory,
    secondaryCategory: runnerUp,
    confidence,
    priority: suggestedPriority,
    priorityReason,
    riskLevel,
    estimatedResolutionHours: slaHours,
    department: CATEGORY_RULES[bestCategory].department,
    detectedKeywords: matchedKeywords[bestCategory].slice(0, 6),
    detectedLocation,
    summary,
    timestamp: new Date().toISOString()
  };
}

function extractLocationHint(text) {
  const buildingPatterns = [
    /engineering block [a-z0-9]+/i,
    /science block [a-z0-9]+/i,
    /hostel [a-z0-9-]+/i,
    /central library/i,
    /main cafeteria/i,
    /sports complex/i,
    /admin(?:istrative)? block/i,
    /computer lab [0-9]+/i,
    /room [0-9]+/i,
    /floor [0-9]+/i,
    /[0-9]+(?:st|nd|rd|th) floor/i
  ];

  for (const pat of buildingPatterns) {
    const match = text.match(pat);
    if (match) return match[0];
  }
  return null;
}

module.exports = {
  analyzeComplaint,
  CATEGORY_RULES
};
