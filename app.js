//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _= require("lodash");
const app = express();

mongoose.connect("mongodb+srv://AK78:Vinayak8158@cluster0.euxh9ex.mongodb.net/todolistDB");



const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const ListSchema={
  name:String,
  items:[itemsSchema] //re using the itemsSchema to populate items list
}
const List=mongoose.model("List",ListSchema);





const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems).then(function(){
//   console.log("Successfully saved default items to DB.");
// }).catch(function(err){
//   console.log(err);
// });
//added initially to add the default items to the database


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const day = date.getDate();
app.get("/", function (req, res) {
  Item.find({}).then(function (foundItems) {
   //foundItems is an array of objects of the itemsSchema assumed to be the items in the database
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function () {
        console.log("Successfully saved default items to DB.");
      }).catch(function (err) {
        console.log(err);
      });
      
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  }).catch(function (err) { 
    console.log(err); 
  });
});

app.post("/", function (req, res) {

  const item_name = req.body.newItem;

  const item = new Item({
    name:item_name
  });
  if(req.body.list===day)
  {
  item.save();
  res.redirect("/");}
  
  else{
    List.findOne({name:req.body.list}).then(function(foundList){
      foundList.items.push(item); //pushing the item into the items array of the foundList because an Array is present in the ListSchema for items
      foundList.save();
      res.redirect("/"+req.body.list); //redirecting to the route with the name of the list

    });
  }


});

app.post("/delete",function(req,res){
  const checkeditem=req.body.checkbox;
  const listName=req.body.list;
  if(listName===day){
  Item.findByIdAndRemove(checkeditem).then(function(){
    console.log("deleted Checked Item");
    res.redirect('/');
  }).catch(function(err){
    console.log(err);
  });
}
else
{
 List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditem}}}).then(function(foundList){  //pulling the item from the items array of the foundList because an Array is present in the ListSchema for items
res.redirect("/"+listName);
 }).catch(function(err){
    console.log(err);
  });

}
});

app.get("/about",function(req,res){
  res.render("about"); //rendering the about.ejs file in the views folder
})


app.get("/"+":name",function(req,res){
  const customListName=_.capitalize(req.params.name);
  
  List.findOne({name:customListName}).then(function(foundList){
    if(!foundList){
      //create a new list'
  const list1=new List({
    name:customListName,
    items:defaultItems
  });
  list1.save();
  console.log("saved");
  res.redirect("/"+customListName);//redirecting to the route with the name of the list

}
else{
  //show an existing list
  res.render("list",{listTitle:foundList.name,newListItems:foundList.items}); //rendering the list.ejs file wherein the name on the top will be as the name of the route we selected and the items will be the items of the list using foundList.items
}
});
});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});
