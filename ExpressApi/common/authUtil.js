var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var commonConfig = require('../common/configUtil');
var Account = require('../model/accounts');
var passport = require('passport'); // Authentication Framework
var LocalStrategy = require('passport-local').Strategy; // Authentication Strategy
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var CustomError = require('../common/errorUtil');
var FacebookTokenStrategy = require('passport-facebook-token');

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
exports.decodeToken = function(token) {
  var decoded = jwt.verify(token, commonConfig.jwtSecret)
  return decoded;
}
exports.createJwt = function(account) {
  const expiration = Math.floor(Date.now() / 1000) + (60 * 60);
  const token = jwt.sign(
    {
      exp: expiration,
      data: {
        user: account.toJSON()
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
    next(new CustomError('', 401))
  }
}
exports.ensureAuthenticated = function(req, res, next) {
  passport.authenticate(
    [ 'jwt' ],
    (err, user, info) => {
      if (err) {
        next(new CustomError('JWT verification failed.', 500, err))
      }
      else if (!user) {
        next(new CustomError('JWT invalid.', 401, info))
      }
      else {
        req.logIn(user, (err) => {
          if (err) { 
            next(new CustomError('JWT failed login user.', 500, err))
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
      .then((accounts) => {
        switch(accounts.length) {
          case 1: // FOUND
            const account = new Account(accounts[0]);
            if(account.passwordHashAndSalt) {
              if(!bcrypt.compareSync(password, account.passwordHashAndSalt)) {
                next(new CustomError('Incorrect Password!', 401))
                // next(null, false, new CustomError('Incorrect Password!', 401))
              }
              else {
                next(null, account)
              }
            }
            else {
              next(new CustomError('This account was registered via an external Social Media service, either login using with the appropriate method (then link your social account with a local password).', 401));
              // next(null, false, new CustomError('This account was registered via an external Social Media service, either login using with the appropriate method (then link your social account with a local password).', 401))
            }
            break;
          case 0: // NOT FOUND
            next(new CustomError('Account not found!', 404));
            // next(null, false, new CustomError('Account not found!', 404))
            break;
          default: // TOO MANY FOUND
            next(new CustomError('Too many accounts were found matching this email. Contact server admin.', 500));
            // next(null, false, new CustomError('Too many accounts were found matching this email. Contact server admin.', 500))
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
    .then((accounts) => {
      try {
        switch(accounts.length) {
          case 1: // Account match found!
            const account = new Account(accounts[0]);
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
                .then((account) => {
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
                  .then((account) => {
                    next(null, account)
                  })
                  .catch((err) => {
                    next(err)
                  })
                }
                else {
                  // Email mismatch between System and Facebook... Weird error!
                  next(new CustomError('This facebook profile matches an ID in the backend, but the email on record does not match!', 500))
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
            .then((account) => {
              next(null, account)
            })
            .catch((err) => {
              // Account create failed!
              next(err)
            });
            break;
          default: // ERROR!!! Too many matches...
            next(new CustomError('This facebook profile seems to match multiple accounts this system, which should never be the case!', 500))
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
  done(null, JSON.stringify(accountObject));
});
passport.deserializeUser(function(accountString, done) {
  const accountJson = JSON.parse(accountString);
  const accountClass = new Account(accountJson);
  done(null, accountClass);
});