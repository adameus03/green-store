const Joi = require('joi');

//const category_values = ["Food", "Drink", "Clothes", "Electronics", "Furniture", "Other"];

const productSchema = Joi.object().keys({
    name: Joi.string().alphanum().min(3).max(60).required(),
    description: Joi.string().max(1000),
    price: Joi.number().greater(0).max(1000000000).required(),
    weight: Joi.number().greater(0).max(1000000000).required()
    //category: Joi.string().valid(...category_values).required()
});

function validateProduct(name, description, price, weight) {
    return productSchema.validate({ name, description, price, weight});
}

module.exports = {
    validateProduct: validateProduct
}