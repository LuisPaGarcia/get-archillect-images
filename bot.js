require("dotenv").config();

if (
  !process.env.CONSUMER_KEY ||
  !process.env.CONSUMER_SECRET ||
  !process.env.ACCESS_TOKEN ||
  !process.env.ACCESS_TOKEN_SECRET
) {
  console.log(
    `You need to fill your credentials on .env file, go to https://developer.twitter.com/ to get yours.
    @luispa`
  );

  process.exit();
}

var Twit = require("twit");
var http = require("http");
var { extname } = require("path");
var { existsSync, writeFile, createWriteStream, mkdirSync } = require("fs");

var jsonDir = "./json";
var imgDir = "./images";

if (!existsSync(jsonDir)) mkdirSync(jsonDir);
if (!existsSync(imgDir)) mkdirSync(imgDir);

var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000 // Request timeout, optional
});

var options = { screen_name: "archillect", count: 10 };
T.get("statuses/user_timeline", options, (err, data, response) => {
  for (let index = 0; index < options.count; index++) {
    const element = data[index];
    writeFile(
      __dirname + "/json/" + element.id + ".json",
      JSON.stringify(element),
      err => {
        if (err) {
          return console.log(err);
        }
        console.log("Json was saved!");
        var file = createWriteStream(
          __dirname +
            "/images/" +
            element.id +
            extname(element.extended_entities.media[0].media_url)
        );
        var request = http.get(
          element.extended_entities.media[0].media_url,
          response => {
            response.pipe(file);
            console.log("Image saved.");
          }
        );
      }
    );
  }
});
