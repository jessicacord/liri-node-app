//Bring in all required node modules
require("dotenv").config();

var keys = require("./keys.js");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");
var fs = require("fs");


//Define keys for Spotify and Twitter
function Spotify(keys) {
    this.id = keys.id;
    this.secret = keys.secret;
}

function Twitter(keys) {
    this.consumer_key = keys.consumer_key;
    this.consumer_secret = keys.consumer_secret;
    this.access_token_key = keys.access_token_key;
    this.access_token_secret = keys.access_token_secret;
}

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

//Store user input
var terminal = process.argv;
var command = terminal[2];
var lookup = terminal[3];


//Log user input to log.txt
var log = function() {

    if ( lookup === undefined ) {
        fs.appendFile("log.txt", 
            "\nCommand: " + command + "\n", 
            function(err) {
            if (err) {
                return console.log(err);
            }
        });
    } else {
        fs.appendFile("log.txt", 
        "\nCommand: " + command + 
        
        "\nLookup: " + lookup + "\n", 
        function(err) {
        if (err) {
            return console.log(err);
        }
    });
    }

}

//Divider to be used in between logs and responses
function appendDivider() {
    fs.appendFile("log.txt", "--------------------\n", function(err) {
        if (err) {
            return console.log(err);
        }
    });
}


//Look up movie for movie-this. Lookup determined by user input or default to Mr. Nobody
var lookupMovie = function() {

    request("http://www.omdbapi.com/?t=" + lookup + "&y=&plot=short&apikey=trilogy", function(error, response, body) {

        if (!error && response.statusCode === 200) {
        var info = JSON.parse(body);

        console.log("--------------------\n");
        appendDivider();

        console.log("Title: " + info.Title +
                    "\nYear: " + info.Year +
                    "\nIMDB Rating: " + info.imdbRating +
                    "\n"+ info.Ratings[1].Source + " Rating: " + info.Ratings[1].Value +
                    "\nCountry: " + info.Country +
                    "\nLanguage: " + info.Language +
                    "\nPlot: " + info.Plot +
                    "\nActors: " + info.Actors)
        fs.appendFile("log.txt", "Title: " + info.Title +
                                "\nYear: " + info.Year +
                                "\nIMDB Rating: " + info.imdbRating +
                                "\n"+ info.Ratings[1].Source + " Rating: " + info.Ratings[1].Value +
                                "\nCountry: " + info.Country +
                                "\nLanguage: " + info.Language +
                                "\nPlot: " + info.Plot +
                                "\nActors: " + info.Actors + "\n", function(err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });

    
        console.log("--------------------\n");  
        appendDivider();

        }
    });
}

//Liri with different commands defined

var liri = function() {

    //My Tweets
    if (command === "my-tweets") {
        var params = {screen_name: 'yung_weavy', count: 10};
        client.get('statuses/user_timeline', params, function(error, tweets, response) {
          if (!error) {
            
            appendDivider();
        
            tweets.forEach(function(tweet) {
                console.log(tweet.created_at + ": " + tweet.text)
                fs.appendFile("log.txt", tweet.created_at + ": " + tweet.text + "\n", function(err) {
                    if (err) {
                        return console.log(err);
                    }
                });
            })

            appendDivider();
          }
        });
    }
    
    //Spotify
    if (command === "spotify-this-song") {
        spotify.search({ type: 'track', query: lookup, limit: 1 }, function(err, data) {
            if (err) {
              return console.log('Error occurred: ' + err);
            }
           
            appendDivider();

            console.log("\nArtist: " + data.tracks.items[0].artists[0].name +
                        "\nSong: " + data.tracks.items[0].name +
                        "\nAlbum: " + data.tracks.items[0].album.name +
                        "\nPreveiw: " + data.tracks.items[0].preview_url); 
            fs.appendFile("log.txt", "\nArtist: " + data.tracks.items[0].artists[0].name +
                                    "\nSong: " + data.tracks.items[0].name +
                                    "\nAlbum: " + data.tracks.items[0].album.name +
                                    "\nPreveiw: " + data.tracks.items[0].preview_url +"\n", 
                                    function(err) {
                                            if (err) {
                                                return console.log(err);
                                            }
                                        });

            console.log("_____________________________"); 

            appendDivider();
          });
    }
    
    //OMDB
    if ( command === "movie-this") {
    
        if ( lookup === undefined ) {
            lookup = "Mr. Nobody";
            lookupMovie();
        } else {
            lookupMovie();
        }
     
    }
    
    //Read random.txt
    if ( command === "do-what-it-says") {
        fs.readFile("random.txt", "utf8", function(error, data) {
    
            if (error) {
                return console.log(error);
            }
    
    
            var dataArray = data.split(",");
    
            command = dataArray[0];
            lookup = dataArray[1];

            liri();
        })
    }
    
}

//Run program
log();
liri();

