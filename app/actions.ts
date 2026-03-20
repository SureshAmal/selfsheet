'use server';

import { db } from '@/db';
import { usersTable, protocolsTable, protocolLogsTable } from '@/db/schema';
import { eq, and, like, inArray } from 'drizzle-orm';

// --- USER ACTIONS ---
export async function registerUser(username: string, passwordHash: string) {
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (existing.length > 0) throw new Error('Username already exists');
    
    const newUser = await db.insert(usersTable).values({ username, password: passwordHash }).returning();
    return { id: newUser[0].id, username: newUser[0].username, theme: newUser[0].theme };
  } catch (error) {
    console.error('Error in registerUser:', error);
    throw new Error('Failed to register');
  }
}

export async function loginUser(username: string, passwordHash: string) {
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (existing.length === 0) throw new Error('User not found');
    
    const user = existing[0];
    if (user.password !== passwordHash) throw new Error('Invalid credentials');
    
    return { id: user.id, username: user.username, theme: user.theme };
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw new Error('Invalid login');
  }
}

export async function updateUserTheme(userId: string, theme: string) {
  try {
    const updated = await db.update(usersTable)
      .set({ theme })
      .where(eq(usersTable.id, userId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Error updating theme:', error);
    throw new Error('Failed to update theme');
  }
}

// --- PROTOCOL ACTIONS ---
export async function getUserProtocols(userId: string) {
  try {
    return await db.select().from(protocolsTable).where(eq(protocolsTable.userId, userId));
  } catch (error) {
    console.error('Error fetching protocols:', error);
    return [];
  }
}

export async function addProtocol(userId: string, name: string) {
  try {
    const newProtocol = await db.insert(protocolsTable).values({ userId, name }).returning();
    return newProtocol[0];
  } catch (error) {
    console.error('Error adding protocol:', error);
    throw new Error('Failed to add protocol');
  }
}

export async function deleteProtocol(protocolId: string) {
  try {
    await db.delete(protocolsTable).where(eq(protocolsTable.id, protocolId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting protocol:', error);
    throw new Error('Failed to delete protocol');
  }
}

export async function updateProtocolName(protocolId: string, newName: string) {
  try {
    const updated = await db.update(protocolsTable)
      .set({ name: newName })
      .where(eq(protocolsTable.id, protocolId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Error updating protocol name:', error);
    throw new Error('Failed to update protocol name');
  }
}

// --- LOG ACTIONS ---
export async function getLogsForMonth(userId: string, monthPrefix: string) {
  // monthPrefix like '2026-03%'
  try {
    const userProtocols = await getUserProtocols(userId);
    if (userProtocols.length === 0) return [];
    
    const protocolIds = userProtocols.map(p => p.id);
    const logs = await db.select().from(protocolLogsTable)
      .where(
        and(
          inArray(protocolLogsTable.protocolId, protocolIds),
          like(protocolLogsTable.date, `${monthPrefix}%`)
        )
      );
    return logs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
}

export async function toggleLogStatus(protocolId: string, date: string, currentStatus: boolean | undefined) {
  try {
    if (currentStatus === undefined) {
      // Create new
      const newLog = await db.insert(protocolLogsTable).values({ protocolId, date, status: true }).returning();
      return newLog[0];
    } else {
      // Toggle
      const updatedLog = await db.update(protocolLogsTable)
        .set({ status: !currentStatus })
        .where(
          and(
            eq(protocolLogsTable.protocolId, protocolId),
            eq(protocolLogsTable.date, date)
          )
        ).returning();
      return updatedLog[0];
    }
  } catch (error) {
    console.error('Error toggling status:', error);
    throw new Error('Failed to toggle status');
  }
}

export async function bulkInsertLogs(userId: string, monthPrefix: string, extractedProtocols: string[], extractedLogs: any[]) {
  try {
    // Basic implementation: ensure protocols exist
    const userProtos = await getUserProtocols(userId);
    const existingProtoNames = userProtos.map(p => p.name.toLowerCase());
    
    // Create missing protocols
    for (const pName of extractedProtocols) {
      if (!existingProtoNames.includes(pName.toLowerCase())) {
        await addProtocol(userId, pName);
      }
    }
    
    // Refresh protocols to get IDs
    const updatedProtos = await getUserProtocols(userId);
    const protoMap = new Map(updatedProtos.map(p => [p.name.toLowerCase(), p.id]));
    
    // Prepare logs
    const logsToInsert = extractedLogs
      .filter(l => l.status === true) // only insert true statuses
      .map(l => {
        const pId = protoMap.get(l.protocolName.toLowerCase());
        const dateStr = `${monthPrefix}-${l.day.toString().padStart(2, '0')}`;
        return pId ? { protocolId: pId, date: dateStr, status: true } : null;
      })
      .filter(Boolean);
      
    if (logsToInsert.length > 0) {
       await db.insert(protocolLogsTable).values(logsToInsert as any).onConflictDoNothing();
    }
    return { success: true };
  } catch(e) {
    console.error(e);
    return { success: false };
  }
}
