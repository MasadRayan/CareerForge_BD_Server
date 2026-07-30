import { Router } from 'express'
import { analyticsController } from './analytics.controller.js'
import { verifyFBToken } from '../../middleware/verifyFBToken.js'
import { verifyAdmin } from '../../middleware/verifyAdmin.js'

const router = Router()

router.get('/status', verifyFBToken, analyticsController.getUserStatus)
router.get('/admin', verifyFBToken, verifyAdmin, analyticsController.getAdminAnalytics)

export const analyticsRouter = router
