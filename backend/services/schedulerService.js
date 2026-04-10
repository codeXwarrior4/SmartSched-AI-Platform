const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const SlotConfig = require('../models/SlotConfig');
const TimetableEntry = require('../models/TimetableEntry');

exports.generateTimetable = async () => {
  // Pre-flight Data Integrity Validation Phase
  const classes = await Class.find();
  const subjects = await Subject.find().populate('teacherIds');
  const rooms = await Room.find();
  const teachers = await Teacher.find();
  
  if (classes.length === 0) return { inserted: 0, conflicts: [{ type: 'FATAL', element: 'Class', message: 'Fatal: No Classes exist in the database.' }] };
  if (rooms.length === 0) return { inserted: 0, conflicts: [{ type: 'FATAL', element: 'Room', message: 'Fatal: No Rooms exist in the database.' }] };
  if (subjects.length === 0) return { inserted: 0, conflicts: [{ type: 'FATAL', element: 'Subject', message: 'Fatal: No Subjects exist in the database.' }] };
  
  // Validate Subject Integrity
  for (const sub of subjects) {
    if (!sub.classId) return { inserted: 0, conflicts: [{ type: 'FATAL', element: 'Subject', message: `Fatal: Subject '${sub.name}' has no assigned Class.` }] };
    if (!sub.teacherIds || sub.teacherIds.length === 0) {
      return { inserted: 0, conflicts: [{ type: 'FATAL', element: 'Subject', message: `Fatal: Subject '${sub.name}' has no assigned Teacher. Mapping impossible.` }] };
    }
  }

  // Clear old timetable entries
  await TimetableEntry.deleteMany({});

  // Default config if none found
  let config = await SlotConfig.findOne();
  if (!config) {
    config = {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      lecturesPerDay: 5
    };
  }

  const days = config.workingDays;
  const slotsPerDay = config.lecturesPerDay;
  const slots = Array.from({ length: slotsPerDay }, (_, i) => `Slot ${i + 1}`);

  let newEntries = [];
  const occupied = {};

  // Setup teacher bounds tracking
  let teacherDailyLoads = {};
  let teacherWeeklyLoads = {};
  let teacherMap = {};
  for(let t of teachers) {
      teacherMap[t._id.toString()] = t;
      teacherDailyLoads[t._id.toString()] = {};
      teacherWeeklyLoads[t._id.toString()] = 0;
      for (const day of days) {
          teacherDailyLoads[t._id.toString()][day] = 0;
      }
  }

  const getOccupiedKey = (day, slot) => `${day}_${slot}`;

  const isAvailable = (day, slot, teacherId, roomId, classId) => {
    // 10. Enforce teacher availability bounds
    const teacher = teacherMap[teacherId];
    if (teacher && teacher.availability && teacher.availability.length > 0) {
        const availKey = `${day}-${slot}`;
        if (!teacher.availability.includes(availKey)) return false;
    }

    // 11. Implement max lectures bounds checking
    if (teacher && teacherDailyLoads[teacherId][day] >= teacher.maxLecturesPerDay) return false;
    if (teacher && teacherWeeklyLoads[teacherId] >= teacher.maxLecturesPerWeek) return false;

    const key = getOccupiedKey(day, slot);
    if (!occupied[key]) return true;
    if (occupied[key][teacherId] || occupied[key][roomId] || occupied[key][classId]) {
      return false;
    }
    return true;
  };

  const markOccupied = (day, slot, teacherId, roomId, classId) => {
    const key = getOccupiedKey(day, slot);
    if (!occupied[key]) occupied[key] = {};
    if(teacherId) {
      occupied[key][teacherId] = true;
      teacherDailyLoads[teacherId][day]++;
      teacherWeeklyLoads[teacherId]++;
    }
    if(roomId) occupied[key][roomId] = true;
    if(classId) occupied[key][classId] = true;
  };

  const conflicts = []; // 13. Map structured JSON conflict diagnostics

  // Iterate over each class and their subjects to generate schedule
  for (const cls of classes) {
    const clsSubjects = subjects.filter(s => s.classId.toString() === cls._id.toString());
    
    for (const subject of clsSubjects) {
      let hoursScheduled = 0;
      let teacherId = subject.teacherIds[0]._id.toString();
      let isLab = subject.type === 'Lab';
      
      let compatibleRooms = isLab ? rooms.filter(r => r.type === 'Lab') : rooms.filter(r => r.type === 'Classroom');
      
      if (compatibleRooms.length === 0) {
         conflicts.push({ type: 'NO_ROOM', element: 'Room', message: `No compatible room found for ${isLab ? 'Lab' : 'Theory'} subject: ${subject.name}` });
         continue;
      }

      // 12. Improve workload heuristics
      if (!isLab) {
        // Try to spread theory subjects across days
        for (let pass = 0; pass < 2 && hoursScheduled < subject.weeklyLectures; pass++) {
            for (const day of days) {
                if (hoursScheduled >= subject.weeklyLectures) break;

                // Pass 0: Try to assign only if subject is not already scheduled on this day
                if (pass === 0) {
                    const alreadyHasToday = newEntries.some(e => e.classId.toString() === cls._id.toString() && e.subjectId.toString() === subject._id.toString() && e.day === day);
                    if (alreadyHasToday) continue;
                }

                for (const slot of slots) {
                    let freeRoom = compatibleRooms.find(r => isAvailable(day, slot, teacherId, r._id.toString(), cls._id.toString()));

                    if (freeRoom) {
                        newEntries.push({
                            day,
                            slot,
                            classId: cls._id,
                            subjectId: subject._id,
                            teacherId: teacherId,
                            roomId: freeRoom._id
                        });
                        
                        markOccupied(day, slot, teacherId, freeRoom._id.toString(), cls._id.toString());
                        hoursScheduled++;
                        break; // Move to the next day for spreading
                    }
                }
            }
        }
      } else {
        // Labs usually prefer back-to-back, so we fall back to a greedy approach
        for (const day of days) {
            if (hoursScheduled >= subject.weeklyLectures) break;

            for (const slot of slots) {
                if (hoursScheduled >= subject.weeklyLectures) break;

                let freeRoom = compatibleRooms.find(r => isAvailable(day, slot, teacherId, r._id.toString(), cls._id.toString()));

                if (freeRoom) {
                    newEntries.push({
                        day,
                        slot,
                        classId: cls._id,
                        subjectId: subject._id,
                        teacherId: teacherId,
                        roomId: freeRoom._id
                    });
                    
                    markOccupied(day, slot, teacherId, freeRoom._id.toString(), cls._id.toString());
                    hoursScheduled++;
                }
            }
        }
      }

      if (hoursScheduled < subject.weeklyLectures) {
        conflicts.push({ 
           type: 'UNRESOLVED', 
           element: 'Subject', 
           subjectName: subject.name,
           className: cls.name,
           message: `Unresolved conflict: ${subject.name} for class ${cls.name} missed ${subject.weeklyLectures - hoursScheduled} slots due to constraints/bounds.` 
        });
      }
    }
  }

  // Bulk Insert for performance
  if (newEntries.length > 0) {
    await TimetableEntry.insertMany(newEntries);
  }

  return { inserted: newEntries.length, conflicts };
};
