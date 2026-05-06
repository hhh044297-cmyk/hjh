// api/oracle.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 这里的 process.env 会自动去 Vercel 后台读取您填写的密钥，绝对安全
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = req.body.prompt;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{
                text: "你是一位精通东方美学、汉字解构与色彩心理学的大师。用户输入一个中文名字和心境。你需要将名字拆分为两部分（比如单字名拆成姓和名，双字名拆成姓氏和名字）。为每个部分赋予深度的美学解读，并挑选一个代表该气质的高级感十六进制颜色代码(HEX，须为暗底易读的明度，如 #5C7A99)。最后生成充满诗意的人生判词。严格按JSON格式输出。"
            }]
        },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    subtitle: { type: "STRING" },
                    part1: {
                        type: "OBJECT",
                        properties: {
                            text: { type: "STRING" },
                            concept: { type: "STRING" },
                            colorHex: { type: "STRING" },
                            desc: { type: "STRING" }
                        }
                    },
                    part2: {
                        type: "OBJECT",
                        properties: {
                            text: { type: "STRING" },
                            concept: { type: "STRING" },
                            colorHex: { type: "STRING" },
                            desc: { type: "STRING" }
                        }
                    },
                    synthesisTitle: { type: "STRING" },
                    synthesisDesc: { type: "STRING" },
                    blessing: { type: "STRING" }
                },
                required: ["subtitle", "part1", "part2", "synthesisTitle", "synthesisDesc", "blessing"]
            }
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Google API responded with status ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to connect to the stars.' });
    }
}
