import os
import time
import io
import pdfplumber
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langchain.chains import RetrievalQA

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

if not GOOGLE_API_KEY or not PINECONE_API_KEY or not INDEX_NAME:
    raise ValueError("Missing API Keys. Please check your .env file.")

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pc = Pinecone(api_key=PINECONE_API_KEY)
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector_store = PineconeVectorStore(index_name=INDEX_NAME, embedding=embeddings)
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
)

class ChatRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "RAG Backend is Secure & Running!"}

@app.post("/ingest")
async def ingest_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")

    try:
        content = await file.read()
        text_data = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_data += text + "\n"

        if not text_data:
            raise HTTPException(status_code=400, detail="No text found in PDF")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = text_splitter.split_text(text_data)
        
        batch_size = 5
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            success = False
            retries = 0
            
            while not success and retries < 3:
                try:
                    PineconeVectorStore.from_texts(
                        texts=batch,
                        embedding=embeddings,
                        index_name=INDEX_NAME
                    )
                    success = True
                    time.sleep(1)
                except Exception:
                    time.sleep(20)
                    retries += 1
            
            if not success:
                raise HTTPException(status_code=500, detail="Failed to upload batch to Pinecone")

        return {
            "filename": file.filename,
            "total_chunks": len(chunks),
            "status": "Success! Document stored in Cloud."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response = qa_chain.invoke(request.question)
        return {"answer": response["result"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))