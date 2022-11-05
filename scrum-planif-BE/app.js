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
                let token = req.header("Authorization").substr(7);

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

    let realHeader = null;
    if (typeof conf.realHeader !== "undefined") {
        realHeader = conf.realHeader;
    }

    // Not realy usefull : there is not real auth
    const rateLimit = require('express-rate-limit');
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,   // 15 minutes
        max: 100,                   // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        standardHeaders: true,      // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false,       // Disable the `X-RateLimit-*` headers
        // eslint-disable-next-line no-unused-vars
        keyGenerator: (request, response) => {
            // if load balancer
            return request.headers[realHeader] || request.ip;
        },
        // eslint-disable-next-line no-unused-vars
        skip: (request, response) => { 
            return (request.method === 'OPTIONS') ;
        }
    });
    app.use('/auth/', authLimiter);
    app.use('/auth', authRouter);
    //app.use('/planifs', planifsRouter);

    return app;
}
module.exports = initApp;
