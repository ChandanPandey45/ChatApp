import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Avatar,
  Box,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

function ProfileModal({ user, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box onClick={onOpen}>{children}</Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" flexDirection="column" alignItems="center">
            <Avatar size="2xl" name={user.name} src={user.pic} mb={4} />
            <Text fontSize="2xl" fontWeight="bold">{user.name}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" alignItems="center" pb={6}>
            <Box mb={3}>
              <Text fontWeight="semibold">Email:</Text>
              <Text>{user.email}</Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ProfileModal;
