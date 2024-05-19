import OpenAI from 'openai';
import fs from 'fs/promises';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

export async function runConversation() {
    // Read the schema from the file
    let schema = {};
    try {
        const schemaData = await fs.readFile('table.schema.json', 'utf8');
        schema = JSON.parse(schemaData);
    } catch (error) {
        console.error('Error reading schema file:', error);
        return;
    }

    // Define the conversation and tools
    const messages = [
        { role: 'user', content: "Select email of users that starts with 'larry'" }
    ];
    const tools = [
        {
            type: 'function',
            function: {
                name: 'select_query',
                description: 'Generate or Select a GraphQL-like query',
                parameters: schema,
            }
        }
    ];

    // Send the request to OpenAI API
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            tools: tools,
            tool_choice: { type: 'function', function: { name: 'select_query' } },
        });
        return response.choices[0].message.tool_calls[0].function.arguments;
    } catch (error) {
        console.error('Error in API request:', error);
    }
}
