var mongoose = require('mongoose');
var CategorySchema = require('../schemas/category');
module.exports = mongoose.model('Category',CategorySchema);