'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	const { goodsId, token } = event;
	
	  try {
	    const userInfo = await uniID.getUserInfoByToken(token);
	    if (!userInfo || !userInfo.uid) {
	      return {
	        code: 1,
	        message: '用户未登录或登录状态已过期'
	      };
	    }
	
	    const res = await db.collection('cart').add({
	      userId: userInfo.uid,
	      goodsId: goodsId,
	      createTime: new Date().getTime()
	    });
	
	    return {
	      code: 0,
	      data: res
	    };
	  } catch (error) {
	    console.error('加入购物车失败', error);
	    return {
	      code: 1,
	      message: '加入购物车失败，请稍后重试'
	    };
	  }
};
