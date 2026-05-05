import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "editor", "visualizador"]);
export const statusEnum = pgEnum("status", ["ativo", "inativo"]);

export const equipe = pgTable("equipe", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  ownerId: uuid("owner_id").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  cargo: varchar("cargo", { length: 100 }),
  role: roleEnum("role").default("visualizador").notNull(),
  status: statusEnum("status").default("ativo").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("admin").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Equipe = typeof equipe.$inferSelect;
export type InsertEquipe = typeof equipe.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
