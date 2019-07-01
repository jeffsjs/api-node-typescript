import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'
import { validateCPF } from '../common/validators'
import { environment } from '../common/environment'

export interface User extends mongoose.Document {
  name: string
  email: string
  password: string
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 80,
    minlength: 3
  },
  email: {
    type: String,
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    unique: true,
    required: true
  },
  password: {
    type: String,
    select: false,
    required: true
  },
  gender: {
    type: String,
    required: false,
    enum: ['Male', 'Female']
  },
  cpf: {
    type: String,
    required: false,
    validate: {
      validator: validateCPF,
      message: '{PATH} Invalid CPF ({VALUE})'
    }
  }
})

const hasPassword = (obj, next) => {
  bcrypt
    .hash(obj.password, environment.secutiry.saltRounds)
    .then(hash => {
      obj.password = hash
      next()
    })
    .catch(next)
}

const saveMiddleware = function(this: User, next) {
  const user: User = this
  if (!user.isModified('password')) {
    next()
  } else {
    hasPassword(user, next)
  }
}

const updateMiddleware = function(next) {
  if (!this.getUpdate().password) {
    next()
  } else {
    hasPassword(this.getUpdate(), next)
  }
}


userSchema.pre('save', saveMiddleware)
userSchema.pre('findOneAndUpdate', updateMiddleware)
userSchema.pre('update', updateMiddleware)

export const User = mongoose.model<User>('User', userSchema)
