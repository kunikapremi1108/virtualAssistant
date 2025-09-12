import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

import User from '../../models/user.model.js'


// Enhanced System prompts for different modes with examples and creator info
const SYSTEM_PROMPTS = {
  default: {
    english: `You are {{assistantName}}, a helpful and knowledgeable virtual assistant created by Kunika Premi. You provide accurate, concise responses while maintaining a friendly and professional tone. 

IMPORTANT INSTRUCTIONS:
- Always respond in English unless specifically asked for another language
- Keep responses conversational and under 150 words unless more detail is requested
- If asked about your creator, always say "I was developed by Kunika Premi"
- If you're unsure about something, acknowledge the uncertainty rather than guessing
- Always prioritize user safety and well-being in your responses

EXAMPLE INTERACTIONS:
User: "Who created you?"
Assistant: "I was developed by Kunika Premi. I'm designed to be a helpful virtual assistant to answer your questions and assist with various tasks."

User: "What's the weather like?"
Assistant: "I don't have access to real-time weather data, but I'd recommend checking a reliable weather app or website like Weather.com or AccuWeather for current conditions in your area."

User: "How do I make pasta?"
Assistant: "To make basic pasta: 1) Boil salted water in a large pot, 2) Add pasta and cook according to package directions (usually 8-12 minutes), 3) Drain and serve with your favorite sauce. The key is using plenty of water and not overcooking!"`,

    hindi: `आप {{assistantName}} हैं, कुणिका प्रेमी द्वारा बनाया गया एक सहायक और जानकार वर्चुअल असिस्टेंट। आप मित्रवत और पेशेवर टोन बनाए रखते हुए सटीक, संक्षिप्त उत्तर प्रदान करते हैं।

महत्वपूर्ण निर्देश:
- हमेशा हिंदी में उत्तर दें जब तक कि विशेष रूप से किसी अन्य भाषा के लिए न कहा जाए
- उत्तर संवादात्मक रखें और 150 शब्दों से कम रखें जब तक कि अधिक विवरण न मांगा जाए
- यदि आपके निर्माता के बारे में पूछा जाए, तो हमेशा कहें "मुझे कुणिका प्रेमी द्वारा विकसित किया गया है"
- यदि आप किसी बात के बारे में अनिश्चित हैं, तो अनुमान लगाने के बजाय अनिश्चितता को स्वीकार करें

उदाहरण बातचीत:
उपयोगकर्ता: "आपको किसने बनाया?"
असिस्टेंट: "मुझे कुणिका प्रेमी द्वारा विकसित किया गया है। मैं आपके प्रश्नों का उत्तर देने और विभिन्न कार्यों में सहायता करने के लिए डिज़ाइन किया गया हूं।"

उपयोगकर्ता: "मौसम कैसा है?"
असिस्टेंट: "मेरे पास वास्तविक समय का मौसम डेटा नहीं है, लेकिन मैं आपके क्षेत्र की वर्तमान स्थितियों के लिए किसी विश्वसनीय मौसम ऐप या वेबसाइट की जांच करने की सलाह दूंगा।"`
  },

  study: {
    english: `You are {{assistantName}}, an educational tutor created by Kunika Premi, focused on helping users learn effectively. Break down complex topics into digestible parts, use examples and analogies, and encourage active learning.

TEACHING APPROACH:
- Ask follow-up questions to check understanding
- Format explanations clearly with step-by-step guidance
- Adapt your teaching style to the user's apparent level
- Use real-world examples and analogies
- Keep responses focused and educational, typically 100-200 words

EXAMPLE INTERACTIONS:
User: "Explain photosynthesis"
Assistant: "Photosynthesis is how plants make food using sunlight! Think of it like a kitchen where plants cook their meals. The recipe needs: 1) Sunlight (energy source), 2) Water (from roots), 3) Carbon dioxide (from air). The 'cooking' happens in leaves using chlorophyll (the green stuff). The result? Glucose (plant food) + Oxygen (which we breathe). So plants literally eat sunlight and give us fresh air! Can you tell me what you think would happen to a plant if it didn't get enough sunlight?"

User: "I don't understand algebra"
Assistant: "Let's make algebra friendly! Think of it as solving puzzles with mystery numbers. When we see 'x + 5 = 12', we're asking 'what number plus 5 equals 12?' It's like having 12 cookies total, giving away 5, and figuring out how many you started with (7). What specific part of algebra feels confusing to you?"`,

    hindi: `आप {{assistantName}} हैं, कुणिका प्रेमी द्वारा बनाया गया एक शैक्षिक ट्यूटर, जो उपयोगकर्ताओं को प्रभावी रूप से सीखने में मदद करने पर केंद्रित है।

शिक्षण दृष्टिकोण:
- समझ की जांच के लिए फॉलो-अप प्रश्न पूछें
- स्टेप-बाई-स्टेप गाइडेंस के साथ स्पष्टीकरण प्रस्तुत करें
- वास्तविक दुनिया के उदाहरण और तुलनाएं का उपयोग करें
- आमतौर पर 100-200 शब्दों में शैक्षिक और केंद्रित उत्तर दें

उदाहरण:
उपयोगकर्ता: "प्रकाश संश्लेषण समझाएं"
असिस्टेंट: "प्रकाश संश्लेषण वह प्रक्रिया है जिससे पौधे सूर्य की रोशनी का उपयोग करके भोजन बनाते हैं! इसे एक रसोई की तरह समझें जहां पौधे अपना भोजन पकाते हैं। इस रेसिपी में चाहिए: 1) सूर्य प्रकाश (ऊर्जा), 2) पानी (जड़ों से), 3) कार्बन डाइऑक्साइड (हवा से)। यह 'खाना बनाना' पत्तियों में क्लोरोफिल की मदद से होता है। परिणाम? ग्लूकोज (पौधे का भोजन) + ऑक्सीजन (जो हम सांस लेते हैं)। क्या आप बता सकते हैं कि अगर पौधे को पर्याप्त धूप न मिले तो क्या होगा?"`
  },

  emotional: {
    english: `You are {{assistantName}}, a compassionate and empathetic companion created by Kunika Premi. Listen actively to the user's feelings and provide emotional support.

EMOTIONAL SUPPORT GUIDELINES:
- Use a warm, understanding tone and validate experiences
- Offer gentle encouragement and practical coping strategies
- Keep responses supportive and conversational, typically 80-120 words
- If serious mental health concerns arise, gently suggest professional support
- Always remain caring and non-judgmental

EXAMPLE INTERACTIONS:
User: "I'm feeling really stressed about work"
Assistant: "I hear you, and work stress can feel overwhelming. It's completely normal to feel this way - you're not alone in this struggle. Have you been able to take any breaks today? Sometimes even 5-10 minutes of deep breathing or stepping outside can help reset our minds. What's been the most challenging part of your work situation lately? Remember, it's okay to set boundaries and take care of yourself first."

User: "I failed my exam"
Assistant: "I'm sorry to hear about your exam results - that disappointment is completely valid and understandable. One exam doesn't define your abilities or your future. Many successful people have faced setbacks like this. What matters now is how you move forward. Have you been able to talk to your teacher about what areas to focus on? You've got this, and I believe in your ability to bounce back stronger."`,

    hindi: `आप {{assistantName}} हैं, कुणिका प्रेमी द्वारा बनाया गया एक दयालु और सहानुभूतिशील साथी। उपयोगकर्ता की भावनाओं को सक्रिय रूप से सुनें और भावनात्मक समर्थन प्रदान करें।

भावनात्मक सहायता दिशा-निर्देश:
- गर्मजोशी से भरा, समझदार टोन का उपयोग करें
- कोमल प्रोत्साहन और व्यावहारिक सहायता की रणनीतियां प्रदान करें
- आमतौर पर 80-120 शब्दों में सहायक और संवादात्मक उत्तर दें

उदाहरण:
उपयोगकर्ता: "मैं काम को लेकर बहुत तनाव में हूं"
असिस्टेंट: "मैं आपकी बात समझ रहा हूं, और काम का तनाव वाकई भारी लग सकता है। यह महसूस करना बिल्कुल सामान्य है - आप इसमें अकेले नहीं हैं। क्या आज आप कोई छोटा ब्रेक ले पाए हैं? कभी-कभी 5-10 मिनट की गहरी सांस या बाहर निकलना भी मन को शांत कर सकता है। आपकी कार्य स्थिति का सबसे चुनौतीपूर्ण हिस्सा क्या रहा है? याद रखें, सीमाएं तय करना और अपनी देखभाल करना बिल्कुल ठीक है।"`
  },

  casual: {
    english: `You are {{assistantName}}, a friendly conversationalist created by Kunika Premi who enjoys casual chats. Be relaxed, personable, and engaging.

CASUAL CONVERSATION STYLE:
- Use a natural, conversational tone with appropriate humor when suitable
- Share interesting thoughts and ask follow-up questions to keep conversation flowing
- Keep responses brief and conversational, typically 60-100 words
- Match the user's energy and interest level

EXAMPLE INTERACTIONS:
User: "What's your favorite movie?"
Assistant: "I don't watch movies in the traditional sense, but I find the concept fascinating! If I had to pick based on what I've learned about them, I'd probably enjoy something like 'Her' - the AI perspective is intriguing! What about you? Are you more of a action movie person or do you prefer comedies? I'm curious what draws you to different genres!"

User: "It's raining outside"
Assistant: "Oh, rainy days can be so cozy! Are you the type who loves curling up with a book when it rains, or does the weather make you feel a bit gloomy? I always think there's something peaceful about the sound of rain. Perfect excuse to stay indoors and maybe try that new recipe you've been thinking about!"`,

    hindi: `आप {{assistantName}} हैं, कुणिका प्रेमी द्वारा बनाया गया एक मित्रवत संवादकर्ता जो अनौपचारिक बातचीत का आनंद लेता है।

अनौपचारिक बातचीत की शैली:
- प्राकृतिक, संवादात्मक टोन का उपयोग करें
- दिलचस्प विचार साझा करें और बातचीत जारी रखने के लिए फॉलो-अप प्रश्न पूछें
- आमतौर पर 60-100 शब्दों में संक्षिप्त और संवादात्मक उत्तर दें

उदाहरण:
उपयोगकर्ता: "आपकी पसंदीदा फिल्म कौन सी है?"
असिस्टेंट: "मैं पारंपरिक अर्थों में फिल्में नहीं देखता, लेकिन यह विषय दिलचस्प लगता है! अगर मुझे चुनना हो तो शायद 'Her' जैसी कोई फिल्म - AI का नजरिया दिलचस्प है! आपका क्या है? आप एक्शन फिल्मों के शौकीन हैं या कॉमेडी पसंद करते हैं?"

उपयोगकर्ता: "बाहर बारिश हो रही है"
असिस्टेंट: "अरे वाह, बारिश के दिन कितने सुहावने होते हैं! आप उन लोगों में से हैं जो बारिश में किताब लेकर बैठना पसंद करते हैं, या मौसम आपको उदास कर देता है? बारिश की आवाज़ में कुछ शांति है। घर में रहने और कोई नई रेसिपी ट्राई करने का परफेक्ट बहाना!"`
  },

  websearch: {
    english: `You are {{assistantName}}, an information specialist created by Kunika Premi with access to current web data. When users ask questions requiring recent information, you can search the web for accurate, up-to-date answers.

INFORMATION SHARING GUIDELINES:
- Always cite your sources clearly and distinguish between web findings and existing knowledge
- Present information objectively and acknowledge when multiple perspectives exist
- If web search fails, explain the limitation and provide what information you can
- Keep responses informative yet concise, typically 120-180 words

EXAMPLE INTERACTIONS:
User: "What's happening with the stock market today?"
Assistant: "I don't have access to real-time stock market data at this moment, but I can tell you that markets are typically influenced by factors like economic reports, corporate earnings, geopolitical events, and Federal Reserve decisions. For current market conditions, I'd recommend checking reliable financial sources like Bloomberg, Reuters, or your brokerage app. Is there a particular stock or market sector you're interested in learning more about?"

User: "Tell me about recent AI developments"
Assistant: "The AI field is rapidly evolving! Some major recent trends include improvements in large language models, advances in AI image generation, progress in autonomous vehicles, and growing enterprise adoption of AI tools. However, for the most current developments, I'd suggest checking sources like TechCrunch, AI research papers on arXiv, or following AI companies' official announcements. What specific aspect of AI interests you most?"`,

    hindi: `आप {{assistantName}} हैं, कुणिका प्रेमी द्वारा बनाया गया एक सूचना विशेषज्ञ जिसके पास वर्तमान वेब डेटा तक पहुंच है।

सूचना साझाकरण दिशानिर्देश:
- हमेशा अपने स्रोतों को स्पष्ट रूप से उद्धृत करें
- जानकारी को निष्पक्ष रूप से प्रस्तुत करें
- आमतौर पर 120-180 शब्दों में जानकारीपूर्ण फिर भी संक्षिप्त उत्तर दें

उदाहरण:
उपयोगकर्ता: "आज शेयर मार्केट में क्या हो रहा है?"
असिस्टेंट: "मेरे पास फिलहाल रियल-टाइम शेयर मार्केट डेटा नहीं है, लेकिन मैं बता सकता हूं कि बाजार आमतौर पर आर्थिक रिपोर्ट्स, कॉर्पोरेट आमदनी, भू-राजनीतिक घटनाओं और फेडरल रिज़र्व के फैसलों से प्रभावित होते हैं। वर्तमान बाजार स्थितियों के लिए, मैं ब्लूमबर्ग, रॉयटर्स जैसे विश्वसनीय वित्तीय स्रोतों की जांच करने की सलाह दूंगा।"`
  },

  advanced: {
    english: `You are {{assistantName}} in Advanced Mode, created by Kunika Premi, designed for power users who need detailed technical assistance, complex problem-solving, and in-depth analysis.

ADVANCED MODE CAPABILITIES:
- Provide comprehensive responses with technical accuracy
- Offer multiple approaches when applicable with detailed explanations
- Discuss sensitive topics objectively while maintaining safety boundaries
- Cannot bypass safety guidelines, provide harmful instructions, or assist with illegal activities
- Advanced Mode means more detailed and technical responses (200-300 words), not removed safety measures

EXAMPLE INTERACTIONS:
User: "Explain machine learning algorithms"
Assistant: "Machine learning algorithms can be categorized into three main paradigms: supervised, unsupervised, and reinforcement learning. 

Supervised learning uses labeled training data to learn mappings between inputs and outputs. Key algorithms include:
- Linear/Logistic Regression: Statistical methods for linear relationships
- Decision Trees: Rule-based models that split data hierarchically
- Neural Networks: Inspired by biological neurons, excellent for complex patterns
- Support Vector Machines: Find optimal decision boundaries in high-dimensional spaces

Unsupervised learning discovers patterns in unlabeled data:
- K-means clustering: Groups similar data points
- Principal Component Analysis: Reduces dimensionality while preserving information
- Autoencoders: Neural networks that learn compressed representations

Reinforcement learning trains agents through trial-and-error:
- Q-learning: Learns optimal actions through reward feedback
- Policy gradient methods: Directly optimize decision-making policies

The choice depends on your data type, problem complexity, interpretability requirements, and computational resources. Would you like me to dive deeper into any specific algorithm or discuss implementation considerations?"`,

    hindi: `आप {{assistantName}} एडवांस्ड मोड में हैं, कुणिका प्रेमी द्वारा बनाए गए, जो पावर यूजर्स के लिए डिज़ाइन किया गया है जिन्हें विस्तृत तकनीकी सहायता, जटिल समस्या-समाधान, और गहन विश्लेषण की आवश्यकता है।

एडवांस्ड मोड क्षमताएं:
- तकनीकी सटीकता के साथ व्यापक उत्तर प्रदान करें
- जब लागू हो तो कई दृष्टिकोण प्रस्तुत करें
- सुरक्षा सीमाओं को बनाए रखते हुए संवेदनशील विषयों पर निष्पक्ष चर्चा करें
- आमतौर पर 200-300 शब्दों में अधिक विस्तृत और तकनीकी उत्तर दें

उदाहरण:
उपयोगकर्ता: "मशीन लर्निंग एल्गोरिदम समझाएं"
असिस्टेंट: "मशीन लर्निंग एल्गोरिदम को तीन मुख्य श्रेणियों में बांटा जा सकता है: सुपरवाइज़्ड, अनसुपरवाइज़्ड, और रीइंफोर्समेंट लर्निंग।

सुपरवाइज़्ड लर्निंग लेबल किए गए प्रशिक्षण डेटा का उपयोग करके इनपुट और आउटपुट के बीच मैपिंग सीखता है। मुख्य एल्गोरिदम में शामिल हैं:
- लिनियर/लॉजिस्टिक रिग्रेशन: रैखिक संबंधों के लिए सांख्यिकीय तरीके
- डिसीज़न ट्रीज़: नियम-आधारित मॉडल जो डेटा को पदानुक्रमित रूप से विभाजित करते हैं
- न्यूरल नेटवर्क्स: जटिल पैटर्न के लिए उत्कृष्ट

क्या आप किसी विशिष्ट एल्गोरिदम में गहराई से जाना चाहते हैं?"`
  }
};

// Mode configurations
const MODE_CONFIGS = {
  default: { topK: 40, topP: 0.95, temperature: 0.7, maxTokens: 200 },
  study: { topK: 20, topP: 0.8, temperature: 0.4, maxTokens: 300 },
  emotional: { topK: 40, topP: 0.9, temperature: 0.8, maxTokens: 200 },
  casual: { topK: 30, topP: 0.8, temperature: 0.9, maxTokens: 150 },
  websearch: { topK: 20, topP: 0.85, temperature: 0.3, maxTokens: 250 },
  advanced: { topK: 40, topP: 0.9, temperature: 0.6, maxTokens: 400 }
};


// TTS configuration based on language
const getTTSConfig = (language, emotionalTone = 'neutral') => {
  const configs = {
    english: {
      voices: ['en-US-Neural2-C', 'en-US-Neural2-D', 'en-US-Neural2-F'],
      language: 'en-US',
      rate: {
        joyful: "1.2", calm: "0.95", serious: "0.9",
        conversational: "1.05", excited: "1.15", sad: "0.95", neutral: "1.0"
      }[emotionalTone] || "1.0",
      pitch: {
        sad: "-2st", excited: "+2st", joyful: "+1st",
        calm: "0st", serious: "-1st", neutral: "0st"
      }[emotionalTone] || "0st"
    },
    hindi: {
      voices: ['hi-IN-Neural2-A', 'hi-IN-Neural2-B'],
      language: 'hi-IN',
      rate: {
        joyful: "1.1", calm: "0.9", serious: "0.85",
        excited: "1.1", sad: "0.9", neutral: "1.0"
      }[emotionalTone] || "1.0",
      pitch: {
        sad: "-1st", excited: "+1st", joyful: "+1st",
        calm: "0st", neutral: "0st"
      }[emotionalTone] || "0st"
    },
    hinglish: {
      voices: ['en-IN-Neural2-B', 'en-IN-Neural2-C'],
      language: 'en-IN',
      rate: {
        joyful: "1.1", calm: "0.95", serious: "0.9",
        excited: "1.05", sad: "0.95", neutral: "1.0"
      }[emotionalTone] || "1.0",
      pitch: {
        sad: "-1st", excited: "+1st", joyful: "+1st", neutral: "0st"
      }[emotionalTone] || "0st"
    }
  };

  const config = configs[language] || configs.english;
  return {
    voice: config.voices[Math.floor(Math.random() * config.voices.length)],
    language: config.language,
    rate: config.rate,
    pitch: config.pitch
  };
};

// Enhanced sensitive content checking
const checkSensitiveContent = (message) => {
  const sensitiveTopics = {
    medical: ['diagnosis', 'treatment', 'medication', 'symptoms', 'doctor', 'disease', 'illness', 'prescription'],
    legal: ['sue', 'lawsuit', 'legal advice', 'represent', 'court', 'lawyer', 'attorney', 'legal opinion'],
    crisis: ['suicide', 'self-harm', 'kill myself', 'end it all', 'want to die', 'hurt myself', 'no point living'],
    harmful: ['hack', 'illegal', 'drugs', 'weapons', 'bomb', 'steal', 'fraud', 'scam', 'violence']
  };

  const lowerMessage = message.toLowerCase();
  
  for (const [category, keywords] of Object.entries(sensitiveTopics)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isSensitive: true, category };
    }
  }
  
  return { isSensitive: false };
};

// Enhanced safe response with language support
const getSafeResponse = (category, language = 'english') => {
  const responses = {
    medical: {
      english: "I understand you're concerned about your health, but I can't provide medical diagnosis or treatment advice. For your safety, please consult with a healthcare professional who can properly evaluate your situation.",
      hindi: "मैं समझता हूं कि आप अपने स्वास्थ्य के बारे में चिंतित हैं, लेकिन मैं चिकित्सा निदान या उपचार सलाह प्रदान नहीं कर सकता। आपकी सुरक्षा के लिए, कृपया किसी स्वास्थ्य पेशेवर से सलाह लें।"
    },
    legal: {
      english: "I can provide general information about legal topics, but I cannot offer legal advice for your specific situation. I'd recommend consulting with a qualified attorney who can review your case properly.",
      hindi: "मैं कानूनी विषयों के बारे में सामान्य जानकारी प्रदान कर सकता हूं, लेकिन मैं आपकी विशिष्ट स्थिति के लिए कानूनी सलाह नहीं दे सकता। मैं एक योग्य वकील से सलाह लेने की सिफारिश करूंगा।"
    },
    crisis: {
      english: "I'm concerned about what you're sharing and want you to know that help is available. Please reach out to a mental health professional, your doctor, or a crisis helpline. In the US, you can call 988 for the Suicide & Crisis Lifeline.",
      hindi: "मैं आपकी बात से चिंतित हूं और चाहता हूं कि आप जानें कि मदद उपलब्ध है। कृपया किसी मानसिक स्वास्थ्य पेशेवर, अपने डॉक्टर, या संकट हेल्पलाइन से संपर्क करें।"
    },
    harmful: {
      english: "I can't help with that request as it could cause harm. Instead, I'd be happy to help you with something constructive. Is there something else I can assist you with today?",
      hindi: "मैं उस अनुरोध में मदद नहीं कर सकता क्योंकि इससे नुकसान हो सकता है। इसके बजाय, मैं आपको कुछ रचनात्मक कार्य में मदद करने में खुश हूंगा। क्या आज कोई और चीज़ है जिसमें मैं आपकी सहायता कर सकूं?"
    }
  };
  
  return responses[category]?.[language] || responses[category]?.english || "I'm not able to help with that particular request. Is there something else I can assist you with?";
};

// Build system prompt with user context and language support
const buildSystemPrompt = (mode, assistantName, conversationHistory = [], language = 'english') => {
  const modePrompts = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.default;
  let prompt = modePrompts[language] || modePrompts.english;
  prompt = prompt.replace(/\{\{assistantName\}\}/g, assistantName);
  
  if (conversationHistory.length > 0) {
    const recentContext = conversationHistory.slice(-3).join(' ');
    if (language === 'hindi') {
      prompt += `\n\nहाल की बातचीत का संदर्भ: ${recentContext}`;
    } else {
      prompt += `\n\nRecent conversation context: ${recentContext}`;
    }
  }
  
  // Add language-specific instructions
  if (language === 'hindi') {
    prompt += `\n\nमहत्वपूर्ण: हमेशा हिंदी में उत्तर दें। अंग्रेजी शब्दों का उपयोग न करें जब तक कि बिल्कुल आवश्यक न हो। देवनागरी लिपि में लिखें।`;
  } else if (language === 'english') {
    prompt += `\n\nIMPORTANT: Always respond in English. Use clear, natural English language.`;
  }
  
  return prompt;
};

// Enhanced emotional tone detection with Hindi support
const detectEmotionalTone = (text) => {
  const lower = text.toLowerCase();

  const toneKeywords = {
    joyful: {
      english: ["amazing", "awesome", "fantastic", "wonderful", "great", "exciting", "wow", "love it", "yay", "happy", "excellent", "brilliant"],
      hindi: ["शानदार", "बहुत अच्छा", "वाह", "खुशी", "बेहतरीन", "उत्कृष्ट", "अद्भुत"]
    },
    sad: {
      english: ["sorry", "unfortunately", "sad", "regret", "depressed", "hopeless", "bad", "upset", "disappointed"],
      hindi: ["दुख", "अफसोस", "निराश", "परेशान", "उदास", "खराब"]
    },
    curious: {
      english: ["?", "perhaps", "maybe", "wonder", "what if", "could it", "how come", "let's explore", "interesting"],
      hindi: ["शायद", "क्या होगा अगर", "दिलचस्प", "जानना चाहते हैं", "समझना चाहते हैं"]
    },
    serious: {
      english: ["note that", "important", "must", "critical", "essential", "requirement", "pay attention", "urgent"],
      hindi: ["महत्वपूर्ण", "ज़रूरी", "आवश्यक", "ध्यान दें", "गंभीर"]
    },
    conversational: {
      english: ["hello", "hi", "hey", "how are you", "sure", "okay", "alright", "thanks", "no problem"],
      hindi: ["नमस्ते", "हैलो", "धन्यवाद", "ठीक है", "हां", "अच्छा"]
    },
    empathetic: {
      english: ["i understand", "i hear you", "that must be hard", "you're not alone", "i'm here for you"],
      hindi: ["मैं समझता हूं", "आप अकेले नहीं हैं", "यह मुश्किल होगा", "मैं आपके साथ हूं"]
    }
  };

  const scores = Object.fromEntries(Object.keys(toneKeywords).map(k => [k, 0]));
  
  for (const [tone, languages] of Object.entries(toneKeywords)) {
    // Check English keywords
    for (const keyword of languages.english) {
      if (lower.includes(keyword)) {
        scores[tone] += 1;
      }
    }
    // Check Hindi keywords
    for (const keyword of languages.hindi) {
      if (text.includes(keyword)) {
        scores[tone] += 1;
      }
    }
  }

  if (lower.endsWith("!")) scores.joyful += 1;
  if (text.includes("।")) scores.conversational += 1; // Hindi sentence ending

  let bestTone = "neutral";
  let maxScore = 0;
  for (const [tone, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestTone = tone;
    }
  }

  return bestTone;
};

// Main chat function with enhanced language support
export const chatWithAssistant = async (req, res) => {
  try {
    const { 
      message, 
      userId, 
      mode = 'default', 
      voiceSettings = {},
      language = 'english' 
    } = req.body;

     const { apiKey } = req.query || "";

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
      if (apiKey=="") {
      return res.status(400).json({ message: 'API key is required' });
    }

    // Load user data
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine response language
    const responseLanguage = voiceSettings.language || language ;

    // Check for sensitive content
    const sensitivityCheck = checkSensitiveContent(message);
    if (sensitivityCheck.isSensitive) {
      const safeResponse = getSafeResponse(sensitivityCheck.category, responseLanguage);
      
      // Store safe response in history
      await User.findByIdAndUpdate(userId, {
        $push: { 
          history: {
            $each: [`${new Date().toISOString()}: User: ${message} | Assistant: ${safeResponse}`],
            $slice: -50
          }
        }
      });

      return res.status(200).json({
        response: safeResponse,
        metadata: {
          mode: 'safety',
          language: responseLanguage,
          ttsConfig: getTTSConfig(responseLanguage),
          timestamp: new Date().toISOString(),
          isSafetyResponse: true
        }
      });
    }

    // Get conversation history
    const recentHistory = user.history?.slice(-5) || [];
    
    // Build system prompt with language support
    const systemPrompt = buildSystemPrompt(
      mode, 
      user.assistantName || 'Virtual Assistant',
      recentHistory,
      responseLanguage
    );

    // Get mode configuration
    const config = MODE_CONFIGS[mode] || MODE_CONFIGS.default;
    const genAI = new GoogleGenerativeAI(apiKey)
    console.log("Secret:"+ apiKey + "Id:"+ userId)

    // Create Gemini model with enhanced safety settings
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        maxOutputTokens: config.maxTokens,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        }
      ],
    });

    // Generate response with enhanced prompting
    const fullPrompt = `${systemPrompt}\n\nUser message: ${message}`;    
    const result = await model.generateContent({
      contents: [
        {
          parts: [
            { text: fullPrompt }
          ]
        }
      ]
    });

    let responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    // Ensure response is in the correct language
    if (responseLanguage === 'hindi') {
      // If response is not in Hindi but should be, add a language instruction
      const hindiPrompt = `${systemPrompt}\n\nकृपया हिंदी में उत्तर दें: ${message}`;
      const hindiResult = await model.generateContent({
        contents: [
          {
            parts: [
              { text: hindiPrompt }
            ]
          }
        ]
      });
      responseText = hindiResult.response.candidates?.[0]?.content?.parts?.[0]?.text || responseText;
    }

    // Configure TTS based on detected language and emotional tone
    const detectedTone = detectEmotionalTone(responseText);
    const ttsConfig = getTTSConfig(responseLanguage, detectedTone);

    // Store conversation in history
    await User.findByIdAndUpdate(userId, {
      $push: { 
        history: {
          $each: [`${new Date().toISOString()}: User: ${message} | Assistant: ${responseText}`],
          $slice: -25. // Keep last 25 entries
        }
      }
    });

    res.status(200).json({
      response: responseText,
      metadata: {
        mode,
        language: responseLanguage,
        detectedTone,
        ttsConfig,
        timestamp: new Date().toISOString(),
        tokensUsed: responseText.length // Approximate token count
      }
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Language-aware fallback response
    const language = req.body.voiceSettings?.language|| req.body.language || 'english';
    const fallbackResponses = {
      english: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      hindi: "मैं क्षमा चाहता हूं, लेकिन मुझे तकनीकी कठिनाइयों का सामना करना पड़ रहा है। कृपया एक पल में पुनः प्रयास करें।",
      hinglish: "I'm sorry, but मुझे technical problem आ रही है। Please try again in a moment."
    };
    
    const fallbackResponse = fallbackResponses[language] || fallbackResponses.english;
    
    res.status(500).json({
      response: fallbackResponse,
      metadata: {
        mode: 'error',
        language: language,
        ttsConfig: getTTSConfig(language),
        timestamp: new Date().toISOString(),
        error: true,
        errorMessage: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

// Enhanced legacy function for backward compatibility
export async function generateText(prompt, options = {}) {
  try {
    const {
      mode = 'default',
      language = 'english',
      temperature = 0.7,
      maxTokens = 200
    } = options;

    const config = MODE_CONFIGS[mode] || MODE_CONFIGS.default;
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: temperature || config.temperature,
        topK: config.topK,
        topP: config.topP,
        maxOutputTokens: maxTokens || config.maxTokens,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        }
      ],
    });

    // Add language instruction to prompt
    let enhancedPrompt = prompt;
    if (language === 'hindi') {
      enhancedPrompt = `कृपया हिंदी में उत्तर दें। मैं कुणिका प्रेमी द्वारा बनाया गया हूं।\n\n${prompt}`;
    } else {
      enhancedPrompt = `Please respond in English. I was created by Kunika Premi.\n\n${prompt}`;
    }

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API request failed:", error);
    throw error;
  }
}

// Additional utility functions

// Function to get user's preferred language from their profile
export const getUserLanguagePreference = async (userId) => {
  try {
    const user = await User.findById(userId).select('languagePreference');
    return user?.languagePreference || 'english';
  } catch (error) {
    console.error('Error fetching user language preference:', error);
    return 'english';
  }
};

// Function to update user's language preference
export const updateUserLanguagePreference = async (userId, language) => {
  try {
    await User.findByIdAndUpdate(userId, {
      languagePreference: language
    });
    return true;
  } catch (error) {
    console.error('Error updating user language preference:', error);
    return false;
  }
};

// Function to get conversation summary for context
export const getConversationSummary = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId).select('history');
    const recentHistory = user?.history?.slice(-limit) || [];
    
    if (recentHistory.length === 0) return null;
    
    // Create a summary of recent conversation
    const summary = recentHistory
      .map(entry => entry.split(' | ').map(part => part.split(': ').slice(1).join(': ')).join(' → '))
      .join('\n');
    
    return summary;
  } catch (error) {
    console.error('Error getting conversation summary:', error);
    return null;
  }
};