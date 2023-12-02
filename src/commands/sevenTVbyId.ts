import { ICommand } from '../interfaces';
import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import axios from 'axios';

class SevenTVByIdCommand implements ICommand {
  readonly name = '/7tvid';
  readonly fileNumber = 3;

  async handle(client: Client, message: Message): Promise<void> {
    try {
      client.sendMessage(message.from, 'Aguarde!');

      const [, emoteId] = message.body.split(' ');

      const emote = await axios
        .get(`https://7tv.io/v3/emotes/${emoteId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log('ERRO::', err.response.data);
          client.sendMessage(message.from, 'Emote não encontrado! :(');
          throw err;
        });

      if (!emote) {
        client.sendMessage(message.from, 'Emote não encontrado! :(');
        return;
      }
      const validFiles = emote.host.files.filter(
        (f: any) => f.format !== 'AVIF',
      );

      const file =
        validFiles[this.fileNumber] || validFiles[validFiles.length - 1];

      const image = await MessageMedia.fromUrl(
        `https:${emote.host.url}/${file.name}`,
      );

      const media = await new MessageMedia(image.mimetype, image.data);

      client.sendMessage(message.from, media, {
        sendMediaAsSticker: true,
        stickerAuthor: 'wa-sticker-bot:LhuizF',
        stickerName: emote.name,
      });
    } catch (error) {
      console.log('CATH', error);
      client.sendMessage(message.from, 'Ocorreu um erro');
    }
  }
}

export default SevenTVByIdCommand;
