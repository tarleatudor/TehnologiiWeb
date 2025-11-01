let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let app = express();
let router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

const array = [
    {id: 1, name: 'Alex', age: 10},
    {id: 2, name: 'Maria', age: 12},
    {id: 3, name: 'John', age: 11},
    {id: 4, name: 'Ana', age: 13},
    {id: 5, name: 'Tom', age: 14}
];

router.route("/getList").get((req, res) =>{
    res.json(array);
});

router.route("/postList").post((req, res) =>{
    const newItem = req.body;
    newItem.id = array.length + 1;
    array.push(newItem);
    res.json(array);
});

//new Endpoint 

router.route("/getById/:id").get((req, res) =>{
    const id = parseInt(req.params.id);
    const item = array.find(i => i.id === id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).send("Item not found");
    }
});

let port = 8000;
app.listen(port);

console.log("Server started on port " + port);