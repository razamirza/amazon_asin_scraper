// asin_scraper.js
const axios = require('axios');
const cheerio = require('cheerio')

const RankAndCatagoryPattern = /#\d+(?:,\d+)? in \w+(?:,)*( [&\w]+)*/g;

function findDimensionsElement($) {
  const Selectors = [
    ".size-weight > td:contains('Dimensions') + .value",
    "th:contains('Dimensions') + td"
  ]

  let dimensionsElement = { length: 0 };
  for (let i = 0; i < Selectors.length && dimensionsElement.length < 1; i++) {
    dimensionsElement = $(Selectors[i]);
  }
  return dimensionsElement;
}

function findRankAndCatagoryElement($) {
  const Selectors = [
    '#SalesRank > .value',
    "th:contains('Sellers Rank') + td",
    "#SalesRank"
  ]
  let rankAndCatagoryElement = { length: 0 };

  for (let i = 0; i < Selectors.length && rankAndCatagoryElement.length < 1; i++) {
    rankAndCatagoryElement = $(Selectors[i]);
  }
  return rankAndCatagoryElement;
}

module.exports = {
  getProductInfo: function (asin) {
    const url = `https://www.amazon.com/dp/${asin}?th=1`;
    return axios.get(url)
      .then(function (response) {

        const $ = cheerio.load(response.data);

        let dimensions, dimensionsElement = findDimensionsElement($);
        if(dimensionsElement.length > 0) {
          dimensionsElement = dimensionsElement.text().split('\n').filter(function (elem) {
            return elem != null && elem.trim() != '';
          });
          if(dimensionsElement.length > 0) {
            dimensions = dimensionsElement[0].trim();
          }
        }

        let rank, catagory, rankAndCatagoryElement = findRankAndCatagoryElement($);
        if(rankAndCatagoryElement.length > 0) {
          const rankAndCatagoryStr = rankAndCatagoryElement.text().trim().match(RankAndCatagoryPattern);
          if(rankAndCatagoryStr) {
            const parts = rankAndCatagoryStr[0].substring(1).split(" ");
            rank = parts[0];
            catagory = parts.slice(2).join(" ");
          }
        }

        return {
          catagory: catagory,
          dimensions: dimensions,
          rank: rank
        };
      });
  }
};
