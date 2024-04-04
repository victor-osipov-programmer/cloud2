import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Relation, Unique, PrimaryColumn, BeforeInsert, ManyToMany, JoinTable, JoinColumn } from "typeorm"

@Entity('users')
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn({ name: 'user_id' })
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
    @JoinColumn({ name: 'role_id' })
    role: Relation<Role>

    @Column()
    email: string

    @Column()
    password: string

    @ManyToMany(() => DBFile, dbfile => dbfile.users)
    @JoinTable({
        name: 'user_id_file_id',
        joinColumn: {
            name: 'user_id'
        },
        inverseJoinColumn: {
            name: 'file_id'
        }
    })
    files: Relation<DBFile[]>

    @OneToMany(() => DBFile, dbfile => dbfile.author)
    files_author: Relation<DBFile[]>
}

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn({ name: 'role_id' })
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

    @ManyToMany(() => User, user => user.files)
    users: Relation<User[]>

    @ManyToOne(() => User, user => user.files_author)
    @JoinColumn({ name: 'user_id_author' })
    author: Relation<User>
}
