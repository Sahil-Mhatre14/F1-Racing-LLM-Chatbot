import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import * as cheerio from 'cheerio';

const {
  ASTRA_DB_ENDPOINT,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_API_KEY,
  OPEN_AI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPEN_AI_API_KEY });

const f1Data = [
  "https://www.formula1.com/en/results.html",
  "https://www.espn.com/racing/f1/story/_/id/43043850/lewis-hamilton-ferrari-f1-formula-one-expect",
  "https://en.wikipedia.org/wiki/List_of_Formula_One_World_Champions",
  "https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship",
  "https://www.skysports.com/f1/news",
  "https://www.espn.com/f1/",
  "https://www.espn.com/f1/standings",
  "https://www.motorsport.com/f1/news/",
  "https://www.motorsport.com/f1/results/",
  "https://www.racefans.net/",
  "https://www.racefans.net/category/f1-standings/",
  "https://www.statsf1.com/en/default.aspx",
  "https://www.f1-fansite.com/f1-results/",
  "https://www.mercedesamgf1.com/en/",
  "https://www.redbullracing.com/int-en",
  "https://www.ferrari.com/en-EN/formula1",
  "https://www.mclaren.com/racing/",
];

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const client = new DataAPIClient(ASTRA_DB_API_KEY)
const db = client.db(ASTRA_DB_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE})

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

const createCollection = async (similarityMetric: SimilarityMetric = 'dot_product') => {
    const existingCollections = await db.listCollections({nameOnly: true});
    console.log("collections", existingCollections)
    
    if (!existingCollections.includes('f1gpt')) {
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1536,
                metric: similarityMetric
            }
        })
        console.log(res)
    } else {
        console.log('Collection already exists.');
    }
    
}

const loadSampleData = async () => {
    const collection = db.collection(ASTRA_DB_COLLECTION)
    for await (const url of f1Data) {
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await(const chunk of chunks) {
            const embeddings = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })

            const vector = embeddings.data[0].embedding

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
    }
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }
    })
    // return (await loader.scrape())?.replace(/<[^>]*>?/gm, '')
    const html = await loader.scrape();
        
    // Use Cheerio to load the HTML content and get the text
    const $ = cheerio.load(html)
    return $('body').text().trim();  // Extracts and cleans up the body text
}

createCollection().then(() => loadSampleData())