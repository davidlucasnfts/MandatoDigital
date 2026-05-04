import { createRouter, publicQuery } from "./middleware";

export const authRouter = createRouter({
  me: publicQuery.query(() => null),
  logout: publicQuery.mutation(() => ({ success: true })),
});
