import axios from 'axios';

const LEMUR_API_KEY = '70dfe62cc1494ba587862ca38ae9a095';
const GEMINI_API_KEY = 'REMOVED_LEAKED_GOOGLE_KEY';
const OPENAI_API_KEY = 'REMOVED_LEAKED_OPENAI_KEY';

export const transcribeAudio = async (audioFile: File) => {
  const formData = new FormData();
  formData.append('audio', audioFile);

  try {
    const response = await axios.post('https://api.assemblyai.com/v2/upload', formData, {
      headers: {
        'authorization': LEMUR_API_KEY,
        'content-type': 'multipart/form-data',
      },
    });

    const transcriptResponse = await axios.post(
      'https://api.assemblyai.com/v2/transcript',
      {
        audio_url: response.data.upload_url,
        summarization: true,
        summary_model: 'informative',
        summary_type: 'bullets',
      },
      {
        headers: {
          'authorization': LEMUR_API_KEY,
        },
      }
    );

    return transcriptResponse.data;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

export const generateContent = async (transcript: string, type: 'blog' | 'social') => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Generate a ${type} post based on the following transcript:`,
          },
          {
            role: 'user',
            content: transcript,
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

export const translateText = async (text: string, targetLanguage: string) => {
  try {
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
};