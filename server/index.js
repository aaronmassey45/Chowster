require('./config/config');

const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const expressGraphQL = require('express-graphql');
const path = require('path');
require('./models/user');
require('./models/post');
const schema = require('./schema/schema');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI);

const app = express();

app.use(bodyParser.json());
app.use(
  '/graphql',
  expressGraphQL({
    schema,
    graphiql: true,
  })
);

require('./routes/postRoutes')(app);
require('./routes/userRoutes')(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}.`);
});
