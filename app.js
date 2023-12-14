const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');

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
                title: args.title,
                description: args.description,
                price: +args.price, // + converts string to number
                date: new Date().toISOString()
            };
            events.push(event);
        }
    },  
    graphiql: true
}));

app.listen(PORT, () => console.log("Server is running"));
