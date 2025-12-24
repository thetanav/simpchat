import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./lib/db";

// TODO: Implement Polar integration for payments when ready
// import { polar, checkout } from "@polar-sh/better-auth";
// import { Polar } from "@polar-sh/sdk";
// const polarClient = new Polar({
//   accessToken: process.env.POLAR_ACCESS_TOKEN,
// });

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // plugins: [
  //   polar({
  //     client: polarClient,
  //     createCustomerOnSignUp: true,
  //     use: [
  //       checkout({
  //         products: [
  //           {
  //             productId: "727ebc00-165b-49f6-907b-febaabb6bc92",
  //             slug: "Simp-AI-Pro",
  //           },
  //         ],
  //         successUrl: process.env.POLAR_SUCCESS_URL,
  //         authenticatedUsersOnly: true,
  //       }),
  //     ],
  //   }),
  // ],
});
