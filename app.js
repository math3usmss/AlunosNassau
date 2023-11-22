const express = require('express');
const xlsx = require('xlsx');
const multer = require('multer');
const mongoose = require('mongoose');

const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 3000;

// Conectar ao MongoDB usando o Mongoose
mongoose.connect('mongodb://localhost:27017/AlunosNassau', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Definir o esquema do Mongoose
const ItemSchema = new mongoose.Schema({}, { strict: false });
const ItemModel = mongoose.model('Item', ItemSchema);

// Rota para lidar com o upload do arquivo
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Verifica se foi enviado um arquivo
    if (!req.file) {
      return res.status(400).send('Nenhum arquivo enviado.');
    }

    // Lê o arquivo enviado
    const uploadedFilePath = req.file.path;
    const uploadedFile = xlsx.readFile(uploadedFilePath);

    // Processa os dados do arquivo
    const data = [];
    const sheets = uploadedFile.SheetNames;
    sheets.forEach((sheetName) => {
      const temp = xlsx.utils.sheet_to_json(uploadedFile.Sheets[sheetName]);
      temp.forEach((res) => {
        data.push(res);
      });
    });

    // Salva os dados no MongoDB
    await ItemModel.insertMany(data);

    // Renderiza a página com os dados
    res.render('index', { data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar o arquivo e salvar no banco de dados.');
  }
});

// Configurando o mecanismo de visualização como 'ejs'
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Rota para a página inicial
app.get('/', async (req, res) => {
  try {
    // Recupera os itens salvos no banco de dados
    const itens = await ItemModel.find();
    res.render('index', { data: itens });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao recuperar itens do banco de dados.');
  }
});

// Rota para a página de upload
app.get('/upload', (req, res) => {
  res.render('upload');
});

// Rota para lidar com o upload do arquivo
app.post('/upload', upload.single('file'), (req, res) => {
  // Aqui você pode processar o arquivo que foi enviado (por exemplo, salvar no servidor ou ler os dados)
  const uploadedFile = req.file;
  // Lógica de processamento aqui...

  // Redireciona de volta para a página de upload
  res.redirect('/upload');
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
