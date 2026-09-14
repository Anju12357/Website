require("dotenv").config();

const fastify = require("fastify")({
  logger: true,
});

const fastifyCors =
  require("@fastify/cors");

const multipart =
  require("@fastify/multipart");

const fastifyCookie =
  require("@fastify/cookie");

const fastifyStatic =
  require("@fastify/static");

const path =
  require("path");

const fs =
  require("fs");
const userSkillRoutes = require("./routes/userSkills");

// ======================================================
// ROUTES
// ======================================================

const authRoutes =
  require("./routes/auth");

const userRoutes =
  require("./routes/users");

const dashboardRoutes =
  require("./routes/dashboard");

const performanceRoutes =
  require("./routes/performance");

const adminNotesRoutes =
  require("./routes/adminNotes");

const auditLogsRoutes =
  require("./routes/auditLogs");

const notificationRoutes =
  require("./routes/notifications");

const meetingRoutes =
  require("./routes/meetings");

const mailRoutes =
  require("./routes/mail");


// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5175",
  "http://localhost:5173",
  "http://192.168.1.16:3000",
  "http://localhost:5174",
  "http://localhost:3001",
  "https://employee-management-system-alpha-flax.vercel.app",
];

fastify.register(
  fastifyCors,
  {
    origin: function (
      origin,
      callback
    ) {
      if (
        !origin ||
        allowedOrigins.includes(
          origin
        )
      ) {
        callback(
          null,
          true
        );
      } else {
        callback(
          new Error(
            "Not allowed by CORS"
          ),
          false
        );
      }
    },

    credentials: true,

    methods: [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "OPTIONS",
    ],
  }
);


// ======================================================
// COOKIE
// ======================================================

fastify.register(
  fastifyCookie,
  {
    secret:
      process.env.COOKIE_SECRET ||
      "supersecret",

    parseOptions: {},
  }
);


// ======================================================
// FORM BODY
// ======================================================

fastify.register(
  require("@fastify/formbody")
);


// ======================================================
// MULTIPART
// ======================================================

fastify.register(
  multipart,
  {
    attachFieldsToBody: true,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  }
);


// ======================================================
// UPLOAD FOLDER
// ======================================================

const uploadsPath =
  path.join(
    __dirname,
    "uploads"
  );


// Create uploads folder
// automatically if it doesn't exist
if (
  !fs.existsSync(
    uploadsPath
  )
) {
  fs.mkdirSync(
    uploadsPath,
    {
      recursive: true,
    }
  );
}


// Create profile folder
const profilePath =
  path.join(
    uploadsPath,
    "profile"
  );

if (
  !fs.existsSync(
    profilePath
  )
) {
  fs.mkdirSync(
    profilePath,
    {
      recursive: true,
    }
  );
}


// Create cover folder
const coverPath =
  path.join(
    uploadsPath,
    "cover"
  );

if (
  !fs.existsSync(
    coverPath
  )
) {
  fs.mkdirSync(
    coverPath,
    {
      recursive: true,
    }
  );
}


// ======================================================
// STATIC UPLOAD FILES
// ======================================================

fastify.register(
  fastifyStatic,
  {
    root: uploadsPath,

    prefix: "/uploads/",
  }
);


// ======================================================
// APP ROUTE
// ======================================================

fastify.get(
  "/app/*",
  function (
    req,
    reply
  ) {
    reply.sendFile(
      "index.html"
    );
  }
);


// ======================================================
// REGISTER ROUTES
// ======================================================

adminNotesRoutes.forEach(
  (route) => {
    fastify.route(route);
  }
);


authRoutes.forEach(
  (route) => {
    fastify.route(route);
  }
);


userRoutes.forEach((route) => {
  fastify.route(route);
});

userSkillRoutes.forEach((route) => {
  fastify.route(route);
});

dashboardRoutes.forEach((route) => {
  fastify.route(route);
});



performanceRoutes.forEach(
  (route) => {
    fastify.route(route);
  }
);


auditLogsRoutes.forEach(
  (route) => {
    fastify.route(route);
  }
);


notificationRoutes.forEach(
  (route) => {
    fastify.route(route);
  }
);


meetingRoutes.forEach(
  (route) => {
    fastify.route(route);
  }
);


mailRoutes.forEach(
  (route) => {
    fastify.route(route);
  }
);


// ======================================================
// PORT
// ======================================================

const PORT =
  process.env.PORT ||
  4000;


// ======================================================
// START SERVER
// ======================================================

fastify.listen(
  {
    port: PORT,
    host: "0.0.0.0",
  },

  (err, address) => {

    if (err) {
      console.error(err);

      process.exit(1);
    }

    console.log(
      `Server is running on ${address}`
    );

    console.log(
      `Uploads available at: http://localhost:${PORT}/uploads/`
    );

  }
);