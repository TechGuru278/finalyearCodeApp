// API Configuration
const API_KEY = "AIzaSyBV12_wsJIoQThY3ssWi3PiXhd5-zCVCdY";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// API Configuration
// // Updated to use a more reliable model and added retry mechanism
// const API_KEY = "AIzaSyBV12_wsJIoQThY3ssWi3PiXhd5-zCVCdY";
// const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Chat history array
let chatHistory = [];
let isProcessing = false;

// Function to send message with retry mechanism
async function sendMessage() {
    if (isProcessing) {
        alert("Please wait for the current response to complete.");
        return;
    }
    
    const userInput = document.querySelector("#uip");
    const message = userInput.value.trim();
    
    if (!message) {
        alert("Please enter a question!");
        return;
    }
    
    // Add user message to UI
    addMessage(message, "user");
    
    // Clear input
    userInput.value = "";
    userInput.focus();
    
    // Show typing indicator
    showTypingIndicator();
    
    isProcessing = true;
    
    try {
        // Add to chat history
        chatHistory.push({
            role: "user",
            parts: [{ text: message }]
        });
        
        // Try the API request with retry logic
        const aiResponse = await callAPIWithRetry();
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Format and add AI response
        const formattedResponse = formatCodeBlocks(aiResponse);
        
        // Add to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: aiResponse }]
        });
        
        // Limit chat history to last 15 messages to prevent token limit
        if (chatHistory.length > 15) {
            chatHistory = chatHistory.slice(-15);
        }
        
        // Add AI response to UI
        addMessage(formattedResponse, "ai");
        
    } catch (error) {
        console.error("Error:", error);
        hideTypingIndicator();
        addMessage(`Sorry, I encountered an error: ${error.message}. Please try again.`, "ai");
    } finally {
        isProcessing = false;
    }
}

// Function to call API with retry logic
async function callAPIWithRetry(retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
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
                if (response.status === 503 && i < retries - 1) {
                    // Wait and retry for 503 errors
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                    continue;
                }
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check for API errors
            if (data.error) {
                throw new Error(data.error.message || "API Error");
            }
            
            // Get AI response
            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error("No response from AI");
            }
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
}

// Function to add message to UI
function addMessage(message, type) {
    const chatContainer = document.getElementById("chatContainer");
    
    // Remove welcome message if it's the first actual message
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage && chatContainer.children.length === 1) {
        welcomeMessage.style.display = 'none';
    }
    
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}-message`;
    
    if (type === "ai" && (message.includes("<pre>") || message.includes("```"))) {
        messageDiv.innerHTML = message;
    } else {
        messageDiv.textContent = message;
    }
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Function to format code blocks in response
function formatCodeBlocks(text) {
    // Replace triple backtick code blocks
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
        const lang = language || 'javascript';
        return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });
}

// Function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Focus on input field
    document.querySelector("#uip").focus();
    
    // Add event listener for input to show button
    const inputField = document.querySelector("#uip");
    const sendButton = document.querySelector("button");
    
    inputField.addEventListener('input', function() {
        if (this.value.trim()) {
            sendButton.disabled = false;
        } else {
            sendButton.disabled = false;
        }
    });
    
    // Add initial welcome message
    scrollToBottom();
});

// Export functions for global access
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
