export const getChatKey = (lessonId) => {
  return `chat_lesson_${lessonId}`;
};

export const loadMessages = (lessonId) => {
  try {
    const data = localStorage.getItem(getChatKey(lessonId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveMessages = (lessonId, messages) => {
  localStorage.setItem(
    getChatKey(lessonId),
    JSON.stringify(messages)
  );
};

export const clearMessages = (lessonId) => {
  localStorage.removeItem(getChatKey(lessonId));
};