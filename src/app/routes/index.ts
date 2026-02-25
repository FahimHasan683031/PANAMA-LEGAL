import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { LibraryCategoryRoutes } from '../modules/libraryCategory/libraryCategory.route';
import { ArticleCategoryRoutes } from '../modules/articleCategory/articleCategory.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { PublicRoutes } from '../modules/public/public.route';
import { TokenRoutes } from '../modules/token/token.route';
import { SubscriptionRoutes } from '../modules/subscription/subscription.route';
import { ChatbotRoutes } from '../modules/chatbot/chatbot.routes';
import { CaseRoutes } from '../modules/case/case.routes';
import { CaseMessageRoutes } from '../modules/caseMessage/caseMessage.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { LibraryRoutes } from '../modules/library/library.route';
import { ArticleRoutes } from '../modules/article/article.route';


const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/library-category", route: LibraryCategoryRoutes },
    { path: "/article-category", route: ArticleCategoryRoutes },
    { path: "/review", route: ReviewRoutes },
    { path: "/public", route: PublicRoutes },
    { path: "/token", route: TokenRoutes },
    { path: "/subscription", route: SubscriptionRoutes },
    { path: "/chatbot", route: ChatbotRoutes },
    { path: "/case", route: CaseRoutes },
    { path: "/case-message", route: CaseMessageRoutes },
    { path: "/notification", route: NotificationRoutes },
    { path: "/library", route: LibraryRoutes },
    { path: "/article", route: ArticleRoutes },
]



apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;
