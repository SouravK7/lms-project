export const getChatKey = (lessonId) => {
  return `chat_lesson_${lessonId}`;
};

export const loadMessages = (lessonId) => {
  try {
    const data = localStorage.getItem(getChatKey(lessonId));
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn("Failed to load chat messages", err);
    return [];
  }
};

export const saveMessages = (lessonId, messages) => {
  try {
    localStorage.setItem(
      getChatKey(lessonId),
      JSON.stringify(messages || [])
    );
  } catch (err) {
    console.warn("Failed to save chat messages", err);
  }
};

export const clearMessages = (lessonId) => {
  try {
    localStorage.removeItem(getChatKey(lessonId));
  } catch (err) {
    console.warn("Failed to clear chat messages", err);
  }
};