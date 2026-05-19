import { createRouter, publicQuery, authedQuery } from "./middleware.js";

export const authRouter = createRouter({
  me: authedQuery.query(({ ctx }) => ctx.user),
  logout: publicQuery.mutation(() => ({ success: true })),
});
