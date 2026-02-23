import { ChatbotCategory } from './chatbot.model';

export const seedChatbotCategories = async () => {
    const categories = [
        {
            title: 'Labor Procedure',
            icon: 'labor_icon_path',
            subQuestions: [
                'Unfair dismissal',
                'Settlement',
                'Workplace harassment',
                'Voluntary resignation'
            ],
        },
        {
            title: 'Family Problem',
            icon: 'family_icon_path',
            subQuestions: [
                'Divorce',
                'Child custody',
                'Alimony',
                'Domestic violence'
            ],
        },
        {
            title: 'Criminal Matter',
            icon: 'criminal_icon_path',
            subQuestions: [
                'Theft',
                'Assault',
                'Fraud',
                'Drug offenses'
            ],
        },
        {
            title: 'Properties',
            icon: 'property_icon_path',
            subQuestions: [
                'Eviction',
                'Property disputes',
                'Real estate contracts',
                'Mortgage issues'
            ],
        }
    ];

    for (const category of categories) {
        const isExist = await ChatbotCategory.findOne({ title: category.title });
        if (!isExist) {
            await ChatbotCategory.create(category);
            console.log(`Seeded Chatbot Category: ${category.title}`);
        }
    }
};
