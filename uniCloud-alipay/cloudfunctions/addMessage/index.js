'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
  const { userId, nickname, message } = event;
  try {
    await db.collection('messages').add({
      userId,
      nickname,
      message,
      createdAt: new Date().toISOString()
    });
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};