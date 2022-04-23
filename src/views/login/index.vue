<!--
 描述: 登录模板
 作者: Jack Chen
 日期: 2020-04-18
-->

<template>
  <div class="login-container">
		<div class="layer">
			<div class="some-space">
				<div class="form">
					<h2>大数据可视化平台</h2>
					<el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="80px" size="medium" class="demo-ruleForm">
						<el-form-item label="用户名" prop="name">
							<el-input type="name" v-model="ruleForm.name" autocomplete="off"></el-input>
						</el-form-item>
						<el-form-item label="密码" prop="pass">
							<el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
						</el-form-item>
						<!-- <el-form-item label="确认密码" prop="checkPass" style="color:white">
							<el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
						</el-form-item> -->
						<el-form-item>
							<el-button type="primary" @click="submitForm('ruleForm')">登陆</el-button>
							<el-button @click="resetForm('ruleForm')">重置</el-button>
						</el-form-item>
					</el-form>
					<div class="touristsUpload" @click="touristClick">
						游客登陆
					</div>
				</div>
			</div>
	</div>

		<vue-particles 
			color="#6495ED"
			:particleOpacity="0.7"
			:particlesNumber="80"
			shapeType="circle"
			:particleSize="4"
			linesColor="#6495ED"
			:linesWidth="1"
			:lineLinked="true"
			:lineOpacity="0.6"
			:linesDistance="150"
			:moveSpeed="3"
			:hoverEffect="true"
			hoverMode="grab"
			:clickEffect="true"
			clickMode="push"
		>
		</vue-particles>

    <bgAnimation />

    <modal 
      title="提示" 
      :content="modalContent"
      :visible.sync="visible" 
      @confirm="confirm">
    </modal>

  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Login',
  components: {},
  data() {
			var validateName = (rule, value, callback) => {
				if(value === ''){
					callback(new Error('请输入用户名'));
				}else{
					callback();
				}
			}
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.ruleForm.checkPass !== '') {
            this.$refs.ruleForm.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.ruleForm.pass) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
		return {
			ruleForm: {
				name:'',
				pass: '',
				checkPass: '',
			},
			rules: {
				name:[
					{ validator: validateName, trigger: 'blur' }
				],
				pass: [
					{ validator: validatePass, trigger: 'blur' }
				],
				checkPass: [
					{ validator: validatePass2, trigger: 'blur' }
				]
			},
			visible: false,
			modalContent: '这是一段自定义模态框消息'
		}
  },
  computed: {

		},
  created() {},
  mounted() {

  },
  methods: {
    confirm () {
      this.visible = false;
      console.log('点击确定')
    },
		submitForm(formName) {
			this.$refs[formName].validate((valid) => {
				if (valid) {
					console.log("ddd")
					let params = {
						name: this.ruleForm.name,
						pass: this.ruleForm.pass
					}
					axios.get('/api/userLogin',{params}).then(res => {
						if(res.data.data.userInfo == ""){
							this.$message.warning("登陆失败")
						}else{
							let token = res.data.data.userInfo.token
							localStorage.setItem('token',token)
							this.$router.push('/home')
						}
					})
				} else {
					this.$message.error("请输入正确的用户名密码")
					return false;
				}
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		touristClick(){
			this.$router.push('/home')
		}
  }
}
</script>

<style lang="scss" scoped>
.login-container {
	.layer {
		position: absolute;
		height: 100%;
		width: 100%;
	}
	#particles-js {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1000;
	}
	.some-space {
		color: white;
		font-weight: 100;
		letter-spacing: 2px;
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 1001;
		-webkit-transform: translate3d(-50%, -50%, 0);
		transform: translate3d(-50%, -50%, 0);

		-ms-animation: cloud 2s 3s ease-in infinite alternate;
		-moz-animation: cloud 2s 3s ease-in infinite alternate;
		-webkit-animation: cloud 2s 3s ease-in infinite alternate;
		-o-animation: cloud 2s 3s ease-in infinite alternate;
		-webkit-animation: cloud 2s 3s ease-in infinite alternate;
		animation: cloud 2s 3s ease-in infinite alternate;

		.form {
			width: 460px;
			height: auto;
			background: rgba(36, 36, 85, .5);
			margin: 0 auto;
			padding: 35px 30px 25px;
			box-shadow: 0 0 25px rgba(255, 255, 255, .5);
			border-radius: 10px;
			.demo-ruleForm{
				width: 380px;
				/deep/.el-form-item__label{
					color: white;
					font-weight: 300;
				}
			}
			h2 {
				text-align: center;
				font-weight: normal;
				font-size: 26px;
				color: #d3d7f7;
				padding-bottom: 35px;
			}
			.loginBtn {
				width: 100%;
				padding: 12px 0;
				border: 1px solid #d3d7f7;
				font-size: 16px;
				color: #d3d7f7;
				cursor: pointer;
				background: transparent;
				border-radius: 4px;
				margin-top: 10px;
				&:hover {
					color: #fff;
					background: #0090ff;
					border-color: #0090ff;
				}
			}
			.tip {
				font-size: 12px;
				padding-top: 20px;
			}
			.touristsUpload{
				margin-top: 10px;
				font-weight: 1000;
			}
			.touristsUpload:hover{
				color: red;
				cursor: pointer;
			}
		}


	}

}

input::-webkit-input-placeholder {
    color: #d3d7f7;
}
input::-moz-placeholder {   /* Mozilla Firefox 19+ */
    color: #d3d7f7;
}
input:-moz-placeholder {    /* Mozilla Firefox 4 to 18 */
    color: #d3d7f7;
}
input:-ms-input-placeholder {  /* Internet Explorer 10-11 */ 
    color: #d3d7f7;
}


@-ms-keyframes cloud{
    0%{
        -ms-transform: translate(-50%, -50%);
    }
    40%{
        opacity: 1;
    }
    60%{
        opacity: 1;
    }
    100%{
        -ms-transform: translate(-50%, -40%);
    }
}
@-moz-keyframes cloud{
    0%{
        -moz-transform: translate(-50%, -50%);
    }
    40%{
        opacity: 1;
    }
    60%{
        opacity: 1;
    }
    100%{
        -moz-transform: translate(-50%, -40%);
    }
}
@-o-keyframes cloud{
    0%{
        -o-transform: translate(-50%, -50%);
    }
    40%{
        opacity: 1;
    }
    60%{
        opacity: 1;
    }
    100%{
        -o-transform: translate(-50%, -40%);
    }
}
@-webkit-keyframes cloud{
    0%{
        -webkit-transform: translate(-50%, -50%);
    }
    40%{
        opacity: 1;
    }
    60%{
        opacity: 1;
    }
    100%{
        -webkit-transform: translate(-50%, -40%);
    }
}
@keyframes cloud{
    0%{
        transform: translate(-50%, -50%);
    }
    40%{
        opacity: 1;
    }
    60%{
        opacity: 1;
    }
    100%{
        transform: translate(-50%, -40%);
    }
}
	
</style>
