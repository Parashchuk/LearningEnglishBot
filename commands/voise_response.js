import textgears from 'textgears-api';

const voiceResponse = async (ctx) => {
  try {
    ctx.reply('Processing your voice message...');

    //Transcription text
    const voiceUrl = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const transcriptedText = await transcriptAudio(voiceUrl.href);

    //Grammar check
    const data = await checkGrammar(transcriptedText.text);
    const headerMessage = "Let's look at some mistakes you made:\n\n";

    let resultedString = '';
    if (data.response.errors.length != 0) {
      resultedString = headerMessage + transcriptedText.text;

      let lastErorAtIndex = headerMessage.length;
      console.log('init index', lastErorAtIndex);
      for (const error of data.response.errors) {
        if (error.better[0].indexOf(',') != -1) {
          lastErorAtIndex = resultedString.indexOf(error.bad, lastErorAtIndex) + error.bad.length;
          continue;
        }

        let betterErrorMessage = `<b> (<u>${error.bad}</u> ===> <u>${error.better.join(
          '</u> or <u>'
        )}</u>) </b>`;
        let currentError = resultedString.indexOf(error.bad, lastErorAtIndex);

        resultedString =
          resultedString.slice(0, currentError) +
          betterErrorMessage +
          resultedString.slice(currentError + error.bad.length);

        lastErorAtIndex = currentError + betterErrorMessage.length;
        console.log('index in the end for loop', lastErorAtIndex);
      }
    } else {
      resultedString = "Congratulations! we couldn't find any mistakes, gread job.";
    }

    ctx.telegram.sendMessage(ctx.chat.id, resultedString, { parse_mode: 'HTML' });
  } catch (error) {
    console.log(error);
    throw new Error(`Transcription failed`);
  }
};

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

const checkGrammar = (text) => {
  const textgearsApi = textgears('FH9QhMXouq118qcn', { language: 'en-US' });
  const data = textgearsApi
    .checkGrammar(text)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
    });

  return data;
};

export default voiceResponse;
