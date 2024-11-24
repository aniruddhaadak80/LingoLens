import axios from 'axios';

const ASSEMBLY_AI_KEY = '70dfe62cc1494ba587862ca38ae9a095';
const GEMINI_API_KEY = 'AIzaSyAcj7fAW7C_DVZVkXbGBSGDrBu88AKTAKg';
const OPENAI_API_KEY = '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';

interface TranscriptionResponse {
  text: string;
  summary_points?: string[];
  status: string;
  id: string;
}

export const transcribeAudio = async (file: File, onProgress: (progress: number) => void) => {
  // First, upload the file
  const formData = new FormData();
  formData.append('file', file);

  const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', formData, {
    headers: {
      'authorization': ASSEMBLY_AI_KEY,
    },
  });

  // Create transcription job
  const transcriptResponse = await axios.post(
    'https://api.assemblyai.com/v2/transcript',
    {
      audio_url: uploadResponse.data.upload_url,
      summarization: true,
      summary_model: 'informative',
      summary_type: 'bullets',
    },
    {
      headers: {
        'authorization': ASSEMBLY_AI_KEY,
      },
    }
  );

  const transcriptId = transcriptResponse.data.id;

  // Poll for completion
  while (true) {
    const pollingResponse = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: {
          'authorization': ASSEMBLY_AI_KEY,
        },
      }
    );

    const transcriptionResult: TranscriptionResponse = pollingResponse.data;

    if (transcriptionResult.status === 'completed') {
      onProgress(100);
      return transcriptionResult;
    } else if (transcriptionResult.status === 'error') {
      throw new Error('Transcription failed');
    }

    // Update progress (approximate)
    if (transcriptionResult.status === 'processing') {
      onProgress(50);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

export const generateContent = async (text: string, type: 'blog' | 'social' | 'qa', onProgress?: (progress: number) => void) => {
  onProgress?.(25);
  try {
    // Try Gemini first
    const prompt = type === 'qa' 
      ? text 
      : type === 'blog'
        ? `Generate an engaging blog post with relevant emojis based on this transcript: ${text}`
        : `Generate a social media post with relevant emojis based on this transcript: ${text}`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
      }
    );
    onProgress?.(100);
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    // Fallback to OpenAI
    onProgress?.(50);
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: type === 'qa' 
              ? 'You are a helpful assistant answering questions about a transcript.'
              : type === 'blog'
                ? 'Generate an engaging blog post with relevant emojis.'
                : 'Generate a social media post with relevant emojis.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    onProgress?.(100);
    return response.data.choices[0].message.content;
  }
};

export const translateText = async (text: string, targetLanguage: string, onProgress: (progress: number) => void) => {
  onProgress(25);
  try {
    // Try Gemini first
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: `Translate the following text to ${targetLanguage}: ${text}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
      }
    );
    onProgress(100);
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    // Fallback to OpenAI
    onProgress(50);
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Translate the following text to ${targetLanguage}:`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    onProgress(100);
    return response.data.choices[0].message.content;
  }
};
