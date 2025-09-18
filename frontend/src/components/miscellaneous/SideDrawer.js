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
        `http://localhost:3000/api/user?search=${query}`,
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
        "http://localhost:3000/api/chat",
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
        bg="white"
        w="100%"
        p="5px 10px"
        borderWidth="1px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">
          Chatty
        </Text>

        <Box display="flex" alignItems="center">
          {/* Notifications */}
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge count={notification.length} effect={Effect.SCALE} />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
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
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
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
  <DrawerOverlay />
  <DrawerContent
    bg="rgba(255, 255, 255, 0.2)" 
    backdropFilter="blur(3px)"    
    maxW={{ base: "100%", md: "400px" }}
  >
    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
    <DrawerBody>
      <Box display="flex" pb={2}>
        <Input
          placeholder="Search by name or email"
          mr={2}
          value={search}
          onChange={handleSearchChange}
          bg="whiteAlpha.800" 
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
</Drawer>

    </>
  );
}

export default SideDrawer;
