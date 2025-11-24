const express = require('express');
const app = express();
const port = 3000;
const Book = require('./Book');
const bookRouter = express.Router();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api', bookRouter);


app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});

app.listen(port, () => {
  console.log(`Server is running at port` + port);
});

let books = [new Book(1, "Dune", "sf", "Frank Herbert"),
             new Book(2, "Robinson Crusoe", "Adventure", "Daniel Defoe"),
             new Book(3, "Foundation", "sf", "Asimov")];


bookRouter.route('/books')
    .get((req, res) => {
    let filteredBooks = books;
    if(req.query.genre){
        filteredBooks = books.filter(b => b.genre === req.query.genre);
    }else{
        filteredBooks = books;
    }

    res.json(filteredBooks);

    })
    .post((req, res) => {
   const {id, name, genre, author} = req.body;

   //all fields are mandatory 

    if(!id || !name || !genre || !author){
        return res.status(400).json(
            {error: "All fields are mandatory",
            message: "Please provide id, name, genre, and author for the book."
            });
    }

    //id should be number

    if(isNaN(id)){
        return res.status(400).json(
            {error: "Invalid id",
            message: "Id should be a number."
            });
    }

    //id should be unique

    if(books.some(b => b.id === Number(id))){
        return res.status(400).json(
            {error: "Duplicate id",
            message: "A book with this id already exists."
            });
    }

    let newBook = new Book(id, name, genre, author);
    books.push(newBook);

    console.log("New book added:", newBook);

    return res.status(201).json(
        {
        success: true,
        book: newBook
    });
    
})

bookRouter.route('/books/:booksId')
    .put((req, res) => {
        const id = Number(req.params.booksId);
        let bookModif = books.find(x=> Number(x.id) === Number(id));
        if (!bookModif) {
            return res.status(404).json({ error: "Book not found" });
        }
        bookModif.name = req.body.name;
        bookModif.genre = req.body.genre;
        bookModif.author = req.body.author;
        res.json({message: "Book updated", book: bookModif});

    })

bookRouter.route('/books/:booksId')
    .delete((req, res) => {
        const id = Number(req.params.booksId);
        let bookIndex = books.findIndex(x=> Number(x.id) === Number(id));
        if (bookIndex === -1) {
            return res.status(404).json({ error: "Book not found" });
        }
        books.splice(bookIndex, 1);
        res.json({message: "Book deleted"});
    });




//new get to get books order alphabetically

bookRouter.get('/books/sorted', (req, res) => {
    let sortedBooks = books.sort((a, b) => a.name.localeCompare(b.name));
    res.json(sortedBooks);
});



