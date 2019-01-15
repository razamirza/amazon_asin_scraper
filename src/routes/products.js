
const cache = require('../libs/redis-client');
const express = require('express');
const router = express.Router();
const scraper = require('../libs/asin_scraper');

/* GET products listing. */
router.get('/:asin', function(req, res, next) {
  const asin = req.params.asin;
  cache.getAsync(asin)
    .then(function(data) {
      if ( typeof data !== 'undefined' && data ) {
        data = JSON.parse(data)
        data.asin = asin;
        return data;
      } else {
        return Promise.reject({ code: 404 }); // cache missed
      }
    })
    .catch(function (error) {
      if ( error.code == 404 ) { // cache missed
        return scraper.getProductInfo(asin)
          .then(function (data) {
            return data;
          })
          .then(function (data) {
            return cache.setAsync(asin, JSON.stringify(data))
                    .then(function(info) {
                      return data;
                    });
          })
          .then(function (data) {
            return {
              asin: asin,
              catagory: (data.catagory ? data.catagory : 'Cannot find catagory'),
              rank: (data.rank ? data.rank : 'Cannot find rank'),
              dimensions: (data.dimensions ? data.dimensions : 'Cannot find dimensions')
            };
          })
          .catch(function (err) {
            if (err.response && err.response.status == 404) {
              return {
                asin: asin,
                msg:  "Invalid ASIN: Item not found."
              };
            }
            else {
              return {
                asin: asin,
                msg:  "Unknow error: Please try a different ASIN."
              };
            }
          });
      }
      else {
        return {
          asin: asin,
          msg:  "Invalid ASIN: Item not found."
        };
      }
    })
    .then(function (data){
      res.json(data);
    });
});

module.exports = router;
