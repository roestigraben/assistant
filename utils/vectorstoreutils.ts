import { OpenAI } from 'langchain/llms/openai';
import { PineconeClient, UpsertRequest } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { VectorDBQAChain, loadQAChain } from "langchain/chains";
import { Document } from "langchain/document";
import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import { FewShotPromptTemplate, PromptTemplate } from "langchain/prompts";

type PineConeMetadata = Record<string, any>;
const embeddings = new OpenAIEmbeddings();
const pinecone = new PineconeClient();

// added by P. Hirt to get an context from a question
export async function promptContextSearch(
  query: string,
  // index: VectorOperationsApi,
  namespace: string
) {

  await pinecone.init({
    environment: `${process.env.PINECONE_ENVIRONMENT}`,
    apiKey: `${process.env.PINECONE_API_KEY}`,
  });
  const index = pinecone.Index(`${process.env.PINECONE_INDEX_NAME}`);

  const question = query;
  const returnedResults = 3;
  const questionEmbedding = await embedQuery(question, embeddings);
  const docs = await similarityVectorSearch(
    questionEmbedding,
    returnedResults,
    index,
    namespace
  );

  var context = 'The context is as below: \n'
  var sources: string[] = []

  /* docs.forEach(doc => {

    context += doc.pageContent + '\n'
    // console.log(doc.pageContent)
    // console.log('..........................')
    // console.log(doc.metadata.source)
    sources.push(doc.metadata.source)
  }) */
  return docs // [context, sources];
}


export async function callVectorDBQAChain(
  query: string,
  index: VectorOperationsApi,
  namespace: string
) {
  const question = query;
  const returnedResults = 3;
  const questionEmbedding = await embedQuery(question, embeddings);
  const docs = await similarityVectorSearch(
    questionEmbedding,
    returnedResults,
    index,
    namespace
  );
  const inputs = { question, input_documents: docs };
  const llm = new OpenAI();
  const qaChain = loadQAChain(llm, {
    type: "stuff",
  });
  // console.log("qachain", qaChain);
  const result = await qaChain.call(inputs);
  // console.log("result", result);

  return result;
}







//  QUERY EMBEDDING
export async function embedQuery(
  query: string,
  embeddings: OpenAIEmbeddings
): Promise<number[]> {
  const embeddedQuery = await embeddings.embedQuery(query);
  // console.log("embeddedQuery", embeddedQuery);
  return embeddedQuery;
}






//      SIMILARITY VECTOR SEARCH
export async function similarityVectorSearch(
  vectorQuery: number[],
  k = 3,
  index: VectorOperationsApi,
  namespace: string
): Promise<Document[]> {
  const results = await index.query({
    queryRequest: {
      topK: k,
      includeMetadata: true,
      vector: vectorQuery,
      namespace,
    },
  });

  const docs: any = [] //[Document, {}][] = [];

  if (results.matches) {
    for (const res of results.matches) {
      // console.log(res);
      const { text: pageContent, ...metadata } = res?.metadata as PineConeMetadata;

      if (res.score) {
        docs.push({ metadata, pageContent, score: res.score })
      }
    }
  }
  // console.log(" =================================> ", docs)
  // console.log("*****************", docs[0])

  return docs
}
