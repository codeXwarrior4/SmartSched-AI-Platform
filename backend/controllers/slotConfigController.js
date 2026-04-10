const SlotConfig = require('../models/SlotConfig');

exports.getConfig = async (req, res) => {
  try {
    let config = await SlotConfig.findOne();
    if (!config) {
      config = new SlotConfig({
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        lecturesPerDay: 5,
        startTime: '09:00',
        slotDurationMins: 60
      });
      await config.save();
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { workingDays, lecturesPerDay, startTime, slotDurationMins } = req.body;
    
    // Ensure data shapes
    if (!workingDays || !Array.isArray(workingDays) || workingDays.length === 0) {
      return res.status(400).json({ message: 'Valid non-empty workingDays array is required' });
    }
    if (lecturesPerDay < 1 || lecturesPerDay > 15) {
       return res.status(400).json({ message: 'lecturesPerDay must be between 1 and 15' });
    }

    let config = await SlotConfig.findOne();
    if (!config) {
      config = new SlotConfig({ workingDays, lecturesPerDay, startTime, slotDurationMins });
    } else {
      config.workingDays = workingDays;
      config.lecturesPerDay = lecturesPerDay;
      config.startTime = startTime;
      config.slotDurationMins = slotDurationMins;
    }
    await config.save();

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
