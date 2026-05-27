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
  "veteado",
  "retirado",
]);

export const statusEnqueteEnum = pgEnum("status_enquete", [
  "rascunho",
  "publicada",
  "encerrada",
  "arquivada",
]);

export const equipe = pgTable("equipe", {
  id: uuid("id").defaultRandom().primaryKey(),
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

export const enquetes = pgTable("enquetes", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull(),
  userId: uuid("user_id").notNull(),
  titulo: varchar("titulo", { length: 500 }).notNull(),
  descricao: text("descricao"),
  status: statusEnqueteEnum("status").default("rascunho").notNull(),
  dataPublicacao: date("data_publicacao", { mode: "date" }),
  dataEncerramento: date("data_encerramento", { mode: "date" }),
  permiteMultiplaEscolha: integer("permite_multipla_escolha").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const enqueteOpcoes = pgTable("enquete_opcoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  enqueteId: uuid("enquete_id").notNull(),
  ownerId: uuid("owner_id").notNull(),
  texto: varchar("texto", { length: 500 }).notNull(),
  ordem: integer("ordem").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enqueteRespostas = pgTable("enquete_respostas", {
  id: uuid("id").primaryKey().defaultRandom(),
  enqueteId: uuid("enquete_id").notNull(),
  opcaoId: uuid("opcao_id").notNull(),
  ownerId: uuid("owner_id").notNull(),
  eleitorId: uuid("eleitor_id"),
  nomeRespondente: varchar("nome_respondente", { length: 255 }),
  telefoneRespondente: varchar("telefone_respondente", { length: 20 }),
  observacao: text("observacao"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// CNEFE - Cadastro Nacional de Enderecos para Fins Estatisticos (IBGE)
export const cnefeEnderecos = pgTable("cnefe_enderecos", {
  id: serial("id").primaryKey(),
  uf: varchar("uf", { length: 2 }).notNull(),
  codigoMunicipio: varchar("codigo_municipio", { length: 20 }),
  municipio: varchar("municipio", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }),
  tipoLogradouro: varchar("tipo_logradouro", { length: 50 }),
  nomeLogradouro: varchar("nome_logradouro", { length: 200 }).notNull(),
  numero: varchar("numero", { length: 20 }),
  cep: varchar("cep", { length: 8 }),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  nivelGeocodificacao: integer("nivel_geocodificacao").default(3),
  codigoUnico: varchar("codigo_unico", { length: 50 }).unique(),
});

export const cepCache = pgTable("cep_cache", {
  id: serial("id").primaryKey(),
  cep: varchar("cep", { length: 8 }).notNull().unique(),
  logradouro: varchar("logradouro", { length: 200 }),
  bairro: varchar("bairro", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  source: varchar("source", { length: 20 }).notNull().default("here"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
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
export type Enquete = typeof enquetes.$inferSelect;
export type InsertEnquete = typeof enquetes.$inferInsert;
export type EnqueteOpcao = typeof enqueteOpcoes.$inferSelect;
export type InsertEnqueteOpcao = typeof enqueteOpcoes.$inferInsert;
export type EnqueteResposta = typeof enqueteRespostas.$inferSelect;
export type InsertEnqueteResposta = typeof enqueteRespostas.$inferInsert;
export type CnefeEndereco = typeof cnefeEnderecos.$inferSelect;
export type InsertCnefeEndereco = typeof cnefeEnderecos.$inferInsert;
export type CepCache = typeof cepCache.$inferSelect;
export type InsertCepCache = typeof cepCache.$inferInsert;
