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

      const { data } = await axios.get(`${BACKEND_URL}/api/chat`, config);
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
      p={4}
      // bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      bg="transparent"
      w={{ base: "100%", md: "31%" }}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.15)"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
        pointerEvents: "none"
      }}
    >
      {/* Header */}
      <Box
        pb={4}
        px={2}
        fontSize={{ base: "24px", md: "28px" }}
        fontFamily="Work sans"
        fontWeight="bold"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color="white"
        position="relative"
        zIndex={1}
      >
        <Text
          textShadow="0 2px 4px rgba(0,0,0,0.3)"
          bgGradient="linear(to-r, white, whiteAlpha.900)"
          bgClip="text"
          fontSize={{ base: "34px", md: "28px"}}
          color="black"
        >
          My Chats
        </Text>
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "14px", md: "16px" }}
            rightIcon={<AddIcon />}
            bg="whiteAlpha.200"
            color="black"
            border="1px solid"
            borderColor="whiteAlpha.300"
            _hover={{ 
              bg: "whiteAlpha.300", 
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
            _active={{ transform: "translateY(0)" }}
            transition="all 0.2s ease"
            backdropFilter="blur(10px)"
            borderRadius="lg"
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>

      {/* Chat List */}
      <Box
        display="flex"
        flexDir="column"
        p={3}
        // bg="rgba(255, 255, 255, 0.1)"
        bg="transparent"
        backdropFilter="blur(15px)"
        w="100%"
        h="85vh"
        color="black"
        borderRadius="xl"
        overflowY="auto"
        border="1px solid"
        borderColor="whiteAlpha.200"
        position="relative"
        zIndex={1}
        sx={{
          "&::-webkit-scrollbar": { 
            width: "8px"
          },
          "&::-webkit-scrollbar-track": {
            bg: "whiteAlpha.100",
            borderRadius: "full"
          },
          "&::-webkit-scrollbar-thumb": { 
            bg: "whiteAlpha.400", 
            borderRadius: "full",
            border: "2px solid transparent",
            backgroundClip: "padding-box"
          },
          "&::-webkit-scrollbar-thumb:hover": { 
            bg: "whiteAlpha.600"
          }
        }}
      >
        {chats ? (
          <Stack spacing={2}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat?._id === chat._id 
                  ? "rgba(255, 255, 255, 0.25)" 
                  : "rgba(255, 255, 255, 0.05)"
                }
                color="black"
                px={4}
                py={3}
                borderRadius="lg"
                key={chat._id}
                border="1px solid"
                borderColor={selectedChat?._id === chat._id 
                  ? "whiteAlpha.400" 
                  : "whiteAlpha.100"
                }
                _hover={{ 
                  bg: "rgba(255, 255, 255, 0.15)",
                  transform: "translateX(4px)",
                  borderColor: "whiteAlpha.300"
                }}
                transition="all 0.2s ease"
                backdropFilter="blur(10px)"
                position="relative"
                overflow="hidden"
                _before={selectedChat?._id === chat._id ? {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  // bg: "linear-gradient(to bottom, #5f6e6eff, #4FD1C7)",
                  bg: "transparent",
                  borderRadius: "0 4px 4px 0"
                } : {}}
              >
                <Text 
                  fontWeight="semibold" 
                  fontSize="md"
                  textShadow="0 1px 2px rgba(0,0,0,0.2)"
                  noOfLines={1}
                >
                  {!chat.isGroupChat ? getSender(user, chat.users) : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text 
                    fontSize="sm" 
                    noOfLines={1}
                    color="whiteAlpha.800"
                    mt={1}
                  >
                    <Text as="span" fontWeight="medium" color="whiteAlpha.900">
                      {chat.latestMessage.sender.name}:
                    </Text>{" "}
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