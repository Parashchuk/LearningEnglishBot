const transcriptAudio = async (voiceUrl) => {
  const headers = {
    authorization: process.env.ASSEMBLYAI_API_KEY,
    'content-type': 'application/json',
  };

  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    body: JSON.stringify({ audio_url: voiceUrl }),
    headers,
  });

  const responseData = await response.json();

  // Construct the polling endpoint URL using the transcript ID
  const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${responseData.id}`;

  // Poll the transcription API until the transcript is ready
  while (true) {
    const pollingResponse = await fetch(pollingEndpoint, { headers });
    const transcriptionResult = await pollingResponse.json();

    // If the transcription is complete, return the transcript object
    if (transcriptionResult.status === 'completed') {
      return transcriptionResult;
    }
    // If the transcription has failed, throw an error with the error message
    else if (transcriptionResult.status === 'error') {
      throw new Error(`Transcription failed: ${transcriptionResult.error}`);
    }
    // If the transcription is still in progress, wait for a few seconds before polling again
    else {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

export default transcriptAudio;
