import { axiosWithAuth } from './customAxios';
import { ipURL } from './utils';

export const uploadChatMedia = async ({
  uri,
  mime,
  fileName,
  conversationId,
  messageId,
  kind,
}: {
  uri: string;
  mime: string;
  fileName: string;
  conversationId: string;
  messageId: string;
  kind: 'image' | 'audio';
}) => {
  const form = new FormData();
  form.append('conversationId', conversationId);
  form.append('messageId', messageId);
  form.append('kind', kind);
  form.append('media', {
    uri,
    name: fileName,
    type: mime,
  } as unknown as Blob);

  const resp = await axiosWithAuth.post(`${ipURL}/api/s3/chat-media`, form, {
    timeout: 60000,
  });
  return resp.data as { url: string; mime: string };
};
