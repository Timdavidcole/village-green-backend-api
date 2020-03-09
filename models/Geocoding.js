const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config()

module.exports = {

  getCoordinates: function(address) {
    let searchAddress = address.split(" ").join("+");
    let url =
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      searchAddress +
      "&key=" + process.env.GOOGLE_API;
    return fetch(url)
      .then(response => response.json())
      .then(data => data)
  }

}