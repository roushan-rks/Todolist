const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash"); 
 const mongoose = require("mongoose");
const app = express();
 
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://roushan59227:RITIKraj12@cluster0.3ew3i.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("todolistDB").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://roushan59227:RITIKraj12@cluster0.3ew3i.mongodb.net/todolistDB");
const itemSchema = new mongoose.Schema({
    name:String
});
const Item = mongoose.model("Item",itemSchema);
const workSchema = new mongoose.Schema({
    name:String
});
const Workitem = mongoose.model("Workitem",workSchema);
const code = new Item({
    name:"coding"
});
const eat = new Item({
    name:"Eat"
});
const sleep = new Item({
    name:"Sleep"
});
const listSchema = new mongoose.Schema({
    name:String,
    list:[itemSchema]
});
const List = mongoose.model("List",listSchema);
let today = new Date();
let options ={
    weekday:"long",
    day:"numeric",
    month: "long"
};
let day =today.toLocaleDateString("en-US",options);
// const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
app.get("/", function (req, res) {
     Item.find(function(err,result){
        if(err){
            console.log(err);
        }
        else{
              if(result.length===0){
                Item.insertMany([code,eat,sleep],function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("success");
                    }
                });
                res.redirect("/");
              }
              else{
                  res.render("list", { listtitle: "Today" ,newitems:result});

              }
        }
     })
});
app.post("/",function(req,res){
   let item= req.body.newitems;
   
   const title=req.body.list;
    
 
   if(req.body.list==="Work"){
     
    const workitem = new Workitem({
        name:item
    });
    workitem.save();
    res.redirect("/work");
   }
   else if(title==="Today"){
     
       const newitem = new Item({
        name:item
       });
       newitem.save();
       res.redirect("/");
     }
     else{
        const newitem = new Item({
            name:item
           });
        List.findOneAndUpdate(
            { name: title }, 
            { $push: {  list: newitem  } },
           function (error, success) {
                 if (error) {
                     console.log(error);
                 } else {
                     res.redirect("/"+title);
                 }
             });   
     }
});
app.get("/work",function(req,res){
    Workitem.find(function(err,result){
        if(err){
            console.log(err);
        }
        else{

            res.render("list",{listtitle:"Work List",newitems:result});
        }
    })
});
app.get("/:customlistname",function(req,res){
    const request = _.capitalize(req.params.customlistname);
     
     List.findOne({name:request},function(err,result){
         if(!err){
            if(result){
                res.render("list",{listtitle: result.name ,newitems:result.list})
            }
            else{
                
                const newlist = new List({
                   name:request,
                   list:[code,eat,sleep]
                });
                newlist.save();
                 res.redirect("/"+request);
            }
         } 
         else{
            console.log(err);
         }        
    });
        
});
 app.post("/delete",function(req,res){
     const deleteval = (req.body.checkbox);
     const title = (req.body.titlename);
     if(title === "Today"){
         Item.deleteOne({_id:deleteval},function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("successfully deleted one item");
                res.redirect("/");
            }
         });
        }
      else if(title === "Work List"){
        Workitem.deleteOne({_id:deleteval},function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("successfully deleted one item");
                res.redirect("/work");
            }
         });
      }  
      else{
        List.findOneAndUpdate({name:title},{$pull:{list:{_id:deleteval}}},function(err){
            if(!err){
                res.redirect("/"+title);
            }
            else{
                console.log(err);
            }
        });
      }
 });
 let port = process.env.PORT;
 if(port == null|| port == ""){
    port = 4000;
 }
app.listen(port, function () {
    console.log("Server is running on port no " + port);

})