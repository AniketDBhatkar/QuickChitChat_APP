import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios, authUser } = useContext(AuthContext);

    // ✅ Get all users
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users || []);
                setUnseenMessages(data.unseenMessages || {});
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Get messages with a user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Send message
    const sendMessages = async (messageData) => {
        if (!selectedUser) return;

        try {
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData
            );

            if (data.success) {
                setMessages(prev => [...prev, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Subscribe to socket messages
    const subscribeToMessages = () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages(prev => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [newMessage.senderId]:
                        prev[newMessage.senderId]
                            ? prev[newMessage.senderId] + 1
                            : 1
                }));
            }
        });
    };

    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    };

    // ✅ Fetch users once authUser is ready
    useEffect(() => {
        if (authUser) getUsers();
    }, [authUser]);

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        getUsers,
        getMessages,
        sendMessages,
        setSelectedUser,
        setUsers,
        setMessages,
        setUnseenMessages
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
