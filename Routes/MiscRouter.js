const router = require('express').Router();

// Dummy newsletter endpoint
router.post('/subscribe', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  // TODO: push to your list provider
  return res.json({ success: true, message: 'Subscribed!' });
});

// Dummy YouTube stats to stop frontend errors
router.get('/youtube-stats', (req, res) => {
  return res.json({ views: 0, likes: 0, comments: 0 });
});

module.exports = router;
