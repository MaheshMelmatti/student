const mongoose = require('mongoose');


const courseSchema = new mongoose.Schema({
code: { type: String, required: true },
title: { type: String, required: true },
description: String,
seats: { type: Number, default: 999 }
});


module.exports = mongoose.model('Course', courseSchema);