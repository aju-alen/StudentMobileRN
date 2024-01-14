import ChatPage from "../../components/ChatPage";
import { useLocalSearchParams } from "expo-router";
const CommunityId = () => {
  const chatName = useLocalSearchParams().communityId;

  return <ChatPage chatName={chatName} />;
};

export default CommunityId;
