const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const app = express();

const events = [];

app.use(bodyParser.json());

const PORT = 5000;

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): String
        }

        schema { 
            query: RootQuery
            mutation: RootMutation
        }`),
    rootValue: {
        events: () => {
            return events;
        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, // + converts string to number
                date: new Date().toISOString()
            };
            events.push(event);
            return event;
        }
    },  
    graphiql: true
}));

const user = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;

mongoose.connect(`mongodb+srv://${user}:${password}@eventsdb.pjku6qe.mongodb.net/?retryWrites=true&w=majority`).then(() => {
                    app.listen(PORT, () => console.log("Server is running"));
                }).catch(err => {
                    console.log(err);
                });
