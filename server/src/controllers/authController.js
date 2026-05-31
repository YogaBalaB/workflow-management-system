import crypto from 'crypto';
import { userRepository } from '../repositories/userRepository.js';
import { comparePassword, hashPassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/generateToken.js';
import { responseHandler } from '../utils/responseHandler.js';

export const authController = {
  /**
   * Log in user using email and password
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Fetch user by email
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return responseHandler.error(res, 'Invalid email or password.', null, 401);
      }

      // 2. Validate password
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return responseHandler.error(res, 'Invalid email or password.', null, 401);
      }

      // 3. Generate JWT
      const token = generateToken(user);

      // 4. Return success with token and role
      return responseHandler.success(res, {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }, 'Logged in successfully.');

    } catch (err) {
      next(err);
    }
  },

  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      // 1. Check if user already exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return responseHandler.error(res, 'User with this email already exists.', null, 400);
      }

      // 2. Hash the password
      const hashedPassword = await hashPassword(password);

      // 3. Create user record
      const newUser = await userRepository.create({
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role: role || 'User'
      });

      // 4. Generate JWT
      const token = generateToken(newUser);

      // 5. Return success
      return responseHandler.success(res, {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }, 'Registered and logged in successfully.', 201);

    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return responseHandler.error(res, 'User profile not found.', null, 404);
      }
      return responseHandler.success(res, user, 'User profile retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }
};

