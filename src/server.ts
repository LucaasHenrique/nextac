import fastify from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    jsonSchemaTransform,
    type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import { authRoutes } from "@/routes/auth.routes.js";
import questionsRoutes from "@/routes/questions.route.js";
import notesRoutes from "@/routes/notes.routes.js";
import userRoutes from "@/routes/user.routes.js";
import reviewSessionRoutes from "@/routes/review.session.routes.js";
import topicsRoutes from "@/routes/topics.routes.js";
import { reviewSessionQueue } from "@/queues/review.session.queue.js";

// Workers
import "@/workers/review.session.worker.js";

dotenv.config();
const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
});

app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || "super-secret-change-me",
});
app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "super-secret-change-me",
});

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "Fastify API",
            description: "A simple API built with Fastify and Zod",
            version: "1.0.0",
        },
    },
    transform: jsonSchemaTransform,
});

// Bull Board
const serverAdapter = new FastifyAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
    queues: [new BullMQAdapter(reviewSessionQueue)],
    serverAdapter,
});

app.register(serverAdapter.registerPlugin(), { prefix: "/admin/queues" });

/// ROUTES
app.register(authRoutes, { prefix: "/api/auth" });
app.register(questionsRoutes, { prefix: "/api/questions" });
app.register(notesRoutes, { prefix: "/api/notes" });
app.register(userRoutes, { prefix: "/api/users" });
app.register(reviewSessionRoutes, { prefix: "/api/review-sessions" });
app.register(topicsRoutes, { prefix: "/api/topics" });

app.get("/", () => {
    return "hello :)";
});

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
    console.log("Server running!");
});
