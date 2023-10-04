### Slot Filling chatbot demo

Welcome to a basic demo of a slot-filling chatbot. 
This demo showcases a chatbot tailored for a webshop specializing in shoes. 
The chatbot will continue the conversation until the user provides details on the brand, size, and color.

Below are some example conversations:

```
Hi, I'm the assistant chatbot for ABC Shoe Shop. How can I assist you?     
            
> Hi
Hello! Welcome to our shop. How can I assist you today? 😊

> I'm looking for Nike shoes.
Great! We have a wide range of Nike shoes available. Is there a specific style or type of Nike shoes you're interested in?

> I like red.
That's a great choice! Red Nike shoes can be quite stylish. Just to confirm, are you looking for any specific size in red Nike shoes?

> My foot size is 28.5cm
Thank you for providing your foot size. That helps us find the perfect fit for you. Now, I have all the necessary information to assist you in finding the right pair of red Nike shoes in size 28.5cm. Let me check our inventory for available options. 

Finished !
Customer input is.
size:28.5cm
color:red
brand:Nike
```

Because the demo uses the LLM model, the chatbot can answer questions that are not expected for its role.
```
Hi, I'm the assistant chatbot for ABC Shoe Shop. How can I assist you?     
            
> Hi, how are you ?
Hi there! I'm doing great, thanks for asking! How can I assist you today? 😊
> 1+1=?
1+1 is equal to 2.
> thanks :)
You're welcome! If you have any other questions or if there's anything else I can help you with, just let me know! 😊
> I'm looking for a Nike shoes. My foot size is 28.5cm.
Great! Nike offers a wide range of shoes that should fit your foot size of 28.5cm. Is there a specific style or model that you're interested in or do you have any preferences in terms of design or functionality? Let me know so I can assist you better! 🏃‍♀️👟
> I like red one.
That's great! Red is a bold and eye-catching color for shoes. I'll help you find a Nike shoe in red that suits your style and foot size. Just give me a moment to search through their collection.

Finished !
Customer input is.
size:28.5cm
color:red
brand:Nike

```

We confirmed it works with the Llama2 13B Chat model. The hardware I used is the RTX 4090.
Here's an example. Each inference took about 30 seconds

```

Hi, I'm the assistant chatbot for ABC Shoe Shop. How can I assist you?     
            
> Hi, I'm looking for Nike shoes.
 Hey there! 😊 OMG, you're looking for Nike shoes?! 😍 Like, totally my fave brand too! 💖 So, what size are you looking for? 🤔 Do you need a small, medium, or large? 🤷‍♀️ Let me know, and I'll help you find the perfect pair! 👟💪
> My foot size is 28.5cm.
OMG, 28.5cm?! 😱 That's like, so big! 🤯 But in a good way, obvi! 💁‍♀️ So, you're looking for Nike shoes in size 28.5cm, huh? 🤔 Well, let me check... 👀 Hmmm, it looks like we have a few options in that size. 🤔 Do you have a specific color in mind? 💖 Maybe black, white, or gray? 😏 Or are you open to something more bold and colorful? 💥 Like, a bright red or a funky print? 🎨 Let me know, and I'll help you find the perfect pair! 👟💕
> I lile gray one.

OMG, gray is such a great choice! 💕 There are so many gorgeous gray Nike shoes to choose from... 🤩 But, like, which ones do you like the most? 🤔 Do you want a sleek and modern design, or something more sporty and edgy? 🤔 Maybe you're looking for something with a little bit of bling? 💎 Like, a pair with some serious shine and sparkle? 💃 Or maybe you just want something simple and understated? 😊 Let me know, and I'll help you find the perfect gray Nike shoes! 👟💕

Finished !
Customer input is.
size:28.5cm
color:GRAY
brand:Nike

```

Llama2 seems overly friendly, but I believe there's room to adjust the tone using prompts.