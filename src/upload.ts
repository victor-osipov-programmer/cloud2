import multer from 'multer'
import fs from 'fs/promises'
const path_to_files = process.env.FILES + '/'

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        cb(null, path_to_files)
    },
    filename: async function (req, file, cb) {
        let number = 1;
        let file_name = file.originalname;

        while (true) {
            try {
                await fs.access(path_to_files + file_name, fs.constants.F_OK);

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