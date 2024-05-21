import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

export async function runConversation(schema: any, query: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: query }
            ],
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'select_query',
                        description: 'Generate or Select a GraphQL-like query',
                        parameters: schema,
                    }
                }
            ],
            tool_choice: { type: 'function', function: { name: 'select_query' } },
        });
        return response.choices[0].message.tool_calls?.[0].function.arguments;
    } catch (error) {
        console.error('Error in API request:', error);
    }
}
