<template>
    <div class="carousel text-sm font-light">
      
      <button class="carousel-button" @click="prevItem">&lt;</button>
      <div class="carousel-container">
        <div class="carousel-title-container">
          <p style="float:left; margin-top: 2px">additional source information : {{ currentIndex + 1}}/{{ infoCount }}</p> 
          <div class="score-bubble" :style="{ backgroundColor: BackgroundColor }">{{scorePercentage}}%</div>
        </div>
       
        <div  class="carousel-content" >{{currentItem.pageContent}}</div>
        <p class="footer"><span>source file</span> : {{ currentItem.metadata.source }}</p>
        <!-- <p class="footer"><span>score</span> : {{ currentItem.score }}</p> -->
      </div>
      <button class="carousel-button" @click="nextItem">&gt;</button>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  
  export default {
    props: {
      items: {
        type: Array,
        required: true,
      },
    },
    setup(props) {
      const currentIndex = ref(0);
      const infoCount = ref(props.items.length)
      
  
      const currentItem = computed(() => props.items[currentIndex.value]);
      var scorePercentage = computed(() => adjust(props.items[currentIndex.value].score))
      var BackgroundColor = ref('rgb(250, 161, 161)')

      function adjust(val) {
        var score = Math.round( val * 1000) / 10
        
        if ( score >= 85 ) { 
          console.log('should be green', score)
          BackgroundColor.value = 'rgb(161, 250, 161)'
        } else if ( score >= 80 ){
          BackgroundColor.value = 'rgb(250, 161, 161)'
        } else {
          BackgroundColor.value = 'rgb(250, 161, 161)'
        }

        return score
      }
      
  
      function prevItem() {
        if (currentIndex.value > 0) {
          currentIndex.value--;
        }
        scorePercentage = adjust(props.items[currentIndex.value].score)
      }
  
      function nextItem() {
        if (currentIndex.value < props.items.length - 1) {
          currentIndex.value++;
        }
        scorePercentage = adjust(props.items[currentIndex.value].score)
      }
  
      return {
        currentItem,
        prevItem,
        nextItem,
        currentIndex,
        infoCount,
        scorePercentage,
        BackgroundColor 
      };
    },
  };
  </script>
  
  <style>
  .carousel {
    display: flex;
    align-items: flex-start;
  }
  
  .carousel-button {
    font-size: 1.0rem;
    font-weight: bold;
    background: none;
   padding-top:10px;
    cursor: pointer;
    margin-top: 2px;
  }
  
  .carousel-container {
    flex: 1;
    margin: 0 10px;
    padding: 10px;
    border: 1px solid grey;
    border-radius: 5px;
  }
  .carousel-title-container {
    height: 30px;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid grey;
    font-weight: bold;
  }
  .score-bubble {
    width: 60px;
    height: 24px;
    border: 1px solid grey;
    border-radius: 12px;
    margin-top: 0px;
    text-align: center;
    float: right;
  }

  .carousel-content {
    width:470px;
    height:fit-content;
    padding-bottom: 10px;
    border-bottom: 1px solid grey;
  }

  .footer {
    padding-bottom: 10px;
    padding-top: 10px;
    
  }
  
  .footer span{
    font-weight: bold;
  }
  </style>
  