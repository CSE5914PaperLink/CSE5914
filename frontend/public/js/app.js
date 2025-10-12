// public/js/app.js - Dashboard functionality
let activeFeature = null;

function switchTab(tab) {
  const featuresTab = document.getElementById('featuresTab');
  const historyTab = document.getElementById('historyTab');
  const featuresContent = document.getElementById('featuresContent');
  const historyContent = document.getElementById('historyContent');
  
  if (tab === 'features') {
    // Activate features tab
    featuresTab.classList.add('text-blue-600', 'border-blue-600', 'bg-blue-50');
    featuresTab.classList.remove('text-gray-500', 'border-transparent');
    
    // Deactivate history tab
    historyTab.classList.add('text-gray-500', 'border-transparent');
    historyTab.classList.remove('text-blue-600', 'border-blue-600', 'bg-blue-50');
    
    // Show features content, hide history content
    featuresContent.classList.remove('hidden');
    historyContent.classList.add('hidden');
  } else if (tab === 'history') {
    // Activate history tab
    historyTab.classList.add('text-blue-600', 'border-blue-600', 'bg-blue-50');
    historyTab.classList.remove('text-gray-500', 'border-transparent');
    
    // Deactivate features tab
    featuresTab.classList.add('text-gray-500', 'border-transparent');
    featuresTab.classList.remove('text-blue-600', 'border-blue-600', 'bg-blue-50');
    
    // Show history content, hide features content
    historyContent.classList.remove('hidden');
    featuresContent.classList.add('hidden');
  }
}

function setActiveFeature(feature, featureName) {
  // Check if clicking the same feature that's already active
  if (activeFeature === feature) {
    // Deselect the feature
    activeFeature = null;
    
    // Update chat status
    document.getElementById('chatStatus').textContent = 'General chat - Ask anything';
    
    // Update input placeholder
    const messageInput = document.getElementById('messageInput');
    messageInput.placeholder = 'Type your message here...';
    
    // Reset all buttons and feature cards
    document.querySelectorAll('[id$="Btn"]').forEach(btn => {
      btn.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500', 'ring-green-500', 'ring-purple-500');
    });
    
    document.querySelectorAll('.cursor-pointer').forEach(card => {
      card.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500', 'ring-green-500', 'ring-purple-500');
    });
    
    // Add system message
    addMessage(`Switched to general chat mode. You can ask about anything!`, 'system');
    scrollToBottom();
    return;
  }
  
  // Set new active feature
  const previousFeature = activeFeature;
  activeFeature = feature;
  
  // Update chat status
  document.getElementById('chatStatus').textContent = `Chatting about: ${featureName}`;
  
  // Enable input and send button
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  messageInput.disabled = false;
  messageInput.placeholder = `Ask about ${featureName.toLowerCase()}...`;
  sendBtn.disabled = false;
  sendBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
  sendBtn.classList.add('bg-blue-600', 'hover:bg-blue-700', 'transition-colors');
  
  // Reset all buttons and feature cards
  document.querySelectorAll('[id$="Btn"]').forEach(btn => {
    btn.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500', 'ring-green-500', 'ring-purple-500');
  });
  
  document.querySelectorAll('.cursor-pointer').forEach(card => {
    card.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500', 'ring-green-500', 'ring-purple-500');
  });
  
  // Highlight active button and corresponding feature card
  const btn = document.getElementById(feature + 'Btn');
  const cards = document.querySelectorAll('.cursor-pointer');
  let cardIndex = feature === 'search' ? 0 : feature === 'papers' ? 1 : 2;
  
  if (feature === 'search') {
    btn.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
    cards[cardIndex].classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
  } else if (feature === 'papers') {
    btn.classList.add('ring-2', 'ring-offset-2', 'ring-green-500');
    cards[cardIndex].classList.add('ring-2', 'ring-offset-2', 'ring-green-500');
  } else if (feature === 'analyze') {
    btn.classList.add('ring-2', 'ring-offset-2', 'ring-purple-500');
    cards[cardIndex].classList.add('ring-2', 'ring-offset-2', 'ring-purple-500');
  }
  
  // Only add system message if switching to a different feature (not the same one)
  if (previousFeature !== feature) {
    addMessage(`Switched to ${featureName} mode. You can now ask questions related to this feature.`, 'system');
    scrollToBottom();
  }
}

document.getElementById('chatForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  
  if (message) {
    let displayMessage = message;
    
    // Add feature context to message if active
    if (activeFeature) {
      const featureNames = {
        'search': 'Search Papers',
        'papers': 'My Papers', 
        'analyze': 'Compare & Analyze'
      };
      displayMessage = `[${featureNames[activeFeature]}] ${message}`;
    }
    
    // Add user message to chat
    addMessage(displayMessage, 'user');
    
    // Clear input
    messageInput.value = '';
    
    // Scroll to bottom
    scrollToBottom();
    
    // Show typing indicator after a short delay
    setTimeout(() => {
      addTypingIndicator();
      
      // Remove typing indicator and show response after 2 seconds
      setTimeout(() => {
        removeTypingIndicator();
        let response;
        
        if (activeFeature) {
          const featureResponses = {
            'search': 'paper search',
            'papers': 'paper management',
            'analyze': 'paper analysis'
          };
          response = `AI responses for ${featureResponses[activeFeature]} are not yet implemented. Your message has been received!`;
        } else {
          response = 'AI responses are not yet implemented. Your message has been received! You can continue chatting or select a feature for specialized assistance.';
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