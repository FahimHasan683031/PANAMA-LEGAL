import express from "express";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enum/user";
import { fileAndBodyProcessorUsingDiskStorage } from "../../middleware/processReqBody";
import validateRequest from "../../middleware/validateRequest";
import { LibraryCategoryController } from "./libraryCategory.controller";
import { LibraryCategoryValidations } from "./libraryCategory.validation";

const router = express.Router();

router.post(
    "/",
    auth(USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(LibraryCategoryValidations.libraryCategoryValidation),
    LibraryCategoryController.createLibraryCategory
);

router.get("/", LibraryCategoryController.getAllLibraryCategories);

router.patch(
    "/:id",
    auth(USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(LibraryCategoryValidations.updateLibraryCategoryValidation),
    LibraryCategoryController.updateLibraryCategory
);

router.delete(
    "/:id",
    auth(USER_ROLES.ADMIN),
    LibraryCategoryController.deleteLibraryCategory
);

export const LibraryCategoryRoutes = router;
