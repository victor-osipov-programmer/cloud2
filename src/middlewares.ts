import { GeneralError, ValidationError, LoginFailed } from './errors'
import { AppDataSource } from './db/data-source'
import { User } from './db/entities'
import jwt from 'jsonwebtoken'
const secret_key = process.env.SECRET_KEY

const userRepository = AppDataSource.getRepository(User)

export function auth(roles) {
    return async (req, res, next) => {
        try {
            const token = req.get('Authorization')?.split(' ')[1]
            if (!token) {
                return next(new LoginFailed())
            }

            const paylod = jwt.verify(token, secret_key)
            const user = await userRepository.findOne({
                where: {
                    id: paylod.user_id,
                    token
                },
                relations: {
                    role: true
                }
            })
            if (!user || (!roles.includes(user.role.name) && roles.length !== 0)) {
                return next(new LoginFailed())
            }

            req.user = user;
            next()
        } catch (err) {
            return next(new LoginFailed())
        }
    }
}

export async function handleErrors(err, req, res, next) {
    if (err instanceof ValidationError) {
        return res.status(err.status).json({
            success: false,
            message: err.errors
        })
    }
    
    if (err instanceof GeneralError) {
        return res.status(err.status).json({
            message: err.message
        })
    }

    res.status(500).json({
        message: err.message
    })
}