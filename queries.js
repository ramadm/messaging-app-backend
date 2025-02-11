const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");

const prisma = new PrismaClient().$extends(withAccelerate());

async function createUser(username, password) {
    await prisma.user.create({
        data: {
            username: username,
            password: password,
        },
    });
}

async function getUserByUsername(username) {
    return await prisma.user.findUnique({
        where: {
            username: username,
        },
    });
}

async function main() {
    await prisma.user.create({
        data: {
            username: "Alice",
            email: "alice@prisma.io",
            messages: {
                create: { content: "Hello World" },
            },
            profile: {
                create: { bio: "I like turtles" },
            },
        },
    });

    const allUsers = await prisma.user.findMany({
        include: {
            messages: true,
            profile: true,
        },
    });
    console.dir(allUsers, { depth: null });
}

/*main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });*/

module.exports = { createUser, getUserByUsername };
