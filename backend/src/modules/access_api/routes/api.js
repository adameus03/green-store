var express = require('express');
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
const httpStatusCodes = require('http-status-codes');
const StatusCodes = httpStatusCodes.StatusCodes;
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
});

router.get('/categories', (req, res, next) => {
  console.log("All categories");
});

router.get("/orders", (req, res, next) => {
  console.log("All orders");
});

router.post("/orders", (req, res, next) => {
  console.log("Create order");
});

router.patch("/orders/:id", (req, res, next) => {
  res.send("Update order with id " + req.params.id);;
});

router.get("/orders/:status/id", (req, res, next) => {
  res.send("All orders with status " + req.params.status);
});

router.get("/status", (req, res, next) => {
  res.send("All statuses");
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
