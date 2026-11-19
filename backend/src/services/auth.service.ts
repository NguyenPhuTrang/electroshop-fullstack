
import { z } from "zod";
import {
  loginSchema,
  registerSchema,
} from "../validations/auth.validation";
import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

export const registerUser = async (
  data: z.infer<typeof registerSchema>
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new AppError(
      "User with this email already exists",
      409
    );
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      avatarUrl: data.avatarUrl || null,
    },
  });

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const loginUser = async (
  data: z.infer<typeof loginSchema>
) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user || !user.password) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(
      "Your account is not active",
      403
    );
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const loginWithGoogle = async (idToken: string) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new AppError(
      "Google authentication is not configured",
      500
    );
  }

  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });

    payload = ticket.getPayload();
  } catch {
    throw new AppError(
      "Invalid Google ID Token",
      401
    );
  }

  if (
    !payload ||
    !payload.sub ||
    !payload.email ||
    payload.email_verified !== true
  ) {
    throw new AppError(
      "Invalid Google account information",
      401
    );
  }

  const googleId = payload.sub;
  const email = payload.email.toLowerCase();

  // 1. Find existing Google account
  const existingGoogleUser = await prisma.user.findUnique({
    where: {
      googleId,
    },
  });

  if (existingGoogleUser) {
    if (existingGoogleUser.status !== "ACTIVE") {
      throw new AppError(
        "Your account is not active",
        403
      );
    }

    const { password, ...userWithoutPassword } =
      existingGoogleUser;

    return userWithoutPassword;
  }

  // 2. Check whether email already belongs to another account
  const existingEmailUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingEmailUser) {
    throw new AppError(
      "This email is already registered. Please log in using your existing account first.",
      409
    );
  }

  // 3. Create a new Google account
  const user = await prisma.user.create({
    data: {
      name: payload.name || email.split("@")[0],
      email,
      googleId,
      password: null,
      avatarUrl: payload.picture || null,
    },
  });

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};
