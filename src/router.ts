import express from 'express'
import * as controllers from './controllers'
import { auth } from './middlewares'
import { upload } from './upload'
const router = express.Router()

router.post('/authorization', controllers.authorization)
router.post('/registration', controllers.registration)
router.get('/logout', auth([]), controllers.logout)
router.post('/files', auth([]), upload.array('files'), controllers.files)

export default router;