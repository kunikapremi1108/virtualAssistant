export const CONVERSATION_MODES = {
  default: {
    displayName: "General Assistant",
    description: "Helpful responses for everyday questions",
    icon: "💬"
  },
  study: {
    displayName: "Study Helper",
    description: "Educational support and learning assistance",
    icon: "📚"
  },
  emotional: {
    displayName: "Emotional Support",
    description: "Compassionate conversation and emotional guidance",
    icon: "💝"
  },
  casual: {
    displayName: "Casual Chat",
    description: "Relaxed, friendly conversation",
    icon: "😊"
  },
  websearch: {
    displayName: "Web Research",
    description: "Find current information and recent updates",
    icon: "🔍"
  },
  advanced: {
    displayName: "Advanced Mode",
    description: "Detailed technical assistance and analysis",
    icon: "🔧"
  }
};

export const VOICE_SETTINGS = {
  language: {
    auto: "Auto-detect",
    english: "English",
    hindi: "हिन्दी",
    hinglish: "Hinglish"
  },
  speechRate: {
    slow: { value: 0.8, label: "Slow" },
    normal: { value: 1.0, label: "Normal" },
    fast: { value: 1.2, label: "Fast" }
  },
  voiceStyle: {
    professional: { value: "Neural2-C", label: "Professional" },
    friendly: { value: "Neural2-A", label: "Friendly" },
    casual: { value: "Neural2-B", label: "Casual" }
  }
};