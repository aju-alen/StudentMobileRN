import { useLocalSearchParams } from "expo-router";
import ChatPage from "../../components/ChatPage";
const ChatId = () => {
  const chat = useLocalSearchParams().chatId;

  return <ChatPage chatName={chat} />;
};

export default ChatId;
