var express = require('express');
const fs = require('fs');
const path = require('path')
const formidable = require('formidable');
const httpStatusCodes = require('http-status-codes');

var router = express.Router();

router.get('/products', (req, res, next) => {
  res.send("All products");
  
});

router.get('/products/:id', (req, res, next) => {
  res.send("Product with id " + req.params.id);
});

router.post('/products', (req, res, next) => {
  res.send("Create product");
});

router.put('/products/:id', (req, res, next) => {
  res.send("Update product with id " + req.params.id);
});

router.get('/categories', (req, res, next) => {
  res.send("All categories");
});

router.get("/orders", (req, res, next) => {
  res.send("All orders");
});

router.post("/orders", (req, res, next) => {
  res.send("Create order");
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
