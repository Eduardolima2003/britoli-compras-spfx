import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

interface IChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

interface IChatAppProps {

}

const ChatApp: React.FC<IChatAppProps> = () => {
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [input, setInput] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent): void => {
        e.preventDefault();
        if (input.trim() === '') return;

        const newMessage: IChatMessage = {
            id: Date.now(),
            text: input,
            sender: 'user',
        };

        setMessages((prev) => [...prev, newMessage]);
        setInput('');


        void setTimeout(() => {
            const botResponse: IChatMessage = {
                id: Date.now() + 1,
                text: `Resposta simulada para: "${input}"`,
                sender: 'bot',
            };
            setMessages((prev) => [...prev, botResponse]);
        }, 1000);
    };

    const handleError = (error: unknown): void => {
        console.error('Erro no componente:', error);
        setMessages((prev) => [...prev, {
            id: Date.now(),
            text: 'Desculpe, ocorreu um erro de processamento.',
            sender: 'bot'
        }]);
    };

    return (
        <div style={{ height: '400px', display: 'flex', flexDirection: 'column', border: '1px solid #ccc' }}>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                        margin: '5px 0'
                    }}>
                        <span style={{
                            padding: '8px 12px',
                            borderRadius: '15px',
                            backgroundColor: msg.sender === 'user' ? '#D6EAF8' : '#EAFAF1',
                            display: 'inline-block'
                        }}>
                            {msg.text}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ccc' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    style={{ flexGrow: 1, padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}
                />
                <button type="submit" style={{ padding: '8px 15px', marginLeft: '10px' }}>Enviar</button>
            </form>
        </div>
    );
};

export default ChatApp;