const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET ;

passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // console.log(profile); // Google se user ka data milta
        
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // Check if user exists with same email but different provider
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                // Update existing user with googleId
                user.googleId = profile.id;
                user.authProvider = "google";
                if (!user.profileImage) user.profileImage = profile.photos[0].value;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    authProvider: "google",
                    profileImage: profile.photos[0].value,
                    isVerified: true
                });
            }
        }
        
        return done(null, user); // DB user object session me save
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user); // session me store
});

passport.deserializeUser((user, done) => {
    done(null, user); // session se read
});

module.exports = passport;

