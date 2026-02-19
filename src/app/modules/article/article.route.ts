import express from "express";
import { USER_ROLES } from "../../../enum/user";
import auth from "../../middleware/auth";
import { fileAndBodyProcessorUsingDiskStorage } from "../../middleware/processReqBody";
import validateRequest from "../../middleware/validateRequest";
import { ArticleControllers } from "./article.controller";
import { ArticleValidations } from "./article.validation";

const router = express.Router();

router.post(
    "/",
    auth(USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(ArticleValidations.createArticleZodSchema),
    ArticleControllers.createArticle
);

router.get("/", ArticleControllers.getAllArticles);

router.get("/:id", ArticleControllers.getSingleArticle);

router.patch(
    "/:id",
    auth(USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(ArticleValidations.updateArticleZodSchema),
    ArticleControllers.updateArticle
);

router.delete("/:id", auth(USER_ROLES.ADMIN), ArticleControllers.deleteArticle);

export const ArticleRoutes = router;
