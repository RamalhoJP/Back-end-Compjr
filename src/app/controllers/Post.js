import{Router} from 'express';
import Post from '@/app/Schemas/Post';
import Slugify from '@/utils/slugify'; 

//crud -> cria, mostra, atualiza e delete posts 
const router = new Router;

//read
router.get('/', (req,res)=> {
	Post.find() //encontra os posts
	.then(data => { 
		const posts = data.map(post => {
			return {title: post.title, description: post.description, slug: post.slug};
		});
		// retorna os dados resumidos da maneira que ta no return
		res.send(posts);
	})
	.catch(error => {
		console.error('erro ao obter publicaçao no banco de dados', error);
			res
				.status(400)//erro
				.send({
					error: 'Não foi possivel obter os dados da publicaçao.'
				});
	});
});
//acessa a rota pelo slug
//encontra post pelo slug
router.get('/:postSlug', (req, res) =>{ 
	Post.findOne({slug: req.params.postSlug}) 
	.then(post =>{
		res.send(post);
		//retorna o post
	})
	.catch(error => {
		console.error('Erro ao obter publicaçao no banco de dados', error);
			res
				.status(400)//erro
				.send({
					error: 'Não foi possivel obter os dados da publicaçao.'
				});
	});
});

//create
router.post('/', (req,res)=>{
	const {title, slug, description} = req.body;
	//extraindo dados do req.body
	//poderia ser feito manualmente por ex const title = req.body; etc
	Post.create({title, slug, description}) //funcao assincrona, cria um post
	.then(post => {
		res.status(200).send(post);
		//manda pro banco
	})
	.catch(error => {
		console.error('Erro ao salvar nova publicaçao no banco de dados', error);
		res
			.status(400)//erro
			.send({
				error: 'Não foi possivel salvar publicaçao.'
			});
	});
});

//update
router.put('/:postId', (req,res)=>{
	const {title, description} = req.body;
	//extraindo dados do req.body
	let slug = undefined;
	//se tiver titulo, recebe/cria o slug a partir do titulo
	if(title){ 
		slug = Slugify(title);
	}
	Post.findByIdAndUpdate(
		req.params.postId, 
		{title, slug, description}, //os parametros do que podem ser atualizados
		{new: true}) //atualiza com os novos dados e mostra ja atualizado
	.then(post => {
		res.status(200).send(post);//manda pro banco a atualizacao
	})
	.catch(error => {
		console.error('erro ao salvar publicaçao no banco de dados', error);
		res.status(400).send({error: 'Não foi possivel salvar sua publicaçao.'});
	});
});

//delete
router.delete('/:postId', (req,res)=>{
	Post.findByIdAndRemove(req.params.postId).then(() => {
		res.send({message: 'Publicaçao removido com sucesso!'});
	}).catch(error =>{
		console.error('Erro ao remover publicaçao do banco de dados', error);
		res.status(400).send({message: 'Erro ao remover publicaçao, tente novamente'});
	});
});

export default router;
