// API Configuration
const API_KEY = "AIzaSyBV12_wsJIoQThY3ssWi3PiXhd5-zCVCdY";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Chat history array
let chatHistory = [];

// Function to send message
async function sendMessage() {
    const userInput = document.querySelector("#uip");
    const message = userInput.value.trim();
    
    if (!message) {
        alert("Please enter a question!");
        return;
    }
    
    // Add user message to UI
    addUserMessage(message);
    
    // Clear input
    userInput.value = "";
    userInput.focus();
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Add to chat history
        chatHistory.push({
            role: "user",
            parts: [{ text: message }]
        });
        
        // Prepare API request
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: chatHistory,
                generationConfig: {
                    temperature: 0.7,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Check for API errors
        if (data.error) {
            throw new Error(data.error.message || "API Error");
        }
        
        // Get AI response
        let aiResponse = "";
        if (data.candidates && data.candidates.length > 0) {
            aiResponse = data.candidates[0].content.parts[0].text;
            
            // Format code blocks in response
            aiResponse = formatCodeBlocks(aiResponse);
            
            // Add to chat history
            chatHistory.push({
                role: "model",
                parts: [{ text: aiResponse }]
            });
            
            // Limit chat history to last 20 messages to prevent token limit
            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(-20);
            }
            
            // Add AI response to UI
            addAiMessage(aiResponse);
        } else {
            throw new Error("No response from AI");
        }
        
    } catch (error) {
        console.error("Error:", error);
        hideTypingIndicator();
        addAiMessage(`Sorry, I encountered an error: ${error.message}. Please try again.`);
    }
}

// Function to add user message to UI
function addUserMessage(message) {
    const userIpBox = document.querySelector(".userIpBox");
    const li = document.createElement("li");
    li.textContent = message;
    userIpBox.appendChild(li);
    scrollToBottom();
}

// Function to add AI message to UI
function addAiMessage(message) {
    const aiResponseBox = document.querySelector(".aiResponce");
    const li = document.createElement("li");
    
    // Check if message contains code blocks
    if (message.includes("```")) {
        li.innerHTML = message;
    } else {
        li.textContent = message;
    }
    
    aiResponseBox.appendChild(li);
    scrollToBottom();
}

// Function to format code blocks in response
function formatCodeBlocks(text) {
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
        const lang = language || '';
        return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
    });
}

// Function to show typing indicator
function showTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");
    indicator.style.display = "flex";
    scrollToBottom();
}

// Function to hide typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");
    indicator.style.display = "none";
}

// Function to scroll chat to bottom
function scrollToBottom() {
    const boxArea = document.querySelector(".boxArea");
    boxArea.scrollTop = boxArea.scrollHeight;
}

// Function to handle Enter key press
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// Function to clear chat
function clearChat() {
    const userIpBox = document.querySelector(".userIpBox");
    const aiResponceBox = document.querySelector(".aiResponce");
    
    userIpBox.innerHTML = '';
    aiResponceBox.innerHTML = '';
    chatHistory = [];
    
    // Restore welcome message
    const welcomeMessage = document.querySelector('.welcome-message');
    if (!welcomeMessage) {
        const chatContainer = document.querySelector('.chat-container');
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = '<p>👋 Hello! I\'m your coding assistant. Ask me anything about programming, web development, algorithms, or any tech-related questions!</p>';
        chatContainer.insertBefore(welcomeDiv, chatContainer.firstChild);
    }
    
    scrollToBottom();
}

// Add clear chat button dynamically
document.addEventListener('DOMContentLoaded', function() {
    // Create clear chat button
    const header = document.querySelector('.headder');
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear Chat';
    clearBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f093fb, #f5576c);
        padding: 8px 16px;
        font-size: 0.9rem;
        z-index: 100;
    `;
    clearBtn.onclick = clearChat;
    header.appendChild(clearBtn);
    
    // Focus on input field
    document.querySelector("#uip").focus();
    
    // Add initial welcome message
    scrollToBottom();
});

// Export functions for global access (if needed)
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
window.clearChat = clearChat;
