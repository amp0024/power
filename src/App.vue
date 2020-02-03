<template>
  <div id="app">
    <div class="sideBar">
      <div class="sessionOverview">
        <div class="subSection">
          <h5>Distance</h5>
          <h2 class="bg">{{totalDistance.values.distance / 5280 | round(2)}}</h2>
          <h2>{{totalDistance.values.distance / 5280 | round(2)}}<span>miles</span></h2>
        </div>
        <div class="subSection stats">
        </div>
      </div>
    </div>
    <div class="body">
        <div class="mapSection"> 
            <google-map :map="data.samples" :selectedSegment="selectedSegment"></google-map>
        </div>

        <div class="graphSection">
          
            <div class="bestAverageWrapper">
              <div class="segmant">
                <h5>Best Average</h5>
                <ul>
                  <li v-on:click="minute(1)" :class="{'active': duration === 1}">1min</li>
                  <li v-on:click="minute(5)" :class="{'active': duration === 5}">5min</li>
                  <li v-on:click="minute(10)" :class="{'active': duration === 10}">10min</li>
                  <li v-on:click="minute(15)" :class="{'active': duration === 15}">15min</li>
                  <li v-on:click="minute(20)" :class="{'active': duration === 20}">20min</li>
                  <li v-on:click="minute('all')" :class="{'active': duration === data.samples.length}">All</li>
                </ul>
              </div>
              <div class="details">
                <h2>Power Output Avg.</h2>
                <p>
                  <span>{{bestAveragePower.a | round(2)}}</span></p>
              </div>
              
            </div>
          <highcharts :options="chartOptions" ref="highcharts"></highcharts >
        </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
import json from '../workout-data.json'
export default {
  name: 'app',
  data() {
      return {
          data: json,
          duration: 'all',
          workingData: null,
          customStart: 0,
          customEnd: 0,
          bestAveragePower: {},
          graphDataPoints: [],
          selectedSegment: [],
          bestAverage:[],
          activeOutput: 'power',
          totalDistance: null
      }
  },
  methods: {
    highlightSelected(){
      if (this.customStart === -50 || this.customStart === null){
        this.customStart = 0
        this.customEnd = this.data.samples.length
        this.selectedSegment = []
      } else{
        this.selectedSegment = this.data.samples.slice(this.customStart, this.customEnd)
      }
    },
    minute(val){
      if (val === 'all'){
        this.duration = this.data.samples.length 
        var num = this.data.samples.length
        this.workingData = this.data.samples.slice(0, num)
        this.averageBySection(num)
      } else {
        this.duration = val
        var num = (val * 60) + 1
        this.workingData = this.data.samples.slice(0, num)
        this.averageBySection(num)
      }
    },
    averageBySection(num){
      //bring in full array of sample data
      var fullSamples = this.data.samples 
      // set up total variable for average calculation
      var total = 0
      var mapArr = []
      this.totalDistance = this.data.samples[this.data.samples.length - 1]
      //loop through entire list of data
      for (let l = 0; l < fullSamples.length; l++) {
        //set segment for this iteration to loop through
        const currentSegmant = fullSamples.slice(l, num+l)
        //check to make sure time segment is still ok in total of section
        if (currentSegmant.length === num){
          //loop through segment of list (time interval ammout ex. 20min)     
          var total = 0 
          for (let i = 0; i < currentSegmant.length; i++) {
            // Add specific index to the running total
            if (currentSegmant[i].values.power) {
              total += currentSegmant[i].values.power
            } else {
              total += 0
            }
          }
          // Do average caluculation
          var average = total / currentSegmant.length
          mapArr.push({'a': average, 'i': l, 'e': num+l})
        } 

      }
      this.Sort(mapArr)
    },
    Sort(arr){
      //Implement bubblesort least to greatest
      for (let i = 0; i < arr.length; i++){
        //start at 0 go up
        for (let j = 0; j < (arr.length - i -1); j++){
          if (arr[j].a > arr[j+1].a){
            const lesser = arr[j + 1]
            arr[j+1] = arr[j]
            arr[j] = lesser;
          }
        }
      }
      this.bestAveragePower = arr[arr.length - 1]
      this.setUpMap()
    },
    setUpMap(){
      var that = this
      that.graphDataPoints = []
      for (var i = 0; i < that.data.samples.length; i++) {
        if (that.data.samples[i].values.power != undefined){
          that.graphDataPoints.push(that.data.samples[i].values.power)
        }
        that.chartOptions.series[0].data = that.graphDataPoints
      }
    }
  },
  computed:{
    
    chartOptions(){
      return { chart: {
              zoomType: 'x',
              height: 250,
              backgroundColor: null,
              style: {
                  fontFamily: 'Montserrat, sans-serif'
              }
            },
            title: {
              text: '',
              style: {
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
              }
            },
            xAxis: {
              type: 'milliseconds',
              events: {
                afterSetExtremes: function(event, Vue) {
                  var that = this

                        vm.someComponent.customStart = Math.ceil(event.min);
                          vm.someComponent.customEnd = Math.floor(event.max);
                      vm.someComponent.highlightSelected()
                     
                  }
              }
            },
            yAxis: {
              title: {
                text: 'Output'
              }
            },
            legend: {
              enabled: false
            },
            tooltip: {
                borderWidth: 0,
                backgroundColor: 'rgba(219,219,216,0.8)',
                shadow: false
            },
            plotOptions: {
              series: {
                  color: '#9fa5ae'
              }
            },
            series: [{
              type: 'line',
              name: 'Power Output',
              data: [],
              zoneAxis: 'x',
              zones: [
                ]
            }],
            
          }
    },
  },
  created(){
    this.minute(this.duration)
    vm.someComponent = this
  },
  mounted: function() {
    let chart = this.$refs.highcharts.chart;
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Montserrat:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i');

body{
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
#app{
  display: flex;
  flex-direction: row;
  height: 100vh;
  background-color: #EFF3F8;
  overflow: hidden;
  .sideBar{
    // width: 30%;
    min-width: 300px;
    box-shadow: 0px 0px 20px #00000042;
    z-index: 2;
    overflow: hidden;
    position: relative;
    .subSection{
      
      // margin: 2em 0 0 0;
      padding: 2em 1em;
      padding-bottom: 1.75em;
      &.stats{
        border-bottom: solid 1px #DEE1E7;
        padding-top: 0;
        box-shadow: 0 -17px 29px -5px #eff3f8;
        z-index: 1;
        position: relative;
      }
      &.av{
        bottom: 0;
        position: absolute;
        display: block;
      }
      .outPutWrapper{
        display: flex;
        ul{
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 0;
          flex-wrap: none;
          overflow: scroll;
          li{
            margin-bottom: 5px;
            margin-top: 5px;
            padding-left: 5px;
            color: #4a5565;
            font-size: 1.25em;
            // width: 100%;
            list-style: none;
            &.active{
              color: #526efe;
              font-weight: 700;
            }
          }
        }
        
      }
    }
    h5{
        color: #9fa5ae;
        margin: 0;
        font-size: .6em;
        margin-bottom: 5px;
        z-index: 1;
        position: relative;
      }
      h2{
        color: #516DFF;
        font-size: 3.75em;
        font-weight: 700;
        margin: 0;
        z-index: 1;
        position: relative;
        span{
          font-size: .5em;
        }
        &.bg{
          position: absolute;
          font-size: 10em;
          margin-top: -.35em;
          z-index: 0;
          color: #fff;
        }
      }
      p{
        color: #465161;
        font-weight: 700;
        margin: 0;
      }
    ul{
      // border-bottom: solid 1px #DEE1E7;
      display: flex;
      flex-direction: row;
      margin: 0;
      padding: 0;
      li{
          text-align: left;
          width: 100%;
          list-style: none;
      }
    }
  }
  .body{
    display: flex;
    flex-direction: column;
    width: calc(100% - 300px);
    position: relative;
    .mapSection{
      height: calc(100% - 300px);
      #map{
        height: calc(100vh - 300px);
      }
      &:after{
        content: '';
        position: absolute;
        width: 100%;
        z-index: 1;
        height: calc(100% - 300px);
        background: radial-gradient(transparent, transparent, #eff3f8c7);
        pointer-events: none;
        top: 0;
      }
    }
    .graphSection{
      background-color: #fff;
      background: radial-gradient(transparent, transparent, #eff3f8c7);
      position: relative;
      .bestAverageWrapper{
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: horizontal;
        -webkit-box-direction: normal;
        -ms-flex-direction: row;
        flex-direction: row;
        position: relative;
        width: 80%;
        background: #eff3f8;
        font-size: .8em;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        margin-top: 7px;
        .details{
          width: 40%;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          h2{
            margin: 5px;
            color: #4a5565;
            margin-left: 1.6em;
          }
          p{
            position: relative;
            .svg-wrapper{
              display: flex;
              position: absolute;
              height: 100%;
              width: 100%;
              align-items: center;
              justify-content: center;
              // background: #ffffffa6;
              z-index: 1;
            }
            .loading-svg{
                height: 1.5em;
                width: 1.5em;
                top: 50%;
                // left: 38%;
                position: absolute;
                display: block;
                z-index: 10;
                transform: translate(-50%, -50%);
                animation-name: spin;
                animation-duration: 2000ms;
                animation-iteration-count: infinite;
                animation-timing-function: linear; 
            }
            @keyframes spin {
              from {
                transform:rotate(0deg);
              }
              to {
                transform:rotate(360deg);
              }
            }
            circle{
                stroke: #00A890;
                stroke-width: 3px;
            }
            .fade-enter-active, .fade-leave-active {
              transition: opacity 2s;
            }
            .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
              opacity: 0;
            }
            span{
              margin: 5px;
              color: #516bfe;
              font-weight: 700;
              font-size: 1.5em;
            }
          }
        }
        .segmant{
          width: 60%;
          display: flex;
          flex-direction: row;
          h5{
            /* padding-left: 30px; */
            font-size: 1em;
            margin: 5px;
            margin-top: 5px;
            margin-left: 0;
            color: #4a5565;
            width: 130px;
          }
          ul{
            width: 100%;
            margin: 5px;
            margin-top: 5px;
            padding-left: 1.5em;
            display: flex;
            flex-direction: row;
            width: 100%;
            align-items: center;
            li{
              position: relative;
              font-weight: 700;
              color: #a8aeb7;
              list-style: none;
              width: 100%;
              &:after{
                transition: all .2s;
              }
              &.active{
                color: #4a5565;
                &:after{
                  content: '';
                  height: 3px;
                  background: #516cfe;
                  width: 20px;
                  bottom: -5px;
                  display: block;
                  position: absolute;
                  border-radius: 3px;
                }
              }
              &:hover{
                cursor: pointer;
                &:after{
                  content: '';
                  height: 3px;
                  background: #516cfe;
                  width: 20px;
                  bottom: -5px;
                  display: block;
                  position: absolute;
                  border-radius: 3px;
                  transition: all .2s;
                }
              }
            }
          }
        }
      }
    }
  }
}

</style>





