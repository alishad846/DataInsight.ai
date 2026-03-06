import React, { useState } from "react";
import { chatbotResponse } from "../api/chatbot_logic";

interface Props {
    report: any
}

export default function ChatbotUI({ report }: Props) {

    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");

    const sendMessage = () => {

        if (!input.trim()) return;

        const userMessage = {
            sender: "user",
            text: input
        };

        const botReply = chatbotResponse(input, report);

        const botMessage = {
            sender: "bot",
            text: botReply
        };

        setMessages(prev => [...prev, userMessage, botMessage]);

        setInput("");
    };

    return (

        <div style={{
            width: "350px",
            height: "450px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column"
        }}>

            <div style={{
                padding: "10px",
                background: "#222",
                color: "white"
            }}>
                Dataset Assistant
            </div>

            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px"
            }}>

                {messages.map((msg, i) => (
                    <div key={i} style={{
                        textAlign: msg.sender === "user" ? "right" : "left",
                        marginBottom: "10px"
                    }}>
                        <span style={{
                            background: msg.sender === "user" ? "#4CAF50" : "#eee",
                            color: msg.sender === "user" ? "white" : "black",
                            padding: "8px",
                            borderRadius: "8px",
                            display: "inline-block"
                        }}>
                            {msg.text}
                        </span>
                    </div>
                ))}

            </div>

            <div style={{
                display: "flex",
                borderTop: "1px solid #ccc"
            }}>

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "10px",
                        border: "none"
                    }}
                />

                <button
                    onClick={sendMessage}
                    style={{
                        padding: "10px 15px"
                    }}
                >
                    Send
                </button>

            </div>

        </div>

    )
}