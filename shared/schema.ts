import { pgTable, serial, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
visitorId: varchar("visitor_id", { length: 50 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("colaborador"),
  status: varchar("status", { length: 50 }).notNull().default("ativo"),
  avatar: text("avatar"),
  cpf: varchar("cpf", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  capacity: integer("capacity").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  image: text("image"),
  amenities: jsonb("amenities").default([]),
  isAvailable: boolean("is_available").notNull().default(true),
  status: varchar("status", { length: 50 }).default("active"),
  pricePerHour: integer("price_per_hour"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 100 }).notNull().default("Disponível"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => rooms.id),
  userId: integer("user_id").notNull().references(() => users.id),
  roomName: varchar("room_name", { length: 255 }).notNull(),
  roomLocation: varchar("room_location", { length: 255 }).notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("confirmed"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  reservations: many(reservations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  room: one(rooms, {
    fields: [reservations.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
}));

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  resource: varchar("resource", { length: 50 }).notNull(),
  resourceId: integer("resource_id"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  result: varchar("result", { length: 20 }).notNull(),
  details: jsonb("details"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
