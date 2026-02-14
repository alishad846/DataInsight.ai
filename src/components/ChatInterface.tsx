import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  BarChart3,
  Lightbulb,
  TrendingUp,
  PieChart,
  Loader2,
} from "lucide-react";
import API from "../api/api";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  chart?: {
    type: string;
    data: any;
  };
}

interface ChatInterfaceProps {
  dataset: { id: string; name: string } | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ dataset }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    { text: "Which year had the least profit?", icon: <TrendingUp className="w-4 h-4" /> },
    { text: "Predict next year's sales", icon: <BarChart3 className="w-4 h-4" /> },
    { text: "Show me a graph of revenue trends", icon: <PieChart className="w-4 h-4" /> },
    { text: "What are the top performing regions?", icon: <Lightbulb className="w-4 h-4" /> },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     BACKEND CHAT CONNECTION
     ========================= */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await API.post("/chat", {
        message: question,
        datasetId: dataset?.id || null,
      });

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: "ai",
        content: res.data.answer || res.data.reply || "No response",
        timestamp: new Date(),
        chart: res.data.chart || null,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          type: "ai",
          content:
            "Unable to reach AI engine. Please ensure backend & ML service are running.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-sky-50">
      {/* Header */}
      <div className="backdrop-blur-md bg-white/20 border-b border-white/30 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Data Insights</h1>
            <p className="text-sm text-gray-600">
              {dataset
                ? `Analyzing: ${dataset.name}`
                : "General Assistant (No dataset selected)"}
            </p>
          </div>
          {dataset && (
            <div className="px-3 py-1 bg-green-500/20 text-green-700 rounded-full text-xs font-bold border border-green-500/30">
              ML Engine Active
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="backdrop-blur-md bg-white/20 rounded-2xl p-8 border border-white/30">
                <Lightbulb className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome! Let's explore your data
                </h3>

                <div className="grid gap-3 md:grid-cols-2 mt-6">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(q.text)}
                      className="flex items-center space-x-3 p-3 backdrop-blur-md bg-white/30 hover:bg-white/40 rounded-xl border border-white/30 transition-all"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-sky-500 text-white">
                        {q.icon}
                      </div>
                      <span className="text-gray-700 font-medium">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-lg p-4 rounded-2xl backdrop-blur-md border ${
                  msg.type === "user"
                    ? "bg-gradient-to-r from-purple-500 to-sky-500 text-white"
                    : "bg-white/30 border-white/30 text-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.chart && (
                  <div className="mt-4 p-4 bg-white/80 rounded-xl border border-purple-100">
                    <div className="h-40 bg-purple-50 rounded-lg flex flex-col items-center justify-center">
                      <BarChart3 className="w-10 h-10 text-purple-400 mb-2" />
                      <p className="text-xs font-bold text-purple-600">
                        {msg.chart.type.toUpperCase()} CHART READY
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-[10px] opacity-70 mt-2">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="p-4 bg-white/30 rounded-2xl border border-white/30 text-gray-500 text-sm animate-pulse">
                AI is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="backdrop-blur-md bg-white/20 border-t border-white/30 p-4">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={dataset ? "Ask about your data..." : "Ask me anything..."}
            className="flex-1 p-4 rounded-2xl backdrop-blur-md bg-white/30 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-4 bg-gradient-to-r from-purple-500 to-sky-500 text-white rounded-2xl hover:scale-105 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
