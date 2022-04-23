<!--
 描述: 首页
 作者: shixiaolei
 日期: 2021-02-3
-->
<template>
  <div class="home-container">
    <div class="operation">
      <span @click="btn">隐藏图表</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span id="btnSelect" @click="fit">复位</span>
    </div>
    <div class="wrap" ref="editor">
      <div class="top">
        <div class="top-button1">监控地图</div>
        <div class="top-button2" @click="goMap">人员地图</div>
      </div>
      <!-- 3D地图 -->
      <div id="BoxDD" ref="BoxDD"></div>
      <!-- 社区报警 -->
      <sinan v-if="threeVisiable"/>
      <!-- 报警数量 -->
      <alarmNumber v-if="threeVisiable"/>
      <!-- 视频监控 -->
      <seamless  v-if="threeVisiable"/>
      <!-- 智能邀约 -->
      <smartVisite v-if="threeVisiable"/>
      <!-- 图例 -->
      <lengend v-if="threeVisiable"/>
      <!-- <pyramid /> -->
    </div>

  </div>
</template>
<script>
import { screenSize } from '@/assets/js/utils'
import * as three from './threeJS'

export default {
  name: 'Home',
  components: {},
  data() {return {
    threeVisiable:true
  }
  },
  computed: {

  },
  created() {
  },
  mounted() {
    screenSize(this.$refs.editor);
    this.init()
    this.$nextTick(() => {
      window.addEventListener('resize', () => { //监听浏览器窗口大小改变
        var element = document.querySelector('.fink');
        var element2 = document.querySelector('.canvasBook');
        element2.style.height = "100%";
        element2.style.width = "100%";

        element.style.height = "100%";
        element.style.width = "100%";
      });
    })
  },
  methods: {
    btn(){
      this.threeVisiable = !this.threeVisiable
    },
    init(){
      three.init()
      three.animate()
    },
    goMap(){
      this.$router.push('/person')
    },
    fit(){ // 3D复位
      three.refit()
    }
  },
}
</script>

<style lang="scss" scoped>
.home-container {
	position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  .operation{
    position: fixed;
    top: 50px;
    left: 100px;
    font-size: 15px;
    color: white;
    z-index: 200000;
  }
  .wrap {
    transform-origin: 0px 0px 0px;
    background: url(../../assets/img/bj.jpg) no-repeat;
    background-size: contain;
    background-position: 50% 0;
    background-color: rgb(0, 0, 0);
    min-width: auto;
    width: 1920px;
    min-height: auto;
    height: 1080px;
    overflow: auto;
    #BoxDD{
      position:absolute;
      // top: 80px;
      display: flex;
      width: 100%; 
      height: 100%;
      overflow: auto;
      // /deep/.canvas{
      //   width
      // }
      // z-index: 10000;
    }
    .top {
      position: absolute;
      left: 0; 
      top: 0; 
      z-index: 1000;
      width: 100%; 
      height: 80px; 
      background-color: transparent; 
      background: url(../../assets/navBar.png) no-repeat center; 
      background-size:60% 70%;
      // background-position: 65% 0;
      border: none; 
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 20px;
      &-button1{
        margin-right: 30px;
      }
      &-button2{
        margin-left: 30px;
      }
    }
  }
}	
</style>
