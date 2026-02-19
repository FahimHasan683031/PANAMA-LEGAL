import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IArticle } from "./article.interface";
import { ArticleModel } from "./article.model";
import QueryBuilder from "../../builder/QueryBuilder";

const createArticle = async (payload: IArticle) => {
    const result = await ArticleModel.create(payload);
    return result;
};

const getAllArticles = async (query: Record<string, unknown>) => {
    const articleQuery = new QueryBuilder(ArticleModel.find().populate('category'), query)
        .search(['title', 'description'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await articleQuery.modelQuery;
    const meta = await articleQuery.getPaginationInfo();

    return {
        meta,
        result,
    };
};

const getSingleArticle = async (id: string) => {
    const result = await ArticleModel.findById(id).populate('category');
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Article not found");
    }
    return result;
};

const updateArticle = async (id: string, payload: Partial<IArticle>) => {
    const isExist = await ArticleModel.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Article not found");
    }

    const result = await ArticleModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteArticle = async (id: string) => {
    const isExist = await ArticleModel.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Article not found");
    }

    const result = await ArticleModel.findByIdAndDelete(id);
    return result;
};

export const ArticleServices = {
    createArticle,
    getAllArticles,
    getSingleArticle,
    updateArticle,
    deleteArticle,
};
