import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  uuid,
  jsonb,
  inet,
  integer,
  date,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "editor", "visualizador"]);
export const statusEnum = pgEnum("status", ["ativo", "inativo"]);

export const tipoProposicaoEnum = pgEnum("tipo_proposicao", [
  "projeto_lei",
  "emenda",
  "indicacao",
  "requerimento",
  "parecer",
  "mocao",
  "decreto",
]);

export const statusProposicaoEnum = pgEnum("status_proposicao", [
  "em_elaboracao",
  "protocolado",
  "em_tramitacao",
  "em_comissao",
  "aprovado",
  "rejeitado",
  "sancionado",
  "arquivado",
  "vetoado",
  "retirado",
]);

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

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  action: varchar("action", { length: 20 }).notNull(),
  tableName: varchar("table_name", { length: 100 }).notNull(),
  recordId: text("record_id"),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const proposicoes = pgTable("proposicoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull(),
  userId: uuid("user_id").notNull(),
  tipo: tipoProposicaoEnum("tipo").notNull(),
  numero: varchar("numero", { length: 50 }),
  ano: integer("ano"),
  titulo: varchar("titulo", { length: 500 }).notNull(),
  ementa: text("ementa"),
  tema: varchar("tema", { length: 100 }),
  status: statusProposicaoEnum("status").default("em_elaboracao").notNull(),
  dataApresentacao: date("data_apresentacao", { mode: "date" }),
  dataAprovacao: date("data_aprovacao", { mode: "date" }),
  orgaoAtual: varchar("orgao_atual", { length: 200 }),
  relator: varchar("relator", { length: 255 }),
  linkOficial: text("link_oficial"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const tramitacoes = pgTable("tramitacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  proposicaoId: uuid("proposicao_id").notNull(),
  ownerId: uuid("owner_id").notNull(),
  userId: uuid("user_id").notNull(),
  data: date("data", { mode: "date" }).notNull(),
  orgao: varchar("orgao", { length: 200 }).notNull(),
  status: statusProposicaoEnum("status").notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Equipe = typeof equipe.$inferSelect;
export type InsertEquipe = typeof equipe.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type Proposicao = typeof proposicoes.$inferSelect;
export type InsertProposicao = typeof proposicoes.$inferInsert;
export type Tramitacao = typeof tramitacoes.$inferSelect;
export type InsertTramitacao = typeof tramitacoes.$inferInsert;
