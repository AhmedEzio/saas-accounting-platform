import { api } from "./api";

export const aiApi = {
  /**
   * Create a new chat session.
   * POST /api/ai/newChat
   * @param {string} [title] - Optional title for the chat.
   * @returns {Promise<any>}
   */
  createSession: (title) =>
    api.post("/ai/newChat", { title }).then((r) => r.data),

  /**
   * Get all chat sessions of the current user.
   * GET /api/ai/userSessions
   * @returns {Promise<any>}
   */
  getUserSessions: () =>
    api.get("/ai/userSessions").then((r) => r.data),

  /**
   * Get all messages for a specific session.
   * GET /api/ai/usersessions/:sessionId
   * @param {string} sessionId
   * @returns {Promise<any>}
   */
  getSessionMessages: (sessionId) =>
    api.get(`/ai/usersessions/${sessionId}`).then((r) => r.data),

  /**
   * Send a message (text and optional image) to the AI assistant.
   * POST /api/ai/chat/:sessionId
   * @param {string} sessionId
   * @param {FormData} formData - Form data containing "question" and optional "file"
   * @returns {Promise<any>}
   */
  sendMessage: (sessionId, formData) =>
    api.post(`/ai/chat/${sessionId}`, formData).then((r) => r.data),

  /**
   * Delete a chat session.
   * DELETE /api/ai/usersessions/:sessionId
   * @param {string} sessionId
   * @returns {Promise<any>}
   */
  deleteSession: (sessionId) =>
    api.delete(`/ai/usersessions/${sessionId}`).then((r) => r.data),
};
