import { respond } from '@/actions/App/Http/Controllers/ChatbotController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

const WELCOME_MESSAGE =
    'أهلًا! أنا مساعد "همة" للأردن. بقدر أساعدك تختار مبادرة مناسبة وتبدأ بخطوة واضحة.';

export function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: WELCOME_MESSAGE },
    ]);

    const canSend = useMemo(
        () => message.trim().length > 0 && !isLoading,
        [message, isLoading],
    );

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const userText = message.trim();
        if (userText.length === 0 || isLoading) {
            return;
        }

        setMessage('');
        setIsLoading(true);
        setMessages((prev) => [...prev, { role: 'user', content: userText }]);

        try {
            const response = await fetch(respond().url, {
                method: respond().method.toUpperCase(),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ message: userText }),
            });

            const data = (await response.json()) as
                | { reply?: string; message?: string }
                | undefined;

            if (!response.ok) {
                throw new Error(data?.message ?? 'تعذر معالجة الرسالة.');
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data?.reply ?? 'تم استلام رسالتك، جرب مرة ثانية.',
                },
            ]);
        } catch (error) {
            const fallback =
                error instanceof Error
                    ? error.message
                    : 'حدث خطأ غير متوقع. حاول لاحقًا.';

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: fallback,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed bottom-4 left-4 z-50">
            {open ? (
                <div className="flex h-112 w-84 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                    <div className="flex items-center justify-between border-b border-border bg-primary/10 px-4 py-3">
                        <div>
                            <p className="text-sm font-bold text-foreground">
                                مساعد همة
                            </p>
                            <p className="text-xs text-muted-foreground">
                                الأردن · 18-30 · مبادرات اجتماعية
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            aria-label="إغلاق المحادثة"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-background p-3">
                        {messages.map((item, index) => (
                            <div
                                key={`${item.role}-${index}`}
                                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                                    item.role === 'user'
                                        ? 'mr-auto bg-primary text-primary-foreground'
                                        : 'bg-muted text-foreground'
                                }`}
                            >
                                {item.content}
                            </div>
                        ))}
                        {isLoading ? (
                            <div className="max-w-[85%] rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                                جاري التفكير...
                            </div>
                        ) : null}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-2 border-t border-border p-3"
                    >
                        <Input
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="اكتب سؤالك عن المبادرات..."
                            maxLength={1000}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!canSend}
                            aria-label="إرسال"
                        >
                            <Send className="size-4" />
                        </Button>
                    </form>
                </div>
            ) : (
                <Button
                    type="button"
                    size="icon"
                    className="size-12 rounded-full shadow-lg"
                    onClick={() => setOpen(true)}
                    aria-label="فتح مساعد همة"
                >
                    <MessageCircle className="size-5" />
                </Button>
            )}
        </div>
    );
}
