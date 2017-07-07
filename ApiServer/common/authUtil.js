var passport = require('passport'); // Authentication Framework
var LocalStrategy = require('passport-local').Strategy; // Authentication Strategy
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var FacebookTokenStrategy = require('passport-facebook-token');
var Account = require('../model/accounts');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var commonConfig = require('../common/configUtil');

exports.getPassport = function() {
  return passport;
}
exports.extractJwt = function(req) {
    var token = null;
    if(req)
    {
      const headers = req.headers;
      if(headers) {
        const authorization = headers['authorization']
        if(authorization) { 
          const bearer = authorization.startsWith('Bearer ')
          if(bearer) {
            token = authorization.substring(7);
          }
        }
      }
    }
    return token;
};
exports.createJwt = function(account) {
  const expiration = Math.floor(Date.now() / 1000) + (60 * 60);
  const token = jwt.sign(
    {
      exp: expiration,
      data: {
        user: account.toObject()
      }
    },
    commonConfig.jwtSecret);
  return { token: token, expiration: expiration };
}
exports.ensureAdmin = function(req, res, next) {
  if(req.user.email === commonConfig.adminEmail) {
    next()
  }
  else {
      var err = new Error('Action requires adminstrative account access..')
      err.status = 401
      next(err)
  }
}

// exports.checkAuthenticated = function(req, res, next) {
//     passport.authenticate(
//     [ 'jwt' ],
//     (err, user, info) => {
//       if (err) { 
//         next(); 
//       }
//       else if (!user) {
//         next(); 
//       }
//       else {
//         req.logIn(user, (err) => {
//           if (err) { 
//             next(); 
//           }
//           else {
//             next();
//           }
//         });
//       }
//     })(req, res, next)
// }

exports.ensureAuthenticated = function(req, res, next) {
  passport.authenticate(
    [ 'jwt' ],
    (err, user, info) => {
      if (err) {
        err.status = 500
        next(err); 
      }
      else if (!user) {
        info.status = 401
        next(info);
      }
      else {
        req.logIn(user, (err) => {
          if (err) { 
            err.status = 500
            next(err); 
          }
          else {
            next();
          }
        });
      }
  })(req, res, next)
}

// Authenticates client provided "JWT token" validity...
// This middleware is called on each request to ensure token validity, 
// because it does not query any databases/apis to check user credentials.
// (A valid token already implies trust!)
passport.use('jwt', new JwtStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: false,
    secretOrKey: commonConfig.jwtSecret,
    jwtFromRequest: exports.extractJwt
  },
  (req, jwt_payload, next) => {
    // Technically not necessary to verify credentials here.
    // If this function is reach it is already implied that
    // the user is authenticated via a valid signed token found in the auth header.
    var user = new Account(jwt_payload.data.user);
    // Refresh jwt... if needed? (bad practice, because otherwise tokens would never expire..)
    next(null, user)
  })
);
// Authenticates client provided credentials validity against my custom MongoDB
passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
  },
  (req, email, password, next) => {
    Account.read(
      {
        query: { email: email }
      })
      .then((results) => {
        switch(results.length) {
          case 1: // FOUND
            const account = new Account(results[0]);
            if(!bcrypt.compareSync(password, account.passwordHashAndSalt)) {
              var err = new Error('Incorrect Password!')
              err.status = 401
              next(null, false, err)
            }
            else {
              next(null, account)
            }
            break;
          case 0: // NOT FOUND
            var err = new Error('Account not found!')
            err.status = 404
            next(null, false, err)
            break;
          default: // TOO MANY FOUND
            var err = new Error('Too many accounts were found matching this email. Contact server admin.')
            err.status = 500
            next(null, false, err)
            break;
        }
      })
      .catch((err) => {
        next(err)
      });
  })
);


// Authenticates client provided "Facebook token" validity
// This middleware queries the facebook GraphAPI to return facebook account details,
// therefore this is only called on initial login (not each request).
passport.use('facebook', new FacebookTokenStrategy({
    clientID: commonConfig.facebookAppID,
    clientSecret: commonConfig.facebookAppSecret,
    passReqToCallback: true,
    profileFields: ['id', 'displayName', 'photos', 'email', 'first_name', 'last_name' ]
  },
  function(req, accessToken, refreshToken, profile, next) {
    // Find account matching facebook profile id
    const emailsList = (profile.emails && profile.emails.length > 0) ? profile.emails.map((item) => { return item.value }) : []
    Account.read(
    {
      query: {
        $or: [
          { facebookProfileID: profile.id }, 
          { email: { $in: emailsList } } ]
      }
    })
    .then((results) => {
      try {
        switch(results.length) {
          case 1: // Account match found!
            const account = new Account(results[0]);
            // Check if Email & ProfileID match between my local account data & facebooks profile data.
            if(account.email && emailsList.indexOf(account.email) !== -1 && account.email === emailsList[emailsList.indexOf(account.email)]
              && account.facebookProfileID && account.facebookProfileID === profile.id) {
              // Full match
              next(null, account);
            }
            else { // Partial Match
              if(!account.facebookProfileID) {
                // Email matched but missing ID, between Backend System & Facebook profile!
                // Update System adding FacebookProfileID
                account.facebookProfileID = profile.id;
                Account.update({
                  account: account
                })
                .then((results) => {
                  next(null, account)
                })
                .catch((err) => {
                  next(err)
                })
              }
              else {
                // ID must have matched between Backend System & Facebook profile!
                if(!account.email) {
                  // Email missing in Backend System, update with facebook's first email!!
                  account.email = emailsList[0];
                  Account.update({
                    account: account
                  })
                  .then((results) => {
                    next(null, account.toObject())
                  })
                  .catch((err) => {
                    next(err)
                  })
                }
                else {
                  // Email mismatch between System and Facebook... Weird error!
                  const err = new Error('This facebook profile matches an ID in the backend, but the email on record does not match!')
                  err.status = 500
                  next(err)
                }
              }
            }
            break;
          case 0: // New Account/User!!!!
            const newAccount = new Account({
              facebookProfileID: profile.id,
              nameFirst: profile.name.givenName,
              nameLast: profile.name.familyName,
              email: profile.emails[0].value
            })
            Account.create({ account: newAccount })
            .then((results) => {
              next(null, results.ops[0])
            })
            .catch((err) => {
              // Account create failed!
              next(err)
            });
            break;
          default: // ERROR!!! Too many matches...
            const err = new Error('This facebook profile seems to match multiple accounts this system, which should never be the case!')
            err.status = 500
            next(err)
            break;
        }
      }
      catch(err){
        next(err)
      }
    })
    .catch((err) => {
      next(err)
    });
  })
);
passport.serializeUser(function(accountObject, done) {
  const accountJson = accountObject.toObject()
  const clientFriendlyAccountString = JSON.stringify(accountJson)
  done(null, clientFriendlyAccountString);
  // done(null, account.id);
});
passport.deserializeUser(function(accountString, done) {
  const accountJson = JSON.parse(accountString);
  const accountClass = new Account(accountJson);
  done(null, accountClass);
  // done(err, { id: '1234', username: 'Josh' });
});