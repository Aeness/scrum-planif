var express = require('express');
var router = express.Router();
const { body } = require('express-validator');
const { spValidationResult } = require('../sp-validation-result');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

router.options('/', function(req, res/*, next*/) {
    res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.sendStatus(200);
});

router.options('/refresh', function(req, res/*, next*/) {
    res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.sendStatus(200);
});


var newAuthValidation = [
    body('player.name')
        .not().isEmpty().withMessage('Le nom ne peut pas être vide.')
        .isLength({min:3}).withMessage('Le nom doit comporter au moins 3 caractères.')
        .matches(/^[0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ@_'".\- ]+$/i).withMessage('Le nom ne doit comporter que des caractères alphanumérique ou @ _ - " \' .')
];
router.post('/', newAuthValidation, function(req, res/*, next*/) {
    const routerErrors = spValidationResult(req);
    if (!routerErrors.isEmpty()) {
        res.status(400).json(routerErrors.getErrors());
        return;
    }


    res.json(createTokens(
        req.app,
        Math.random().toString(36).substr(2, 9),
        req.body.player.name
    ));
});

router.post('/refresh', function(req, res/*, next*/) {
    var refreshToken = req.header("Authorization").substr(7);

    jwt.verify(refreshToken,req.app.get('refreshsecret'),function(err,refreshTokenDecoded){
        if (err) {
            res.sendStatus(401);
        } else {
            res.json(createTokens(
                req.app,
                refreshTokenDecoded.ref,
                refreshTokenDecoded.name
            ));
        }
    })
});

const createTokens = function(app, player_ref,player_name) {
    // https://www.iana.org/assignments/jwt/jwt.xhtml
    // claims will be in the PAYLOAD
    var claims = {
        ref: player_ref,
        name: player_name
    };

    var token = jwt.sign(
        claims, app.get('tokensecret'),
        {
            //algorithm: 'RS256',
            expiresIn: 900 // expires in 15 minutes
        }
    );

    var refreshToken = jwt.sign(
        claims, app.get('refreshsecret'),
        {
            //algorithm: 'RS256',
            expiresIn: 1800 // expires in 30 minutes
        }
    );

    return {
        token: token,
        refreshToken: refreshToken
    };
}

module.exports = router;
