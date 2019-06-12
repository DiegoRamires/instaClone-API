Iniciar o projeto criando o arquivo `package.json`. <br>
A flag `-y` serve para não precisar preencher o questionário para gerar o arquivo.

```
yarn init -y
```
-------------------------------------------------------
Instale o express
```
yarn add express
```
-------------------------------------------------------
Criando o servidor:
```
mkdir src
touch src/index.js
```
-------------------------------------------------------
No arquivo criado colocar:

```
const express = require('express')

const app = express()

app.get('/', (req, res) {
  return res.send("Hello World)
})

app.listen(3000)
console.log("Server running on 'http://localhost:3000'")
```

Use o comando `node src/index.js` para rodar o servidor

-------------------------------------------------------
Instalar o nodemon em ambiente de desenvolvimento
```
yarn add nodemon -D
```

Adicionar script no `package.json` para iniciar o servidor

```
"scripts": {
  "dev": "nodemon src/index.js"
}
```

Para subir o servidor, agora use o comando `yarn dev` que possibilitará que as mudanças sejam ouvidas pelo `nodemon` e o servidor seja reiniciado automaticamente.

-------------------------------------------------------
Instalar o mongoose

```
yarn add mongoose
```

Atualize o `src/index.js` para criar a conexão com o banco de dados

```
const express = require('express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect('mongodb://localhost/instarocket', { useNewUrlParser: true })

app.get('/', (req, res) => {
  return res.send('Hello World')
})

app.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log("The App server is running on localhost:3000")
  console.log("Hit ctrl + c to stop!")
})
```
--------------------------------------------------------

Dentro da pasta `src` criar um arquivo `routes.js` e colocar nele os arquivos de rotas:

```
const express = require('express')
const routes = new express.Router()

routes.get('/', (req, res) => {
  return res.send('Hello World')
})

module.export = routes
```

Atualizar o arquivo `src/index.js` e remover a rota que tem nele. Adicionar a chamada para o arquivo de rotas que acabamos de criar:

```
const express = require('express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect('mongodb://localhost/instarocket', {
  useNewUrlParser: true 
})

app.use(require('./routes'))

app.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log("The App server is running on localhost:3000")
  console.log("Hit ctrl + c to stop!")
})
```

----------------------------------------------------------
No terminal:
```
mkdir src/config
mkdir src/controllers
mkdir src/models

touch src/models/Post.js
```

No arquivo gerado, crie a tabela `Post` no com os campos que serão gravados nela. Digite:

```
const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  author: String,
  place: String,
  description: String,
  hashtags: String,
  image: String,
  likes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('Post', PostSchema)
```

Atualize o arquivo `src/routes.js` criando a rota **`/posts`**

```
const express = require('express')
const PostController = require('./controllers/PostController')

const routes = new express.Router()

routes.get('/posts', PostController.store)

module.exports = routes
```

----------------------------------------------------------------

Instalar o multer

```
yarn add multer
```

Criar o arquivo

```
touch src/config/upload.js
```

Atualize o `routes.js` para utilizar o multer:

```
const express = require('express')
const multer = require('multer')

const PostController = require('./controllers/PostController')
const upload = multer()

const routes = new express.Router()

routes.post('/posts', upload.single('image'), PostController.store)

module.exports = routes
```

No arquivo `src/config/upload.js` adicione as configurações para o upload da imagem para dentro da pasta da aplicação:

```
const multer = require('multer')
const path = require('path')

module.exports = {
  storage: new multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads')
  })
}
```

Atualize o `routes.js` para que o **post** reconheça que está sendo enviado uma imagem e que o método do controller chamado seja utilizado

```
const express = require('express')
const multer = require('multer')

const uploadConfig = require('./config/upload') 
const PostController = require('./controllers/PostController')

const routes = new express.Router()
const upload = multer(uploadConfig)

routes.post('/posts', upload.single('image'), PostController.store)

module.exports = routes
```

Atualize o arquivo `src/config/upload.js` para salvar a imagem dentro da aplicação

```
const multer = require('multer')
const path = require('path')

module.exports = {
  storage: new multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename: function(req, file, cb) {
      cb(null, file.originalname)
    }
  })
}
```

Atualizar o arquivo `src/controllers/PostController.js` para salvar no banco de dados os campos passados e a referencia para a imagem seja o caminho de dentro da aplicação:

```
const Post = require('../models/Post')

module.exports = {
  async index(req, res) {

  },

  async store(req, res) {
    const { author, place, description, hashtags } = req.body
    const { filename: image } = req.file

    const post = await Post.create({
      author,
      place,
      description,
      hashtags,
      image
    })

    return res.json(post)
  }
}
```

----------------------------------------------------------------------------

Criar uma nova rota no arquivo `src/routes.js` que possibilita retornar **( /get )** os arquivos salvos no banco de dados ordenando do mais recente para o mais antigo

```
routes.get('/posts', PostController.index)
```

No arquivo `src/controllers/PostController.js` atualize o método index para ordenar que seja retornado sempre o mais recente primeiro:

```
async index(req, res) {
  const posts = await Post.find().sort('-createdAt')

  return res.json(posts)
},
```

-------------------------------------------------------------------------------

Atualize o arquivo `src/routes.js` adicionando a nova rota de like e o método:

```
const express = require('express')
const multer = require('multer')

const uploadConfig = require('./config/upload') 
const PostController = require('./controllers/PostController')
const LikeController = require('./controllers/LikeController')

const routes = new express.Router()
const upload = multer(uploadConfig)

routes.get('/posts', PostController.index)
routes.post('/posts', upload.single('image'), PostController.store)

routes.post('/posts/:id/like', LikeController.store)

module.exports = routes
```

Atualize o arquivo `src/controllers/LikeController.js`:

```
const Post = require('../models/Post')

module.exports = {
  async store(req, res) {
    const post = await Post.findById(req.params.id)

    post.likes += 1
    await post.save()
    return res.json(post)
  }
}
```

----------------------------------------------------------------------------

Redimensionar as imagens quando forem salvas na aplicação

```
yarn add sharp
```

Adicionar as dependência no arquivo `PostController.js` para redimensionar o arquivo antes de salvar o `Post`

```
const sharp = require('sharp')
const path = require('path')
```

Criar uma pasta

```
mkdir src/uploads/resized
```

Atualize o `PostController`

```
const Post = require('../models/Post')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

module.exports = {
  async index(req, res) {
    const posts = await Post.find().sort('-createdAt')

    return res.json(posts)
  },

  async store(req, res) {
    const { author, place, description, hashtags } = req.body
    const { filename: image } = req.file

    // redimensiona a imagem e salva dentro da pasta `resized`
    await sharp(req.file.path)
      .resize(500)
      .jpeg({ quality: 70 })
      .toFile(
        path.resolve(req.file.destination, 'resized', image)
      )

    //deleta a imagem com tamanho original
    fs.unlinkSync(req.file.path)

    const post = await Post.create({
      author,
      place,
      description,
      hashtags,
      image
    })

    return res.json(post)
  }
}
```

--------------------------------------------------------------------------
Atualize o arquivo `src/index.js` para que ao acessar a rota `/files/nome-do-arquivo`, seja carregada a imagem que foi salva dentro da aplicação:

```
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

const app = express()

mongoose.connect('mongodb://localhost/instarocket', {
  useNewUrlParser: true 
})

app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads', 'resized')))

app.use(require('./routes'))

app.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log("The App server is running on localhost:3000")
  console.log("Hit ctrl + c to stop!")
})
```

Atualize o `src/controller/PostController.js`

```
const Post = require('../models/Post')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

module.exports = {
  async index(req, res) {
    const posts = await Post.find().sort('-createdAt')

    return res.json(posts)
  },

  async store(req, res) {
    const { author, place, description, hashtags } = req.body
    const { filename: image } = req.file

    // Força a imagem a ser salva com a extensão .jpg
    const [name] = image.split('.')
    const fileName = `${name}.jpg`

    // redimensiona a imagem e salva dentro da pasta `resized`
    await sharp(req.file.path)
      .resize(500)
      .jpeg({ quality: 70 })
      .toFile(
        path.resolve(req.file.destination, 'resized', fileName)
      )

    //deleta a imagem com tamanho original
    fs.unlinkSync(req.file.path)

    const post = await Post.create({
      author,
      place,
      description,
      hashtags,
      image: fileName
    })

    return res.json(post)
  }
}
```

-----------------------------------------------------

Instale o cors para permitir a api ser acessada pelo client

```
yarn add cors
```

Atualize o `scr/index.js` adicionando o cors:

```
...
const cors = require('cors')
...

app.use(cors())
...
```

--------------------------------------------

Instale a dependencia:

```
yarn add socket.io
```

Atualize o `src/index.js` para permitir que o server aceite conexões `http` e `websocket`

```
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')

const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

mongoose.connect('mongodb://localhost/instarocket', {
  useNewUrlParser: true 
})

app.use((req, res, next) => {
  req.io = io

  next()
})

app.use(cors())

app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads', 'resized')))

app.use(require('./routes'))

server.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log("The App server is running on localhost:3000")
  console.log("Hit ctrl + c to stop!")
})
```

Adicione no `src/controllers/PostController.js` após a ação de criar um `post`:

```
req.io.emit('post', post)
```

E no `src/controllers/LikeController.js` após salvar a adição do like:

```
req.io.emit('like', post)
```

Sempre que um novo `post` ou um novo `like` for criado, os usuários conectados na aplicação ficarão sabendo das mudanças