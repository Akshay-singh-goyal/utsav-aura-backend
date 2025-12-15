const Course = require('../models/Course');
const slugify = require('slugify');

exports.create = async (req,res) => {
  // assume req.body has title, description, price, isFree, teacher, thumbnail (cloudinary url)
  const { title } = req.body;
  const slug = slugify(title, { lower: true });
  const course = await Course.create({ ...req.body, slug });
  res.json(course);
};
