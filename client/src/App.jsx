/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { FaShoppingBag } from "react-icons/fa";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const fixedCategories = [
    "laptops",
    "tops",
    "womens-dresses",
    "womens-shoes",
    "mens-shoes",
    "mens-watches",
    "womens-watches",
    "womens-bags",
  ];

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const sendMessage = async (customInput = null) => {
    const userInput = customInput || input;
    if (!userInput.trim()) return;

    const userMsg = { from: "user", text: userInput };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("https://virtual-shopping-assistant-backend-yzp1.onrender.com/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();

      const botMsg = {
        from: "bot",
        text: data.reply,
        suggestCategories: fixedCategories,
      };

      const productMsgs = (data.products || []).map((p) => ({
        from: "bot",
        product: p,
      }));

      setMessages((prev) => [...prev, botMsg, ...productMsgs]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Something went wrong. Try again later.",
          suggestCategories: fixedCategories,
        },
      ]);
    }

    if (!customInput) setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "#f9f9f9",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        padding: "0",
        margin: "0",
        overflow: "hidden",
      }}
    >
      {/* Static Welcome Section */}
      <div
        style={{
          width: "40%",
          backgroundColor: "#fff8ec",
          padding: "40px 30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRight: "1px solid #e0e0e0",
        }}
      >
        <FaShoppingBag
          size={60}
          color="#ff8800"
          style={{ marginBottom: "20px" }}
        />
        <h1 style={{ fontSize: "2rem", color: "#333", marginBottom: "20px" }}>
          🛍️ ShopMate
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#555", textAlign: "center" }}>
          Discover the best products with ease. Ask for categories or specific
          items and let our assistant find the perfect match for you!
        </p>
      </div>

      {/* Chat Section */}
      <div
        style={{
          width: "60%",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          justifyContent: "space-between",
          height: "100vh",
        }}
      >
        {/* Title Header */}
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            paddingBottom: "10px",
            borderBottom: "1px solid #ccc",
            marginBottom: "10px",
            color: "#333",
          }}
        >
          Virtual Shopping Assistant
        </div>

        <div
          style={{
            overflowY: "auto",
            flexGrow: 1,
            padding: "20px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                background: msg.from === "user" ? "#007bff" : "#f0f0f0",
                color: msg.from === "user" ? "#fff" : "#333",
                padding: "12px 18px",
                borderRadius: "20px",
                marginBottom: "10px",
                maxWidth: "75%",
                lineHeight: "1.5",
                wordWrap: "break-word",
              }}
            >
              {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}

              {msg.suggestCategories && (
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {msg.suggestCategories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(cat)}
                      style={{
                        padding: "6px 14px",
                        background: "#ff8800",
                        border: "none",
                        color: "#fff",
                        borderRadius: "20px",
                        fontWeight: "500",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {msg.product && (
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    background: "#f9f9f9",
                    borderRadius: "12px",
                    padding: "10px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    marginTop: "6px",
                  }}
                >
                  <img
                    src={msg.product.image}
                    alt={msg.product.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: "1rem" }}>
                      {msg.product.name}
                    </strong>
                    <p style={{ margin: 0, color: "#555" }}>
                      {msg.product.price}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about laptops, skincare, watches..."
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "999px",
              border: "1px solid #ccc",
              outline: "none",
              fontSize: "1rem",
              fontFamily: "'Poppins', sans-serif",
            }}
          />
          <button
            onClick={() => sendMessage()}
            style={{
              background: "#007bff",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "999px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
