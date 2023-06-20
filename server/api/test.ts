import { PineconeClient, UpsertRequest } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { embedQuery, similarityVectorSearch } from "../../utils/vectorstoreutils";

const embeddings = new OpenAIEmbeddings();
const pinecone = new PineconeClient();

export default defineEventHandler((event) => {
    const config = useRuntimeConfig();

    const namespace = "bytefulNew"; //change this to your own vectorbase namespace

    let messages: any = [];

    // return 'hello'

    return new Promise((resolve, reject) => {
        readBody(event).then(async (prevMessages) => {
            messages = messages.concat(prevMessages);
            const query = messages.slice(-2)[0].message;
            const docs = await promptContextSearch(query, namespace);

            resolve(docs)

        });


    });

    async function promptContextSearch(query: string, namespace: string) {

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

        return docs //[context, sources];
    }
})
