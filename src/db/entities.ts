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

    @ManyToMany(() => DBFile, dbfile => dbfile.coauthors)
    @JoinTable({
        name: 'coauthors',
        joinColumn: {
            name: 'user_id'
        },
        inverseJoinColumn: {
            name: 'file_id'
        }
    })
    shared_files: Relation<DBFile[]>

    @OneToMany(() => DBFile, dbfile => dbfile.author)
    author_files: Relation<DBFile[]>
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

    @ManyToMany(() => User, user => user.shared_files)
    coauthors: Relation<User[]>

    @ManyToOne(() => User, user => user.author_files)
    @JoinColumn({ name: 'user_id_author' })
    author: Relation<User>
}
