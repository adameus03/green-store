const httpStatusCodes = require('http-status-codes');
const StatusCodes = httpStatusCodes.StatusCodes;

function cors(req, res, next) {

  //res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
}

function requireAuthClient(req, res, next) {
  //cors(req, res, next);
  if (req.cookies["auth_token"] != "client_0f3a4b5c6d7e8f9a" && req.cookies["auth_token"] != "staff_83f03b89aa0b1c2d") {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

function requireAuthStaff(req, res, next) {
  //cors(req, res, next);
  if (req.cookies["auth_token"] != "staff_83f03b89aa0b1c2d") {
    res.status(StatusCodes.UNAUTHORIZED).send({ error: "Unauthorized" });
    return false;
  }
  return true;
}

module.exports = {
    requireAuthClient : requireAuthClient,
    requireAuthStaff : requireAuthStaff
};