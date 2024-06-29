<template>
	<view>
		<view class="search-container">
			<input v-model="searchKeyword" ref="searchInput" type="text" placeholder="请输入商品名称搜索,输入购物车显示购物车"
				class="search-input" />
			<button @click="search" class="search-button">搜索</button>
		</view>

		<swiper v-if="!searchKeyword" class="swiper-container" autoplay="true" interval="3000" circular="true">
			<swiper-item v-for="(image, index) in swiperImages" :key="index" class="swiper-item">
				<image :src="image" mode="aspectFill"></image>
			</swiper-item>
		</swiper>
		<view v-if="showAddToCartMessage" class="add-to-cart-message">
			商品已成功加入购物车！
		</view>
		<view v-if="filteredGoods.length > 0" class="goods-row"
			v-for="(row, rowIndex) in Math.ceil(filteredGoods.length / 2)" :key="rowIndex">
			<view v-for="(item, colIndex) in filteredGoods.slice(rowIndex * 2, rowIndex * 2 + 2)" :key="item._id"
				class="goods-item">
				<image :src="item.image" mode="aspectFill" class="goods-image"></image>
				<view class="goods-details">
					<text class="goods-name">{{ item.goodsname }}</text>
					<text class="goods-price">{{ item.price }} 元</text>
					<button @click="addToCart(item)" class="cart-button">加入购物车</button>
				</view>
			</view>
		</view>

		<view v-if="searchKeyword === '购物车'" class="cart-container">
			<h1 class="cart-text">购物车</h1>
			<view v-if="cart.length === 0" class="empty-cart">
				<text>购物车是空的</text>
			</view>
			<view v-else>
				<view v-for="(cartItem, index) in cart" :key="index" class="cart-item">
					<text>{{ cartItem.goodsname }} - {{ cartItem.price }} 元</text>
					<view class="cart-quantity">
						<button @click="decrementCartItemQuantity(cartItem)" :disabled="cartItem.quantity <= 1"
							class="quantity-button">-</button>
						<text class="quantity-text">{{ cartItem.quantity }}</text>
						<button @click="incrementCartItemQuantity(cartItem)" class="quantity-button">+</button>
					</view>
					<text class="subtotal">小计: {{ cartItem.price * cartItem.quantity }} 元</text>
					<button @click="removeFromCart(index)" class="remove-button">移除</button>
				</view>
				<hr class="separator">
				<text class="total">总计: {{ totalCartPrice }} 元</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		reactive,
		onMounted,
		computed,
		ref
	} from 'vue';

	export default {
		setup() {
			const goodsList = reactive([]);
			const searchKeyword = ref('');
			const searchInputRef = ref(null);
			const cart = reactive([]);
			let messageTimeout = null;
			const showAddToCartMessage = ref(false);

			const fetchGoodsFromCloudDatabase = async () => {
				try {
					const result = await uniCloud.callFunction({
						name: 'getGoods'
					});
					if (result.result && result.result.data) {
						goodsList.splice(0, goodsList.length, ...result.result.data.map(item => ({
							...item,
							quantity: 1
						})));
					} else {
						console.error('Failed to fetch goods data:', result.message);
					}
				} catch (error) {
					console.error('Failed to fetch goods data:', error);
				}
			};

			onMounted(() => {
				fetchGoodsFromCloudDatabase();
			});

			const filteredGoods = computed(() => {
				return goodsList.filter(item => {
					return item.goodsname.toLowerCase().includes(searchKeyword.value.toLowerCase());
				});
			});

			const search = () => {
				if (searchKeyword.value === '购物车') {
					filteredGoods = [];
				}
				nextTick(() => {
					if (filteredGoods.value.length > 0 && searchInputRef.value) {
						searchInputRef.value.scrollIntoView({
							behavior: 'smooth',
							block: 'start'
						});
					}
				});
			};

			const addToCart = (item) => {
				const cartItem = {
					...item
				};
				const existingItem = cart.find(i => i._id === cartItem._id);
				if (existingItem) {
					existingItem.quantity++;
				} else {
					cartItem.quantity = 1;
					cart.push(cartItem);
				}

				showAddToCartMessage.value = true;

				if (messageTimeout) {
					clearTimeout(messageTimeout);
				}

				messageTimeout = setTimeout(() => {
					showAddToCartMessage.value = false;
				}, 2000);
			};

			const removeFromCart = (index) => {
				cart.splice(index, 1);
			};

			const incrementQuantity = (item) => {
				item.quantity++;
			};

			const decrementQuantity = (item) => {
				if (item.quantity > 1) {
					item.quantity--;
				}
			};

			const incrementCartItemQuantity = (cartItem) => {
				cartItem.quantity++;
			};

			const decrementCartItemQuantity = (cartItem) => {
				if (cartItem.quantity > 1) {
					cartItem.quantity--;
				}
			};

			const totalCartPrice = computed(() => {
				return cart.reduce((total, item) => {
					return total + item.price * item.quantity;
				}, 0);
			});

			return {
				goodsList,
				searchKeyword,
				filteredGoods,
				search,
				searchInputRef,
				cart,
				addToCart,
				showAddToCartMessage,
				removeFromCart,
				incrementQuantity,
				decrementQuantity,
				incrementCartItemQuantity,
				decrementCartItemQuantity,
				totalCartPrice,
				swiperImages: [
					'https://ts1.cn.mm.bing.net/th/id/R-C.687c06d45c49d31ecd4bafb67bc12e5a?rik=ZRf%2ffBi7KAeEWg&riu=http%3a%2f%2f5b0988e595225.cdn.sohucs.com%2fimages%2f20171014%2f1304c3d91c70443ba86f76b191e0381b.jpeg&ehk=NrmPR0UgqmxZUwwa%2bfM1rgDOFpwpQVtunGSO8nxpoks%3d&risl=&pid=ImgRaw&r=0',
					'https://tse1-mm.cn.bing.net/th/id/OIP-C.RUeTlQ-pjs0c9uFStsb4NgHaE7?rs=1&pid=ImgDetMain',
					'https://pic.nximg.cn/file/20201120/29412577_193353950083_2.jpg'
				]
			};
		}
	};
</script>

<style scoped>
	.search-container {
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
	}

	.search-input {
		flex: 1;
		padding: 14px;
		font-size: 14px;
		border: 1px solid #ccc;
		border-radius: 4px;
		margin-right: 10px;
	}

	.search-button {
		padding: 10px 20px;
		font-size: 12px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.search-button:hover {
		background-color: #0056b3;
	}

	.swiper-container {
		width: 100%;
		height: 320px;
		margin-bottom: 20px;
	}

	.swiper-item {
		width: 100%;
		height: 100%;
	}

	.swiper-item image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.goods-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.goods-item {
		width: 49%;
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding: 10px;
		box-sizing: border-box;
	}

	.goods-image {
		width: 100%;
		height: 350rpx;
	}

	.goods-details {
		padding: 10rpx;
	}

	.goods-name {
		font-size: 32rpx;
		font-weight: bold;
		padding: 20rpx;
	}

	.goods-price {
		color: #f56c6c;
		font-size: 28rpx;
		padding: 20rpx;
	}

	.quantity-container {
		display: flex;
		align-items: center;
		margin-top: 5px;

	}

	.quantity-button {
		padding: 1px 5px;
		background-color: #2e82f0;
		color: white;
		border: none;
		cursor: pointer;
	}

	.quantity-text {
		margin: 0 10px;
		font-size: 16px;
	}

	.cart-button {
		margin-top: 10px;
		padding: 5px 10px;
		background-color: #44be81;
		color: white;
		border: none;
		cursor: pointer;
	}

	.add-to-cart-message {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 5px;
		background-color: #4caf50;
		color: white;
		border-radius: 5px;
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.cart-container {
		margin-top: 20px;
	}

	.cart-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 5px;
		border: 1px solid #ddd;
		margin-bottom: 5px;
	}

	.remove-button {
		padding: 3px 5px;
		background-color: #e5596c;
		color: white;
		border: none;
		cursor: pointer;
	}

	.separator {
		margin: 20px 0;
		border-top: 1px solid #ddd;
	}

	.total {
		font-size: 18px;
		font-weight: bold;
	}

	.empty-cart {
		text-align: center;
		margin-top: 20px;
	}

	.subtotal {
		color: #888;
		font-size: 14px;
		padding: 5px 15px;
	}

	.cart-quantity {
		display: flex;
		align-items: center;
		margin-left: 20px;
	}

	.cart-text {
		margin-top: 10px;
		padding: 5px 10px;
		background-color: #44be81;
		color: white;
		border: none;
		cursor: pointer;
	}
</style>