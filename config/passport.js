const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/github/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
    //   console.log("GitHub Profile:", profile); // Debug log
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user); // Store full profile
});

passport.deserializeUser((user, done) => {
  done(null, user); // Return full profile
});

module.exports = passport;