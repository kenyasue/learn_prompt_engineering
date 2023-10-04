import OpenAI from 'openai';
import axios from 'axios';

export type conversation = Array<{
    role: "function" | "system" | "user" | "assistant";
    content: string
}>;

export class ChatBot {

    conversationHistory: conversation;
    baseURL: string = "";
    useHistory: boolean;

    constructor(systemMessage: string, useHistory: boolean) {
        this.conversationHistory = [{
            role: "system",
            content: systemMessage
        }];

        this.useHistory = useHistory;
    }

    async speak(message: string): Promise<string> {

        this.setUserMessage(message);

        const prompt: conversation = this.useHistory ? this.conversationHistory : [
            {
                role: "user",
                content: message
            }
        ];

        const response = await this.sendConveration(prompt);

        this.setAssistantMessage(response);

        return response;
    }

    async prompt(message: string): Promise<string> {
        return await this.sendPrompt(message);
    }


    setAssistantMessage(message: string): void {

        this.conversationHistory.push({
            role: "assistant",
            content: message
        })

        return;
    }

    setUserMessage(message: string): void {

        this.conversationHistory.push({
            role: "user",
            content: message
        })

        return;
    }

    async sendPrompt(promp: string): Promise<string> {
        return "";
    }

    async sendConveration(conversation: conversation): Promise<string> {
        return "";
    }

}

export class Llama2ChatBot extends ChatBot {
    baseURL: string = "http://localhost:8000/v1";

    constructor(systemMessage: string, useHistory: boolean) {

        super(systemMessage, useHistory);

    }

    async sendConveration(conversation: conversation): Promise<string> {

        const response = await axios.post(`${this.baseURL}/chat/completions`,
            {
                "messages": conversation
            }
        );


        return response.data.choices[0].message.content;

    }

    async sendPrompt(prompt: string): Promise<string> {

        const response = await axios.post(`${this.baseURL}/completions`,
            {
                "prompt": prompt
            }
        );

        return response.data.choices[0].text;

    }

}

export class ChatGPTChatBot extends ChatBot {

    openai: OpenAI;

    constructor(systemMessage: string, useHistory: boolean) {

        super(systemMessage, useHistory);

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

    }

    async sendConveration(conversation: conversation): Promise<string> {

        const chatCompletion = await this.openai.chat.completions.create({
            messages: conversation,
            model: 'gpt-3.5-turbo',
        });

        return chatCompletion.choices[0].message.content;

    }

    async sendPrompt(prompt: string): Promise<string> {
        const promptCompletion = await this.openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: prompt
        });

        return promptCompletion.choices[0].text;
    }
}