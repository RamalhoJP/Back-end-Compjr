import mongoose from '@/database';
import bcrypt from 'bcryptjs';

//Schema do banco de dados. Um usuario possui um nome opcional, email e senha

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowecase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetTokenExpiration: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

//realiza antes de mandar pro banco de dados

UserSchema.pre('save', function(next) {
  bcrypt
    .hash(this.password, 10)
    .then(hash => {
      this.password = hash;
      next(); //continua e salva no banco de dados
  })
  .catch(error => {
    console.error('Error hashing password', error);
  });
});
//antes de salvar no banco de dados a senha sera criptografada

export default mongoose.model('User', UserSchema);