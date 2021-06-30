const express = require('express')
const app = express()
const mongoclient = require('mongodb').MongoClient
const http=require('http')
const port = process.env.PORT || 3000

var path = require('path')
var fs = require('fs')
var cors = require('cors')


app.use(cors())

//  logger middleware

app.use((req,res, next)=>{
    console.log("Request IP: "+req.url)
    console.log("Request Date "+ new Date())
    next();
})



//to avoid cors errror
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// to extract parameter from requesthk
app.use(express.json())


//mongo connection
let db;
mongoclient.connect('mongodb+srv://coursework2:1234567890@cluster0.py8v0.mongodb.net/', (err,client)=>{
    db= client.db('Webstore')
})

// to get the collection name
app.param('collectionName',(req,res,next,collectionName)=>{
    req.collection = db.collection(collectionName)
    return next();
})

app.get('/',(req,res,next)=>{
    res.send('Please select a collection e.g /collection/messages')
})

// retrive lesson collection 
app.get('/collection/:collectionName',(req,res,next)=>{
    req.collection.find({}).toArray((e,results)=>{
        if(e) return next(e)
        res.send(results)
    })
})

//adding a post
app.post('/collection/:collectionName',(req,res,next)=>{
    req.collection.insert(req.body,(e,results)=>{
        if(e) return next(e)
        res.send(results.ops)
    })
})

// retreive a single ID

const objectId = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.findOne({_id: new objectId(req.params.id)},(e,result)=>{
        if(e)return next(e)
        res.send(result)
    })
})

// updating a collection object
app.put('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.update(
        {_id:new objectId(req.params.id)},
        {$set:req.body},
        {safe:true, multi:false},
        (e,result)=>{
            if(e)return next(e)
            res.send(result.result.n ===1)?{'message':'Updated successful'}:{'message':'Error'}
        }
    )
})
// deleting an object from a collection
app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
    { _id: objectId(req.params.id) },(e, result) => {
    if (e) return next(e)
    res.send((result.result.n === 1) ?
    {msg: 'success'} : {msg: 'error'})
    })
    })

    // serving static files
app.use((req,res,next)=>{
    var filePath = path.join(__dirname, 'images',req.url)
    fs.stat(filePath, function(err,fileInfo){
        if(err){
            next();
            return ;
        }
        if(fileInfo.isFile) res.send(filePath)
        else next()
    })
})

//error handler
app.use(function(req,res){
    res.status(404).send("File not found")
})
app.listen(port)