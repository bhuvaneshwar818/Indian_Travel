import React, { useEffect, useState, useRef } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { Send, Users, Sparkles, AlertCircle } from 'lucide-react'
import axios from 'axios'

// Native Stomp Client Wrapper using standard Browser WebSocket API
class NativeStompClient {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.ws = null;
    this.subscriptions = {};
    this.connected = false;
    this.onConnect = null;
    this.onMessage = null;
  }

  activate() {
    let wsUrl = this.url;
    // Map standard /ws to /ws/websocket to use Tomcat's raw WebSockets transport
    if (wsUrl.endsWith('/ws')) {
      wsUrl = wsUrl + '/websocket';
    } else if (wsUrl.endsWith('/ws/')) {
      wsUrl = wsUrl + 'websocket';
    }
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      const frame = `CONNECT\naccept-version:1.1,1.2\nheart-beat:10000,10000\nAuthorization:Bearer ${this.token}\n\n\u0000`;
      this.ws.send(frame);
    };

    this.ws.onmessage = (event) => {
      const data = event.data;
      if (data.startsWith('CONNECTED')) {
        this.connected = true;
        if (this.onConnect) this.onConnect();
      } else if (data.startsWith('MESSAGE')) {
        const bodyStart = data.indexOf('\n\n');
        if (bodyStart !== -1) {
          const body = data.substring(bodyStart + 2, data.lastIndexOf('\u0000'));
          if (this.onMessage) this.onMessage(body);
        }
      }
    };
  }

  subscribe(destination, callback) {
    const subId = 'sub-' + Math.random().toString(36).substr(2, 9);
    this.subscriptions[destination] = subId;
    this.onMessage = callback;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const frame = `SUBSCRIBE\nid:${subId}\ndestination:${destination}\n\n\u0000`;
      this.ws.send(frame);
    }
  }

  send(destination, body) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const frame = `SEND\ndestination:${destination}\ncontent-type:application/json\n\n${JSON.stringify(body)}\u0000`;
      this.ws.send(frame);
    }
  }

  deactivate() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default function GroupChat({ tripId }) {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const scrollRef = useRef(null);

  // Fetch History & Establish WebSocket connection
  useEffect(() => {
    if (!tripId) return;

    // 1. Fetch Chat History
    const fetchHistory = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const response = await axios.get(`http://localhost:8082/api/chat/history/${tripId}`, config);
        setMessages(response.data);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    fetchHistory();

    // 2. Establish Native STOMP WebSocket Connection
    const wsUrl = "ws://localhost:8082/ws";
    const client = new NativeStompClient(wsUrl, token);
    stompClientRef.current = client;

    client.onConnect = () => {
      setConnected(true);
      client.subscribe(`/topic/chat/${tripId}`, (msgBody) => {
        try {
          const parsed = JSON.parse(msgBody);
          setMessages((prev) => [...prev, parsed]);
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      });
    };

    client.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [tripId, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (stompClientRef.current && connected) {
      stompClientRef.current.send(`/app/chat/${tripId}`, {
        senderName: user?.fullName || 'Traveler',
        message: inputText
      });
      setInputText('');
    } else {
      // Local Mock fallback if websocket down
      const mockMsg = {
        senderName: user?.fullName || 'Traveler',
        message: inputText,
        sentAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, mockMsg]);
      setInputText('');
    }
  };

  return (
    <GlassCard className="p-5 flex flex-col h-[400px] text-left bg-white/[0.04]">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-650/20 text-violet-400 flex items-center justify-center border border-violet-900/30">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">👥 Trip Group Chat</h3>
            <p className="text-[9px] text-white/50">Discuss and sync plans with members</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-[9px] text-white/60 font-bold uppercase">
            {connected ? "Sync Live" : "Offline mode"}
          </span>
        </div>
      </div>

      {/* Message Log Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="py-20 text-center text-xs text-white/35 flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-500/50" />
            <span>Chat is empty. Say hello to your travel group!</span>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderName === (user?.fullName || 'Traveler');
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-white/40 mb-1 px-1 font-semibold">
                  {msg.senderName}
                </span>
                <div className={`px-3 py-2 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                  isMe
                    ? 'bg-violet-600 text-white rounded-tr-none'
                    : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message group..."
          className="flex-1 glass-input text-xs"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-violet-650 hover:bg-violet-700 text-white transition-all shadow-md flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </GlassCard>
  )
}
