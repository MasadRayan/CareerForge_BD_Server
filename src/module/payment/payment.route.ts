import { Router } from 'express'
import { subscriptionController } from './payment.controller.js'
import { verifyFBToken } from '../../middleware/verifyFBToken.js'
import { verifyAdmin } from '../../middleware/verifyAdmin.js'

const router = Router()

router.post('/checkout',  subscriptionController.createCheckOutSession)
router.post('/webhook', subscriptionController.webhookController)
router.get('/status', verifyFBToken, subscriptionController.getSubscriptionStatus)
router.get('/history', verifyFBToken, subscriptionController.getPaymentHistory)
router.get('/all-payments', verifyFBToken, verifyAdmin, subscriptionController.getAllPayments)

export const subscriptionRouter = router
