import db from '../db/index.js';

export const UserModel = {
  upsertUser: (id, username, avatar) => {
    const stmt = db.prepare(`
      INSERT INTO users (id, username, avatar, last_seen)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        username = excluded.username,
        avatar = excluded.avatar,
        last_seen = CURRENT_TIMESTAMP
    `);
    stmt.run(id, username, avatar);
    return UserModel.getUserById(id);
  },

  getUserById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  updateLastSeen: (id) => {
    const stmt = db.prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  }
};

export const RoomModel = {
  createRoom: (id, name) => {
    const stmt = db.prepare('INSERT OR IGNORE INTO rooms (id, name) VALUES (?, ?)');
    stmt.run(id, name);
    return RoomModel.getRoomById(id);
  },

  getRoomById: (id) => {
    const stmt = db.prepare('SELECT * FROM rooms WHERE id = ?');
    return stmt.get(id);
  }
};

export const MessageModel = {
  saveMessage: (id, userId, content, roomId = null, recipientId = null, type = 'text') => {
    const stmt = db.prepare(`
      INSERT INTO messages (id, user_id, room_id, recipient_id, content, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, roomId, recipientId, content, type);
    return MessageModel.getMessageById(id);
  },

  getMessageById: (id) => {
    const stmt = db.prepare(`
      SELECT m.*, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `);
    return stmt.get(id);
  },

  getGlobalMessages: (limit = 50) => {
    const stmt = db.prepare(`
      SELECT m.*, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id IS NULL AND m.recipient_id IS NULL
      ORDER BY m.created_at DESC LIMIT ?
    `);
    return stmt.all(limit).reverse();
  },

  getRoomMessages: (roomId, limit = 50) => {
    const stmt = db.prepare(`
      SELECT m.*, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.room_id = ?
      ORDER BY m.created_at DESC LIMIT ?
    `);
    return stmt.all(roomId, limit).reverse();
  },

  getPrivateMessages: (userId1, userId2, limit = 50) => {
    const stmt = db.prepare(`
      SELECT m.*, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE (m.user_id = ? AND m.recipient_id = ?)
         OR (m.user_id = ? AND m.recipient_id = ?)
      ORDER BY m.created_at DESC LIMIT ?
    `);
    return stmt.all(userId1, userId2, userId2, userId1, limit).reverse();
  }
};
