// Fist start llama2 wrapper server

// use llama2
// # python -m llama2_wrapper.server --backend_type transformers --model_path "meta-llama/Llama-2-13b-chat-hf" --load_in_8bit True

// use xwin
// # python -m llama2_wrapper.server --backend_type transformers --model_path "Xwin-LM/Xwin-LM-13B-V0.1" --load_in_8bit True

// use elyza
// # python -m llama2_wrapper.server --backend_type transformers --model_path "elyza/ELYZA-japanese-Llama-2-7b" --load_in_8bit True


import * as dotenv from "dotenv"
dotenv.config();

import axios from 'axios';

const baseUrl = "http://localhost:8000/v1";

(async () => {

    try {
        const response = await axios.post(`${baseUrl}/completions`, {
            "prompt": `
[INST] 
<<SYS>>
Classify the text into neutral, negative or positive. 
<</SYS>>
[/INST] 
Text: I think the vacation is okay.
Answer:
`
        });


        console.log(`Result 1. ${response.data.choices[0].text}`);

        const responseChat = await axios.post(`${baseUrl}/chat/completions`,
            {
                "messages": [
                    {
                        role: "system",
                        content: "You are text classification bot. Do sentimental analysis of user input."
                    },
                    {
                        role: "user",
                        content: "I think the vacation is okay."
                    }
                ]
            }
        );


        console.log(`Result 1 chat. ${responseChat.data.choices[0].message.content}`);



        /*
                const response2 = await axios.post(`${ baseUrl } /completions`, {
        "prompt": `
        The odd numbers in this group add up to an even number: 4, 8, 9, 15, 12, 2, 1.
        A: Adding all the odd numbers (9, 15, 1) gives 25. The answer is False.
        The odd numbers in this group add up to an even number: 17,  10, 19, 4, 8, 12, 24.
        A: Adding all the odd numbers (17, 19) gives 36. The answer is True.
        The odd numbers in this group add up to an even number: 16,  11, 14, 4, 8, 13, 24.
        A: Adding all the odd numbers (11, 13) gives 24. The answer is True.
        The odd numbers in this group add up to an even number: 17,  9, 10, 12, 13, 4, 2.
        A: Adding all the odd numbers (17, 9, 13) gives 39. The answer is False.
        The odd numbers in this group add up to an even number: 15, 32, 5, 13, 82, 7, 1. 
        A:
        `
        });
        
        console.log(`Result 2. ${response2.data.choices[0].text}`);
        
        
        const response3 = await axios.post(`${baseUrl}/completions`, {
        "prompt": `
        ### Instruction ###
        Translate the text below to Spanish:
        Text: "hello!"
                        
        ### Answer ###
        `
        });
        
        
        console.log(`Result 3. ${response3.data.choices[0].text}`);
        */

    } catch (e) {
        console.error(e);
    }

})()