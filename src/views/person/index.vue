<!--
 描述: 首页
 作者: shixiaolei
 日期: 2021-02-3
-->
<template>
  <div class="home-container">
    <div class="wrap" ref="editor">
      <div class="top">
        <div class="top-button1" @click="goMap">监控地图</div>
        <div class="top-button2">人员地图</div>
      </div>
      <div class="personLeft" >
        <el-table
          :data="tableData"
          align="center"
          border
          show-summary
          height="400"
          style="width: 100%">
          <el-table-column
            prop="id"
            label="ID"
            width="180"
          >
          </el-table-column>
          <el-table-column
            prop="name"
            label="姓名"
            align="center"
            >
          </el-table-column>
          <el-table-column
            prop="amount1"
            sortable
            label="数值 1">
          </el-table-column>
          <el-table-column
            prop="amount2"
            sortable
            label="数值 2">
          </el-table-column>
          <el-table-column
            prop="amount3"
            sortable
            label="数值 3">
          </el-table-column>
        </el-table>

        <el-table
          :data="tableData"
          border
          height="400"
          :summary-method="getSummaries"
          show-summary
          style="width: 100%; margin-top: 20px">
          <el-table-column
            prop="id"
            label="ID"
            width="180">
          </el-table-column>
          <el-table-column
            prop="name"
            label="姓名">
          </el-table-column>
          <el-table-column
            prop="amount1"
            label="数值 1（元）">
          </el-table-column>
          <el-table-column
            prop="amount2"
            label="数值 2（元）">
          </el-table-column>
          <el-table-column
            prop="amount3"
            label="数值 3（元）">
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import { screenSize } from '@/assets/js/utils'
// import * as d3 from 'd3';
export default {
  name: 'Home',
  components: {},
  data() {return {
    threeVisiable:true,
    tableData: [{
      id: '12987122',
      name: '王小虎',
      amount1: '234',
      amount2: '3.2',
      amount3: 10
    }, {
      id: '12987123',
      name: '王小虎',
      amount1: '165',
      amount2: '4.43',
      amount3: 12
    }, {
      id: '12987124',
      name: '王小虎',
      amount1: '324',
      amount2: '1.9',
      amount3: 9
    }, {
      id: '12987125',
      name: '王小虎',
      amount1: '621',
      amount2: '2.2',
      amount3: 17
    }, {
      id: '12987126',
      name: '王小虎',
      amount1: '539',
      amount2: '4.1',
      amount3: 15
    }]
  }
  },
  created() {
  },
  mounted() {
    screenSize(this.$refs.editor);
  },
  methods: {
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总价';
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
          sums[index] += ' 元';
        } else {
          sums[index] = 'N/A';
        }
      });
      return sums;
    },
    goMap(){
      this.$router.push('/home')
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
    .personLeft{
      left: 50px;
      top: 110px;
      width: 1800px;
      height: 900px;
      position: absolute;
      /deep/.cell{
        font-size: 20px;
      }
      // background: darkgrey;
      // display: flex;
    }
  }
}	
</style>
