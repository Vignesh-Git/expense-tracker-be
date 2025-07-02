// Google OAuth removed. Add local strategy or leave empty if not needed. 

import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';

/**
 * Passport configuration with JWT strategy
 * Handles token-based authentication
 */
export const initializePassport = () => {
  // JWT Strategy configuration
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
  };

  // JWT Strategy for token validation
  passport.use(
    new JwtStrategy(jwtOptions, async (payload: any, done: any) => {
      try {
        const user = await User.findById(payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Serialize user for session (not used in JWT but required)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session (not used in JWT but required)
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}; 