const Joi = require('joi');

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
    phone_number: Joi.string().pattern(/^\+420[1-9][0-9]{2}([ -]?[0-9]{3}){2}$/).required()
});

function validateProduct(name, description, price, weight) {
    return productSchema.validate({ name, description, price, weight});
}

function validateUser(username, password, email, phone_number) {
    return userSchema.validate({ username, password, email, phone_number});
}

function validateOrderChange(order, mockOrder) {
    // Not implemented, throw error
    throw new Error("validateOrderChange not implemented");
}

module.exports = {
    validateProduct: validateProduct,
    validateUser: validateUser,
    validateOrderChange: validateOrderChange
}