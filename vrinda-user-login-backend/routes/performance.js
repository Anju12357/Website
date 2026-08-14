const { getPerformance } = require("../controllers/performance");

const performanceRoutes = [
  {
    method: "GET",
    url: "/dashboard/performance",
    handler: getPerformance,
  },
];

module.exports = performanceRoutes;