import mongoose from '@/database';
import Slugify from '../../utils/Slugify';

//Schema do banco de dados. Posts com titulo e descriçao

const PostSchema = new mongoose.Schema({
	title: {
		type: String,
		unique: true,
		required: true
	},
	slug: {
		type: String,
		unique: true
	},
	description: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

PostSchema.pre('save', function(next){
	const title = this.title;
	this.slug = Slugify(title);
	next();
})

export default mongoose.model('Post', PostSchema);