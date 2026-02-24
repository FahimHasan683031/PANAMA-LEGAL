import express from "express";
import { SubscriptionController } from "./subscription.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enum/user";
const router = express.Router();

router.get("/",
    auth(USER_ROLES.ADMIN),
    SubscriptionController.subscriptions
);

router.get("/my-plan",
    auth(USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT, USER_ROLES.STUDENT),
    SubscriptionController.subscriptionDetails
);

router.post("/verify-purchase",
    auth(USER_ROLES.CITIZEN, USER_ROLES.LAWYER, USER_ROLES.EXPERT),
    SubscriptionController.verifyPurchase
);

export const SubscriptionRoutes = router;