const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const SlotConfig = require('../models/SlotConfig');
const TimetableEntry = require('../models/TimetableEntry');

exports.generateTimetable = async () => {
  // Clear old timetable entries
  await TimetableEntry.deleteMany({});

  const classes = await Class.find();
  const subjects = await Subject.find().populate('teacherIds');
  let rooms = await Room.find();
  
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
  
  // A lookup dictionary for fast conflict checking O(1) checks
  const occupied = {};

  const getOccupiedKey = (day, slot) => `${day}_${slot}`;

  const isAvailable = (day, slot, teacherId, roomId, classId) => {
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
    if(teacherId) occupied[key][teacherId] = true;
    if(roomId) occupied[key][roomId] = true;
    if(classId) occupied[key][classId] = true;
  };

  const conflicts = [];

  // Iterate over each class and their subjects to generate schedule
  for (const cls of classes) {
    const clsSubjects = subjects.filter(s => s.classId.toString() === cls._id.toString());
    
    for (const subject of clsSubjects) {
      let hoursScheduled = 0;
      let teacherId = subject.teacherIds.length > 0 ? subject.teacherIds[0]._id.toString() : null;
      let isLab = subject.type === 'Lab';
      
      // Filter compatible rooms
      let compatibleRooms = rooms;
      if (isLab) {
        compatibleRooms = rooms.filter(r => r.type === 'Lab');
      } else {
        compatibleRooms = rooms.filter(r => r.type === 'Classroom');
      }

      // Schedule exact number of weekly lectures
      for (const day of days) {
        if (hoursScheduled >= subject.weeklyLectures) break;

        for (const slot of slots) {
          if (hoursScheduled >= subject.weeklyLectures) break;

          // Find an available room
          let freeRoom = compatibleRooms.find(r => isAvailable(day, slot, teacherId, r._id.toString(), cls._id.toString()));

          if (freeRoom) {
            newEntries.push({
              day,
              slot,
              classId: cls._id,
              subjectId: subject._id,
              teacherId: teacherId, // Handle null gracefully in views if needed
              roomId: freeRoom._id
            });
            
            markOccupied(day, slot, teacherId, freeRoom._id.toString(), cls._id.toString());
            hoursScheduled++;
            
            // To balance workload, break to move to next day
            break;
          }
        }
      }

      if (hoursScheduled < subject.weeklyLectures) {
        conflicts.push(`Unresolved conflict: ${subject.name} for class ${cls.name} missed ${subject.weeklyLectures - hoursScheduled} slots.`);
      }
    }
  }

  // Bulk Insert for performance
  if (newEntries.length > 0) {
    await TimetableEntry.insertMany(newEntries);
  }

  return { inserted: newEntries.length, conflicts };
};
