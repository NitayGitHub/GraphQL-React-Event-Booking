const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const mongoose = require('mongoose');

const resolvers = require('./graphql/resolvers/index');
const schema = require('./graphql/schema/index');

const app = express();

app.use(bodyParser.json());

const PORT = 5000;

app.use('/graphql', graphqlHttp({
    schema: schema,
    rootValue: resolvers,  
    graphiql: true
}));

const user = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const dbName = process.env.MONGO_DB;

mongoose.connect(`mongodb+srv://${user}:${password}@eventsdb.pjku6qe.mongodb.net/${dbName}?retryWrites=true&w=majority`).then(() => {
                    app.listen(PORT, () => console.log("Server is running"));
                }).catch(err => {
                    console.log(err);
                });

