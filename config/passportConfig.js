// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id).then((user) => {
//     done(null, user);
//   });
// });

// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/User");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "https://supplya.cyclic.app/api/v1/auth/google/callback",
//       passReqToCallback: true,
//     },
//     async (req, accessToken, refreshToken, profile, done) => {
//       try {
//         if (!profile || !profile.id) {
//           throw new Error("Profile ID not found");
//         }

//         const { given_name, family_name, phone_number, email, password } =
//           profile._json;
//         console.log(profile._json);

//         let existingUser = await User.findOne({ email });

//         if (existingUser) {
//           return done(null, existingUser);
//         }

//         // Ensure that all required fields are present
//         if (!given_name || !family_name || !email) {
//           throw new Error("Required fields missing in the Google profile");
//         }

//         const newUser = await User.findOne({ googleId: profile.id });

//         if (newUser) {
//           return done(null, newUser);
//         } else {
//           // Create a new user with Google profile information
//           const createdUser = await User.create({
//             googleId: profile.id,
//             firstName: given_name,
//             lastName: family_name,
//             email: email,
//             phoneNumber: "0",
//             password: password || process.env.GOOGLE_OAUTH_PASSWORD,
//           });
//           return done(null, createdUser);
//         }
//       } catch (error) {
//         console.error("Error in Google OAuth strategy:", error);
//         done(error, false);
//       }
//     }
//   )
// );

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (!profile || !profile.id) {
          return done(new Error("Profile ID not found"));
        }

        const { given_name, family_name, email } = profile._json;

        if (!given_name || !family_name || !email) {
          return done(
            new Error("Required fields missing in the Google profile")
          );
        }

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            firstName: given_name,
            lastName: family_name,
            email: email,
            phoneNumber: "0",
            password: process.env.GOOGLE_OAUTH_PASSWORD || "",
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Error in Google OAuth strategy:", error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});
