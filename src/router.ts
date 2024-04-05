import express from 'express'
import * as controllers from './controllers'
import { auth } from './middlewares'
import { upload } from './upload'
const router = express.Router()

router.post('/authorization', controllers.authorization)
router.post('/registration', controllers.registration)
router.get('/logout', auth([]), controllers.logout)
router.post('/files', auth([]), upload.array('files'), controllers.files)
router.patch('/files/:file_id', auth([]), controllers.editFile)
router.delete('/files/:file_id', auth([]), controllers.deleteFile)
router.get('/files/:file_id', auth([]), controllers.downloadFile)
router.post('/files/:file_id/accesses', auth([]), controllers.addAccess)
router.delete('/files/:file_id/accesses', auth([]), controllers.deleteAccess)

export default router;