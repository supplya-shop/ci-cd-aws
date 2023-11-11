const OrderSchema = new mongoose.Schema({
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    total: Number,
    date: { type: Date, default: Date.now },
  });
  
  const Order = mongoose.model('Order', OrderSchema);