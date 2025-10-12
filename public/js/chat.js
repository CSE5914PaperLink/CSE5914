// public/js/chat.js - Chat page functionality
let activeFeature = null;

// Feature button handlers
document.getElementById('searchBtn').addEventListener('click', function() {
  setActiveFeature('search', 'Search Papers');
});

document.getElementById('papersBtn').addEventListener('click', function() {
  setActiveFeature('papers', 'My Papers');
});

document.getElementById('analyzeBtn').addEventListener('click', function() {
  setActiveFeature('analyze', 'Compare & Analyze');
});

function setActiveFeature(feature, featureName) {
  activeFeature = feature;
  
  // Reset all buttons
  document.querySelectorAll('[id$="Btn"]').forEach(btn => {
    btn.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500', 'ring-green-500', 'ring-purple-500');
  });
  
  // Highlight active button
  const btn = document.getElementById(feature + 'Btn');
  if (feature === 'search') {
    btn.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
  } else if (feature === 'papers') {
    btn.classList.add('ring-2', 'ring-offset-2', 'ring-green-500');
  } else if (feature === 'analyze') {
    btn.classList.add('ring-2', 'ring-offset-2', 'ring-purple-500');
  }
  
  // Update placeholder
  const messageInput = document.getElementById('messageInput');
  messageInput.placeholder = `Ask about ${featureName.toLowerCase()}...`;
  
  // Add system message
  addMessage(`Switched to ${featureName} mode. You can now ask questions related to this feature.`, 'system');
  scrollToBottom();
}

document.getElementById('chatForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  
  if (message) {
    // Add feature context to message if active
    let contextMessage = message;
    if (activeFeature) {
      const featureNames = {
        'search': 'Search Papers',
        'papers': 'My Papers', 
        'analyze': 'Compare & Analyze'
      };
      contextMessage = `[${featureNames[activeFeature]}] ${message}`;
    }
    
    // Add user message to chat
    addMessage(contextMessage, 'user');
    
    // Clear input
    messageInput.value = '';
    
    // Scroll to bottom
    scrollToBottom();
    
    // Show typing indicator after a short delay
    setTimeout(() => {
      addTypingIndicator();
      
      // Remove typing indicator and show "no response" message after 2 seconds
      setTimeout(() => {
        removeTypingIndicator();
        let response = 'AI responses are not yet implemented. Your message has been received!';
        if (activeFeature) {
          const featureNames = {
            'search': 'paper search',
            'papers': 'paper management',
            'analyze': 'paper analysis'
          };
          response = `AI responses for ${featureNames[activeFeature]} are not yet implemented. Your message has been received!`;
        }
        addMessage(response, 'ai');
        scrollToBottom();
      }, 2000);
    }, 500);
  }
});

function addMessage(text, sender) {
  const messagesContainer = document.getElementById('messagesContainer');
  const messageDiv = document.createElement('div');
  
  if (sender === 'user') {
    messageDiv.innerHTML = `
      <div class="flex justify-end">
        <div class="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs break-words">
          ${text}
        </div>
      </div>
    `;
  } else if (sender === 'system') {
    messageDiv.innerHTML = `
      <div class="flex justify-center">
        <div class="bg-yellow-100 text-yellow-800 rounded-lg px-4 py-2 max-w-md text-center text-sm">
          ${text}
        </div>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="flex justify-start">
        <div class="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-xs break-words">
          ${text}
        </div>
      </div>
    `;
  }
  
  messagesContainer.appendChild(messageDiv);
}

function addTypingIndicator() {
  const messagesContainer = document.getElementById('messagesContainer');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="flex justify-start">
      <div class="bg-gray-200 text-gray-600 rounded-lg px-4 py-2 max-w-xs">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  scrollToBottom();
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function scrollToBottom() {
  const chatContainer = document.getElementById('chatContainer');
  chatContainer.scrollTop = chatContainer.scrollHeight;
}