var db = require('../modules/access_api/database.js');

db.sequelize.sync()
    //.then(db.sequelize.drop)

// enforce static category list in the categories table in the database
    .then(() => db.Category.findOrCreate({where: {name: "Electronics"}}))
    .then(() => db.Category.findOrCreate({where: {name: "Food"}}))
    .then(() => db.Category.findOrCreate({where: {name: "Drink"}}))
    .then(() => db.Category.findOrCreate({where: {name: "Clothes"}}))
    .then(() => db.Category.findOrCreate({where: {name: "Furniture"}}))
    .then(() => db.Category.findOrCreate({where: {name: "Other"}})) 
    
// enforce static state list in the states table in the database
    .then(() => db.State.findOrCreate({where: {name: "UNCONFIRMED"}}))
    .then(() => db.State.findOrCreate({where: {name: "CONFIRMED"}}))
    .then(() => db.State.findOrCreate({where: {name: "CANCELLED"}}))
    .then(() => db.State.findOrCreate({where: {name: "COMPLETED"}}))


// enforce static admin user in the database
    //.then(() => { db.Person.findOrCreate({where: {username: "admin", password: "admin", email: "", phone_number: ""}}); })

    .then(() => console.log("Database setup successfull"))
    .catch((err) => console.log("!! migrate.js error: " + err.message));
