const {
  dashboardStats,
  notifications,
  activities,
  meetings,
  departmentChart,
  performance,
  report,
} = require("../controllers/dashboard");

const dashboardController = require("../controllers/dashboard");

module.exports = [
  {
    method: "GET",
    url: "/dashboard/stats",
    handler: dashboardController.getDashboardStats,
  },
  {
    method: "GET",
    url: "/dashboard/activities",
    handler: dashboardController.getActivities,
  },
  {
    method: "GET",
    url: "/dashboard/meetings",
    handler: dashboardController.getMeetings,
  },
  {
    method: "GET",
    url: "/dashboard/notifications",
    handler: dashboardController.getNotifications,
  },

 
{
  method: "GET",
  url: "/dashboard/department-chart",
  handler: dashboardController.getDepartmentChart,
},
{
  method: "GET",
  url: "/dashboard/report",
  handler: report,
},

];