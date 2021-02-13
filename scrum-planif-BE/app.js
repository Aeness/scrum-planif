var express = require('express');
var helmet = require('helmet');
var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');

var authRouter = require('./routes/auth');
//var planifsRouter = require('./routes/planifs');

function initApp(conf) {

    let app = express();

    // Make information accessible to our routers
    app.set('tokensecret', conf.tokenSecret);
    app.set('refreshsecret', conf.refreshSecret);

    // Node.js body parsing middleware.
    app.use(bodyParser.json());
    
    app.use(helmet());
    app.disable('x-powered-by');

    // CORS (Cross-Origin Resource Sharing)
    // https://www.html5rocks.com/en/tutorials/cors/
    app.use(function(req,res,next){
        // TODO : Allow less
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With,Authorization, content-type");
        // TODO : ask the Web browser uses cache 
        // res.header("Access-Control-Max-Age", "3600");

        next();
    });

    // used to create, sign, and verify tokens
    var jwt = require('jsonwebtoken');

    // Checks jwt
    app.use(function(req,res,next){

        if (req.method !== "OPTIONS" && !req.path.startsWith("/auth")) {

            if (req.header("Authorization") && req.header("Authorization").startsWith("Bearer ")) {
                var token = req.header("Authorization").substr(7);

                jwt.verify(token,req.app.set('tokensecret'),function(err){
                    if(err){

                        require('debug')('scrum-planif:router')("Wrong JWT for " + req.path + ":%j", err);
                        res.sendStatus(401, err);
                        // TODO add location
                    } else {
                        next();
                    }
                });
            } else {
                require('debug')('scrum-planif:router')("Wrong Authorization for", req.path);
                res.sendStatus(403);
                // TODO add location
            }
        } else {
            next();
        }
    });

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/auth', authRouter);
    //app.use('/planifs', planifsRouter);

    return app;
}
module.exports = initApp;
