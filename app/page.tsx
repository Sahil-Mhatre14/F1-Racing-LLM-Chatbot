"use client";
import React from "react";
import f1GPTLogo from "./assets/f1GPTLogo.jpg";
import Image from "next/image";
import { useChat } from "ai/react";
import { Message } from "ai";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import Bubble from "./components/Bubble";

const Home = () => {
  const {append, isLoading, messages, input, handleInputChange, handleSubmit} = useChat()


  const noMessages = !messages || messages.length === 0;

  const handlePrompt = (promptText) => {
    const msg: Message = {
        id: crypto.randomUUID(),
        content: promptText,
        role: "user"
    }
    append(msg)
  }

  return (
    <main>
      <Image src={f1GPTLogo} width="250" alt="Logo" />
      <section className={noMessages ? "" : "populated"}>
       { noMessages ? (
        <>
            <p className="starter-text">
            The ultimate place for Formula 1 superfans. Ask F1 GPT anything about
            Formula 1 and it will come back with the most tp-to-date and accurate
            answer!We hope you enjoy.
            </p>
            <br />
            <PromptSuggestionRow onPromptClick={handlePrompt} />
        </>) : 
        (
        <>
            {messages.map((message, index) => <Bubble key={`message-${index}`} message={message} />)}
            {isLoading && <LoadingBubble />}
        
        </>)}
      </section>
        <form onSubmit={handleSubmit}>
            <input className="question-box" onChange={handleInputChange}
            value={input} placeholder="Ask me something..."></input>
            <input type="submit" />
        </form>
    </main>
  );
};

export default Home;
