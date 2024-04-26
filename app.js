const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport')
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');
const issueJWT = require('./utils/issueJWT');
const fs = require('fs')
const cors = require('cors')

const publicKey = fs.readFileSync(path.resolve(__dirname, 'id_rsa_pub.pem'), 'utf8')
console.log(publicKey)
/* 
  PASSPORT + JWT CONFIGURATION
*/
const passportJwtOptions = {
  // Authorization: Bearer <token>
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: publicKey,
  algorithms: ['RS256']
};

passport.use(new JwtStrategy(passportJwtOptions, async (jwtPayload, done) => {
  try {
    const user = {_id: jwtPayload.sub}
    if (user) {
      // no error, and a user was found
      done(null, user)
    } else {
      // no error, and a user wansn't found
      done(null, false)
    }
  } catch (e) {
    // some kind of error occurred
    done(e, false)
  }
}))

var app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// debugging middleware
let requestCntr = 0;
app.use((req, res, next) => {
    let thisRequest = requestCntr++;
    console.log(`REQUEST ${thisRequest}: ${req.method}, ${req.originalUrl}, `, req.headers);
    // watch for end of theresponse
    res.on('close', () => {
        console.log(`RESPONSE ${thisRequest}: close response, res.statusCode = ${res.statusCode}, outbound headers: `, res.getHeaders(), '\n', res.body);
    });
    next();
});

app.get('/login', (req, res) => {
  const {token, expires} = issueJWT({_id: "greg"})
  res.json({token, expires})
  console.log('response sent:', {token, expires})
})

app.get('/', 
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    res.json({msg: "authorized"})
    console.log('response sent:', {msg: 'authorized'})
  }
)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
