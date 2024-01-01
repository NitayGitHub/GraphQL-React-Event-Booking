const bcrypt = require('bcryptjs');
const Event = require('../../models/events');
const User = require('../../models/users');

const users = userId => {
    return User.findById(userId)
    .then(user => {
        return { 
            ...user._doc, 
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents) 
        };
    })
    .catch(err => {
        throw err;
    })
};

const events = eventIds => {
    return Event.find({ _id: { $in: eventIds } }) // returns all events with ids in eventIds
    .then(events => {
        return events.map(event => {
            return { 
                ...event._doc, 
                _id: event.id,
                creator: users.bind(this, event.creator)
            };
        });
    })
    .catch(err => {
        throw err;
    });
}

module.exports = {
    events: () => {
        return Event.find()
        .then(events => {
            return events.map(event => {
                return { 
                    ...event._doc, 
                    _id: event.id,
                    creator: users.bind(this, event._doc.creator)
                 };
            });
        })
        .catch(err => {
            throw err;
        });
    },
    createEvent: (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price, // '+' converts string to number
            date: new Date().toISOString(),
            creator: '658eb6db5ad5ad3662accb70'
        });
        let createdEvent;
        return event.save()
        .then(result => {
            createdEvent = { 
                ...result._doc, 
                _id: result._doc._id.toString(),
                creator: users.bind(this, result._doc.creator)
             };
            return User.findById('658eb6db5ad5ad3662accb70')
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
}