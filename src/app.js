const io = require("./server/server");
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
  availableRooms,
} = require("./utils/user");
const { genratemessage } = require("./utils/message");

const ADMIN_ID = "I_AM_ADMIN";

io.on("connection", (socket) => {
  // When someone join the room
  socket.on("join", (data, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      ...data,
    });
    availableRooms();

    if (error) {
      return callback(error);
    }
    // Creates vertual connection between users in the same room
    socket.join(user.room);

    // This will send massage to currunt user
    socket.emit(
      "recive_message",
      genratemessage({
        name: "Admin",
        message: `Welcome, ${user.name}.`,
        id: ADMIN_ID,
      })
    );

    // This will send massage to all users expect currunt user
    socket.broadcast.to(user.room).emit(
      "recive_message",
      genratemessage({
        name: "Admin",
        message: `${user.name} has joined.`,
        id: ADMIN_ID,
      })
    );

    io.to(user.room).emit("room", {
      room: user.room,
      usersInRoom: getUsersInRoom(user.room),
    });
    io.to(user.room).emit("user-connected", {
      id: user.id,
    });
    // to notify client
    callback();
  });

  // Message sent
  socket.on("send_message", (message, callback) => {
    const user = getUser(socket.id);
    //this will send massage to all users in a room

    io.to(user.room).emit(
      "recive_message",
      genratemessage({ name: user.name, message, id: user.id })
    );
    callback();
  });
  socket.on("send_location", (data, callback) => {
    const user = getUser(socket.id);
    if (data.privateRoom) {
      io.to(data.privateRoom).emit("recive_private_message", {
        ...genratemessage({
          name: user.name,
          url: `https://google.com/maps?q=${data.coords.latitude},${data.coords.longitude}`,
          id: user.id,
          privateRoom: data.privateRoom,
        }),
        user,
      });
    } else {
      io.to(user.room).emit(
        "recive_message",
        genratemessage({
          name: user.name,
          url: `https://google.com/maps?q=${data.coords.latitude},${data.coords.longitude}`,
          id: user.id,
        })
      );
    }
    callback();
  });
  socket.on("send_private_message", (data, callback) => {
    const user = getUser(socket.id);

    //this will send massage to all users in a room
    io.to(data.room).emit("recive_private_message", {
      ...genratemessage({
        name: user.name,
        message: data.message,
        id: user.id,
        privateRoom: data.room,
      }),
      user,
    });
    callback();
  });

  socket.on("private_room", (data, callback) => {
    const roomName = data.roomName;
    let user = getUser(data.me.id);
    const users = getUsersInRoom(user.room);
    let updatedUser;
    users.map((user) => {
      if (user.id === data.me.id) {
        user.privateRoom[`${data.user.id}`] = roomName;
        updatedUser = user;
      }
      if (user.id === data.user.id) {
        user.privateRoom[`${data.me.id}`] = roomName;
      }
    });
    io.sockets.sockets.get(data.me.id).join(roomName);
    io.sockets.sockets.get(data.user.id).join(roomName);
    io.to(roomName).emit("recive_private_message", {
      ...genratemessage({
        name: data.me.name,
        message: `hii i am ${data.me.name}.`,
        id: data.me.id,
        privateRoom: roomName,
      }),
      user: updatedUser,
    });
    socket.broadcast.to(roomName).emit("room", {
      updatedUser,
    });
    callback();
  });

  socket.on("send_Files", (data, callback) => {
    const user = getUser(socket.id);
    const fileDetails = [];
    data.files.forEach((file) => {
      const filedata = {
        file: Buffer.from(file.file).toString("base64"),
        type: file.type,
        name: file.name,
      };
      fileDetails.push(filedata);
    });
    // io.to(user.room).emit(
    //   !data.isPrivate ? "recive_message" : "recive_private_message",
    //   genratemessage({ name: user.name, files: fileDetails, id: user.id })
    // );
    if (data.privateRoom) {
      io.to(data.privateRoom).emit("recive_private_message", {
        ...genratemessage({
          name: user.name,
          files: fileDetails,
          id: user.id,
          privateRoom: data.privateRoom,
        }),
        user,
      });
    } else {
      io.to(user.room).emit(
        "recive_message",
        genratemessage({ name: user.name, files: fileDetails, id: user.id })
      );
    }
    callback();
  });

  // Leave room or refreash the page
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "recive_message",
        genratemessage({
          name: "Admin",
          message: `${user.name} has left.`,
          id: ADMIN_ID,
        })
      );
      io.to(user.room).emit("room", {
        room: user.room,
        // usersInRoom: getUsersInRoom(user.room),
        // userRemoved: true,
        removedUser: user,
      });
    }
  });
});
