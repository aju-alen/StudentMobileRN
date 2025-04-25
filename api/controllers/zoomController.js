import {
    createZoomMeeting,
    updateZoomMeeting,
    deleteZoomMeeting,
  } from '../services/zoomService.js';
  
  // Mock DB
  const db = {};
  
  export const createMeeting = async (req, res) => {
    const { email, topic, startTime } = req.body;
  
    try {
      const meeting = await createZoomMeeting(email, topic, startTime);
      console.log(meeting);
      db[meeting.id] = meeting;
      res.json(meeting);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const updateMeeting = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
  
    try {
      await updateZoomMeeting(id, updates);
      db[id] = { ...db[id], ...updates };
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const deleteMeeting = async (req, res) => {
    const { id } = req.params;
  
    try {
      await deleteZoomMeeting(id);
      delete db[id];
      res.json({ deleted: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const getMeeting = (req, res) => {
    const meeting = db[req.params.id];
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  
    res.json({ join_url: meeting.join_url });
  };
  