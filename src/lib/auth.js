// src/lib/auth.js
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      
      async profile(profile) {
        try {
          // Check if customer exists
          let customer = await prisma.customer.findUnique({
            where: { 
              email: profile.email 
            },
          });

          // If customer doesn't exist, create new one
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                googleId: profile.sub, // Google ID
                name: profile.name || "",
                email: profile.email,
                avatarUrl: profile.picture,
              },
            });
          } else {
            // Update existing customer info
            customer = await prisma.customer.update({
              where: { id: customer.id },
              data: {
                name: profile.name || customer.name,
                avatarUrl: profile.picture || customer.avatarUrl,
              },
            });
          }

          return {
            id: customer.id.toString(),
            name: customer.name,
            email: customer.email,
            image: customer.avatarUrl,
            googleId: customer.googleId,
          };
        } catch (error) {
          console.error("Google profile error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.googleId = user.googleId;
      }

      // Store Google tokens if available
      if (account?.provider === "google" && account.access_token) {
        try {
          const customerId = parseInt(token.id);
          
          // Store or update Google tokens
          await prisma.googleToken.upsert({
            where: { customerId },
            update: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token || "",
              tokenExpiresAt: new Date(account.expires_at * 1000),
            },
            create: {
              customerId,
              accessToken: account.access_token,
              refreshToken: account.refresh_token || "",
              tokenExpiresAt: new Date(account.expires_at * 1000),
            },
          });
        } catch (error) {
          console.error("Token storage error:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        
        // Get fresh customer data
        try {
          const customer = await prisma.customer.findUnique({
            where: { id: parseInt(token.id) },
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              phone: true,
              address: true,
            },
          });

          if (customer) {
            session.user.name = customer.name;
            session.user.email = customer.email;
            session.user.image = customer.avatarUrl;
            session.user.phone = customer.phone;
            session.user.address = customer.address;
          }
        } catch (error) {
          console.error("Session callback error:", error);
        }
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Additional sign-in validation if needed
      if (account?.provider === "google") {
        try {
          const customerId = parseInt(user.id);
          
          // Create login session record
          await prisma.loginSession.create({
            data: {
              id: crypto.randomUUID(),
              customerId,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              // ipAddress and userAgent would need to be passed from request
            },
          });

          return true;
        } catch (error) {
          console.error("Sign-in error:", error);
          return false;
        }
      }
      
      return true;
    },
  },

  events: {
    async signOut({ token }) {
      // Clean up login sessions when user signs out
      if (token?.id) {
        try {
          await prisma.loginSession.deleteMany({
            where: {
              customerId: parseInt(token.id),
            },
          });
        } catch (error) {
          console.error("Sign-out cleanup error:", error);
        }
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function สำหรับ API routes
export async function getAuthSession() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Auth session:", session ? "Found" : "Not found");
    return session;
  } catch (error) {
    console.error("Error getting auth session:", error);
    return null;
  }
}