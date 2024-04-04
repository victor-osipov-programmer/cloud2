import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Relation, Unique, PrimaryColumn, BeforeInsert } from "typeorm"
import { randomString } from "../utils"

@Entity('users')
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    first_name: string

    @Column()
    last_name: string

    @Column({
        default: null
    })
    token: string

    @ManyToOne(() => Role, role => role.users)
    role: Relation<Role>

    @Column()
    email: string

    @Column()
    password: string

    @OneToMany(() => DBFile, dbfile => dbfile.user)
    files: Relation<DBFile[]>
}

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => User, user => user.role)
    users: Relation<User[]>
}

@Entity('files')
export class DBFile {
    @PrimaryColumn({
        name: 'file_id',
        length: 10
    })
    id: string

    @Column()
    url: string

    @Column()
    name: string

    @ManyToOne(() => User, user => user.files)
    user: Relation<User>
}