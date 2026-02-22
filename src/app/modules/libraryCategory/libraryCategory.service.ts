import QueryBuilder from "../../builder/QueryBuilder";
import { ILibraryCategory } from "./libraryCategory.interface";
import { LibraryCategory } from "./libraryCategory.model";

const createLibraryCategory = async (payload: ILibraryCategory) => {
    const result = await LibraryCategory.create(payload);
    return result;
};

const getAllLibraryCategories = async (query: Record<string, unknown>) => {
    const libraryCategoryQueryBuilder = new QueryBuilder(LibraryCategory.find({ isActive: true }), query)
        .filter()
        .search(['title', 'description'])
        .sort()
        .fields()
        .paginate();

    const categories = await libraryCategoryQueryBuilder.modelQuery;
    const meta = await libraryCategoryQueryBuilder.getPaginationInfo();

    return {
        meta,
        categories,
    };
};

const updateLibraryCategory = async (id: string, payload: Partial<ILibraryCategory>) => {
    const result = await LibraryCategory.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
};

const deleteLibraryCategory = async (id: string) => {
    const result = await LibraryCategory.findByIdAndDelete(id);
    return result;
};

export const LibraryCategoryServices = {
    createLibraryCategory,
    getAllLibraryCategories,
    updateLibraryCategory,
    deleteLibraryCategory,
};
