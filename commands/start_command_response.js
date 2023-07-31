const startCommandResponse = (ctx) => {
  ctx.telegram.sendMessage(
    ctx.chat.id,
    "The commnad <u><b>start</b></u> doesn't have any functionality yet, to start <u><b>send a voice message</b></u>",
    { parse_mode: 'HTML' }
  );
};

export default startCommandResponse;
