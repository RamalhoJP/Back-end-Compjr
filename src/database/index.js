import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/projeto-comp', {
    useNewUrlParser : true,
    useUnifiedTopology : true,
});

mongoose.Promise = global.Promise;

export default mongoose;