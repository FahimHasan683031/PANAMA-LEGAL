import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ILibrary } from "./library.interface";
import { LibraryModel } from "./library.model";
import QueryBuilder from "../../builder/QueryBuilder";

const createLibrary = async (payload: ILibrary) => {
    const result = await LibraryModel.create(payload);
    return result;
};

const getAllLibraries = async (query: Record<string, unknown>) => {
    const libraryQuery = new QueryBuilder(LibraryModel.find().populate('category'), query)
        .search(['title', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await libraryQuery.modelQuery;
    const meta = await libraryQuery.getPaginationInfo();

    return {
        meta,
        result,
    };
};

const getSingleLibrary = async (id: string) => {
    const result = await LibraryModel.findById(id).populate('category');
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Library item not found");
    }
    return result;
};

const updateLibrary = async (id: string, payload: Partial<ILibrary>) => {
    const isExist = await LibraryModel.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Library item not found");
    }

    const result = await LibraryModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteLibrary = async (id: string) => {
    const isExist = await LibraryModel.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Library item not found");
    }

    const result = await LibraryModel.findByIdAndDelete(id);
    return result;
};

export const LibraryServices = {
    createLibrary,
    getAllLibraries,
    getSingleLibrary,
    updateLibrary,
    deleteLibrary,
};
