const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET ;

passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: "/auth/google/callback"
},
(accessToken, refreshToken, profile, done) => {
    console.log(profile); // Google se user ka data milta
    return done(null, profile); // session me save
}));

passport.serializeUser((user, done) => {
    done(null, user); // session me store
});

passport.deserializeUser((user, done) => {
    done(null, user); // session se read
});

module.exports = passport;