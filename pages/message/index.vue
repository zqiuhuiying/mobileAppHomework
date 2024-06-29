<template>
	<view class="content">
		<view v-if="hasLogin">
			<view class="message-list" ref="messageList">
				<view v-for="msg in messages" :key="msg._id" class="message-item">
					<text>{{ msg.nickname }}: {{ msg.message }}</text>
				</view>
			</view>
			<view class="input-container">
				<input v-model="newMessage" placeholder="请输入消息" />
				<button @click="sendMessage" class="send-btn">发送</button>
			</view>
		</view>
		<view v-else>
			<uni-forms-item label="登录方式" labelWidth="70">
				<uni-data-checkbox :multiple="false" v-model="loginType"
					:localdata="loginTypeOption"></uni-data-checkbox>
			</uni-forms-item>
			<button @click="toLogin">前往登录</button>
		</view>
	</view>
</template>


<script>
	import {
		store
	} from '@/uni_modules/uni-id-pages/common/store.js'

	export default {
		data() {
			return {
				loginType: "weixin",
				loginTypeOption: [{
						value: "weixin",
						text: "微信"
					},
					{
						value: "univerify",
						text: "一键登录"
					},
					{
						value: "username",
						text: "账号密码"
					},
					{
						value: "smsCode",
						text: "手机验证码"
					},
					{
						value: "apple",
						text: "苹果登录"
					},
					{
						value: "weixinMobile",
						text: "微信手机号登录"
					}
				],
				newMessage: '',
				messages: []
			};
		},
		computed: {
			hasLogin() {
				return store.hasLogin;
			},
			userInfo() {
				return store.userInfo;
			}
		},
		methods: {
			toLogin() {
				if (this.loginType == 'username') {
					uni.navigateTo({
						url: "/uni_modules/uni-id-pages/pages/login/login-withpwd",
					});
				} else {
					uni.navigateTo({
						url: "/uni_modules/uni-id-pages/pages/login/login-withoutpwd?type=" + this.loginType,
						animationType: "none",
						animationDuration: 0
					});
				}
			},
			toUserInfoPage() {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo?showLoginManage=true"
				});
			},
			async sendMessage() {
				if (!this.newMessage.trim()) {
					return;
				}
				try {
					const {
						userInfo,
						newMessage
					} = this;
					const result = await uniCloud.callFunction({
						name: 'addMessage',
						data: {
							userId: userInfo._id,
							nickname: userInfo.nickname || userInfo.username,
							message: newMessage,
						}
					});
					if (result.result && result.result.success) {
						this.newMessage = '';
						await this.fetchMessages();
						this.scrollToBottom();
					} else {
						console.error('Failed to send message:', result.result.message);
					}
				} catch (error) {
					console.error('Error sending message:', error);
				}
			},
			async fetchMessages() {
				try {
					const result = await uniCloud.callFunction({
						name: 'getMessages'
					});
					if (result.result && result.result.success) {
						this.messages = result.result.data.reverse();
						this.$nextTick(() => {
							this.scrollToBottom();
						});
					} else {
						console.error('Failed to fetch messages:', result.result.message);
					}
				} catch (error) {
					console.error('Error fetching messages:', error);
				}
			},
			scrollToBottom() {
				const messageList = this.$refs.messageList;
				if (messageList) {
					messageList.scrollTop = messageList.scrollHeight;
				}
			}
		},

		onShow() {
			if (this.hasLogin) {
				this.fetchMessages();
			}
		}
	};
</script>

<style scoped>
	.content {
		display: flex;
		flex-direction: column;
		height: 100vh;
		padding: 5px;
	}

	.name {
		justify-content: center;
		height: 20px;
		padding: 5px;
		text-align: center;
	}
	
	.message-list {
		max-height: 88%;
		overflow-y: auto;
		padding: 5px;
	}

	.message-item {
		white-space: normal;
		word-break: break-word;
		padding: 3px;
	}

	.input-container {
		position: fixed;
		bottom: 41px;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		background-color: #fff;
		padding: 5px;
	}

	.send-btn {
		padding: 3px 25px;
	}

	input {
		flex: 1;
		padding: 12px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		margin-left: 0px;
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}
</style>