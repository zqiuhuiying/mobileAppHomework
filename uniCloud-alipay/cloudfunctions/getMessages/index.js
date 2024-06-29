'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
  try {
    const res = await db.collection('messages').orderBy('createdAt', 'desc').get();
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};