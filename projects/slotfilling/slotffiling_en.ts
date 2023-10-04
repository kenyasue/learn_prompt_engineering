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
            You have to get following information from user:
            ${this.slots.reduce((text, o) => { if (o.answer.length == 0) text += "[" + o.inquiry + "]\n"; return text; }, "")}

            At this memoment you already have:
            ${this.slots.reduce((text, o) => { if (o.answer.length !== 0) text += o.inquiry + ":" + o.answer + "\n"; return text; }, "")}
            
            In this turn you have to ask the information for ${this.nextSlot.inquiry}.

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
            ${this.initialPrompt}
            You asked user to get following information:
            ${this.slots.reduce((text, o) => { if (o.answer.length == 0) text += "[" + o.inquiry + "]\n"; return text; }, "")}

            User answerd for all required question and the answers are following.
            ${this.slots.reduce((text, o) => { if (o.answer.length !== 0) text += o.inquiry + ":" + o.answer + "\n"; return text; }, "")}
            
            You have all information now, please appreciate to the user and ask for further question if he or she has.

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

        }

    }

}

(async () => {

    try {

        const apparelShotBot = new LLMSlotfilling(`
        You are shop clark chat bot.You need to assist users to reach what they wants.
        `, [
            "size", "color", "brand"
        ]);

        const initialMessage = `
        Hi.I'm assistant chatbot of ABC shoes shop. How can I help you ?        
            `;

        apparelShotBot.initialMessage(initialMessage);

        console.log(initialMessage);

        let resultSlot: slots = [];

        while (1) {

            const userInput = prompt("> ");
            const chatbotResponse = await apparelShotBot.receiveUserInput(userInput)

            if (chatbotResponse.slots.find(o => o.answer.length == 0)) {
                console.log(chatbotResponse.LLMResponse);
                continue;
            } else {
                console.log(chatbotResponse.LLMResponse);
                resultSlot = chatbotResponse.slots;
                break;
            }
        }

        console.log(`
Finished !
Your input is.
${resultSlot.map(o => o.inquiry + ":" + o.answer + "\n")}
`);

    } catch (e) {
        console.error(e.message)
    }

})()