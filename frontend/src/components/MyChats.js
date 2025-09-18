import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast, Button } from "@chakra-ui/react";
import axios from "axios";
import { useEffect } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const toast = useToast();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = async () => {
    if (!user || !user.token) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Failed to load chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchAgain, user]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="#4b6296" 
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      {/* Header */}
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "22px", md: "26px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color="white"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "14px", md: "16px" }}
            rightIcon={<AddIcon />}
            colorScheme="teal"
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>

      {/* Chat List */}
      <Box
        display="flex"
        flexDir="column"
        p={2}
        bg="#1c5494ff" // slightly lighter dark blue
        w="100%"
        h="85vh"
        borderRadius="lg"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { bg: "#38B2AC", borderRadius: "24px" },
        }}
      >
        {chats ? (
          <Stack spacing={2}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat?._id === chat._id ? "#38B2AC" : "#0a3d62"}
                color={selectedChat?._id === chat._id ? "white" : "whiteAlpha.800"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                _hover={{ bg: "#3c6382" }}
              >
                <Text fontWeight="bold">
                  {!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs" noOfLines={1}>
                    <b>{chat.latestMessage.sender.name}:</b>{" "}
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 50) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
