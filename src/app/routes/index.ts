import express from 'express';
import handleStripeWebhook from '../../stripe/handleStripeWebhook';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { LibraryCategoryRoutes } from '../modules/libraryCategory/libraryCategory.route';
import { ArticleCategoryRoutes } from '../modules/articleCategory/articleCategory.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { PublicRoutes } from '../modules/public/public.route';
import { TokenRoutes } from '../modules/token/token.route';
import { PlanRoutes } from '../modules/plan/plan.route';
import { SubscriptionRoutes } from '../modules/subscription/subscription.route';
import { ChatRoutes } from '../modules/chat/chat.routes';
import { CaseRoutes } from '../modules/case/case.routes';
import { MessageRoutes } from '../modules/message/message.routes';
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
    { path: "/payment", route: PaymentRoutes },
    { path: "/public", route: PublicRoutes },
    { path: "/token", route: TokenRoutes },
    { path: "/plan", route: PlanRoutes },
    { path: "/subscription", route: SubscriptionRoutes },
    { path: "/chat", route: ChatRoutes },
    { path: "/case", route: CaseRoutes },
    { path: "/message", route: MessageRoutes },
    { path: "/notification", route: NotificationRoutes },
    { path: "/library", route: LibraryRoutes },
    { path: "/article", route: ArticleRoutes },
]

router.post('/webhook', handleStripeWebhook);

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;
