import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Sparkles, User, Copy, Check, Download, FileText, FileDown, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

const AIAssistant = ({ isOpen, setIsOpen, isSidebar }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        { id: 1, role: 'bot', text: 'Hello! I am your AI Assistant. How can I help you today?', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const scrollRef = useRef(null);
    const exportMenuRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen]);

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

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = { id: Date.now(), role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await api.post('/chatbot', {
                message: input,
                conversationHistory: messages
            });
            
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: response.data.reply, timestamp: new Date() }]);
        } catch (err) {
            console.error('AI Assistant Error:', err);
            setMessages(prev => [...prev, { 
                id: Date.now() + 1,
                role: 'bot', 
                text: 'System overload. Please retry.',
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Copy message text to clipboard
    const handleCopy = useCallback(async (text, msgId) => {
        try {
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

    // Export as PDF
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

            // Title bar
            pdf.setFillColor(79, 70, 229);
            pdf.rect(0, 0, pageWidth, 28, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            pdf.setTextColor(255, 255, 255);
            pdf.text('AI Assistant - Conversation', margin, 18);

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Exported on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString()}`, margin, 25);

            yPos = 38;
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 8;

            for (const msg of messages) {
                const role = msg.role === 'bot' ? 'AI Assistant' : (user?.name || 'You');
                const cleanText = msg.text
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/\*(.*?)\*/g, '$1')
                    .replace(/`(.*?)`/g, '$1');
                const time = msg.timestamp ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                if (yPos > pageHeight - 40) {
                    pdf.addPage();
                    yPos = margin;
                }

                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(10);
                pdf.setTextColor(msg.role === 'bot' ? 79 : 37, msg.role === 'bot' ? 70 : 99, msg.role === 'bot' ? 229 : 235);
                pdf.text(`${role}  •  ${time}`, margin, yPos);
                yPos += 6;

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
                pdf.setDrawColor(230, 230, 230);
                pdf.line(margin, yPos - 3, pageWidth - margin, yPos - 3);
                yPos += 3;
            }

            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text(`Page ${i} of ${pageCount}  •  AI Assistant`, pageWidth / 2, pageHeight - 8, { align: 'center' });
            }

            pdf.save('ai-assistant-conversation.pdf');
        } catch (err) {
            console.error('PDF export failed:', err);
        } finally {
            setIsExporting(false);
        }
    }, [messages, user]);

    // Export as Word
    const exportAsWord = useCallback(async () => {
        setIsExporting(true);
        setShowExportMenu(false);
        try {
            const children = [];

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'AI Assistant - Conversation',
                            bold: true,
                            size: 32,
                            color: '4F46E5',
                            font: 'Calibri',
                        }),
                    ],
                    spacing: { after: 100 },
                })
            );

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
                const role = msg.role === 'bot' ? 'AI Assistant' : (user?.name || 'You');
                const cleanText = msg.text
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/\*(.*?)\*/g, '$1')
                    .replace(/`(.*?)`/g, '$1');
                const time = msg.timestamp ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: role,
                                bold: true,
                                size: 22,
                                color: msg.role === 'bot' ? '4F46E5' : '2563EB',
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
                sections: [{ properties: {}, children }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, 'ai-assistant-conversation.docx');
        } catch (err) {
            console.error('Word export failed:', err);
        } finally {
            setIsExporting(false);
        }
    }, [messages, user]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed right-0 top-16 bottom-0 w-80 md:w-96 z-[60] bg-white dark:bg-slate-900 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-5 bg-indigo-600 text-white flex justify-between items-center shrink-0">
                         <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                               <Sparkles size={20} />
                            </div>
                            <div>
                               <h3 className="text-[14px] font-black uppercase tracking-[0.2em] leading-none">AI ASSISTANT</h3>
                               <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-1.5">Hyper-Core Support</p>
                            </div>
                         </div>
                         <div className="flex items-center space-x-2">
                            {/* Export Button */}
                            <div className="relative" ref={exportMenuRef}>
                               <button
                                  onClick={() => setShowExportMenu(!showExportMenu)}
                                  disabled={messages.length <= 1 || isExporting}
                                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-[9px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Export conversation"
                               >
                                  {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                  <span>Export</span>
                                  <ChevronDown size={9} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                               </button>

                               <AnimatePresence>
                                  {showExportMenu && (
                                     <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden"
                                     >
                                        <div className="p-1.5">
                                           <button
                                              onClick={exportAsPDF}
                                              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                                           >
                                              <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                 <FileText size={14} className="text-red-500" />
                                              </div>
                                              <div className="text-left">
                                                 <p className="text-xs font-semibold">Export as PDF</p>
                                                 <p className="text-[9px] text-slate-400">Download .pdf file</p>
                                              </div>
                                           </button>
                                           <button
                                              onClick={exportAsWord}
                                              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                                           >
                                              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                 <FileDown size={14} className="text-blue-500" />
                                              </div>
                                              <div className="text-left">
                                                 <p className="text-xs font-semibold">Export as Word</p>
                                                 <p className="text-[9px] text-slate-400">Download .docx file</p>
                                              </div>
                                           </button>
                                        </div>
                                     </motion.div>
                                  )}
                               </AnimatePresence>
                            </div>

                            <button 
                              onClick={() => setIsOpen(false)} 
                              className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                               <X size={18} />
                            </button>
                         </div>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-slate-950/50 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg.id || i} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className="max-w-[95%] group/msg relative">
                                    <div className={`p-4 rounded-2xl text-[11px] font-black leading-relaxed shadow-xl border ${
                                        msg.role === 'user' 
                                        ? 'bg-slate-900 text-white border-slate-800' 
                                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/50 ring-1 ring-indigo-500/10'
                                    }`}>
                                         <span>{msg.text}</span>

                                         {/* Copy Button + Timestamp Row for bot messages */}
                                         {msg.role === 'bot' && (
                                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-indigo-200/30 dark:border-indigo-800/30">
                                               <span className="text-[8px] font-bold text-indigo-400/60 dark:text-indigo-500/60 uppercase tracking-widest">
                                                  {msg.timestamp ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                               </span>
                                               <button
                                                  onClick={() => handleCopy(msg.text, msg.id)}
                                                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[9px] font-bold transition-all duration-200 ${
                                                     copiedId === msg.id
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                                        : 'opacity-0 group-hover/msg:opacity-100 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/40'
                                                  }`}
                                                  title="Copy to clipboard"
                                               >
                                                  {copiedId === msg.id ? (
                                                     <><Check size={9} /><span>Copied!</span></>
                                                  ) : (
                                                     <><Copy size={9} /><span>Copy</span></>
                                                  )}
                                               </button>
                                            </div>
                                         )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                               <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex space-x-1 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-0"></div>
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
                               </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                       <div className="relative">
                          <input 
                              type="text" 
                              placeholder="Describe your query..."
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              className="w-full pl-6 pr-14 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] placeholder:text-slate-300 bg-slate-50 dark:bg-slate-950 border-none focus:ring-2 focus:ring-indigo-600 transition-all outline-none text-slate-900 dark:text-white shadow-inner"
                          />
                          <button 
                              type="submit" 
                              disabled={!input.trim() || isTyping}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-slate-950 transition-all disabled:opacity-30 shadow-lg"
                          >
                             <Send size={16} />
                          </button>
                       </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIAssistant;
