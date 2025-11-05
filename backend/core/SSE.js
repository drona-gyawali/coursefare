class SSE {
  static clients = new Map();

  static addClients(userId, res) {
    try {
      console.log("User connected to SSE:", userId);
      this.clients.set(userId, res);
      res.on("close", () => this.clients.delete(userId));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static SendtoUser(userId, data) {
    try {
      const user = this.clients.get(userId);
      console.log(user);
      if (user) {
        user.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default SSE;
