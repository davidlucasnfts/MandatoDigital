import { createRouter, publicQuery, authedQuery } from "./middleware";

export const authRouter = createRouter({
  me: authedQuery.query(({ ctx }) => ctx.user),
  logout: publicQuery.mutation(() => ({ success: true })),
});
