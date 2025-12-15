# 📚 RAG Document Assistant

A full-stack AI application that enables users to upload PDF documents and engage in natural language conversations with them. Built using **Retrieval-Augmented Generation (RAG)** to provide accurate, context-aware answers based on document content.

## 🚀 Features

-   **📄 Smart PDF Ingestion:** Uploads, cleans, and chunks PDF text automatically.
-   **🧠 Context-Aware AI:** Uses Google Gemini Pro to answer questions based *only* on the uploaded document.
-   **⚡ Vector Search:** Powered by **Pinecone** for high-speed semantic similarity search.
-   **🛡️ Robust Backend:** Built with **FastAPI**, featuring rate-limit handling and secure environment management.
-   **✨ Modern UI:** Clean, responsive interface built with **Next.js 14** and Tailwind CSS.

## 🛠️ Tech Stack

-   **Frontend:** Next.js, React, Tailwind CSS, Axios
-   **Backend:** Python, FastAPI, Uvicorn
-   **AI & Logic:** LangChain, Google Gemini API (LLM & Embeddings)
-   **Database:** Pinecone (Vector Database)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/AKG451/rag-document-assistant.git](https://github.com/AKG451/rag-document-assistant.git)
cd rag-document-assistant

## 2. Backend Setup

The backend handles document processing, vector storage, and AI interactions.

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Set up your environment variables (see Configuration below).

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend runs at:  
👉 http://localhost:8000  

API Docs:  
👉 http://localhost:8000/docs  

---

## 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend runs at:  
👉 http://localhost:3000  

---

## 🔑 Configuration

Create a `.env` file inside the backend directory.

```env
# AI Provider
GOOGLE_API_KEY=your_gemini_api_key_here

# Vector Database
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=rag-app
```

Get your API keys:
- Google Gemini API
- Pinecone API

---

## 📖 Usage

### Upload a Document
- Click **Upload PDF**
- Select a PDF file
- Wait for processing (Clean → Chunk → Embed → Index)

### Ask Questions
- Type a question in the chat bar  
- Example:
  - "Summarize section 3"
  - "What are the main conclusions?"

The AI retrieves relevant chunks and generates an answer using Gemini Pro.

### Clear Context
- Use the **Reset** button to clear the document and chat history.

---

## 📂 Project Structure

```bash
rag-document-assistant/
├── backend/
│   ├── app/
│   │   ├── api/          # API Endpoints
│   │   ├── core/         # Config & Security
│   │   ├── services/     # RAG Logic
│   │   └── utils/        # PDF Parsing & Chunking
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── components/      # React Components
│   ├── app/             # Next.js Pages
│   └── public/
└── README.md
```

---

## 🔮 Future Roadmap

- Add support for `.docx` and `.txt` files  
- Implement chat history persistence (SQL Database)  
- Add source citations for answers  
- Deploy frontend to Vercel and backend to Render  

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.
