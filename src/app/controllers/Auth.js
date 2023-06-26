import {Router} from 'express';
import bcrypt from 'bcryptjs';
import authConfig from '@/config/auth';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '@/app/schemas/User';

const router = new Router();

//funcao que gera tokens
const generateToken = params => {
	return jwt.sign(params, authConfig.secret, //secret, é a chave de criptografar, sequencia aleatoria que no caso eu so bati a mao no teclado
		{  
			expiresIn: 86400, //tempo de duraçao do token (1 dia)
		},
	);
}

router.post('/register', (req,res) => {
	const {email, name, password} = req.body;
	//encontra um usuario pelo email
	User.findOne({ email }) 
		.then(userData => {
			if(userData){
				return res.status(400).send({error: 'Usuario ja existe'});
			} else {
				User.create({ name, email, password })
					.then(user => {
						user.password = undefined; //nao retorna a senha por sergurança
						return res.send({user});
					})
					.catch(error => {
						console.error('Erro ao salvar usuario', err);
						return res.status(400).send({error: 'Falha ao registrar'});
					});
			}
		})
		.catch(error => {
			console.error('Erro ao consultar usuario no banco de dados', err);
			return res.status(500).send({error: 'Falha ao registrar'});
	})
});

router.post('/login',(req,res) => {
	const {email, password} = req.body;

	User.findOne({ email })
		.select('+password')
		.then(user => {
			if(user){ 
				bcrypt
				.compare(password, user.password)
				.then(result => { 
					if(result){
						const token =  generateToken({uid: user.id});
						return res.send({ token: token, tokenExpiration: '1d'}); //padrao de cookies
					} else {
						return res.status(400).send({error: 'Senha invalida'});
					}
				})
				.catch(error => {
					console.error('Erro ao verificar a senha', error);
					return res.status(500).send({error: 'Erro interno do servidor'});
				});
			} else { //se nao tem aquele usuario, erro 404
				req.status(404).send({error: 'Usuario nao encontrado'});
			}
	})
	.catch(error => {
		console.error('Erro ao logar', error);
		return req.status(500).send({error: 'Erro interno do servidor'});
	})
});

router.post('/forgot-password',(req,res) => {
  const {email} = req.body;

	User.findOne({email}).then(user =>{
		if(user){
			const token = crypto.randomBytes(20).toString('hex');
			const expiration = new Date();
			expiration.setHours(new Date().getHours() + 3); //3 horas de validade

			User.findByIdAndUpdate(user.id, { 
				$set: { //dados que serao atualizados
					passwordResetToken: token,
					passwordResetTokenExpiration: expiration
				}
			}).then(()=> {
				return res.send({token: token});
			})
		} else {
			req.status(404).send({error: 'Usuario nao encontrado'});
		}
	})
	.catch(error => {
		console.error('Erro no forgot password', error);
		return req.status(500).send({error: 'Erro interno do servidor'});
	})
});

router.post('/reset-password',(req,res) => {
	const {email, token, newPassword} = req.body;

	User.findOne({email})
	.select('passwordResetToken passwordResetTokenExpiration')
	.then(user => {
		if(user){
				if(token != user.passwordResetToken || new Date().now > user.passwordResetTokenExpiration){
					return res.status(400).send({error: 'Token invalido'})
				} else {
					user.passwordResetToken = undefined;
					user.passwordResetTokenExpiration = undefined;
					user.password = newPassword; //a senha ja é criptograda automaticamente no schema no pre

					user.save().then(() =>{
						return res.send({message: 'Senha trocada com sucesso!'});
					})
					.catch(error => {
						console.error('Erro ao salva nova senha', error);
						return res.status(500).send({error: 'Erro interno do servidor'}) //erro q eu vejo 
					})
				}
		} else {
			req.status(404).send({error: 'Usuario nao encontrado'});
		}
	})
	.catch(error => {
		console.error('Erro no forgot password', error);
		return req.status(500).send({error: 'Erro interno do servidor'});
	})
});

export default router;