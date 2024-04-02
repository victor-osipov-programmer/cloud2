import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import router from './router'
import { AppDataSource } from './db/data-source'
import { handleErrors } from './middlewares'
import { getRoles } from './db/init'

AppDataSource.initialize()
.then(() => {
    getRoles()
    console.log('AppDataSource.initialize()')
})

const app = express()
app.use(cors())
app.use(express.json())
app.use('/', router)
app.use(handleErrors)

app.listen(process.env.PORT, () => console.log('Server started'))
