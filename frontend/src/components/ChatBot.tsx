import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Minimize2, User, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Helper to get token
const getToken = () => localStorage.getItem("token");

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
        { role: "ai", content: "Hello! I am your AI assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
            const res = await axios.post(
                `${backendUrl}/chat`,
                { message: userMsg },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            setMessages((prev) => [...prev, { role: "ai", content: res.data.response }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[350px] sm:w-[400px] shadow-2xl rounded-2xl overflow-hidden border border-border/50 bg-background/95 backdrop-blur-sm"
                    >
                        <Card className="border-0 shadow-none h-[500px] flex flex-col">
                            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex flex-row items-center justify-between space-y-0 rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <div className="bg-white/20 p-1.5 rounded-full">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-base font-semibold">AI Assistant</CardTitle>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Minimize2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30">
                                <ScrollArea className="h-full p-4">
                                    <div className="flex flex-col gap-4" ref={scrollRef}>
                                        {messages.map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-indigo-100 text-indigo-600" : "bg-purple-100 text-purple-600"
                                                    }`}>
                                                    {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                                                </div>
                                                <div
                                                    className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm shadow-sm ${msg.role === "user"
                                                            ? "bg-indigo-600 text-white rounded-br-none"
                                                            : "bg-white border border-border text-foreground rounded-bl-none"
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                                    <Bot size={14} />
                                                </div>
                                                <div className="bg-white border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                                                </div>
                                            </div>
                                        )}
                                        {/* Dummy element to scroll to */}
                                        <div ref={scrollRef} />
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            <CardFooter className="p-3 bg-background border-t">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                    className="flex w-full gap-2"
                                >
                                    <Input
                                        placeholder="Ask anything..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="flex-1 bg-muted/30 focus-visible:ring-indigo-500 rounded-full px-4"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !input.trim()}
                                        className="rounded-full bg-indigo-600 hover:bg-indigo-700 w-10 h-10 shrink-0"
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
                >
                    <MessageSquare className="h-6 w-6" />
                </motion.button>
            )}
        </div>
    );
}
