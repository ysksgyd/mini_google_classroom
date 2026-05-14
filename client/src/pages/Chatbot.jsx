import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Send, Bot, User, Sparkles, BookOpen, GraduationCap, HelpCircle, Loader2, AlertCircle, Zap, BarChart3, Calendar, Settings, Users, Copy, Check, Download, FileText, FileDown, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

const QUICK_PROMPTS_TEACHER = [
  { icon: <BookOpen size={16} />, text: "How do I create an assignment?" },
  { icon: <GraduationCap size={16} />, text: "Show my classes and student count" },
  { icon: <BarChart3 size={16} />, text: "How many submissions do I have?" },
  { icon: <Users size={16} />, text: "How do students join my class?" },
  { icon: <Zap size={16} />, text: "Tips for managing classes effectively" },
  { icon: <Calendar size={16} />, text: "What assignments are due this week?" },
];

const QUICK_PROMPTS_STUDENT = [
  { icon: <BookOpen size={16} />, text: "How do I join a class?" },
  { icon: <GraduationCap size={16} />, text: "Show my enrolled classes" },
  { icon: <HelpCircle size={16} />, text: "How do I submit an assignment?" },
  { icon: <Calendar size={16} />, text: "What are my upcoming deadlines?" },
  { icon: <Zap size={16} />, text: "Have I submitted all my assignments?" },
  { icon: <Settings size={16} />, text: "How do I switch to dark mode?" },
];

const Chatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  const [classes, setClasses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: `Welcome to Classroom Assistant! 🎓\n\nHi **${user?.name || 'there'}**! I'm your AI-powered guide for everything about this platform. I can answer **any question** about your classes, assignments, submissions, settings, and more.\n\nI have access to your live data, so feel free to ask specific questions like "How many students are in my class?" or "What assignments are due soon?"\n\nTry one of the quick prompts below to get started!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        setClasses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isTyping && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping]);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Copy message text to clipboard
  const handleCopy = useCallback(async (text, msgId) => {
    try {
      // Strip markdown-like formatting for clean copy
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1');
      await navigator.clipboard.writeText(cleanText);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Export conversation as PDF
  const exportAsPDF = useCallback(async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Title
      pdf.setFillColor(124, 58, 237);
      pdf.rect(0, 0, pageWidth, 28, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Classroom Assistant - Conversation', margin, 18);

      // Date
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Exported on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString()}`, margin, 25);

      yPos = 38;

      // Divider
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      for (const msg of messages) {
        const role = msg.role === 'bot' ? 'Assistant' : (user?.name || 'You');
        const cleanText = msg.text
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1');
        const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Check if we need a new page
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = margin;
        }

        // Role label
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        if (msg.role === 'bot') {
          pdf.setTextColor(124, 58, 237);
        } else {
          pdf.setTextColor(37, 99, 235);
        }
        pdf.text(`${role}  •  ${time}`, margin, yPos);
        yPos += 6;

        // Message text
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        const lines = pdf.splitTextToSize(cleanText, maxWidth);
        for (const line of lines) {
          if (yPos > pageHeight - 15) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(line, margin, yPos);
          yPos += 5;
        }

        yPos += 6;

        // Divider between messages
        pdf.setDrawColor(230, 230, 230);
        pdf.line(margin, yPos - 3, pageWidth - margin, yPos - 3);
        yPos += 3;
      }

      // Footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount}  •  Classroom Assistant`, pageWidth / 2, pageHeight - 8, { align: 'center' });
      }

      pdf.save('classroom-assistant-conversation.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [messages, user]);

  // Export conversation as Word (DOCX)
  const exportAsWord = useCallback(async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const children = [];

      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Classroom Assistant - Conversation',
              bold: true,
              size: 32,
              color: '7C3AED',
              font: 'Calibri',
            }),
          ],
          spacing: { after: 100 },
        })
      );

      // Date
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Exported on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString()}`,
              size: 18,
              color: '6B7280',
              font: 'Calibri',
            }),
          ],
          spacing: { after: 300 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
          },
        })
      );

      for (const msg of messages) {
        const role = msg.role === 'bot' ? 'Assistant' : (user?.name || 'You');
        const cleanText = msg.text
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/`(.*?)`/g, '$1');
        const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Role header
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: role,
                bold: true,
                size: 22,
                color: msg.role === 'bot' ? '7C3AED' : '2563EB',
                font: 'Calibri',
              }),
              new TextRun({
                text: `  •  ${time}`,
                size: 18,
                color: '9CA3AF',
                font: 'Calibri',
              }),
            ],
            spacing: { before: 200, after: 80 },
          })
        );

        // Message paragraphs
        const paragraphs = cleanText.split('\n');
        for (const para of paragraphs) {
          if (para.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: para,
                    size: 20,
                    color: '374151',
                    font: 'Calibri',
                  }),
                ],
                spacing: { after: 60 },
              })
            );
          }
        }

        // Separator
        children.push(
          new Paragraph({
            children: [],
            spacing: { after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
            },
          })
        );
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'classroom-assistant-conversation.docx');
    } catch (err) {
      console.error('Word export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [messages, user]);

  const quickPrompts = user?.role === 'Teacher' ? QUICK_PROMPTS_TEACHER : QUICK_PROMPTS_STUDENT;

  const handleSend = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Send conversation history for context continuity
      const conversationHistory = messages
        .filter(m => m.id !== 1) // skip the welcome message
        .map(m => ({ role: m.role, text: m.text }));

      const res = await api.post('/chatbot', {
        message: messageText,
        conversationHistory
      });

      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: res.data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMessage = err.response?.data?.msg || 'Something went wrong. Please try again.';
      setError(errorMessage);

      const botErrorMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: `⚠️ ${errorMessage}\n\nPlease try again or rephrase your question.`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, botErrorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Markdown-like rendering
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      // Bold
      let rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
      // Inline code
      rendered = rendered.replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
      // Italic
      rendered = rendered.replace(/\*(.*?)\*/g, '<em>$1</em>');

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: rendered.replace(/^[•\-]\s/, '') }} />;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: rendered.replace(/^\d+\.\s/, '') }} />;
      }
      return <p key={i} className={line === '' ? 'h-2' : ''} dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden pt-[72px]">
        <Sidebar isOpen={isSidebarOpen} />

        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-5 flex items-center space-x-4 flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 dark:text-white tracking-tight flex items-center">
                Classroom Assistant
                <Sparkles size={18} className="ml-2 text-amber-500" />
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">AI-powered — ask me anything about the platform</p>
            </div>
            <div className="ml-auto flex items-center space-x-3">
              <span className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold">
                <Zap size={12} />
                <span>AI Powered</span>
              </span>
              <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Online</span>
              </span>

              {/* Export Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={messages.length <= 1 || isExporting}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  <span>Export</span>
                  <ChevronDown size={10} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-1.5">
                        <button
                          onClick={exportAsPDF}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText size={16} className="text-red-500" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold">Export as PDF</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">Download .pdf file</p>
                          </div>
                        </button>
                        <button
                          onClick={exportAsWord}
                          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileDown size={16} className="text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold">Export as Word</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">Download .docx file</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-2xl ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md ${
                      msg.role === 'bot'
                        ? msg.isError
                          ? 'bg-gradient-to-br from-red-400 to-red-600'
                          : 'bg-gradient-to-br from-violet-500 to-purple-600'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {msg.role === 'bot'
                        ? msg.isError
                          ? <AlertCircle size={18} className="text-white" />
                          : <Bot size={18} className="text-white" />
                        : <User size={18} className="text-white" />
                      }
                    </div>

                    {/* Message Bubble */}
                    <div className="relative group/msg">
                      <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'bot'
                          ? msg.isError
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
                          : 'bg-blue-600 text-white'
                      }`}>
                        <div className="space-y-1">{renderText(msg.text)}</div>
                        <div className={`flex items-center justify-between mt-3`}>
                          <p className={`text-[10px] font-medium ${
                            msg.role === 'bot'
                              ? msg.isError ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'
                              : 'text-blue-200'
                          }`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>

                          {/* Copy Button */}
                          {msg.role === 'bot' && !msg.isError && (
                            <button
                              onClick={() => handleCopy(msg.text, msg.id)}
                              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                                copiedId === msg.id
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                  : 'opacity-0 group-hover/msg:opacity-100 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400'
                              }`}
                              title="Copy to clipboard"
                            >
                              {copiedId === msg.id ? (
                                <><Check size={10} /><span>Copied!</span></>
                              ) : (
                                <><Copy size={10} /><span>Copy</span></>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3"
              >
                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md bg-gradient-to-br from-violet-500 to-purple-600">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium ml-2">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Prompts (show only when few messages) */}
            {messages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 px-1">
                  Suggested Questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt.text)}
                      className="flex items-center space-x-3 px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 shadow-sm hover:shadow-md group text-left"
                    >
                      <span className="text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0">{prompt.icon}</span>
                      <span>{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="max-w-3xl mx-auto flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your classroom..."
                  disabled={isTyping}
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500 rounded-2xl outline-none font-medium text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-sm disabled:opacity-60"
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl shadow-lg shadow-purple-200 dark:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isTyping ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-2 font-medium">
              AI-powered Classroom Assistant • Answers any question about the platform
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chatbot;
