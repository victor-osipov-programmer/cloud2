import { LoginFailed, Validator } from "./errors"
import { AppDataSource } from "./db/data-source";
import { User } from "./db/entities";
import jwt from 'jsonwebtoken'
const secret_key = process.env.SECRET_KEY

const userRepository = AppDataSource.getRepository(User)

export async function authorization(req, res, next) {
    const body = req.body;
    const { email, password } = body;
    
    const  { validate, reportError } = new Validator(body);
    validate('email', 'required')
    validate('password', 'required')
    if (reportError(next)) return

    const user = await userRepository.findOneBy({
        email,
        password
    })
    if (!user) {
        return next(new LoginFailed())
    }

    const new_token = jwt.sign({ user_id: user.id }, secret_key)
    user.token = new_token;

    try {
        await userRepository.save(user)
    } catch (err) {
        return next(err)
    }

    res.json({
        success: true,
        message: 'Success',
        token: new_token
    })
}

export async function registration(req, res, next) {
    const body = req.body;
    const { email, password, first_name, last_name } = body;
    
    const  { validate, reportError } = new Validator(body);
    validate('email', 'required')
    validate('password', 'required')
    validate('password', 'min', 3)
    validate('password', 'password')
    validate('first_name', 'required')
    validate('last_name', 'required')
    if (reportError(next)) return

    const user = new User()
    user.email = email
    user.password = password;
    user.first_name = first_name
    user.last_name = last_name

    try {
        await userRepository.save(user)
    } catch (err) {
        return next(err)
    }

    const new_token = jwt.sign({ user_id: user.id }, secret_key)
    user.token = new_token

    try {
        await userRepository.save(user)
    } catch (err) {
        return next(err)
    }

    res.json({
        success: true,
        message: 'Success',
        token: new_token
    })
}