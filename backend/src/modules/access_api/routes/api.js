/** 
 * @module backend/src/modules/access_api/routes/api.js
 * @proposition Maybe route for getting all user orders?
 * @proposition Optionally, add route for updating user data
 * @todo Set confirmation date to current date when order is confirmed; set to null when order is cancelled?
 * @maybe_todo Verify if any additonal awaits are needed
 * @maybe_todo Verify error handling
*/

var express = require('express');
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
const httpStatusCodes = require('http-status-codes');
const StatusCodes = httpStatusCodes.StatusCodes;
const fastJsonPatch = require('fast-json-patch');
const db = require("../database.js");
const validator = require('../validator.js');

var router = express.Router();

router.get('/products', async (req, res, next) => {
  console.log("All products");
  const products = await db.Product.findAll();
  res.status(StatusCodes.OK).json(products);
});

router.get('/products/:id', (req, res, next) => {
  console.log("Product with id " + req.params.id);
  const product = db.Product.findByPk(req.params.id);
  if (product) {
    res.status(StatusCodes.OK).json(product);
  }
  else {
    res.status(StatusCodes.NOT_FOUND).json({message: "Product does not exist"});
  }
});

router.post('/products', (req, res, next) => {
  console.log("Create product");
  let validationResult = validator.validateProduct(req.body.name, req.body.description, req.body.price, req.body.weight);
  if(validationResult.error) {
    res.status(StatusCodes.BAD_REQUEST).json({message: validationResult.error.details[0].message});
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
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
        });
      }
      else {
        res.status(StatusCodes.BAD_REQUEST).json({message: "Category does not exist"});
      }
    }).catch(err => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
    });
  }
  else {
    // Category was not provided -> error
    res.status(StatusCodes.BAD_REQUEST).json({message: "Category was not provided"});
  }
});

router.put('/products/:id', (req, res, next) => {
  console.log("Update product with id " + req.params.id);
  let validationResult = validator.validateProduct(req.body.name, req.body.description, req.body.price, req.body.weight);
  if(validationResult.error) {
    res.status(StatusCodes.BAD_REQUEST).json({message: validationResult.error.details[0].message});
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
          //if(product[0] == 0)
          if(product) {
            res.status(StatusCodes.OK).json(product);
          }
          else {
            res.status(StatusCodes.NOT_FOUND).json({message: "Product does not exist"});
          }
        }).catch(err => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
        });
      }
      else {
        res.status(StatusCodes.BAD_REQUEST).json({message: "Category does not exist"});
      }
    }).catch(err => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
    });
  }
  else {
    // Category was not provided -> error
    res.status(StatusCodes.BAD_REQUEST).json({message: "Category was not provided"});
  }
});

router.get('/categories', (req, res, next) => {
  console.log("All categories");
  db.Category.findAll().then(categories => res.status(StatusCodes.OK).json(categories))
  .catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message}));
});

router.get("/orders", (req, res, next) => {
  console.log("All orders");
  db.Order.findAll().then(orders => res.status(StatusCodes.OK).json(orders))
  .catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message}));
});

router.post("/orders", (req, res, next) => {
  // Params: userID, products
  console.log("Create order");
  // Check parameters
  if (!req.body.userID) {
    res.status(StatusCodes.BAD_REQUEST).json({message: "User ID was not provided"});
  } else if (!req.body.products) {
    res.status(StatusCodes.BAD_REQUEST).json({message: "Products were not provided"});
  } else if (req.body.products.length == 0) {
    res.status(StatusCodes.BAD_REQUEST).json({message: "Please provide at least one product"});
  }

  //let validationResult = validator.validateOrder(req.body.userID, req.body.products);
  // Check if userID exists, if not return error
  db.Person.findByPk(req.body.userID).then(async user => {
    if(user) {
      // Check if products exist, if not return error
      let productsExist = true;
      for(let i = 0; i < req.body.products.length; i++) {
        await db.Product.findByPk(req.body.products[i].product_id).then(product => {
          if(!product) {
            productsExist = false;
          }
        }).catch(err => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
        });
        if (!productsExist) {
          break;
        }
      }
      if(productsExist) {
        // Create order
        db.Order.create({
          user_id: req.body.userID,
          state_id: 1 // UNCONFIRMED
        }).then(async order => {
          // Create order items
          /**
           * @proposition Replace, so that await is not used
           */
          for(let i = 0; i < req.body.products.length; i++) {
            await db.Product_Order.create({
              order_id: order.order_id,
              product_id: req.body.products[i].product_id,
              quantity: req.body.products[i].quantity
            }).catch(err => {
              res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
            });
          }
          res.status(StatusCodes.CREATED).json(order);
        }).catch(err => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
        });
      }
      else {
        res.status(StatusCodes.BAD_REQUEST).json({message: "One or more products do not exist"});
      }
    }
    else {
      res.status(StatusCodes.BAD_REQUEST).json({message: "User does not exist"});
    }
  }).catch(err => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
  });

});

router.patch("/orders/:id", (req, res, next) => {
  res.send("Update order with id " + req.params.id);
  // Update order using JSON patch or return an error if order does not exist
  db.Order.findByPk(req.params.id).then(async rawOrder => {
    if(rawOorder) {
      // Get raw order state name
      let beforeUpdateStateName = await db.State.findByPk(rawOrder.state_id).then(state => state.name);
      let order = { userID: rawOrder.user_id, state: beforeUpdateStateName, products: []};
      // Get order items
      await db.Product_Order.findAll({where: {order_id: req.params.id}}).then(async orderItems => {
        for(let i = 0; i < orderItems.length; i++) {
          await db.Product.findByPk(orderItems[i].product_id).then(product => {
            order.products.push({product_id: product.product_id, quantity: orderItems[i].quantity});
          }).catch(err => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
          });
        }
      });

      // Use JSON PATCH
      let mockOrder = fastJsonPatch.applyPatch(order, req.body).newDocument;
      // Validate change from order to mockOrder
      let validationResult = validator.validateOrderChange(order, mockOrder);
      // If change is valid, update order, else return error
      if(validationResult.error) {
        res.status(StatusCodes.BAD_REQUEST).json({message: validationResult.error.details[0].message});
      }
      else {
        let afterUpdateStateId = await db.State.findOne({where: {name: mockOrder.state}}).then(state => state.state_id);
        db.Order.update({
          // set current date if this is a confirmation
          confirmation_date: (mockOrder.state_id == 2) ? new Date() : rawOrder.confirmation_date,
          state_id: afterUpdateStateId,
          user_id: mockOrder.userID
        }, {where: {order_id: req.params.id}}).then(order => {
          res.status(StatusCodes.OK).json(order);
        }).catch(err => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
        });
      }
    }
    else {
      res.status(StatusCodes.NOT_FOUND).json({message: "Order does not exist"});
    }
  });

});

router.get("/orders/:status/id", (req, res, next) => {
  res.send("All orders with status " + req.params.status);
  db.Order.findAll({where: {state_id: req.params.status}}).then(orders => res.status(StatusCodes.OK).json(orders))
  .catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message}));
});

router.get("/status", (req, res, next) => {
  res.send("All statuses");
  db.State.findAll().then(states => res.status(StatusCodes.OK).json(states))
  .catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message}));
});

router.post("/users", (req, res, next) => {
  console.log("Create user");
  let validationResult = validator.validateUser(req.body.username, req.body.password, req.body.email, req.body.phone_number);
  if(validationResult.error) {
    res.status(StatusCodes.BAD_REQUEST).json({message: validationResult.error.details[0].message});
  }
  else {
    db.Person.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      phone_number: req.body.phone_number
    }).then(user => {
      res.status(StatusCodes.CREATED).json(user);
    }).catch(err => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: err.message});
    });
  }
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
