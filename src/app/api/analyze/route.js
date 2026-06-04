import { NextResponse } from 'next/server';
import { getUserId, withUserCookie } from '@/app/lib/userId';

// ============================================================
// /api/analyze — 通用 Gemini 視覺/文字分析（CHASSIS）
// 帶有「模型 fallback」：依序嘗試多個 model 與 apiVersion，提高成功率。
// 呼叫端傳入自己的 prompt（領域提示詞放在各模組，不寫死在這裡）。
//
// POST body: { prompt: string(必填), image?: dataURL, json?: boolean(預設 true) }
// 回傳：json=true → { success, result: <解析後物件> }；否則 { success, text }
// ============================================================

const MODELS = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
];

async function callGemini(apiKey, prompt, base64Data, mimeType) {
    let lastError = null;
    for (const model of MODELS) {
        for (const apiVersion of ['v1beta', 'v1']) {
            try {
                const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;
                const parts = [{ text: prompt }];
                if (base64Data) parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts }],
                        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) return text.trim();
                } else {
                    const errData = await res.json().catch(() => ({}));
                    lastError = `${model}/${apiVersion}: ${res.status} - ${errData.error?.message || 'Unknown'}`;
                    continue;
                }
            } catch (e) {
                lastError = `${model}/${apiVersion}: ${e.message}`;
                continue;
            }
        }
    }
    throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}

export async function POST(request) {
    try {
        const { prompt, image, json = true } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
        }

        let base64Data = null;
        let mimeType = 'image/jpeg';
        if (image) {
            const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
            mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        }

        const userId = await getUserId();
        const text = await callGemini(apiKey, prompt, base64Data, mimeType);

        if (!json) {
            return withUserCookie(NextResponse.json({ success: true, text }), userId);
        }

        let parsed;
        try {
            const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(jsonStr);
        } catch {
            return NextResponse.json({ error: 'Could not parse AI response', raw: text }, { status: 422 });
        }
        return withUserCookie(NextResponse.json({ success: true, result: parsed }), userId);
    } catch (error) {
        console.error('AI analysis error:', error);
        return NextResponse.json({ error: error.message || 'Failed to analyze' }, { status: 500 });
    }
}
