import { Router } from 'express'
import { subscriptionController } from './payment.controller.js'
import { verifyFBToken } from '../../middleware/verifyFBToken.js'

const router = Router()

router.post('/checkout',  subscriptionController.createCheckOutSession)
router.post('/webhook', subscriptionController.webhookController)
router.get('/status', verifyFBToken, subscriptionController.getSubscriptionStatus)

export const subscriptionRouter = router
