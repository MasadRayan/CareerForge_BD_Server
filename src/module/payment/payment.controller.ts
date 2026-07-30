import { Request, Response, NextFunction } from 'express'
import { subscriptionService } from './payment.service.js'
import sendResponse from '../../utils/sendResponse.js'

const createCheckOutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = "c947ba44-e4d6-45ea-9fa4-2092508e2dbc"
    const result = await subscriptionService.createCheckOutSession(userId)
    sendResponse(res, 200, true, 'Checkout session created successfully', result)
  } catch (error) {
    next(error)
  }
}

const webhookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body as Buffer
    const signature = req.headers['stripe-signature'] as string
    await subscriptionService.webhookService(payload, signature)
    sendResponse(res, 200, true, 'Webhook processed successfully')
  } catch (error) {
    next(error)
  }
}

const getSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const result = await subscriptionService.getSubscriptionStatus(userId)
    sendResponse(res, 200, true, 'Subscription status retrieved successfully', result)
  } catch (error) {
    next(error)
  }
}

const getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const result = await subscriptionService.getPaymentHistory(userId)
    sendResponse(res, 200, true, 'Payment history retrieved successfully', result)
  } catch (error) {
    next(error)
  }
}

export const subscriptionController = {
  createCheckOutSession,
  webhookController,
  getSubscriptionStatus,
  getPaymentHistory,
}
