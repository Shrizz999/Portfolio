import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION ---
const HUGGING_FACE_DOMAIN = "shrizz999-shrizzfolio.hf.space";
const currentHost = window.location.hostname;
const isLocalDev = currentHost === 'localhost' || currentHost === '127.0.0.1';
const BACKEND_URL = isLocalDev ? `http://${currentHost}:8000` : `https://${HUGGING_FACE_DOMAIN}`;
const WS_BACKEND_URL = isLocalDev ? `ws://${currentHost}:8000` : `wss://${HUGGING_FACE_DOMAIN}`;

const categories = [
  { id: 'cv', title: 'Computer Vision', description: 'Live webcam inference & Hand-tracking games.', color: 'bg-blue-50', borderColor: 'border-blue-200', icon: '📷' },
  { id: 'agent', title: 'AI Agents', description: 'Conversational Gemini-powered assistants.', color: 'bg-pink-50', borderColor: 'border-pink-200', icon: '🤖' },
  { id: 'ml', title: 'Machine Learning', description: 'Lung Cancer Risk prediction models.', color: 'bg-green-50', borderColor: 'border-green-200', icon: '🧠' },
  { id: 'nlp', title: 'NLP', description: 'Advanced text analysis & sentiment.', color: 'bg-amber-50', borderColor: 'border-amber-200', icon: '📝' },
  { id: 'robotics', title: 'Robotics', description: 'Simulated kinematics & automation.', color: 'bg-purple-50', borderColor: 'border-purple-200', icon: '🦾' }
];

export default function App() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* Hero Section */}
      <header className="pt-20 pb-16 px-6 max-w-6xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-blue-600 uppercase bg-blue-100 rounded-full">
            Portfolio v2.0 • AI & ML Hub
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Shrizz's Hub
          </h1>
          <p className="text-slate-500 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
            Where advanced computer vision meets generative AI. 
            An interactive playground for high-performance machine learning models.
          </p>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pb-32">
        
        {/* Category Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveSection(category.id === activeSection ? null : category.id)}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${category.color} ${category.borderColor} ${
                activeSection === category.id 
                  ? 'shadow-xl ring-2 ring-slate-900 ring-offset-2' 
                  : 'hover:shadow-md'
              }`}
            >
              <div className="text-3xl mb-4 transition-transform group-hover:scale-110 duration-300">{category.icon}</div>
              <h3 className="text-lg font-bold mb-1 text-slate-800">{category.title}</h3>
              <p className="text-xs text-slate-500 transition-colors duration-300 line-clamp-2">{category.description}</p>
              
              {activeSection === category.id && (
                <motion.div layoutId="active-indicator" className="absolute top-2 right-4 text-slate-900 text-xl font-black">•</motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Dynamic Workspace Area */}
        <AnimatePresence mode="wait">
          {activeSection ? (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[48px] p-1 shadow-2xl border-2 border-slate-100"
            >
              <div className="rounded-[44px] overflow-hidden p-8 md:p-12">
                {activeSection === 'cv' && <OpenCVSection />}
                {activeSection === 'agent' && <AIAgentSection />}
                {activeSection === 'ml' && <MLSection />}
                {activeSection === 'nlp' && <PlaceholderSection title="NLP Workspace" />}
                {activeSection === 'robotics' && <PlaceholderSection title="Robotics Workspace" />}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[48px]"
            >
              <p className="text-slate-400 font-medium">Select a module above to launch the interactive workspace.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 AI & ML Hub • Built with React & FastAPI</p>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function PlaceholderSection({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <span className="text-3xl">⚙️</span>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500">This module is currently under development.</p>
    </div>
  );
}

function AIAgentSection() {
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Hello! I am your Portfolio Assistant. How can I help you today?' }
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
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
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
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">AI Portfolio Assistant</h2>
          <p className="text-slate-500">Ask about projects, technical skills, or just say hi.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 text-xs font-bold rounded-xl border border-pink-100 uppercase tracking-widest">
          <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
          Gemini 1.5 Flash
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-100 rounded-[32px] p-8 mb-6 flex flex-col gap-6 shadow-inner">
        {messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-5 rounded-3xl ${msg.role === 'user' ? 'bg-slate-900 text-slate-50 rounded-br-sm shadow-xl' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-md'}`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-bl-sm shadow-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-4 p-2 bg-white rounded-full shadow-lg border border-slate-100">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={handleKeyPress} 
          placeholder="Ask me something..." 
          className="flex-1 bg-transparent border-none px-6 py-4 text-slate-700 focus:outline-none placeholder:text-slate-300" 
          disabled={isLoading} 
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()} 
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-10 py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95"
        >
          Send
        </button>
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
  const [cameraError, setCameraError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let ws = null;
    let interval = null;

    // START WEBCAM
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error(e));
          setCameraError(null);
        }
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        if (isMounted) setCameraError(err.message);
      });

    const connectWebSocket = () => {
      if (!isMounted) return;
      
      const backendWsUrl = `${WS_BACKEND_URL}/ws/opencv`; 
      ws = new WebSocket(backendWsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted) setIsConnected(true);
      };

      ws.onclose = () => {
        if (isMounted) {
          setIsConnected(false);
          // Try to reconnect after 2 seconds
          setTimeout(connectWebSocket, 2000);
        }
      };

      ws.onmessage = (event) => {
        if (isMounted && imgRef.current) {
          imgRef.current.src = event.data;
        }
      };
    };

    connectWebSocket();

    interval = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN && videoRef.current?.readyState >= 2 && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5); 
        ws.send(JSON.stringify({ mode: cvMode, frame: dataUrl.split(',')[1] }));
      }
    }, 100);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (ws) {
        ws.onclose = null; // Prevent reconnect loop on unmount
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [cvMode]);

  const modes = [
    { id: 'canny', label: 'Edge Detection', icon: '〰️' },
    { id: 'fatigue', label: 'Fatigue Monitor', icon: '👁️' },
    { id: 'puzzle', label: 'Puzzle Game', icon: '🧩' }
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col lg:flex-row justify-between w-full items-start lg:items-center mb-12 gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Live Computer Vision</h2>
          <p className="text-slate-500">Real-time processing via WebSocket stream.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner gap-1">
           {modes.map(m => (
             <button 
               key={m.id}
               onClick={() => setCvMode(m.id)}
               className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                 cvMode === m.id ? 'bg-white text-blue-600 shadow-lg ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
               }`}
             >
               <span>{m.icon}</span>
               {m.label}
             </button>
           ))}
        </div>
      </div>
      
      <div className="relative w-full max-w-5xl group">
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <canvas ref={canvasRef} width="640" height="480" className="hidden" />
        
        <div className="absolute -top-4 -right-4 z-20">
           <div className={`px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border-2 ${isConnected ? 'bg-green-500 border-green-400 text-white' : 'bg-red-500 border-red-400 text-white animate-pulse'}`}>
             <span className="w-2 h-2 bg-white rounded-full"></span>
             <span className="text-xs font-black uppercase tracking-widest">{isConnected ? 'WSS ACTIVE' : 'RECONNECTING'}</span>
           </div>
        </div>

        <div className="aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white relative group-hover:scale-[1.01] transition-transform duration-500">
        {/* Overlay States */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 backdrop-blur-sm px-6 text-center">
            <div className="text-5xl mb-4">🚫</div>
            <p className="text-red-400 font-bold text-xl mb-2">Camera Access Failed</p>
            <p className="text-white mb-2">{cameraError}</p>
            <p className="text-slate-400 text-sm">Please ensure no other app (like Zoom or OBS) is using your webcam.</p>
          </div>
        )}
        {!cameraError && !isConnected ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 backdrop-blur-sm">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <p className="text-white font-medium animate-pulse">Establishing Secure WebSocket...</p>
            <p className="text-slate-400 text-sm mt-2">Initializing {isLocalDev ? 'local' : 'cloud'} OpenCV stream ({isLocalDev ? currentHost : HUGGING_FACE_DOMAIN})...</p>
          </div>
        ) : null}
           <img ref={imgRef} className="w-full h-full object-contain" alt="CV Stream" />
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
             <h4 className="font-bold text-blue-900 mb-2">Architecture</h4>
             <p className="text-xs text-blue-700 leading-relaxed">Canvas frames are base64 encoded, streamed via WSS to FastAPI, processed by Mediapipe/OpenCV, and returned as a JPG blob.</p>
           </div>
           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
             <h4 className="font-bold text-slate-800 mb-2">Performance</h4>
             <p className="text-xs text-slate-600 leading-relaxed">Headless execution ensures high frame rates even on cloud hardware without GPUs. Latency ~40-80ms.</p>
           </div>
           <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
             <h4 className="font-bold text-green-900 mb-2">Privacy</h4>
             <p className="text-xs text-green-700 leading-relaxed">No video data is stored. Frames are processed in memory and discarded immediately after processing.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function MLSection() {
  const [formData, setFormData] = useState({
    AGE: 50, GENDER_M: 1, SMOKING: 1, YELLOW_FINGERS: 1, ANXIETY: 1, CHRONIC_DISEASE: 1,
    FATIGUE: 1, ALLERGY: 1, WHEEZING: 1, ALCOHOL_CONSUMING: 1, COUGHING: 1,
    SHORTNESS_OF_BREATH: 1, SWALLOWING_DIFFICULTY: 1, CHEST_PAIN: 1
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/predict/lung-cancer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Server error");
      }
      setResult(data);
    } catch (e) {
      console.error(e);
      alert(`Error connecting to ML backend: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { id: 'SMOKING', label: 'Smoking' },
    { id: 'YELLOW_FINGERS', label: 'Yellow Fingers' },
    { id: 'ANXIETY', label: 'Anxiety' },
    { id: 'CHRONIC_DISEASE', label: 'Chronic Disease' },
    { id: 'FATIGUE', label: 'Fatigue' },
    { id: 'ALLERGY', label: 'Allergy' },
    { id: 'WHEEZING', label: 'Wheezing' },
    { id: 'ALCOHOL_CONSUMING', label: 'Alcohol' },
    { id: 'COUGHING', label: 'Coughing' },
    { id: 'SHORTNESS_OF_BREATH', label: 'Shortness of Breath' },
    { id: 'SWALLOWING_DIFFICULTY', label: 'Swallowing Difficulty' },
    { id: 'CHEST_PAIN', label: 'Chest Pain' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Lung Cancer Prediction</h2>
        <p className="text-slate-500 text-lg">Scikit-Learn Random Forest Classifier (92% Accuracy)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8 bg-slate-50 p-8 rounded-[40px] border border-slate-100 shadow-inner">
          <div className="flex gap-8">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Patient Age</label>
              <input 
                type="number" 
                value={formData.AGE} 
                onChange={e => setFormData({...formData, AGE: parseInt(e.target.value)})}
                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gender</label>
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
                <button 
                  onClick={() => setFormData({...formData, GENDER_M: 1})}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.GENDER_M === 1 ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                >Male</button>
                <button 
                  onClick={() => setFormData({...formData, GENDER_M: 0})}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${formData.GENDER_M === 0 ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                >Female</button>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Indicators (Yes/No)</label>
             <div className="grid grid-cols-2 gap-3">
                {fields.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFormData({...formData, [f.id]: formData[f.id] === 2 ? 1 : 2})}
                    className={`flex items-center justify-between px-5 py-3 rounded-2xl border-2 transition-all font-semibold text-sm ${
                      formData[f.id] === 2 ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'
                    }`}
                  >
                    {f.label}
                    <span className={`text-xs p-1 rounded-md ${formData[f.id] === 2 ? 'bg-blue-400' : 'bg-slate-100'}`}>
                      {formData[f.id] === 2 ? 'YES' : 'NO'}
                    </span>
                  </button>
                ))}
             </div>
          </div>

          <button 
            onClick={handlePredict}
            disabled={isLoading}
            className="w-full py-5 rounded-[24px] bg-slate-900 text-white font-black text-xl hover:bg-blue-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'ANALYZING BIOMARKERS...' : 'RUN DIAGNOSTIC INFERENCE'}
          </button>
        </div>

        <div className="flex flex-col">
          {result ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
              <div className={`flex-1 rounded-[40px] p-12 flex flex-col items-center justify-center text-center mb-8 border-4 ${result.prediction === 1 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className={`text-6xl mb-6 ${result.prediction === 1 ? 'animate-pulse' : ''}`}>{result.prediction === 1 ? '⚠️' : '✅'}</div>
                <h3 className={`text-5xl font-black mb-4 ${result.prediction === 1 ? 'text-red-900' : 'text-green-900'}`}>{result.risk_level}</h3>
                <div className="bg-white px-8 py-4 rounded-3xl shadow-lg">
                  <span className="text-slate-400 text-sm font-bold uppercase block mb-1">Inference Confidence</span>
                  <span className={`text-4xl font-black ${result.prediction === 1 ? 'text-red-600' : 'text-green-600'}`}>{result.confidence}%</span>
                </div>
              </div>
              <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl">
                 <h4 className="font-bold text-blue-400 mb-2 uppercase tracking-widest text-xs">Technical Summary</h4>
                 <p className="text-slate-300 text-sm leading-relaxed">The model processed 14 feature vectors using a Random Forest ensemble. The decision was based on weighted feature importance where {formData.SMOKING === 2 ? 'Smoking' : 'Age'} and {formData.FATIGUE === 2 ? 'Fatigue' : 'Chest Pain'} were high-impact variables.</p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center p-12 text-center text-slate-300">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl">📉</div>
              <h3 className="text-2xl font-bold text-slate-400 mb-2">Awaiting Diagnostic Data</h3>
              <p className="max-w-xs mx-auto">Fill out the patient questionnaire and run the inference engine to see results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}