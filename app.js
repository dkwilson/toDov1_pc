const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "do stuff",
});

const item2 = new Item({
  name: "do more stuff",
});

const item3 = new Item({
  name: "do even more stuff",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model('List', listSchema)

app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to the database.");
        }
      });
      res.redirect('/');
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItem: foundItems,
      });
    }
  });
});

app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName}, (err, foundList) =>{
       if (!err) {
         if(!foundList) {
           const list = new List({
            name: customListName,
            items: defaultItems
          }) 

          list.save();
          res.redirect('/' + customListName)
         } else {
           res.render('list', {
            listTitle: foundList.name,
            newListItem: foundList.items,
          })
         }
       }
    });

    

    
})

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if(listName === "Today"){
      item.save();
    res.redirect('/')
    } else {
      List.findOne({ name: listName}, (err, foundList) => {
        foundList.items.push(item)
        foundList.save();
        res.redirect('/' + listName)
      })
    }

    
});

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, (err) => {
        if (!err) {
          console.log("Successfully delted checked item.")
          res.redirect('/');
        }
      })

    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
        if(!err){
          res.redirect("/" + listName);
        }
      });
    }

    
})

app.get("/work", (req, res) => {
  res.render("list", {
    listTitle: "Work List",
    newListItem: workItems,
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server listening on part 3000!");
});
