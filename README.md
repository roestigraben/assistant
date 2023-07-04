# Nuxt 3 Chatbot for Nuxt3

## Objective

a chatGPT variant that can use specific data that allows answers more tailored towards user questions.
Target is comoany website use, more particularly larger comapnies with complex webiste where navigation
is not obvious.
Also a use for specfic purpose such as Q&A for a large documentation can be a good target.

prerequisites are accounts on:

- pincone.com : vector database provider
- openai : model provider
- langchain : utilities provider for working with this AI flow

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Flow description

the starting and ending point is to generate a prompt that is well constructed so to get the mst relevant answer. The prompt has 4 elements:

- Introduction: Text that tells the model the style you desire as answers
- Context: the most likely text coming from private data
- History: the questions and anwsers from the past within the given session
- Question: the actual text of the question

Context Creation ( also know as ingest flow):
the flow is presented in the flowchart.png file in the project folder.
steps are:

- scrape the website under consideration and add all .txt and .pdf files into the docs folder. Other file types are also possible but need some rework.
- read the files into memory
- create chunks of size approx 200 - 1000 characters with some overlap between chunks
- run the embed process to get a probability vector set that represents the chunks content
- store the vectors into a vector store, here pinecone (others like Chroma, Supabase,... ) would be possible also

## Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview
```


# github setup

git remote add origin https://github.com/roestigraben/assistant.git
git branch -M main
git push -u origin main
