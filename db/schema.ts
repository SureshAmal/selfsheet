import { pgTable, text, timestamp, boolean, uuid, integer } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  theme: text('theme').default('light').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const protocolsTable = pgTable('protocols', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const protocolLogsTable = pgTable('protocol_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  protocolId: uuid('protocol_id').references(() => protocolsTable.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(), // Format YYYY-MM-DD
  status: boolean('status').default(false).notNull(),
  value: integer('value'), // For chart values (e.g. 1-13 as seen in wireframe line chart)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
