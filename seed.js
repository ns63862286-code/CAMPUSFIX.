const { db } = require('./db');
const { hashPassword } = require('./auth');

function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount && userCount.count > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial CampusFix university data...');

  // 1. Seed Users
  const adminPass = hashPassword('Admin@123');
  const studentPass = hashPassword('Student@123');
  const staffPass = hashPassword('Staff@123');

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, salt, role, student_id, department, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminUser = insertUser.run(
    'Prof. Sarah Jenkins',
    'admin@campusfix.edu',
    adminPass.hash,
    adminPass.salt,
    'admin',
    'FAC-1002',
    'Campus Estate & Facilities',
    '+1 (555) 234-5678'
  );

  const studentAlex = insertUser.run(
    'Alex Rivera',
    'student@campusfix.edu',
    studentPass.hash,
    studentPass.salt,
    'student',
    'STU-2024-8842',
    'Computer Science & Engineering',
    '+1 (555) 432-8765'
  );

  const studentPriya = insertUser.run(
    'Priya Sharma',
    'priya@campusfix.edu',
    studentPass.hash,
    studentPass.salt,
    'student',
    'STU-2024-5120',
    'Electrical Engineering',
    '+1 (555) 345-6789'
  );

  const studentRohan = insertUser.run(
    'Rohan Gupta',
    'rohan@campusfix.edu',
    studentPass.hash,
    studentPass.salt,
    'student',
    'STU-2023-3391',
    'Mechanical Engineering',
    '+1 (555) 876-5432'
  );

  const techMarcus = insertUser.run(
    'Marcus Vance',
    'staff@campusfix.edu',
    staffPass.hash,
    staffPass.salt,
    'technician',
    'TECH-409',
    'Electrical & Infrastructure Maintenance',
    '+1 (555) 987-6543'
  );

  // 2. Seed Realistic Complaints
  const sampleComplaints = [
    {
      ticket_number: 'CF-2026-0001',
      user_id: studentAlex.lastInsertRowid,
      title: 'Live electrical sparks and burning smell from switchboard in Lab 204',
      description: 'During our afternoon practical session, sparks started shooting out of the main wall socket powering computers 12 to 16. There is a strong burning plastic smell. We had to trip the emergency power switch.',
      category: 'Electrical & Power',
      location: 'Engineering Block A',
      room: 'Computer Lab 204 (2nd Floor)',
      priority: 'Urgent',
      status: 'In Progress',
      photo_url: '',
      is_anonymous: 0,
      assigned_to: 'Marcus Vance - Senior Electrician',
      admin_notes: 'Technician dispatched within 15 minutes. Breaker 4 isolated. Replacing burnt MCB and terminal wires.',
      ai_confidence: 96,
      ai_reasoning: 'Urgent priority recommended! Active danger or severe disruption detected (spark, burning smell). Immediate dispatch required.',
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
    },
    {
      ticket_number: 'CF-2026-0002',
      user_id: studentPriya.lastInsertRowid,
      title: 'Major water pipe leak flooding corridor outside Central Library entrance',
      description: 'The overhead plumbing line near the water fountain has burst. Water is pooling rapidly across the marble floor making it very slippery. Library staff had to put caution cones but water is spreading toward study cubicles.',
      category: 'Plumbing & Water',
      location: 'Central Library',
      room: '1st Floor West Wing',
      priority: 'High',
      status: 'Under Review',
      photo_url: '',
      is_anonymous: 0,
      assigned_to: 'Suresh Sharma - Plumbing Lead',
      admin_notes: 'Notified plumbing emergency dispatch. Water valve shutoff in progress.',
      ai_confidence: 93,
      ai_reasoning: 'High priority suggested due to significant student impact and structural slipping hazard from rapid flooding.',
      created_at: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    },
    {
      ticket_number: 'CF-2026-0003',
      user_id: studentAlex.lastInsertRowid,
      title: 'Hostel C Wi-Fi access point dead for 3 days before midterm examinations',
      description: 'The Cisco router on the 2nd floor ceiling of Hostel C is constantly flashing red. Over 60 students in rooms 201-230 have zero internet connectivity. Hotspots are getting saturated.',
      category: 'IT & Campus Wi-Fi',
      location: 'Hostel Block C',
      room: '2nd Floor Corridor, Rooms 201-230',
      priority: 'High',
      status: 'Assigned',
      photo_url: '',
      is_anonymous: 0,
      assigned_to: 'Anita Verma - Network Operations',
      admin_notes: 'PoE injector failure identified on switch rack #3. Spare unit ordered from central IT repository.',
      ai_confidence: 91,
      ai_reasoning: 'High priority suggested due to widespread academic impact affecting 60+ students during midterm week.',
      created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
    },
    {
      ticket_number: 'CF-2026-0004',
      user_id: studentRohan.lastInsertRowid,
      title: 'Broken wooden lecture bench with protruding sharp screws in Hall 3',
      description: 'Row 4 bench #12 has cracked across the middle support beam. A student torn their backpack on an exposed rusted screw this morning. It poses a physical cut hazard.',
      category: 'Infrastructure & Furniture',
      location: 'Academic Complex',
      room: 'Lecture Hall 3 (Auditorium Wing)',
      priority: 'Medium',
      status: 'Resolved',
      photo_url: '',
      is_anonymous: 0,
      assigned_to: 'Vikram Singh - Carpenter Section',
      admin_notes: 'Carpentry workshop repaired the support beam and replaced damaged screws with flush countersunk bolts. Inspected and cleared.',
      ai_confidence: 88,
      ai_reasoning: 'Medium priority standard infrastructure maintenance. Poses localized hazard.',
      created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      ticket_number: 'CF-2026-0005',
      user_id: studentPriya.lastInsertRowid,
      title: 'Central cafeteria waste bins overflowing and attracting stray animals',
      description: 'The outdoor waste collection station behind the student food court has not been emptied since yesterday evening. Large amounts of food waste are spilling out, causing foul odor and attracting stray dogs and crows near dining tables.',
      category: 'Cleanliness & Sanitation',
      location: 'Central Cafeteria',
      room: 'Outdoor Dining Deck, Rear Bin Bay',
      priority: 'Medium',
      status: 'In Progress',
      photo_url: '',
      is_anonymous: 0,
      assigned_to: 'GreenClean Sanitation Crew #4',
      admin_notes: 'Sanitation contractor notified. Truck scheduled for deep cleaning and bin sanitization.',
      ai_confidence: 89,
      ai_reasoning: 'Medium priority sanitation issue affecting food court hygiene and pest control.',
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      ticket_number: 'CF-2026-0006',
      user_id: studentRohan.lastInsertRowid,
      title: 'Perimeter pathway streetlights non-operational between Gate 3 and Girls Hostel',
      description: 'Four consecutive streetlights along the south walkway are pitch dark after 6:30 PM. Many female students feel unsafe walking back from evening library study hours. Immediate lighting restoration requested.',
      category: 'Safety & Security',
      location: 'South Perimeter Path',
      room: 'Walkway between Gate 3 and Girls Hostel 2',
      priority: 'High',
      status: 'Submitted',
      photo_url: '',
      is_anonymous: 0,
      assigned_to: null,
      admin_notes: null,
      ai_confidence: 94,
      ai_reasoning: 'High priority suggested due to student safety and campus security vulnerability during nighttime.',
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      ticket_number: 'CF-2026-0007',
      user_id: studentAlex.lastInsertRowid,
      title: 'Chemistry Lab 2 fume hood exhaust fan stopped working during experiment',
      description: 'The main ventilation exhaust hood in organic chemistry lab has completely stopped rotating. Fumes from ether extraction were lingering in the room. Lab instructor halted the session.',
      category: 'Library & Labs',
      location: 'Science Block',
      room: 'Chemistry Lab 202',
      priority: 'Urgent',
      status: 'In Progress',
      photo_url: '',
      is_anonymous: 0,
      assigned_to: 'Marcus Vance - Senior Electrician',
      admin_notes: 'Motor belt snapped on rooftop ventilation blower. Replacement belt installed, final airflow test pending.',
      ai_confidence: 95,
      ai_reasoning: 'Urgent priority due to toxic chemical vapor hazard and laboratory safety compliance requirements.',
      created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    {
      ticket_number: 'CF-2026-0008',
      user_id: studentPriya.lastInsertRowid,
      title: 'Boys Hostel B 3rd floor washroom geyser leaking cold water and won’t heat',
      description: 'The water heater in bathroom unit 3B only produces cold water and continuously drips water onto the electrical power point below it. Needs immediate inspection before someone turns it on with wet hands.',
      category: 'Hostel & Mess',
      location: 'Boys Hostel B',
      room: '3rd Floor Common Washroom Unit 3B',
      priority: 'High',
      status: 'Assigned',
      photo_url: '',
      is_anonymous: 0,
      assigned_to: 'Suresh Sharma - Plumbing Lead',
      admin_notes: 'Thermostat failure and heating coil seal damaged. New 25L element requisitioned.',
      ai_confidence: 92,
      ai_reasoning: 'High priority due to electrical hazard proximity with water drip.',
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
    }
  ];

  const insertComplaint = db.prepare(`
    INSERT INTO complaints (
      ticket_number, user_id, title, description, category, location, room,
      priority, status, photo_url, is_anonymous, assigned_to, admin_notes,
      ai_confidence, ai_reasoning, created_at, updated_at, resolved_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  const insertActivity = db.prepare(`
    INSERT INTO complaint_activities (complaint_id, user_id, user_name, user_role, action, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertUpvote = db.prepare(`
    INSERT INTO complaint_upvotes (complaint_id, user_id, created_at)
    VALUES (?, ?, ?)
  `);

  for (const c of sampleComplaints) {
    const res = insertComplaint.run(
      c.ticket_number, c.user_id, c.title, c.description, c.category, c.location, c.room,
      c.priority, c.status, c.photo_url, c.is_anonymous, c.assigned_to, c.admin_notes,
      c.ai_confidence, c.ai_reasoning, c.created_at, c.updated_at, c.resolved_at || null
    );

    const compId = res.lastInsertRowid;

    // Seed Initial Activity: Submission
    insertActivity.run(
      compId, c.user_id, 'Student Reporter', 'student', 'Complaint Submitted',
      'Issue logged through CampusFix student portal with AI classification.',
      c.created_at
    );

    // If assigned or in progress
    if (c.status !== 'Submitted') {
      insertActivity.run(
        compId, adminUser.lastInsertRowid, 'Prof. Sarah Jenkins', 'admin', 'Status Updated',
        `Assigned ticket to ${c.assigned_to || 'maintenance crew'}. Priority verified as ${c.priority}.`,
        c.updated_at
      );
    }

    if (c.status === 'Resolved') {
      insertActivity.run(
        compId, techMarcus.lastInsertRowid, 'Marcus Vance', 'technician', 'Issue Resolved',
        c.admin_notes,
        c.resolved_at
      );
    }

    // Seed some upvotes
    insertUpvote.run(compId, studentAlex.lastInsertRowid, c.created_at);
    if (compId % 2 === 0) {
      insertUpvote.run(compId, studentPriya.lastInsertRowid, c.created_at);
      insertUpvote.run(compId, studentRohan.lastInsertRowid, c.created_at);
    }
  }

  console.log('CampusFix database seeded successfully with realistic campus complaints.');
}

module.exports = { seedData };
