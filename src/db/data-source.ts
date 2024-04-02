import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Role, User } from './entities'

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "cloud2",
    synchronize: true,
    logging: false,
    entities: [ User, Role ],
    subscribers: [],
    migrations: [],
})