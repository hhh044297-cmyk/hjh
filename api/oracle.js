// api/oracle.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = req.body.prompt;

    // 1. 更换为额度最充裕的 Lite 模型
   const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{
                // 2. 由于 Lite 模型不支持 Schema，我们把 JSON 格式要求直接写进系统指令里
                text: `你是一位精通东方美学、汉字解构与色彩心理学的大师。用户输入一个中文名字和心境。你需要将名字拆分为两部分。
请严格按照以下 JSON 格式输出结果（不要输出任何额外的说明文字，也不要包含 \`\`\`json 这样的 Markdown 符号，只输出纯 JSON）：
{
  "subtitle": "四字或六字美学定调，如'渊水流深'",
  "part1": {
    "text": "名字第一部分",
    "concept": "两字意象",
    "colorHex": "高级感十六进制颜色，如 #5C7A99",
    "desc": "该部分的深度美学解析，约30字"
  },
  "part2": {
    "text": "名字第二部分",
    "concept": "两字意象",
    "colorHex": "另一颜色，如 #E6B8A2",
    "desc": "该部分的深度美学解析，约30字"
  },
  "synthesisTitle": "如'吴以立基，斐以修神'",
  "synthesisDesc": "两股力量交融的哲学总结",
  "blessing": "三句或四句古风诗意寄语，用<br>分隔"
}`
            }]
        },
        generationConfig: {
            // 仅保留基础的 JSON 声明，删除了 Lite 不支持的 responseSchema
            responseMimeType: "application/json"
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
