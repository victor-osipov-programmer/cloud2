import { FileNameIsOccupied, ForbiddenForYou, LoginFailed, NotFound, Validator } from "./errors"
import { AppDataSource } from "./db/data-source";
import { DBFile, User } from "./db/entities";
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import { randomString } from "./utils";
import path from 'path'
const secret_key = process.env.SECRET_KEY


const userRepository = AppDataSource.getRepository(User)
const fileRepository = AppDataSource.getRepository(DBFile)

async function fileAccess(file, user) {
    if (!file) {
        throw new NotFound()
    }
    if (file.author.id !== user.id) {
        throw new ForbiddenForYou()
    }
    try {
        await fs.access(`${process.env.FILES}/${file.name}`, fs.constants.F_OK)
    } catch (err) {
        throw new NotFound()
    }
}

function getOwners(file: DBFile) {
    const res = []

    const getData = (user: User, type) => {
        return {
            fullname: user.first_name + ' ' + user.last_name,
            email: user.email,
            type
        }
    }

    res.push(getData(file.author, 'author'))
    res.push(...file.users.map(user => getData(user, 'co-author')))
    
    return res;
}

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

export async function logout(req, res, next) {
    const user: User = req.user;
    user.token = null;

    try {
        await userRepository.save(user)
    } catch (err) {
        return next(err)
    }

    res.json({
        success: true,
        message: "Logout"
    })
}

interface IFile {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: string,
    filename: string, // '1 кролл.jpg' 
    path: string, // 'uploads\\1 кролл.jpg'
    size: number // 1855491 byte
}
export async function files(req, res, next) {
    const user: User = req.user;
    let files: IFile[] = req.files
    
    const promises = files.map(async (file) => new Promise(async (resolve) => {
        const mb = file.size / 1024 / 1024
        const type = file.filename.slice(file.filename.lastIndexOf('.') + 1)

        if (mb > 2 || !['doc', 'pdf', 'docx', 'zip', 'jpeg', 'jpg', 'png'].includes(type)) {
            await fs.rm(file.path)

            return resolve({
                success: false,
                message: 'File not loaded',
                name: file.filename
            })
        }

        const new_file = new DBFile()
        const file_id = randomString(10)
        const url = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${process.env.FILES}/${file_id}`

        new_file.id = file_id;
        new_file.url = url;
        new_file.name = file.filename;
        new_file.author = user;

        try {
            await fileRepository.save(new_file)
        } catch (err) {
            return next(err)
        }

        resolve({
            success: true,
            message: 'Success',
            name: file.filename,
            url: url,
            file_id: file_id
        })
    }))

    res.json(await Promise.all(promises))
}

export async function editFile(req, res, next) {
    const user: User = req.user;
    const body = req.body;
    const { name } = body;
    
    const  { validate, reportError } = new Validator(body);
    validate('name', 'required')
    validate('name', 'not_empty')
    if (reportError(next)) return

    const file = await fileRepository.findOne({
        where: {
            id: req.params.file_id
        },
        relations: {
            author: true
        }
    })

    try {
        await fileAccess(file, user)
    } catch (err) {
        return next(err)
    }

    try {
        await fs.access(`${process.env.FILES}/${name}`, fs.constants.F_OK)
        throw new FileNameIsOccupied()
    } catch (err) {
        if (err.errno == -4058) {

            await fs.rename(`${process.env.FILES}/${file.name}`, `${process.env.FILES}/${name}`)
            file.name = name
            await fileRepository.save(file)

        } else {
            return next(err)
        }
    }

    res.json({
        success: true,
        message: 'Renamed'
    })
}

export async function deleteFile(req, res, next) {
    const user: User = req.user;
    const file = await fileRepository.findOne({
        where: {
            id: req.params.file_id
        },
        relations: {
            author: true
        }
    })

    try {
        await fileAccess(file, user)
    } catch (err) {
        return next(err)
    }
    
    try {
        await fs.rm(`${process.env.FILES}/${file.name}`)
        await fileRepository.remove(file)
    } catch (err) {
        return next(err)
    }

    res.json({
        success: true,
        message: 'File already deleted'
    })
}

export async function downloadFile(req, res, next) {
    const user: User = req.user;
    const file = await fileRepository.findOne({
        where: {
            id: req.params.file_id
        },
        relations: {
            author: true
        }
    })

    try {
        await fileAccess(file, user)
    } catch (err) {
        return next(err)
    }

    res.sendFile(path.resolve(process.env.FILES, file.name))
}

export async function addAccess(req, res, next) {
    const user: User = req.user;
    const body = req.body;
    const { email } = body;
    
    const  { validate, reportError } = new Validator(body);
    validate('email', 'required')
    if (reportError(next)) return

    const file = await fileRepository.findOne({
        where: {
            id: req.params.file_id
        },
        relations: {
            author: true,
            users: true
        }
    })

    try {
        await fileAccess(file, user)
    } catch (err) {
        return next(err)
    }

    const coauthor = await userRepository.findOneBy({ email })
    if (!coauthor) {
        return next(new NotFound())
    }

    if (user.id == coauthor.id) {
        return next({ message: 'Вы и так владелец' })
    }
    if (file.users.some(owner_user => owner_user.id === coauthor.id )) {
        return next({ message: 'Уже был добавлен' })
    }

    file.users.push(coauthor)

    try {
        await fileRepository.save(file)
    } catch (err) {
        return next(err)
    }

    const owners = getOwners(file);

    res.json(owners)

}

