<template>
    <div class="carousel text-xs font-light">
      
      <button class="carousel-button" @click="prevItem">&lt;</button>
      <div class="carousel-container">
        <p>additional source information : {{ currentIndex + 1}}/{{ infoCount }}</p> 
        <textarea v-model="currentItem.pageContent"></textarea>
        <p class="footer"><span>source file</span> : {{ currentItem.metadata.source }}</p>
        <p class="footer"><span>score</span> : {{ currentItem.score }}</p>
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
  
      function prevItem() {
        if (currentIndex.value > 0) {
          currentIndex.value--;
        }
      }
  
      function nextItem() {
        if (currentIndex.value < props.items.length - 1) {
          currentIndex.value++;
        }
      }
  
      return {
        currentItem,
        prevItem,
        nextItem,
        currentIndex,
        infoCount
      };
    },
  };
  </script>
  
  <style>
  .carousel {
    display: flex;
    align-items: center;
  }
  
  .carousel-button {
    font-size: 1.0rem;
    background: none;
    border: none;
    cursor: pointer;
  }
  
  .carousel-container {
    flex: 1;
    margin: 0 10px;
  }
  
  textarea {
    width: 100%;
    height: 200px;
    padding: 2px; 
    border-radius: 4px; 
    border: 1px solid #efefef
  }

  .footer span{
    font-weight: bold
  }
  </style>
  