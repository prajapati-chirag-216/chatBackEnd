const genratemessage = (data) => {
  return {
    id: data.id,
    name: data.name,
    message: data.message || null,
    files: data.files || null,
    url: data.url || null,
    privateRoom: data.privateRoom || null,
    createdAt: new Date().getTime(),
    uploadedId: data.uploadedId || null,
  };
};

module.exports = {
  genratemessage,
};
