import express from 'express'
import * as controllers from './controllers'
import { auth } from './middlewares'
const router = express.Router()

router.post('/authorization', controllers.authorization)
router.post('/registration', controllers.registration)

export default router;