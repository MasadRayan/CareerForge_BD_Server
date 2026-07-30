import { prisma } from "../lib/prisma";
import sendResponse from "../utils/sendResponse";
export const verifyAdmin = async (req, res, next) => {
    const email = req.decoded?.email;
    if (!email) {
        sendResponse(res, 401, false, "Unauthorized Access");
        return;
    }
    const user = await prisma.users.findUnique({
        where: {
            email,
        },
    });
    if (user?.role !== "admin") {
        sendResponse(res, 401, false, "Unauthorized Access");
        return;
    }
    next();
};
//# sourceMappingURL=verifyAdmin.js.map