import express from "express";
import { USER_ROLES } from "../../../enum/user";
import auth from "../../middleware/auth";
import { fileAndBodyProcessorUsingDiskStorage } from "../../middleware/processReqBody";
import validateRequest from "../../middleware/validateRequest";
import { LibraryControllers } from "./library.controller";
import { LibraryValidations } from "./library.validation";

const router = express.Router();

router.post(
    "/",
    auth(USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(LibraryValidations.createLibraryZodSchema),
    LibraryControllers.createLibrary
);

router.get("/", LibraryControllers.getAllLibraries);

router.get("/:id", LibraryControllers.getSingleLibrary);

router.patch(
    "/:id",
    auth(USER_ROLES.ADMIN),
    fileAndBodyProcessorUsingDiskStorage(),
    validateRequest(LibraryValidations.updateLibraryZodSchema),
    LibraryControllers.updateLibrary
);

router.delete("/:id", auth(USER_ROLES.ADMIN), LibraryControllers.deleteLibrary);

export const LibraryRoutes = router;
