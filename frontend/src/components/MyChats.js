import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast, Button, Avatar, Input, InputGroup, InputLeftElement, Spinner } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import UserListItem from "./userAvatar/UserListItem";
import { useHistory } from "react-router-dom";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();
  const history = useHistory();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  };

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      bg="white"
      w={{ base: "100%", md: "30%" }}
      borderRight="1px solid #e0e0e0"
      height="100%"
    >
      {/* Header */}
      <Box
        px={4}
        py={3}
        bg="#f0f2f5"
        w="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom="1px solid #d1d7db"
      >
        <Avatar
          size="sm"
          cursor="pointer"
          name={user.name}
          src={user.pic}
        />
        <Box display="flex" gap={4}>
          <GroupChatModal>
            <Button
              size="sm"
              variant="ghost"
              color="#54656f"
              _hover={{ bg: "rgba(0,0,0,0.1)" }}
              fontSize="20px"
              p={0}
            >
              <i className="fas fa-users"></i>
            </Button>
          </GroupChatModal>

          <Button
            size="sm"
            variant="ghost"
            color="#54656f"
            _hover={{ bg: "rgba(0,0,0,0.1)" }}
            fontSize="20px"
            p={0}
            onClick={logoutHandler}
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box px={3} py={2} w="100%" borderBottom="1px solid #f0f2f5">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search or start new chat"
            bg="#f0f2f5"
            border="none"
            fontSize="sm"
            _placeholder={{ color: "gray.500" }}
            _focus={{ bg: "white", boxShadow: "0 0 0 1px #00a884" }}
            borderRadius="lg"
            onChange={(e) => handleSearch(e.target.value)}
            value={search}
          />
        </InputGroup>
      </Box>

      {/* Chat List */}
      <Box
        display="flex"
        flexDir="column"
        w="100%"
        h="100%"
        overflowY="auto"
        bg="white"
      >
        {search ? (
          // Search Results
          loading ? (
            <ChatLoading />
          ) : (
            searchResult?.map((user) => (
              <UserListItem
                key={user._id}
                user={user}
                handleFunction={() => accessChat(user._id)}
              />
            ))
          )
        ) : (
          // Existing Chats
          chats ? (
            <Stack spacing={0}>
              {chats.map((chat) => (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#f0f2f5" : "white"}
                  color="black"
                  px={4}
                  py={3}
                  key={chat._id}
                  borderBottom="1px solid #f0f2f5"
                  _hover={{ bg: "#f5f6f6" }}
                  transition="background 0.2s"
                  display="flex"
                  alignItems="center"
                >
                  <Avatar
                    mr={4}
                    size="md"
                    cursor="pointer"
                    name={!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                    src={!chat.isGroupChat ? getSender(loggedUser, chat.users) : undefined}
                  />
                  <Box flex="1">
                    <Text fontSize="16px" fontWeight="400" color="#111b21">
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </Text>
                    {chat.latestMessage && (
                      <Text fontSize="13px" color="#667781" noOfLines={1}>
                        <Text as="span" fontWeight="400">
                          {chat.latestMessage.sender.name === loggedUser?.name ? "You: " : ""}
                        </Text>
                        {chat.latestMessage.content.length > 50
                          ? chat.latestMessage.content.substring(0, 51) + "..."
                          : chat.latestMessage.content}
                      </Text>
                    )}
                  </Box>
                  {/* Optional: Add Time rendering logic here later */}
                </Box>
              ))}
            </Stack>
          ) : (
            <ChatLoading />
          )
        )}
      </Box>
    </Box>
  );
};

export default MyChats;