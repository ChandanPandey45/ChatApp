import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack, Box, Heading, Text, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [show, setShow] = useState(false);
  const toast = useToast();
  const history = useHistory();
  const location = useLocation();

  // Data passed from Signup
  const { name, email, password, pic } = location.state || {};

  const handleClick = () => setShow(!show);

  const handleVerify = async () => {
    if (!otp) {
      toast({
        title: "Please enter OTP",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user/verify",
        { name, email, password, pic, otp },
        config
      );

      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      history.push("/chats");
    } catch (error) {
      toast({
        title: "OTP Verification Failed",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

 return (
  <Flex
    justify="center"
    align="center"
    minH="100vh"
    w="100%"
  >
    <Box
      bg="white"
      p={8}
      borderRadius="lg"
      boxShadow="lg"
      width="100%"
      maxW="md"
    >
      <Heading mb={4} textAlign="center" color="blue.600">
        Verify Your Account
      </Heading>
      <Text mb={6} textAlign="center" color="gray.600">
        Enter the OTP sent to your email to complete registration
      </Text>

      <VStack spacing="15px">
        <FormControl id="otp" isRequired>
          <FormLabel>Enter OTP</FormLabel>
          <InputGroup size="md">
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button
          colorScheme="blue"
          width="100%"
          mt={2}
          onClick={handleVerify}
        >
          Verify
        </Button>
      </VStack>
    </Box>
  </Flex>
);

};

export default Verify;
