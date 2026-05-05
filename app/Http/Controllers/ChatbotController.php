<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Throwable;

class ChatbotController extends Controller
{
    public function respond(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $apiKey = config('services.groq.api_key');
        $model = config('services.groq.model', 'llama-3.1-8b-instant');

        if (! is_string($apiKey) || trim($apiKey) === '') {
            return response()->json([
                'message' => 'لم يتم ضبط مفتاح Groq بعد. أضف GROQ_API_KEY في ملف البيئة.',
            ], 500);
        }

        $systemPrompt = <<<'PROMPT'
أنت مساعد شبابي لمنصة "همة" في الأردن.
- الفئة المستهدفة: الشباب من 18 إلى 30 سنة.
- الهدف: تشجيع المستخدمين على الانضمام إلى المبادرات التطوعية الاجتماعية في الأردن.
- الأسلوب: قصير، مشجع، عملي، وودود.
- قدّم اقتراحات قابلة للتنفيذ (مثل اختيار مبادرة مناسبة حسب المدينة/الوقت/الاهتمامات).
- إذا كانت الرسالة عامة، وجّه المستخدم لخطوة واضحة تالية للانضمام.
- تجنب الإفتاء القانوني/الطبي/النفسي المتخصص.
PROMPT;

        try {
            $response = Http::timeout(20)
                ->withToken($apiKey)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => $model,
                    'temperature' => 0.7,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $validated['message']],
                    ],
                ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'تعذر الاتصال بخدمة المساعد الآن، حاول مرة أخرى بعد قليل.',
            ], 502);
        }

        if ($response->failed()) {
            return response()->json([
                'message' => 'تعذر الحصول على رد من المساعد حاليًا.',
            ], 502);
        }

        $reply = (string) data_get(
            $response->json(),
            'choices.0.message.content',
            '',
        );

        if (trim($reply) === '') {
            return response()->json([
                'message' => 'المساعد لم يرجع ردًا صالحًا. حاول بصياغة مختلفة.',
            ], 502);
        }

        return response()->json([
            'reply' => $reply,
        ]);
    }
}
