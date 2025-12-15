"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadData, setUploadData] = useState<any>(null);
  
  const [question, setQuestion] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadStatus("Uploading & Processing...");

    try {
      const response = await axios.post("http://127.0.0.1:8000/ingest", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadData(response.data);
      setUploadStatus("✅ Success! Document is ready for chatting.");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("❌ Upload failed. Check backend console.");
    }
  };

  const handleChat = async () => {
    if (!question.trim()) return;

    const newHistory = [...chatHistory, { role: "user", content: question }];
    setChatHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/chat", {
        question: question,
      });

      setChatHistory([
        ...newHistory,
        { role: "ai", content: response.data.answer },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory([
        ...newHistory,
        { role: "ai", content: "⚠️ Error: Could not get answer from backend." },
      ]);
    } finally {
      setIsLoading(false);
      setQuestion(""); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      <header className="bg-blue-600 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">📚 RAG Document Assistant</h1>
          <p className="opacity-90 mt-2">Upload a PDF and ask questions about it.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        
        <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 1: Upload Document</h2>
          
          <div className="flex gap-4 items-center">
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button 
              onClick={handleUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Upload
            </button>
          </div>

          {uploadStatus && (
            <p className={`mt-4 font-medium ${uploadStatus.includes("Success") ? "text-green-600" : "text-red-600"}`}>
              {uploadStatus}
            </p>
          )}
        </section>

        <section className="bg-white p-6 rounded-lg shadow border border-gray-200 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 2: Chat with Document</h2>
          
          <div className="flex-1 border border-gray-100 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto max-h-[400px] space-y-4">
            {chatHistory.length === 0 ? (
              <p className="text-gray-400 text-center italic mt-10">
                No messages yet. Ask a question below!
              </p>
            ) : (
              chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 p-3 rounded-lg animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Ex: What is the main topic of this PDF?"
              className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleChat}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:bg-gray-400"
            >
              Send
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}