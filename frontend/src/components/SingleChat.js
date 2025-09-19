import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "https://chat-guis.onrender.com";
// const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `${BACKEND_URL}/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          `${BACKEND_URL}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || 
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          {/* <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text> */}

         <Text
  fontSize={{ base: "28px", md: "30px" }}
  pb={3}
  px={2}
  w="100%"
  fontFamily="Work sans"
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  // border-radius="20px"
  borderRadius="10px"
  margin="2px"
  border="2px solid"
  borderColor="gray.200"
  bg="rgba(255, 255, 255, 0.8)"
>
  <Box display="flex" alignItems="center" gap={3}>
    {/* Back Button (mobile only) */}
    <IconButton
      display={{ base: "flex", md: "none" }}
      icon={<ArrowBackIcon />}
      onClick={() => setSelectedChat("")}
    />

  {messages &&
  (!selectedChat.isGroupChat ? (
    <ProfileModal user={getSenderFull(user, selectedChat.users)}>
      <Box
        px={3}
        py={1}
        borderRadius="md"
        marginTop="10px" 
        // bg="lightgray"
        // _hover={{ bg: "gray.200" }}
        cursor="pointer"
        fontWeight="bold"
      >
        {getSender(user, selectedChat.users)}
      </Box>
    </ProfileModal>
  ) : (
    <UpdateGroupChatModal
      fetchMessages={fetchMessages}
      fetchAgain={fetchAgain}
      setFetchAgain={setFetchAgain}
    >
      <Box
        px={3}
        py={1}
        borderRadius="md"
        bg="blue.100"
        _hover={{ bg: "blue.200" }}
        cursor="pointer"
        fontWeight="bold"
      >
        {selectedChat.chatName.toUpperCase()}
      </Box>
    </UpdateGroupChatModal>
  ))}


  </Box>

  {/* Call Icons */}
  <Box display="flex" alignItems="center" gap={2} height="100%" >
    <IconButton
      aria-label="Audio Call"
      icon={<i className="fas fa-phone"></i>}
      size="md"
      variant="ghost"
      colorScheme="teal"
      _hover={{ bg: "teal.100" }}
      onClick={() => console.log("Audio Call Clicked")}
    />
    <IconButton
      aria-label="Video Call"
      icon={<i className="fas fa-video"></i>}
      size="md"
      variant="ghost"
      colorScheme="purple"
      _hover={{ bg: "purple.100" }}
      onClick={() => console.log("Video Call Clicked")}
    />
  </Box>
</Text>

          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflow="hidden"
            // bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            bg="transparent"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="blue.500"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
              position="relative"
              zIndex={1}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : null}
              <Input
                variant="filled"
                bg="rgba(255, 255, 255, 0.9)"
                color="gray.800"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
                border="1px solid"
                borderColor="gray.200"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.95)",
                  borderColor: "purple.300"
                }}
                _focus={{
                  bg: "white",
                  borderColor: "purple.400",
                  boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.3)"
                }}
                borderRadius="lg"
                fontSize="md"
                py={6}
                backdropFilter="blur(10px)"
              />
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box d="flex" alignItems="center" justifyContent="center" h="100%" className="chatbox">
          <Text fontSize="5xl" pb={3} fontFamily="Work sans" color="black" textWeight="bold">
            {/* Click on a user to start chatting */}
            Start a conversation!
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;