import { useState, useEffect } from "react";
import { getOpenAI } from "./api/OpenAIAPI";
import axios from "axios";
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import OpenAI from "openai";
const AIChat = () => {
  const [aiResponse, setAiResponse] = useState<any>();
  const [messages, setMessages] = useState<any>([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const client = new OpenAI({
    apiKey:
      "sk-pKrYT47ApL8X8bKKetBOogZF8nNEppCpNGrKdmm_HuT3BlbkFJt_ahzDCUjxyGGsCjkSykc444hPW-L8rYbues-_WQEA",
      dangerouslyAllowBrowser: true
  });

  const API_KEY = "sk-pKrYT47ApL8X8bKKetBOogZF8nNEppCpNGrKdmm_HuT3BlbkFJt_ahzDCUjxyGGsCjkSykc444hPW-L8rYbues-_WQEA"
  const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
    "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
  }

  useEffect(() => {
    GetOpenAIResponse();
    return () => {};
  }, []);

  const GetOpenAIResponse = async () => {
    // const response = await getOpenAI("");

    // if (!response) return;
    // console.log(response);
    // setAiResponse(response.data);
    const stream = await client.chat.completions.create({
      // model: "gpt-4o-mini",
      // messages: [{ role: "user", content: "Say this is a test" }],
      // stream: true,
      model: "gpt-4o",
      messages: [
          {"role": "user", "content": "write a haiku about ai"}
      ]
    });

    if (!stream) return;
    console.log(stream);
    // for await (const chunk of stream) {
    //   process.stdout.write(chunk.choices[0]?.delta?.content || "");
    // }
  };

  const handleSendInquiry = async (message: any) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages: any = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };


  const processMessageToChatGPT = async(chatMessages: any) => { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject: any) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    // await fetch("https://api.openai.com/v1/chat/completions", 
    // {
    //   method: "POST",
    //   headers: {
    //     "Authorization": "Bearer " + API_KEY,
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify(apiRequestBody)
    // }).then((data) => {
    //   return data.json();
    // }).then((data) => {
    //   console.log(data);
    //   setMessages([...chatMessages, {
    //     message: data.choices[0].message.content,
    //     sender: "ChatGPT"
    //   }]);
    //   setIsTyping(false);
    // });

    try {
      // Make the API request using axios
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        apiRequestBody,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      // Update the state with the new message from ChatGPT
      setMessages([
        ...chatMessages,
        {
          message: response.data.choices[0].message.content,
          sender: "ChatGPT",
        },
      ]);
  
      // Update the typing indicator
      setIsTyping(false);
    } catch (error) {
      console.error("Error calling ChatGPT API:", error);
      setIsTyping(false); // Ensure typing indicator is stopped in case of an error
    }
  }

  return ( 
    <div className="" style={{height: '80vh', width: '80vw', margin: '2rem'}}>
      <MainContainer>
        <ChatContainer>       
          <MessageList 
            scrollBehavior="smooth" 
            typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
          >
            {messages.map((message: any, i: number) => {
              console.log(message)
              return <Message key={i} model={message} />
            })}
          </MessageList>
          <MessageInput placeholder="Type message here" 
          onSend={handleSendInquiry}
           />        
        </ChatContainer>
      </MainContainer>
    </div>
 );
};

export default AIChat;
