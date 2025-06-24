interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'developer' | 'tool' | 'function';
  content?: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    function: {
      arguments: string;
      name: string;
    };
    type: 'function';
  }>;
  audio?: {
    id: string;
  };
  function_call?: {
    arguments: string;
    name: string;
  };
  refusal?: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_completion_tokens?: number;
  stream?: boolean;
  frequency_penalty?: number;
  presence_penalty?: number;
  n?: number;
  stop?: string | string[];
  user?: string;
  logprobs?: boolean;
  top_logprobs?: number;
  seed?: number;
  response_format?: {
    type: 'text' | 'json_object';
    json_schema?: {
      name: string;
      description?: string;
      schema: Record<string, any>;
      strict?: boolean;
    };
  };
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description?: string;
      parameters?: Record<string, any>;
    };
  }>;
  tool_choice?: 'none' | 'auto' | string;
  parallel_tool_calls?: boolean;
  // Additional vLLM-specific parameters
  best_of?: number;
  use_beam_search?: boolean;
  top_k?: number;
  min_p?: number;
  repetition_penalty?: number;
  length_penalty?: number;
  stop_token_ids?: number[];
  include_stop_str_in_output?: boolean;
  ignore_eos?: boolean;
  min_tokens?: number;
  skip_special_tokens?: boolean;
  spaces_between_special_tokens?: boolean;
  truncate_prompt_tokens?: number;
  prompt_logprobs?: number;
  echo?: boolean;
  add_generation_prompt?: boolean;
  continue_final_message?: boolean;
  add_special_tokens?: boolean;
  documents?: Array<Record<string, string>>;
  chat_template?: string;
  chat_template_kwargs?: Record<string, any>;
  mm_processor_kwargs?: Record<string, any>;
  guided_json?: string;
  guided_regex?: string;
  guided_choice?: string[];
  guided_grammar?: string;
  structural_tag?: string;
  guided_decoding_backend?: string;
  guided_whitespace_pattern?: string;
  priority?: number;
  request_id?: string;
  logits_processors?: Array<string | {
    qualname: string;
    args: string[];
    kwargs: Record<string, any>;
  }>;
  return_tokens_as_token_ids?: boolean;
  cache_salt?: string;
  kv_transfer_params?: Record<string, any>;
}

interface ChatChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
  index: number;
}

interface ChatResponse {
  choices?: ChatChoice[];
  error?: {
    message: string;
    type: string;
  };
}

interface UIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class ChatService {
  private readonly apiUrl = 'https://wbigu561gn7c40-8000.proxy.runpod.net/v1/chat/completions';
  private readonly apiKey = process.env.VITE_API_KEY || '';
  private conversationHistory: ChatMessage[] = [];

  private convertUIMessagesToAPIFormat(uiMessages: UIMessage[]): ChatMessage[] {
    return uiMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content,
      name: msg.type === 'user' ? 'user' : 'MiniMax AI'
    }));
  }

  async sendMessage(message: string, conversationContext?: UIMessage[]): Promise<string> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    // Build messages array from conversation context
    let messages: ChatMessage[] = [];
    
    if (conversationContext && conversationContext.length > 0) {
      // Convert UI messages to API format and keep last 15 for context
      messages = this.convertUIMessagesToAPIFormat(conversationContext.slice(-15));
    }

    // Add the new user message
    messages.push({
      role: 'user',
      content: message,
      name: 'user'
    });

    const requestBody: ChatRequest = {
      model: 'MiniMax-M1',
      messages: messages,
      temperature: 1.0,
      top_p: 0.95,
      max_completion_tokens: 8192,
      stream: false,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1
    };

    try {
      console.log('Sending request to API:', this.apiUrl);
      console.log('Conversation context:', messages.length, 'messages');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Validate response is valid JSON
      let data: ChatResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format from API');
      }
      
      if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(data.error.message || 'Unknown API error');
      }

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices received from API');
      }

      // Get the assistant's response
      let assistantResponse = data.choices[0].message.content || '';
      
      // Clean and validate the generated text
      assistantResponse = assistantResponse.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
      
      // Basic security check - don't return responses that look like config data
      if (assistantResponse.includes('ethereum') || assistantResponse.includes('rpc-url') || assistantResponse.includes('mainnet')) {
        console.warn('Potentially unsafe response detected, using fallback');
        assistantResponse = "I'm here to help! How can I assist you today?";
      }

      if (!assistantResponse.trim()) {
        return "I'm sorry, I couldn't generate a proper response. Please try again.";
      }

      console.log('Processed response:', assistantResponse);
      return assistantResponse;
      
    } catch (error) {
      console.error('Chat service error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred while communicating with the AI service.');
    }
  }

  // Method to clear conversation history if needed
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Method to get conversation history if needed
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

export const chatService = new ChatService();
