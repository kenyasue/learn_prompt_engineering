import * as dotenv from "dotenv"
dotenv.config();

import { ChatGPTChatBot, ChatBot, Llama2ChatBot, conversation } from "../../lib/ts/chatbot.js";
import promtFactory from "prompt-sync";

const prompt = promtFactory();

type slot = {
    inquiry: string,
    answer: string
};

type slots = Array<slot>;

class LLMSlotfilling {
    chatbot: Llama2ChatBot;
    slots: slots;
    conversation: conversation;
    initialPrompt: string;
    nextSlot: slot;

    constructor(initialPrompt: string, slots: string[]) {

        this.chatbot = new Llama2ChatBot(initialPrompt, false);

        this.initialPrompt = initialPrompt;

        this.slots = slots.map(s => {
            return {
                inquiry: s,
                answer: ""
            }
        });

        this.conversation = [];
        this.nextSlot = this.slots[0];

    }

    initialMessage(message: string) {

        this.chatbot.setAssistantMessage(message);
    }

    async receiveUserInput(userInput: string): Promise<{
        LLMResponse: string,
        slots: slots
    }> {

        this.conversation.push({
            role: "user",
            content: userInput
        });

        /*
            1. Extract the values
            2. Construct next response based on the result
        */

        const valueExtractionConversation: conversation = [
            {
                role: "system",
                content: `
Extract following value from the user input.
${this.slots.reduce((text, o) => { text += "[" + o.inquiry + "],"; return text; }, "")}

Output in this format.
${this.slots.reduce((text, o) => { text += o.inquiry + ": [User input value]\n"; return text; }, "")}

If there is no provided information fill with "EMPTY".
No need to say anything else.
                `
            },
            {
                role: "user",
                content: userInput
            }
        ];

        const response1 = await this.chatbot.sendConveration(valueExtractionConversation);

        let findSomething: boolean = false;

        // parse the response
        this.slots.forEach(slot => {

            const regex: RegExp = new RegExp(`${slot.inquiry}:\R*(.+)`, "i");
            const regexResult = regex.exec(response1);
            if (regexResult?.length > 0) {
                findSomething = true;
                const answer = regexResult[1].trim();
                if (!/empty/i.test(answer))
                    slot.answer = regexResult[1].trim();
            }
        });

        if (findSomething) {
            this.nextSlot = this.slots.find(o => o.answer.length == 0);
        }

        if (this.slots.reduce((emptySlotNum, o) => { o.answer.length === 0 ? emptySlotNum++ : null; return emptySlotNum }, 0) !== 0) {

            const systemPrompt = `
            ${this.initialPrompt}
            You need to obtain the following information from the user:
            ${this.slots.reduce((text, o) => { if (o.answer.length == 0) text += "[" + o.inquiry + "]\n"; return text; }, "")}
            
            Currently, you have:
            ${this.slots.reduce((text, o) => { if (o.answer.length !== 0) text += o.inquiry + ": " + o.answer + "\n"; return text; }, "")}
            
            For this step, you should request information regarding ${this.nextSlot.inquiry}.
            
            Let's go.
        `;

            const newConversation: conversation = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];


            this.conversation.map(o => newConversation.push(o))

            const response = await this.chatbot.sendConveration(newConversation);

            this.conversation.push({
                role: "assistant",
                content: response
            });

            return {
                LLMResponse: response,
                slots: this.slots
            };
        } else {

            // generate thanks message

            const systemPrompt = `
            You asked the user for the following information:
            ${this.slots.reduce((text, o) => { if (o.answer.length == 0) text += "[" + o.inquiry + "]\n"; return text; }, "")}
            
            The user has responded to all required questions. Here are their answers:
            ${this.slots.reduce((text, o) => { if (o.answer.length !== 0) text += o.inquiry + ": " + o.answer + "\n"; return text; }, "")}
            
            You now have all the necessary information. Please express your gratitude and now you have all neccesary information.
        `;

            const newConversation: conversation = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];


            this.conversation.map(o => newConversation.push(o))

            const response = await this.chatbot.sendConveration(newConversation);

            this.conversation.push({
                role: "assistant",
                content: response
            });

            return {
                LLMResponse: response,
                slots: this.slots
            };

        }

    }

}

(async () => {

    try {

        const apparelShotBot = new LLMSlotfilling(`
You're the shop clerk chatbot. Your role is to help users find what they're looking for. 
Engage with users in a friendly manner and feel free to use emojis. Interact as though you're a 28-year-old woman
        `, [
            "size", "color", "brand"
        ]);

        const initialMessage = `
Hi, I'm the assistant chatbot for ABC Shoe Shop. How can I assist you?     
            `;

        apparelShotBot.initialMessage(initialMessage);

        console.log(initialMessage);

        let resultSlot: slots = [];

        while (1) {

            const userInput = prompt("> ");
            const chatbotResponse = await apparelShotBot.receiveUserInput(userInput)

            console.log(chatbotResponse.LLMResponse);

            if (chatbotResponse.slots.find(o => o.answer.length == 0)) {
                continue;
            } else {
                resultSlot = chatbotResponse.slots;
                break;
            }
        }

        console.log(`
Finished !
Customer input is.
${resultSlot.reduce((text, o) => text += o.inquiry + ":" + o.answer + "\n", "")}
`);

    } catch (e) {
        console.error(e.message)
    }

})()