const {
  fetchUserSkills,
  createUserSkill,
  removeUserSkill,
} = require("../controllers/userSkills");

const userSkillRoutes = [

  // GET SKILLS
  {
    method: "POST",
    url: "/webservices/users/get-skills",
    handler: fetchUserSkills,
  },

  // ADD SKILL
  {
    method: "POST",
    url: "/webservices/users/add-skill",
    handler: createUserSkill,
  },

  // DELETE SKILL
  {
    method: "POST",
    url: "/webservices/users/delete-skill",
    handler: removeUserSkill,
  },

];

module.exports = userSkillRoutes;