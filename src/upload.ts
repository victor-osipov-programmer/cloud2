import multer from 'multer'
import fs from 'fs/promises'
import { User } from './db/entities';
import path from 'path'
const path_to_files = process.env.FILES

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const user: User = req.user;

        try {
            await fs.access(path.join(path_to_files, String(user.id)))
        } catch {
            await fs.mkdir(path.join(path_to_files, String(user.id)))
        }
        
        cb(null, path.join(path_to_files, String(user.id)))
    },
    filename: async function (req, file, cb) {
        const user: User = req.user;
        let number = 1;
        let file_name = file.originalname;

        while (true) {
            try {
                await fs.access(path.join(path_to_files, String(user.id), file_name), fs.constants.F_OK);

                const index = file.originalname.lastIndexOf('.');
                const name = file.originalname.slice(0, index)
                const type = file.originalname.slice(index + 1);

                file_name = `${name} (${number++}).${type}`;
            } catch (err) {
                cb(null, file_name)
                break;
            }
        }
    }
})

export const upload = multer({ storage })