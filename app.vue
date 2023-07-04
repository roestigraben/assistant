<template>
  
  <div class="light">
    <main
      class="absolute inset-0 transition-width flex flex-col overflow-hidden items-stretch flex-1 light:bg-gray-800 pb-20 md:pb-32">
      <div class="flex-1 overflow-hidden">
        <div class="h-full overflow-y-auto">
          <div class="flex flex-col items-center text-sm h-full chat-messages">
            <div v-for="(message, index) in messages" :key="index"
              class="w-full border-b border-black/10 light:border-gray-900/50 text-gray-800 light:text-gray-100 group"
              :class="{ 'bg-gray-100': message.actor === 'Human', 'light:bg-gray-700': message.actor === 'AI' }">
              <div
                class="text-base gap-4 md:gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0">
                <div class="w-[30px] flex flex-col relative items-end">
                  <div v-if="message.actor === 'Human'" class="relative flex">
                    <Icon name="uil:user" class="bg-indigo-300" />
                  </div>
                  <div v-else
                    class="relative flex " >
                    <Icon name="uil:trowel" class="bg-emerald-700 text-white" /> 
                  </div>
                </div>

                <div class="relative flex w-[calc(100%-50px)] md:flex-col lg:w-[calc(100%-115px)]">
                  
                  <div class="flex flex-grow flex-col gap-3">
                    <div  
                      class="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap prose prose-gray dark:prose-invert prose-p:m-0 prose-pre:p-0 prose-pre:m-0 prose-li:my-0 prose-li:leading-none prose-ol:my-0">
                      <VueShowdown :markdown="addFullBlock(message.message, message.loading)"
                        :extensions="['highlight']" />
                        
                      
                      <div v-if="message.actor === 'AI' && activeIndex === index" class="relative flex">
                        <div v-if="message.docs.length != 0">
                          
                          <carousel :items="message.docs" />
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="relative flex w-[calc(10%-0px)] md:flex-col lg:w-[calc(10%-5px)]">
                  <div v-if="message.actor === 'AI' &&  message.docs.length != 0 && !loading" @click="toggleInfo(index)">
                    <span v-if="activeIndex !== index">
                      <Icon name="uil:info-circle" class="text-grey" />
                    </span>
                    <span v-else>
                    <Icon name="uil:times-circle" class="text-grey" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>


    <div
      class="fixed inset-x-0 bottom-0 left-0 border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient">


      <form class="stretch mx-2 flex flex-row gap-3 pt-2 last:mb-2 md:last:mb-6 lg:mx-auto lg:max-w-3xl lg:pt-6">
        <div class="relative flex h-full flex-1 md:flex-col">
          <div class="ml-1 mt-1.5 md:w-full md:m-auto md:flex md:mb-2 gap-2 justify-center"></div>
          <div
            class="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
            <textarea tabindex="0" v-model="message" @keydown.enter.exact.prevent="submit()" ref="messageInput"
              autofocus :disabled="loading" data-id="63ee3844-11f0-456d-b3b5-a6e2a3ac6a04" rows="1"
              :class="{ 'text-gray-800': loading }" placeholder="Write your message here..."
              class="m-0 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:pl-0"
              style="max-height: 200px; overflow-y: scroll;" :style="{ height: (numOfLines * 24) + 'px' }"></textarea>
            <button @click.prevent="submit()" :disabled="loading"
              class="absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"></button>
          </div>
        </div>
      </form>



      <div class="px-3 pt-2 pb-3 text-center text-xs text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6"><a
          href="https://beta.openai.com" target="_blank" rel="noreferrer" class="underline">based on OpenAI models augmented by enterprise data,
          </a></div>
    </div>
  </div>
</template>

<style>
.icon {
  width: 2em;
  height: 2em;
  margin-bottom: 0;
}
textarea:focus, input:focus{
    outline: none;
}
</style>

<script setup lang="ts">

const activeIndex = ref(-1);

function toggleInfo(index:number) {
  if (activeIndex.value === index) {
    activeIndex.value = -1;
  } else {
    activeIndex.value = index;
  }
}

const messages = ref([{
  actor: 'AI',
  message: 'Hello! How can I help you?',
  loading: false, 
  docs: []
}]);

const message = ref<string>("")
const loading = ref(false);
const messageInput = ref<HTMLInputElement | null>(null)


// add the new message to the array of messages
const addMessage = (actor: "AI" | "Human", message: string, loading: boolean = true, docs?: Document) => {
  const length = messages.value.push({ actor, message, loading, docs:[] });
  // if the page is full, ensure that you scroll in order to see the message
  scrollToEnd();
  // return last message
  return messages.value[length - 1];
};

const addFullBlock = (markdown: string, loading: boolean) => {
  return markdown + (loading ? '<span class="animate-pulse">\u258b</span>' : '')
};

const numOfLines = computed(() => {
  return Math.max(Math.min(4, message.value.split('\n').length), 1);
});

const scrollToEnd = () => {
  setTimeout(() => {
    document.querySelector(".chat-messages>div:last-child")?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
};

const sendRequest = async () => {
  loading.value = true;
  const newMessage = addMessage("AI", '');

  // get the similar documents from the pinecone vector database
  // console.log('sent to test.ts   : ', JSON.stringify(messages.value.slice(1)))
  const docs:any = await $fetch(`/api/test`, {        // [Document, number][]
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(messages.value.slice(1)), // the first message is the hello, so get rid of it
    method: 'post'
  });
  
  console.log('documents     : ', docs) 
  
  

  // console.log('sent to gpt3.ts   : ', JSON.stringify(messages.value.slice(1)))
  const res = await fetch(`/api/gpt3`, {
    body: JSON.stringify(messages.value.slice(1)), // the first message is the hello, so get rid of it
    method: 'post'
  });

  
  // add the docs to the last answer
  messages.value[messages.value.length -1].docs  = docs
  
  // console.log('last message : ', messages.value.slice(-1))


  const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader();

  while (true) {
    const result = await reader?.read();
    // console.log('Result', result);

    if (result?.done) {
      loading.value = false;
      newMessage.loading = false;
      return;
    }

    const results = result?.value?.split(/\n/);
    results?.forEach((line) => {
      const dataSlice = line.slice('data: '.length).trim();
      if (dataSlice && dataSlice != '[DONE]') {
        const data = JSON.parse(dataSlice);
        newMessage.message = newMessage.message.concat(data.text);
        scrollToEnd();
      }
    });
  } 
}

// Button Click Action
const submit = async () => {
  const newMessage = message.value;

  // add the message to the array of messages
  addMessage("Human", newMessage, false);

  // send the request to the model
  await sendRequest();
  message.value = "";
  messageInput.value?.focus();
};

</script>
