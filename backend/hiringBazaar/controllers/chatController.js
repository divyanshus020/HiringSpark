import { chatWithDoc } from '../../shared/services/aiService.js';

export const chatWithAI = async (req, res) => {
    try {
        const { message, context } = req.body;
        const role = req.user?.role || 'visitor'; // 'admin' or 'hr' - assuming auth middleware adds user

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const response = await chatWithDoc(message, context, role);
        res.status(200).json({ response });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
