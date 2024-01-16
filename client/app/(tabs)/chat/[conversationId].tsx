import { useLocalSearchParams } from "expo-router";
import ChatPage from "../../components/ChatPage";
const ConversationId = () => {
  const { conversationId } = useLocalSearchParams();
  console.log(ConversationId,'this is chatId');
  
  console.log(useLocalSearchParams(),'chat local params');

  return <ChatPage chatName={conversationId} />;
};

export default ConversationId;
