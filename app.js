const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongodb = require('mongodb');
const jwt = require('express-jwt');

const auth = require('./middleware/auth');
const routes = require('./routes/index');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const authOpts = {
  clientId: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  audience: process.env.AUTH_AUDIENCE,
};

const connString = process.env.MONGO_URI;
exports.connect = (connPort = 8080) => {
  mongodb.MongoClient.connect(connString)
    .then((db) => {
      // Save database object from the callback for reuse.
      console.log('Database connection ready');

      // Routes
      app.use('/api', routes(db, auth(authOpts)));

      const server = app.listen(process.env.PORT || connPort, () => {
        const port = server.address().port;
        console.log('App now running on port', port);
      });

      return {
        app, db,
      };
    }, (err) => {
      console.log(err);
      process.exit(1);
    });
  };
