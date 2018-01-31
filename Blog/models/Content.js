/**
 * 创建User模型
 **/
var mongoose = require('mongoose');
var usersSchema = require('../schemas/contents');

module.exports = mongoose.model('Content',usersSchema);