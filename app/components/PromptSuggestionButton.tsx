import React from 'react'

const PromptSuggestionButton = ({onClick, text}) => {
  return (
    <button
    className='prompt-suggestion-button'
    onClick={onClick}
    >
        {text}
    </button>
  )
}

export default PromptSuggestionButton