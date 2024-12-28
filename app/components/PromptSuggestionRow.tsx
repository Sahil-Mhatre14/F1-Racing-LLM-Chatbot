import React from 'react'
import PromptSuggestionButton from './PromptSuggestionButton'

const PromptSuggestionRow = ({onPromptClick}) => {
    const prompts = [
        "Who is the head of racing for Aston Martin's F1 Academy team?",
        "Who is the hghest paid F1 driver?",
        "Who will be the newest driver for Ferrari",
        "Who is the current Formula One World Driver's Champion?"
    ]
  return (
    <div className='prompt-suggestion-row'>
        {
            prompts.map((prompt, index) => 
            <PromptSuggestionButton
                key={`suggestion-${index}`}
                text={prompt}
                onClick={() => onPromptClick(prompt)}
            />)
        }
    </div>
  )
}

export default PromptSuggestionRow