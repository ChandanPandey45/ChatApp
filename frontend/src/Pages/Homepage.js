import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useHistory } from "react-router";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) history.push("/chats");
  }, [history]);

  return (
    <Box w="100vw" h="100vh" bg="#d1d7db" position="relative">
      {/* WhatsApp Green Header */}
      <Box
        w="100%"
        h="220px"
        bg="#00a884"
        position="absolute"
        top="0"
      />

      <Container
        maxW="420px"
        position="relative"
        pt="80px"
      >
        {/* Logo */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mb={6}
          color="white"
        >
          <i
            className="fas fa-comment-dots"
            style={{ fontSize: "34px", marginRight: "10px" }}
          />
          <Text
            fontSize="lg"
            fontWeight="600"
            letterSpacing="1px"
          >
            THE MESSENGER WORLD
          </Text>
        </Box>

        {/* Auth Card */}
        <Box
          bg="white"
          borderRadius="md"
          boxShadow="0 2px 12px rgba(0,0,0,0.15)"
          p={6}
        >
          <Tabs isFitted variant="unstyled">
            <TabList
              display="flex"
              borderBottom="1px solid #e9edef"
              mb={4}
            >
              <Tab
                fontWeight="600"
                _selected={{
                  color: "#00a884",
                  borderBottom: "2px solid #00a884",
                }}
              >
                Login
              </Tab>
              <Tab
                fontWeight="600"
                _selected={{
                  color: "#00a884",
                  borderBottom: "2px solid #00a884",
                }}
              >
                Sign Up
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <Login />
              </TabPanel>
              <TabPanel px={0}>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
}

export default Homepage;
