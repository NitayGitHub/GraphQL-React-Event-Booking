const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();

const Event = require('./models/events');
const User = require('./models/users');

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

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema { 
            query: RootQuery
            mutation: RootMutation
        }`),

    // resolvers
    rootValue: {
        events: () => {
            return Event.find().then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event.id };
                });
            }).catch(err => {
                throw err;
            });
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, // '+' converts string to number
                date: new Date().toISOString(),
                creator: '5f9f9b7b6c6b3e1f1c9b3b1c'
            });
            let createdEvent;
            return event.save()
            .then(result => {
                createdEvent = { ...result._doc, _id: result._doc._id.toString() };
                return User.findById('5f9f9b7b6c6b3e1f1c9b3b1c')
            })
            .then(user => {
                if (!user) {
                    throw new Error('User not found.');
                }
                user.createdEvents.push(event);
                return user.save();
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
        },
        createUser: (args) => {
            return User.findOne({ email: args.userInput.email }).then(user => {
                if (user) {
                    throw new Error('User exists already.');
                }
                return bcrypt.hash(args.userInput.password, 12);
            })
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                return user.save();
            })
            .then(result => {
                return { ...result._doc, password: null, _id: result.id };
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
        }
    },  
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

