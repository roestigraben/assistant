import https from "https";
import { LengthTransform } from "./transformers/LengthTransform";
import { promptContextSearch } from "../../utils/vectorstoreutils";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const transform = new LengthTransform(30);


  // the prompt will be constructed as
  // prefix       :  general instructions (as per below)
  // context      :  the information called on from the most likely docuemnt in pincone
  // history      :  all conversation that happened in this session
  // question     :  actual question
  let prompt =
    "You are a helpful AI assistant. Use the following pieces of context to answer the question at the end. " +
    " If you don't know the answer, just say you don't know. DO NOT try to make up an answer. " +
    " If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context. " +
    "The assistant is helpful, creative, clever, and very friendly. The assistant always goes into details. " +
    "The assistant provided very detailed explanations for his answers. Be very verbose. The assistant marks code with markdown. \n\n" +
    "The context is as below: \n";

  let messages: any = [];

  return new Promise((resolve, reject) => {
    readBody(event).then(async (prevMessages) => {
      messages = messages.concat(prevMessages);

      const query = messages.slice(-2)[0].message;

      //
      // go get the most likely documents related to the question
      //
      const namespace = `${process.env.PINECONE_NAME_SPACE}`; //change this to your own vectorbase namespace
      const docs = await promptContextSearch(query, namespace);

      // add the most likely document to the prompt
      prompt += docs[0].pageContent


      //
      // add the history
      //
      prompt += "\n\n the history of the chat is here below:  \n"
      // append message to prompt, taking message.actor as "actor:" followed by message.message
      prompt +=
        messages
          .map((message: { actor: any; message: any; }) => `${message.actor}: ${message.message}`)
          .join("\n"); // + `\nAI:`;

      console.log(prompt)


      const req = https.request(
        {
          hostname: "api.openai.com",
          port: 443,
          path: "/v1/completions",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.OPENAI_API_KEY}`,
          },
        },
        (res) => {
          console.log("Got response from GPT-3");
          event.node.res.setHeader("Content-Type", "text/event-stream");
          resolve(res.pipe(transform));
        }
      );

      const body = JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.1,
        max_tokens: 512,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
        stream: true,
      });

      req.on("error", (e) => {
        console.error(e);
        reject("problem with request:" + e.message);
      });

      req.write(body);

      req.end();
    });
  });
});
