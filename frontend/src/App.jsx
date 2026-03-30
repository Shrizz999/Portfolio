import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { id: 'cv', title: 'Computer Vision', description: 'Live webcam inference and object detection.', color: 'bg-pastel-blue', borderColor: 'border-blue-200' },
  { id: 'agent', title: 'AI Agents', description: 'Interactive conversational models and assistants.', color: 'bg-pastel-pink', borderColor: 'border-pink-200' },
  { id: 'ml', title: 'Machine Learning', description: 'Supervised and unsupervised predictive models.', color: 'bg-pastel-green', borderColor: 'border-green-200' },
  { id: 'nlp', title: 'NLP', description: 'Text processing, sentiment analysis, and generation.', color: 'bg-pastel-yellow', borderColor: 'border-yellow-200' },
  { id: 'robotics', title: 'Robotics & Automation', description: 'ROS workflows, kinematics, and simulations.', color: 'bg-pastel-purple', borderColor: 'border-purple-200' }
];

export default function App() {
  const [activeSection, setActiveSection] = useState(null);

  const getActiveColor = () => {
    const active = categories.find(c => c.id === activeSection);
    return active ? active.borderColor : 'border-gray-200';
  };

  return (
    <div className="min-h-screen bg-white text-gray-700 font-sans selection:bg-pastel-pink selection:text-gray-800">
      
      {/* Header Section */}
      <header className="pt-16 pb-12 px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-gray-800">
            Shrizz's AI Portfolio
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto tracking-wide">
            Interactive playground for machine learning, computer vision, and autonomous systems.
          </p>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-8 pb-24">
        
        {/* Category Navigation Grid */}
        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveSection(category.id === activeSection ? null : category.id)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden ${category.color} ${category.borderColor} ${
                activeSection === category.id 
                  ? 'shadow-[0_10px_20px_rgba(0,0,0,0.05)] ring-4 ring-white ring-opacity-50' 
                  : 'hover:shadow-lg opacity-90 hover:opacity-100'
              }`}
            >
              <h3 className="text-lg font-bold mb-2 text-gray-800">{category.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Dynamic Workspace Area */}
        <AnimatePresence mode="wait">
          {activeSection && (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -20 }}
              className={`bg-white border-4 rounded-[40px] p-8 md:p-12 shadow-xl min-h-[500px] ${getActiveColor()}`}
            >
              {activeSection === 'cv' && <OpenCVSection />}
              {activeSection === 'agent' && <AIAgentSection />}
              {activeSection === 'ml' && <div><h2 className="text-3xl font-bold">Machine Learning Loading...</h2></div>}
              {activeSection === 'nlp' && <div><h2 className="text-3xl font-bold">NLP Workspace Loading...</h2></div>}
              {activeSection === 'robotics' && <div><h2 className="text-3xl font-bold">Robotics Workspace Loading...</h2></div>}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function AIAgentSection() {
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Hello! I am the portfolio AI agent. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://portfolio-myax.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'agent', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'agent', text: 'Error: Could not process request.' }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'agent', text: 'Connection to backend failed. Make sure FastAPI is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">AI Agent Interface</h2>
        <span className="px-3 py-1 bg-pastel-pink text-pink-800 text-xs font-bold rounded-full border border-pink-200 uppercase tracking-wider">
          Gemini Powered
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 border-2 border-pink-100 rounded-3xl p-6 mb-4 flex flex-col gap-4 scroll-smooth">
        {messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gray-800 text-white rounded-br-sm' : 'bg-white border-2 border-pink-100 text-gray-700 rounded-bl-sm shadow-sm'}`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border-2 border-pink-100 p-4 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Ask the agent anything..." className="flex-1 bg-gray-50 border-2 border-pink-100 rounded-full px-6 py-4 text-gray-700 focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all" disabled={isLoading} />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-8 py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed">Send</button>
      </div>
    </div>
  );
}

function OpenCVSection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cvMode, setCvMode] = useState('canny'); 
  const wsRef = useRef(null);

  // ======================================================================
  // EDIT THE LINE BELOW! Replace the string with your Hugging Face Domain
  // Example: "shrizz999-my-portfolio.hf.space"
  // ======================================================================
  const HUGGING_FACE_DOMAIN = "YOUR_HUGGING_FACE_URL_HERE.hf.space"; 

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error(e));
        }
      })
      .catch((err) => console.error("Camera access error:", err));

    const isLocalDev = import.meta.env.DEV;
    const backendWsUrl = isLocalDev 
      ? 'ws://localhost:8000/ws/opencv' 
      : `wss://shrizz999-shrizzfolio.hf.space/ws/opencv`; 

    console.log("Vite DEV Mode Active:", isLocalDev);
    console.log("Attempting to connect to WebSocket:", backendWsUrl);

    wsRef.current = new WebSocket(backendWsUrl);
    
    wsRef.current.onopen = () => {
      console.log("WebSocket Connected!");
      setIsConnected(true);
    };
    
    wsRef.current.onclose = (event) => {
      console.log("WebSocket Closed:", event);
      setIsConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
    
    wsRef.current.onmessage = (event) => {
      if (imgRef.current) imgRef.current.src = event.data;
    };

    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN && videoRef.current?.readyState >= 2 && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6); 
        const payload = JSON.stringify({ mode: cvMode, frame: dataUrl.split(',')[1] });
        wsRef.current.send(payload);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [cvMode]);

  const modes = [
    { id: 'canny', label: 'Edge Detection' },
    { id: 'fatigue', label: 'Eye Fatigue Monitor' },
    { id: 'puzzle', label: 'Hand Puzzle Game' }
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col md:flex-row justify-between w-full items-center mb-8 gap-4 border-b-2 border-blue-100 pb-6">
        <h2 className="text-3xl font-bold text-gray-800">Live Computer Vision</h2>
        
        <div className="flex bg-gray-100 p-1.5 rounded-full shadow-inner">
           {modes.map(m => (
             <button 
               key={m.id}
               onClick={() => setCvMode(m.id)}
               className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                 cvMode === m.id ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
               }`}
             >
               {m.label}
             </button>
           ))}
        </div>
      </div>
      
      <div className="flex flex-col w-full justify-center items-center">
        <video ref={videoRef} autoPlay playsInline muted className="fixed top-[-100%] left-[-100%] opacity-0 pointer-events-none" />
        <canvas ref={canvasRef} width="640" height="480" className="fixed top-[-100%] left-[-100%] opacity-0 pointer-events-none" />
        
        <div className="bg-gray-50 p-4 rounded-[32px] shadow-sm border-2 border-blue-100 w-full max-w-4xl">
           <div className="flex justify-between items-center mb-3 px-4">
             <span className={`px-3 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-pastel-green text-green-800' : 'bg-pastel-pink text-red-800'}`}>
                {isConnected ? 'Backend Processing' : 'Disconnected'}
             </span>
             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
           </div>
           
           <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner">
             <img ref={imgRef} className="w-full h-full object-cover z-10" alt="CV Stream" />
           </div>
        </div>
      </div>
    </div>
  );
}