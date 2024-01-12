/** 
 * @module backend/src/modules/access_api/routes/api.js
 * @proposition Maybe route for getting all user orders?
 * @proposition Optionally, add route for updating user data
 * @todo Set confirmation date to current date when order is confirmed; set to null when order is cancelled?
 * @maybe_todo Verify if any additonal awaits are needed
 * @maybe_todo Verify error handling
 * @todo VALIDATE Product_Order in POST orders
*/

var express = require('express');
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
const httpStatusCodes = require('http-status-codes');
const StatusCodes = httpStatusCodes.StatusCodes;
const fastJsonPatch = require('fast-json-patch');
const db = require("../database.js");
const auth = require("../authorization.js");
const validator = require('../validator.js');

var router = express.Router();

router.get('/products', async (req, res, next) => {
  if(!auth.requireAuthClient(req, res, next)) return;
  console.log("All products");
  const products = await db.Product.findAll();
  res.status(StatusCodes.OK).json(products);
});

router.get('/products/:id', (req, res, next) => {
  if(!auth.requireAuthClient(req, res, next)) return;
  console.log("Product with id " + req.params.id);
  db.Product.findByPk(req.params.id).then(product => {
    if (product) {
      res.status(StatusCodes.OK).json(product);
    }
    else {
      res.status(StatusCodes.NOT_FOUND).json({error: "Product does not exist"});
    }
  });
  
});

router.post('/products', (req, res, next) => {
  if(!auth.requireAuthStaff(req, res, next)) return;
  console.log("Create product");
  let validationResult = validator.validateProduct(req.body.name, req.body.description, req.body.price, req.body.weight);
  if(validationResult.error) {
    res.status(StatusCodes.BAD_REQUEST).json({error: validationResult.error.details[0].message});
    //res.status(StatusCodes.BAD_REQUEST).json(validationResult);
  }
  // Check if category exists and find its id
  else if (req.body.category) {
    db.Category.findOne({where: {name: req.body.category}}).then(category => {
      if(category) {
        db.Product.create({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          weight: req.body.weight,
          category_id: category.category_id
        }).then(product => {
          res.status(StatusCodes.CREATED).json(product);
        }).catch(err => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
        });
      }
      else {
        res.status(StatusCodes.BAD_REQUEST).json({error: "Category does not exist"});
      }
    }).catch(err => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
    });
  }
  else {
    // Category was not provided -> error
    res.status(StatusCodes.BAD_REQUEST).json({error: "Category was not provided"});
  }
});

router.put('/products/:id', (req, res, next) => {
  if(!auth.requireAuthStaff(req, res, next)) return;
  console.log("Update product with id " + req.params.id);
  let validationResult = validator.validateProduct(req.body.name, req.body.description, req.body.price, req.body.weight);
  if(validationResult.error) {
    res.status(StatusCodes.BAD_REQUEST).json({error: validationResult.error.details[0].message});
    //res.status(StatusCodes.BAD_REQUEST).json(validationResult);
  }
  // Check if category exists and find its id
  else if (req.body.category) {
    db.Category.findOne({where: {name: req.body.category}}).then(category => {
      if(category) {
        // Update product or return error if product does not exist
        //db.Product.findOne({where: {name: req.body.category}})
        db.Product.update({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          weight: req.body.weight,
          category_id: category.category_id
        }, {where: {product_id: req.params.id}}).then(product => {
          if(product[0] == 1) {
            res.status(StatusCodes.OK).json({message: "success"});
          }
          else {
            res.status(StatusCodes.NOT_FOUND).json({error: "Product does not exist"});
          }
        }).catch(err => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
        });
      }
      else {
        res.status(StatusCodes.BAD_REQUEST).json({error: "Category does not exist"});
      }
    }).catch(err => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
    });
  }
  else {
    // Category was not provided -> error
    res.status(StatusCodes.BAD_REQUEST).json({error: "Category was not provided"});
  }
});

router.get('/categories', (req, res, next) => {
  if(!auth.requireAuthClient(req, res, next)) return;
  console.log("All categories");
  db.Category.findAll().then(categories => res.status(StatusCodes.OK).json(categories))
  .catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message}));
});

router.get("/orders", (req, res, next) => {
  if(!auth.requireAuthClient(req, res, next)) return;
  console.log("All orders");
  db.Order.findAll().then(orders => res.status(StatusCodes.OK).json(orders))
  .catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message}));
});

router.post("/orders", async (req, res, next) => {
  if(!auth.requireAuthClient(req, res, next)) return;
  // Params: userID, products
  // product is an array of { product_id, quantity }
  console.log("Create order");
  // Check parameters
  if (!req.body.user_name) {
    res.status(StatusCodes.BAD_REQUEST).json({error: "User name was not provided"});
  } else if (!req.body.products) {
    res.status(StatusCodes.BAD_REQUEST).json({error: "Products were not provided"});
  } else if (req.body.products.length == 0) {
    res.status(StatusCodes.BAD_REQUEST).json({error: "Please provide at least one product"});
  } else if (!req.body.email) {
	res.status(StatusCodes.BAD_REQUEST).json({error: "User email was not provided"});
  } else if (!req.body.phone_number) {
	res.status(StatusCodes.BAD_REQUEST).json({error: "User email was not provided"});
  }

  //let validationResult = validator.validateOrder(req.body.userID, req.body.products);
  // Check if products exist, if not return error
  let productsExist = true;
  let products = JSON.parse(req.body.products);
  for(let i = 0; i < products.length; i++) {
    await db.Product.findByPk(products[i].product_id).then(product => {
      if(!product) {
        console.log(`Index [${i}]`);
        console.log(products[i]);
        console.log("Product with id " + products[i].product_id + " does not exist");
        productsExist = false;
      }
      // Check if quantity is a positive integer, if not return error
      /**
       * @proposition Migrate to validator.js
       */
      else if (products[i].quantity <= 0 || !Number.isInteger(products[i].quantity)) { // Not a beautiful solution, but it works
        console.log(`Index [${i}]`);
        console.log(products[i]);
        console.log("Product with id " + products[i].product_id + " has invalid quantity");
        res.status(StatusCodes.BAD_REQUEST).json({error: "One or more products have invalid quantity"});
        return; // Exit loop
      }
    }).catch(err => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
    });
    if (!productsExist) {
      break;
    }
  }
  if(productsExist) {
    // Create order
    db.Order.create({
      user_id: req.body.userID,
      state_id: 1, // UNCONFIRMED,
	    user_name: req.body.user_name,
      email: req.body.email,
      phone_number: req.body.phone_number
    }).then(async order => {
      // Create order items
      /**
       * @proposition Replace, so that await is not used
       */
      for(let i = 0; i < products.length; i++) {
        await db.Product_Order.create({
          order_id: order.order_id,
          product_id: products[i].product_id,
          quantity: products[i].quantity
        }).catch(err => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
        });
      }
      res.status(StatusCodes.CREATED).json(order);
    }).catch(err => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
    });
  }
  else {
    res.status(StatusCodes.BAD_REQUEST).json({error: "One or more products do not exist"});
  }
  
});

router.get("/orders/:id", (req, res, next) => {
  if(!auth.requireAuthClient(req, res, next)) return;
  console.log("Order with id " + req.params.id);
  db.Order.findByPk(req.params.id).then(async order => {
    if (order) {
      /**
       * @proposition Archivize products in order, so that the price and weight of the product at the time of order creation is saved
       */
      // Append products to order
      db.Product_Order.findAll({where: {order_id: req.params.id}}).then(async orderItems => {
        order.dataValues.products = [];
        for(let i = 0; i < orderItems.length; i++) {
          await db.Product.findByPk(orderItems[i].product_id).then(product => {
            order.dataValues.products.push({product_id: product.product_id, quantity: orderItems[i].quantity});
          }).catch(err => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
          });
        }
        //console.log(order);
        res.status(StatusCodes.OK).json(order);
      });
    }
    else {
      res.status(StatusCodes.NOT_FOUND).json({error: "Order does not exist"});
    }
  });
});

router.patch("/orders/:id", (req, res, next) => {
  if(!auth.requireAuthClient(req, res, next)) return;
  console.log("Update order with id " + req.params.id);
  // Update order using JSON patch or return an error if order does not exist
  db.Order.findByPk(req.params.id).then(async rawOrder => {
    if(rawOrder) {
      // Get raw order state name
      let beforeUpdateStateName = await db.State.findByPk(rawOrder.state_id).then(state => state.name);
      let order = { email: rawOrder.email, user_name: rawOrder.user_name, phone_number: rawOrder.phone_number, state: beforeUpdateStateName, products: []};
      // Get order items
      await db.Product_Order.findAll({where: {order_id: req.params.id}}).then(async orderItems => {
        for(let i = 0; i < orderItems.length; i++) {
          await db.Product.findByPk(orderItems[i].product_id).then(product => {
            order.products.push({product_id: product.product_id, quantity: orderItems[i].quantity});
          }).catch(err => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
          });
        }
      });

      // Use JSON PATCH
      let mockOrder = fastJsonPatch.applyPatch(order, req.body).newDocument;
      // Validate change from order to mockOrder
      console.log("Before patch validation");
      let validationResult = await validator.validateOrderChange(order, mockOrder); //AWAIT!
      console.log("After patch validation");
      // If change is valid, update order, else return error
      if(validationResult.error) {
        console.log("Patch validation error");
        res.status(StatusCodes.BAD_REQUEST).json(validationResult);
      }
      else {
        console.log("Patch validation succeeded");
        console.log(`validationResult: ${validationResult}`);
        let afterUpdateStateId = await db.State.findOne({where: {name: mockOrder.state}}).then(state => state.state_id);
        // Update order items
        for (let i = 0; i < mockOrder.products.length; i++) {
          await db.Product_Order.update({
            product_id: mockOrder.products[i].product_id,
            quantity: mockOrder.products[i].quantity
          }, {where: {order_id: req.params.id, product_id: mockOrder.products[i].product_id}}).catch(err => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
          });
        }
        db.Order.update({
          // set current date if this is a confirmation
          confirmation_date: (mockOrder.state_id == 2) ? new Date() : rawOrder.confirmation_date,
          state_id: afterUpdateStateId,
          user_name: mockOrder.user_name,
          phone_number: mockOrder.phone_number,
          email: mockOrder.email
        }, {where: {order_id: req.params.id}}).then(order => {
          res.status(StatusCodes.OK).json({message: "success"});
        }).catch(err => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message});
        });
        
      }
    }
    else {
      res.status(StatusCodes.NOT_FOUND).json({error: "Order does not exist"});
    }
  });

});

router.get("/orders/:status/id", async (req, res, next) => {
  if(!auth.requireAuthClient(req, res, next)) return;
  console.log("All orders with status " + req.params.status);
  await db.State.findOne({where: {name: req.params.status }}).then(state => {
    let stateId = state.state_id;
    if (stateId) {
      db.Order.findAll({where: {state_id: stateId}}).then(orders => res.status(StatusCodes.OK).json(orders))
      .catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message}));
    }
    else {
      res.status(StatusCodes.BAD_REQUEST).json({error: "Invalid state queried"});//<<<<
    }
  });
  
});

router.get("/status", (req, res, next) => {
  if(!auth.requireAuthClient(req, res, next)) return;
  console.log("All statuses");
  db.State.findAll().then(states => res.status(StatusCodes.OK).json(states))
  .catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: err.message}));
});










/*router.post('/upload', (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
      if(files.filetoupload){
        let oldPath = files.filetoupload[0].filepath;

        let newPath = `${process.env.USRFILES_LOCATION}/${files.filetoupload[0].originalFilename}`;
        let rawData = fs.readFileSync(oldPath)
      
        fs.writeFile(newPath, rawData, function(err){
            if(err) {
              console.log(err);
              return res.send("Upload with an error")
            }
            else {
              return res.send("Successfully uploaded");
            }
            
        });
      }
      else {
        return res.send("No file / empty file attached")
      }
  });
});

router.get('/download', (req, res) => {
  if(req.query.f){
    //let filepath = `./usrFiles/${req.query.f}`;
    let filepath = `${process.env.USRFILES_LOCATION}/${req.query.f}`;
    if(fs.existsSync(filepath)){
      res.download(filepath);
    }
    else {
      return res.send("No such file.");
    }
  }
});*/

module.exports = {
	router: router
};
