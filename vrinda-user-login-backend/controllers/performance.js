const Performance = require("../models/performance");

const getPerformance = async (req, reply) => {
  try {
    const data = await Performance.getPerformance();

    reply.send({
      status: 1,
      message: "Performance fetched successfully",
      data,
    });
  } catch (error) {
    console.log(error);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

module.exports = {
  getPerformance,
};