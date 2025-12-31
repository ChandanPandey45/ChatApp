import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast, Avatar } from "@chakra-ui/react";
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
// const ENDPOINT = "https://chat-guis.onrender.com";
const ENDPOINT = "http://localhost:5000";
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
        `${process.env.REACT_APP_BACKEND_URL}/api/message/${selectedChat._id}`,
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
          `${process.env.REACT_APP_BACKEND_URL}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
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

    return () => {
      socket.disconnect();
    };
  }, [user]);

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
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            py={2}
            px={4}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bg="#f0f2f5"
            borderBottom="1px solid #d1d7db"
          >
            <Box display="flex" alignItems="center" gap={3}>
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
              />

              {messages &&
                (!selectedChat.isGroupChat ? (
                  <ProfileModal user={getSenderFull(user, selectedChat.users)}>
                    <Box display="flex" alignItems="center" cursor="pointer">
                      <Avatar
                        name={getSender(user, selectedChat.users)}
                        src={getSenderFull(user, selectedChat.users).pic}
                        size="sm"
                        mr={3}
                      />
                      <Box>
                        <Text fontSize="16px" fontWeight="600" color="#111b21">
                          {getSender(user, selectedChat.users)}
                        </Text>
                        <Text fontSize="13px" color="#667781">
                          Online
                        </Text>
                      </Box>
                    </Box>
                  </ProfileModal>
                ) : (
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  >
                    <Box display="flex" alignItems="center" cursor="pointer">
                      <Avatar
                        name={selectedChat.chatName}
                        size="sm"
                        mr={3}
                      />
                      <Box>
                        <Text fontSize="16px" fontWeight="600" color="#111b21">
                          {selectedChat.chatName.toUpperCase()}
                        </Text>
                        <Text fontSize="13px" color="#667781" noOfLines={1} maxW="300px">
                          {selectedChat.users.map((u) => u.name).join(", ")}
                        </Text>
                      </Box>
                    </Box>
                  </UpdateGroupChatModal>
                ))}
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                icon={<i className="fas fa-video"></i>}
                variant="ghost"
                color="#54656f"
                fontSize="20px"
              />
              <IconButton
                icon={<i className="fas fa-phone"></i>}
                variant="ghost"
                color="#54656f"
                fontSize="20px"
              />
              <Box w="1px" h="24px" bg="#d1d7db" mx={2} display={{ base: "none", md: "block" }} />
              <IconButton
                aria-label="Search"
                icon={<i className="fas fa-search"></i>}
                size="md"
                variant="ghost"
                color="#54656f"
                fontSize="20px"
              />
              <IconButton
                aria-label="Menu"
                icon={<i className="fas fa-ellipsis-v"></i>}
                size="md"
                variant="ghost"
                color="#54656f"
                fontSize="20px"
              />
            </Box>
          </Box>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#efeae2"
            w="100%"
            h="100%"
            overflowY="hidden"
            bgImage="url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')"
            bgSize="contain"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="#00a884"
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
              <Box display="flex" alignItems="center" bg="#f0f2f5" p={2} borderRadius="lg">
                <IconButton
                  icon={<i className="far fa-smile"></i>}
                  variant="ghost"
                  color="#54656f"
                  fontSize="24px"
                  mr={2}
                />
                <IconButton
                  icon={<i className="fas fa-plus"></i>}
                  variant="ghost"
                  color="#54656f"
                  fontSize="24px"
                  mr={2}
                />
                <Input
                  variant="filled"
                  bg="white"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={typingHandler}
                  border="none"
                  _focus={{
                    bg: "white",
                  }}
                  borderRadius="lg"
                  py={6}
                />
                <IconButton
                  icon={<i className="fas fa-microphone"></i>}
                  variant="ghost"
                  color="#54656f"
                  fontSize="24px"
                  ml={2}
                />
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
      <Box
  flex="1"
  display="flex"
  width="100%"
  alignItems="center"
  justifyContent="center"
  bg="linear-gradient(180deg, #28363fff 0%, #111b21 100%)"
>
  <Box
    textAlign="center"
    px={6}
  >
    {/* Icon / Illustration */}
    <Box
      mb={6}
      mx="auto"
      w="120px"
      h="120px"
      borderRadius="full"
      bg="rgba(255,255,255,0.06)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <i
        className="fas fa-comments"
        style={{ fontSize: "48px", color: "#8696a0" }}
      />
    </Box>

    {/* Title */}
    <Text
      fontSize="32px"
      fontFamily="Work Sans"
      fontWeight="300"
      color="#e9edef"
      mb={3}
    >
      The Messenger World
    </Text>

    {/* Subtitle */}
    <Text
      fontSize="14px"
      lineHeight="1.6"
      color="#8696a0"
    >
      Send and receive messages without keeping your phone online.
      Use Messenger World on up to 4 linked devices.
    </Text>
  </Box>
</Box>

      )}
    </>
  );
};

export default SingleChat;