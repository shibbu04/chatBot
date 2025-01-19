import { sql } from '@vercel/postgres';
import type { QueryResult } from '@vercel/postgres';

interface Message { 
  id: number;
  text: string;
  isBot: boolean;
  created_at: string;
}

let isConnected = false;

export async function checkConnection() {
  try {
    if (isConnected) return true;

    // Try to connect using Vercel Postgres
    await sql`SELECT 1`;
    
    isConnected = true;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function createMessagesTable() {
  try {
    const connected = await checkConnection();
    if (!connected) return;

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        isBot BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Messages table created successfully');
  } catch (error) {
    console.error('❌ Error creating messages table:', error);
  }
}

export async function getMessages(): Promise<Message[]> {
  try {
    const connected = await checkConnection();
    if (!connected) return [];

    const result: QueryResult<Message> = await sql`
      SELECT * FROM messages ORDER BY created_at ASC
    `;

    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return [];
  }
}

export async function saveMessage({ text, isBot }: { text: string; isBot: boolean }): Promise<Message | null> {
  try {
    const connected = await checkConnection();
    if (!connected) return null;

    const result: QueryResult<Message> = await sql`
      INSERT INTO messages (text, isBot)
      VALUES (${text}, ${isBot})
      RETURNING *
    `;

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error saving message:', error);
    return null;
  }
}