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

app.get("/", () => {
    return "hello :)";
});

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
    console.log("Server running!");
});
