import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  appName: "Lenni",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
        throw new Error("Password-reset email delivery is not configured");
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Reset your Lenni password",
        text: `Reset your Lenni password using this link: ${url}\n\nThis link expires in one hour. If you did not request this, you can ignore this email.`,
        html: `<p>Use the link below to reset your Lenni password:</p><p><a href="${url}">Reset password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`,
      });
      if (error) throw new Error(error.message);
    },
  },
  user: {
    modelName: "User",
    fields: { name: "fullName", image: "avatarUrl", emailVerified: "emailVerified" },
  },
  session: { modelName: "BetterAuthSession" },
  account: { modelName: "BetterAuthAccount" },
  verification: { modelName: "BetterAuthVerification" },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.profile.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
          await prisma.user.update({ where: { id: user.id }, data: { status: "active" } });
        },
      },
    },
  },
});
