import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, Relation } from "typeorm"

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    fist_name: string

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