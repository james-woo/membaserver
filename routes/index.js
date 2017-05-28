const express = require('express');
const mongodb = require('mongodb');

const router = new express.Router();
const ObjectID = mongodb.ObjectID;

const berry = require('./berry');
const users = require('./users');

module.exports = (db, auth) => {
  // -------------- BERRIES API BELOW -------------------------------
  router.use('/berry', berry(db, auth));
  
  // -------------- ACCOUNT API BELOW -------------------------
  router.use('/users', users(db, auth));

  return router;
};