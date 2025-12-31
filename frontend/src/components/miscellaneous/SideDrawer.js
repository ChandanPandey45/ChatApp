import {
  Box,
  Text,
  Button,
  Input,
  Avatar,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import ProfileModal from "./ProfileModal";
import ChatLoading from "../ChatLoading";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import debounce from "lodash.debounce";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const debouncedSearch = debounce(async (query) => {
    if (!query) return setSearchResult([]);
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/user?search=${query}`,
        config
      );
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error occurred!",
        description:
          error.response?.data?.message || "Failed to load search results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }, 500);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
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
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat`,
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      setLoadingChat(false);
      toast({
        title: "Error fetching chat",
        description:
          error.response?.data?.message || error.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  // Clear search results on drawer close
  const handleCloseDrawer = () => {
    setSearch("");
    setSearchResult([]);
    onClose();
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="linear-gradient(90deg, #232536 0%, #2d2f45 100%)"
        w="100%"
        p="12px 20px"
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.08)"
        boxShadow="0 2px 16px rgba(0, 0, 0, 0.15)"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button
            variant="ghost"
            onClick={onOpen}
            color="gray.300"
            _hover={{ bg: "rgba(255, 255, 255, 0.08)", color: "white" }}
            transition="all 0.2s"
          >
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={3} fontWeight="500">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text
          fontSize="xl"
          fontFamily="Work sans"
          fontWeight="600"
          color="white"
          letterSpacing="0.5px"
        >
          The Messenger World
        </Text>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Notifications */}
          <Menu>
            <MenuButton p={1} position="relative">
              <NotificationBadge count={notification.length} effect={Effect.SCALE} />
              <BellIcon fontSize="xl" m={1} color="gray.300" _hover={{ color: "white" }} />
            </MenuButton>
            <MenuList bg="#2d2f45" borderColor="rgba(255,255,255,0.1)" boxShadow="lg">
              {!notification.length && <Text px={3} py={2} color="gray.400">No New Messages</Text>}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  bg="transparent"
                  color="gray.200"
                  _hover={{ bg: "rgba(255,255,255,0.08)" }}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Profile Menu */}
          <Menu>
            <MenuButton
              as={Button}
              bg="transparent"
              rightIcon={<ChevronDownIcon color="gray.400" />}
              _hover={{ bg: "rgba(255,255,255,0.05)" }}
              _active={{ bg: "rgba(255,255,255,0.08)" }}
            >
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList bg="#2d2f45" borderColor="rgba(255,255,255,0.1)" boxShadow="lg">
              <ProfileModal user={user}>
                <MenuItem bg="transparent" color="gray.200" _hover={{ bg: "rgba(255,255,255,0.08)" }}>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider borderColor="rgba(255,255,255,0.1)" />
              <MenuItem bg="transparent" color="gray.200" _hover={{ bg: "rgba(255,255,255,0.08)" }} onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      {/* Drawer for User Search */}
      {/* <Drawer placement="left" onClose={handleCloseDrawer} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={handleSearchChange}
              />
              <Button onClick={() => debouncedSearch(search)}>Go</Button>
            </Box>

            {loading ? (
              <ChatLoading />
            ) : searchResult.length === 0 && search ? (
              <Text mt={2} textAlign="center" color="gray.500">
                No users found
              </Text>
            ) : (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer> */}


      <Drawer
        placement="left"
        onClose={handleCloseDrawer}
        isOpen={isOpen}
        size={{ base: "full", md: "sm" }}
      >
        <DrawerOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
        <DrawerContent
          bg="#232536"
          maxW={{ base: "100%", md: "380px" }}
        >
          <DrawerHeader
            borderBottomWidth="1px"
            borderColor="rgba(255,255,255,0.08)"
            color="white"
            fontWeight="600"
          >
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={3}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={handleSearchChange}
                bg="rgba(255, 255, 255, 0.06)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
                color="white"
                _placeholder={{ color: "gray.500" }}
                _hover={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
                _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 1px #6366f1" }}
              />
              <Button
                onClick={() => debouncedSearch(search)}
                bg="#6366f1"
                color="white"
                _hover={{ bg: "#5558e3" }}
              >
                Go
              </Button>
            </Box>

            {loading ? (
              <ChatLoading />
            ) : searchResult.length === 0 && search ? (
              <Text mt={2} textAlign="center" color="gray.500">
                No users found
              </Text>
            ) : (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="flex" color="#6366f1" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

    </>
  );
}

export default SideDrawer;
