// import passport from "passport";
// import prisma from "./prisma-client.js";
// import JwtStrategy from "passport-jwt";
// import { LocalStrategy } from "passport-local";

// const verifyCallback = async (username, password, done) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: {
//         username: username,
//       },
//     });
//     if (!user) {
//       return done(null, false, { message: "Incorrect username" });
//     }

//     const match = await bcrypt.compare(password, user.password);

//     if (!match) {
//       return done(null, false, { message: "Incorrect password" });
//     }
//     return done(null, user);
//   } catch (err) {
//     return done(err);
//   }
// };

// const strategy = new JwtStrategy(verifyCallback);
// passport.use(strategy);

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: {
//         id: Number(id),
//       },
//     });
//     if (!user) {
//       return done(new Error("User not found"), null);
//     }
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });
