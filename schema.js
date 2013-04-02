var mongoose = require ('mongoose');

var userSchema = new mongoose.Schema({
  phone: {type:String, required:true, unique: true},
  name:  String,
  email: {type:String, unique:true},
  password: String,
  business: [String]
});
userSchema.index({ phone: 1, email: 1});

var businessSchema = new mongoose.Schema({
  name: String,
  pincode: {type:Number, required:true},
  phone: {type:String, required:true},
  details: {type:String, required:true},
  category: {type:String, required:true},
  price: {type:Number, required:true},
  currency: {type:String, default:"rs"},
  workingDays: {type:String, required:true},
  _workingDays: [Boolean],
  notifications: [{
    body: String,
    title: {type:String, required:true},
    timestamp: { type: Date, default: Date.now }
  }],
  likes: {type:Number, default:0},
  likedBy: [String],
  subscribers: {type:Number, default:0},
  subscribedBy: [String],
  reviewed: {type:Boolean, default: false},
  timestamp: { type: Date, default: Date.now },
});
businessSchema.index({category:1, pincode:1, name:1});

exports.User = mongoose.model('User', userSchema),
exports.Business = mongoose.model('Business', businessSchema);