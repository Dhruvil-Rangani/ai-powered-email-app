const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Function calling schema for email search
const searchFunction = {
    name: 'search_emails',
    description: 'Search emails based on natural language query',
    parameters: {
        type: 'object',
        properties: {
            from: {
                type: 'string',
                description: 'Search in sender email/name'
            },
            subject: {
                type: 'string',
                description: 'Search in email subject'
            },
            body: {
                type: 'string',
                description: 'Search in email body'
            },
            after: {
                type: 'string',
                description: 'Search emails after this date (ISO format)'
            },
            before: {
                type: 'string',
                description: 'Search emails before this date (ISO format)'
            },
            tag: {
                type: 'string',
                description: 'Filter by tag'
            }
        }
    }
};

exports.aiSearch = async (req, res) => {
    try {
        const { q } = req.body;
        if (!q) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are an email search assistant. Parse the user's natural language query into structured search parameters. Only include parameters that are explicitly mentioned in the query."
                },
                {
                    role: "user",
                    content: q
                }
            ],
            functions: [searchFunction],
            function_call: { name: 'search_emails' }
        });

        const response = completion.choices[0].message;
        if (!response.function_call) {
            return res.status(400).json({ error: 'Could not parse search query' });
        }

        const filters = JSON.parse(response.function_call.arguments);
        
        // Clean up empty filters
        Object.keys(filters).forEach(key => {
            if (!filters[key]) {
                delete filters[key];
            }
        });

        res.json({
            filters,
            suggestedAnswer: response.content || null
        });
    } catch (error) {
        console.error('AI search error:', error);
        res.status(500).json({ error: 'Failed to process search query' });
    }
}; 