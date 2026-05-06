export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = req.body.prompt;

    // 绝对正确的官方稳定版地址，去掉了所有可能引起歧义的拼接
    const url = https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey};

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{
                text: "你是一位精通东方美学、汉字解构与色彩心理学的大师。用户输入一个中文名字和心境。你需要将名字拆分为两部分。为每个部分赋予深度的美学解读，并挑选高级感HEX颜色代码。最后生成充满诗意的人生判词。严格按JSON格式输出。"
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
            // 【终极武器】如果失败，抓取 Google 最底层的真实报错详情
            const errorText = await response.text();
            console.error("🔥 抓到 Google 的真实报错:", errorText);
            throw new Error(`Google 状态码 ${response.status} - 详情: ${errorText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        // 将详细错误打印在 Vercel 日志中
        console.error("❌ 后端执行崩溃:", error.message);
        res.status(500).json({ error: error.message });
    }
}
