const Joi = require('joi');
const db = require('./database.js');

//const category_values = ["Food", "Drink", "Clothes", "Electronics", "Furniture", "Other"];

const productSchema = Joi.object().keys({
    name: Joi.string().alphanum().min(3).max(60).required(),
    description: Joi.string().max(1000),
    price: Joi.number().greater(0).max(1000000000).required(),
    weight: Joi.number().greater(0).max(1000000000).required()
    //category: Joi.string().valid(...category_values).required()
});

const userSchema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(60).required(),
    password: Joi.string().min(3).max(60).required(),
    email: Joi.string().email().required(),
    // Example valid phone numbers: +420123456789, +420 123 456 789, +420 123-456-789, +420 123 456-789, +420 123-456 789, +420 123-456789, +420123-456 789, +420123456-789, +420123456789
    //phone_number: Joi.string().pattern(/^\+420[1-9][0-9]{2}([ -]?[0-9]{3}){2}$/).required()
    phone_number: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im).required()
});

function validateProduct(name, description, price, weight) {
    return productSchema.validate({ name, description, price, weight});
}

function validateUser(username, password, email, phone_number) {
    return userSchema.validate({ username, password, email, phone_number});
}

/**
 * 
 * @param {*} order old order
 * @param {*} mockOrder new order
 * @returns result object with message: "success" or error
 */
async function validateOrderChange(order, mockOrder) { 
    /**
     * @proposition ehh, why verify all stuff if JSON patch only changes a portion?
     */
    //throw new Error("validateOrderChange not implemented");
    //Check if user id exists
    let user =  await db.Person.findByPk(mockOrder.userID);
    console.log(`Validating user with id ${mockOrder.userID}`);
    if (!user) {
        return {error: "User does not exist"};
    }
    else {
        console.log(`User found: ${user}}`);
    }
    //Check if products exist
    for (let i = 0; i < mockOrder.products.length; i++) {
        let product = await db.Product.findByPk(mockOrder.products[i].product_id);
        if (!product) {
            return {error: `Product with id=${mockOrder.products[i].product_id} does not exist`};
        }
    }
    //Check if quantities are valid
    for (let i = 0; i < mockOrder.products.length; i++) {
        //Check if quantity is a positive integer
        if (mockOrder.products[i].quantity < 1 || !Number.isInteger(mockOrder.products[i].quantity)) {
            return {error: `Product with id=${mockOrder.products[i].product_id} has invalid quantity ${mockOrder.products[i].quantity}`};
        }
    }
    //Check if state transition is valid
    let previousStateId = await db.State.findOne({where: {name: order.state}});
    let nextStateId = await db.State.findOne({where: {name: mockOrder.state}});
    if (!nextStateId) {
        return {error: `State ${mockOrder.state} does not exist`};
    }

    /**
     * @warning Depends on the static order and names of the states in the database
     * 1 - UNCONFIRMED
     * 2 - CONFIRMED
     * 3 - CANCELLED
     * 4 - COMPLETED
     */
    
    let validStateTransitions = [
        [1, 2, 3],
        [2, 3, 4],
        [3],
        [4]
    ];
    if (!validStateTransitions[previousStateId.state_id - 1].includes(nextStateId.state_id)) {
        return {error: `State transition from ${order.state} to ${mockOrder.state} is not valid`};
    }
    return {
        message: "success"
    }
}

module.exports = {
    validateProduct: validateProduct,
    validateUser: validateUser,
    validateOrderChange: validateOrderChange
}