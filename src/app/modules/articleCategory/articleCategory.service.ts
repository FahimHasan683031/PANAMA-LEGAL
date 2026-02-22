import QueryBuilder from "../../builder/QueryBuilder";
import { IArticleCategory } from "./articleCategory.interface";
import { ArticleCategory } from "./articleCategory.model";

const createArticleCategory = async (payload: IArticleCategory) => {
    const result = await ArticleCategory.create(payload);
    return result;
};

const getAllArticleCategories = async (query: Record<string, unknown>) => {
    const articleCategoryQueryBuilder = new QueryBuilder(ArticleCategory.find({ isActive: true }), query)
        .filter()
        .search(['title'])
        .sort()
        .fields()
        .paginate();

    const categories = await articleCategoryQueryBuilder.modelQuery;
    const meta = await articleCategoryQueryBuilder.getPaginationInfo();

    return {
        meta,
        categories,
    };
};

const deleteArticleCategory = async (id: string) => {
    const result = await ArticleCategory.findByIdAndDelete(id);
    return result;
};

export const ArticleCategoryServices = {
    createArticleCategory,
    getAllArticleCategories,
    deleteArticleCategory,
};
