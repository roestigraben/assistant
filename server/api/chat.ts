import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
// import { pinecone } from '@/utils/pinecone-client';
// this import is no longer used as the ES2019 cannot have top level awaits
import { PineconeClient } from '@pinecone-database/pinecone';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  console.log('question', question);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
    throw new Error('Pinecone environment or api key vars missing');
  }
  
  async function initPinecone() {
    try {
      const pinecone = new PineconeClient();
  
      await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT ?? '', //this is in the dashboard
        apiKey: process.env.PINECONE_API_KEY ?? '',
      });
  
      return pinecone;
    } catch (error) {
      console.log('error', error);
      throw new Error('Failed to initialize Pinecone Client');
    }
  }

  const pinecone = await initPinecone();
  

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      },
    );

    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
