import mongoose from 'mongoose';
const MetricSchema = new mongoose.Schema({
  label: String,     // e.g. 'Users', 'Income'
  value: Number,     // current value
  changePct: Number, // -12.4 or +40.9
  series: [Number],  // sparkline series
  dimension: { type: String, enum: ['day', 'month', 'year'], default: 'month' }
});
export default mongoose.model('Metric', MetricSchema);
