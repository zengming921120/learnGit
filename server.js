const express = require('express');
const http = express();
const fs = require('fs');
// const db = new Db('goodslist');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');

const key = "12345";
http.use(bodyParser.urlencoded({extended:false}));
http.use(express.static('./dist'))
http.use((req,res,next) =>{
    res.header("Access-Control-Allow-Origin","*");
    next();
})


// http.on("request",function (req, res) {
//     if(req,url!=="/favicon.ico"){
//         res.end();
//     }
// })
//node服务器下 禁止favicon.ico请求
// http.on("request",function (req, res) {
//     if(req.url!=="/favicon.ico"){
//         console.log(req.url);
//         res.end()
//     }
// })

//对key进行签发
function sign (content,time) {
    return jwt.sign(content,key,{expiresIn:"7d"})

}
//封装函数用于验证tokenID
function verify(tokenID,callback){
    jwt.verify(tokenID,key,callback);
}





http.get("/getsearchgoods",(req,res) =>{
    fs.readFile("./shopcargoods.json",function (err, data) {
        if(err)throw err;
        var datas = JSON.parse(data);
        res.send(datas)
    })
})
http.get("/getallgoods",bodyParser.json(),(req,res) =>{
    fs.readFile("./data.json",function (err, data) {
        if(err)throw err;
        // console.log(typeof datas);
        var datas = JSON.parse(data)
        res.send(datas)
    })
})
http.get("/goback",(req,res) => {
    // let q=req.body;
    // console.log(q);
    // let tel = q.tel;
    // let password = q.password;
        res.send()
})


http.get("/getnum",bodyParser.json(),(req,res) =>{
   fs.readFile("./shopcargoods.json",function (err, data) {
       if(err)throw err;
       // console.log(typeof datas);
       // console.log(222);
       var datas = JSON.parse(data);
       var arrs = [];
       for (let i = 0; i < datas.data.length; i++) {
           if(datas.data[i].count*1>0){
               // console.log(1111);
               arrs.push(datas.data[i])
           }
       }
       // console.log(arrs);
       if (arrs.length>0){
       res.send({data:arrs})
       } else {
           res.send({data:null});
       }
   })
})

http.get("/getsortgoods",bodyParser.json(),(req,res) =>{
    fs.readFile("./sort.json",function (err, data) {
        if(err)throw err;
        // console.log(typeof datas);
        var datas = JSON.parse(data)
        console.log(datas);
        console.log('分类');

        res.send(datas)
    })
})
http.get("/getspecialgoods",bodyParser.json(),(req,res) =>{
    fs.readFile("./special.json",function (err, data) {
        if(err)throw err;
        console.log('专题');
        var datas = JSON.parse(data)
        // console.log(datas);
        res.send(datas)
    })
})

http.post("/getidgoods",bodyParser.json(),(req,res) =>{
    let q = req.body;
    fs.readFile("./shopcargoods.json",function (err, data) {
        if(err) throw err;
        var datas = JSON.parse(data);
        var shopcargoods = datas.data;
        var arr = []
        for (let i = 0; i < shopcargoods.length; i++) {
            if(shopcargoods[i].path==q.id){
                arr.push(shopcargoods[i])
                res.send({data:arr})
            }
        }
    })
})
//中间件的拦截,针对前端请求头所携带的tokenID进行拦截比对登录时后端派发的tokenID:如果前端本地的tokenID被手动修改,和后端比对则不一样
// 需写在要拦截的请求之前,否则无法拦截
http.use((req,res,next)=>{
    console.log(req.url);
    if(req.url=="/favicon.ico"){
        console.log(req.url);
        console.log(11);
        return;
    }else{
        console.log(89)
        let tokenID = req.headers.authorization;
        console.log(tokenID);
        if(tokenID==undefined){
            console.log(3232);
            next()
        }else {
            console.log(2323);
            verify(tokenID,(err,data)=>{//比对如果tokenID被修改则结束返回401状态码给前端否则继续执行下一步
                if(err) {
                    res.status(401);
                    res.send();
                }else{
                    next()
                }
            })

        }
    }

})

http.post("/login",(req,res) => {
    let q=req.body;
    // console.log(q);
    let tel = q.tel;
    let password = q.password;
    if("匹配"){
        res.send({
            uid:"xxx",
            tokenID:sign({id:"xxx"})
        })
    }
})
http.post("/change",(req,res) =>{
    let q = req.body;
    console.log(q.id);
    fs.readFile("./shopcargoods.json",function (err,data) {
        if(err)throw err;
        // console.log(data);
        var datas = JSON.parse(data);
        // console.log(datas.data);
        var shopcargoods = datas.data;
        let arr = [];
        for (let i = 0; i < shopcargoods.length; i++) {
            // console.log(typeof shopcargoods[0].path);
            if(shopcargoods[i].path==q.id){
                shopcargoods[i].count=shopcargoods[i].count*1+1;
            }
        }
        fs.writeFile("./shopcargoods.json",JSON.stringify(datas),"utf-8",function (err) {
                if(err) throw err;
                console.log("修改成功")
              res.send();
        })
    })
})
http.post("/shopcardel",bodyParser.json(),(req,res) =>{
    let q = JSON.parse(req.body.datas);
     console.log(q);
    console.log(44)
    fs.readFile("./shopcargoods.json",function (err,data) {
        if(err)throw err;
    //     // console.log(data);
        var datas = JSON.parse(data);
    //     // console.log(datas.data);
        var shopcargoods = datas.data;
        let arr = [];
        for (let i = 0; i < shopcargoods.length; i++) {
    //         // console.log(typeof shopcargoods[0].path);
            if(shopcargoods[i].path==q.path){
                shopcargoods[i]=q;
                break;
            }
        }
        fs.writeFile("./shopcargoods.json",JSON.stringify(datas),"utf-8",function (err) {
            if(err) throw err;
            console.log("减")
            res.send();
        })
    })
})

http.post("/deletegoods",bodyParser.json(),(req,res) =>{
    let q = req.body;
    console.log(q.id);
    fs.readFile("./shopcargoods.json",function (err,data) {
        if(err)throw err;
        // console.log(data);
        var datas = JSON.parse(data);
        // console.log(datas.data);
        var shopcargoods = datas.data;
        let arr = [];
        for (let i = 0; i < shopcargoods.length; i++) {
            // console.log(typeof shopcargoods[0].path);
            if(shopcargoods[i].path==q.id){
                shopcargoods[i].count=0;
            }
        }
        fs.writeFile("./shopcargoods.json",JSON.stringify(datas),"utf-8",function (err) {
            if(err) throw err;
            console.log("删除成功")
            res.send();
        })
    })
})


// http.post("/gets",(req,res)=>{
//     console.log(222);
//     console.log(req);
//     let datas = req.body;
//     console.log(121212);
//     res.send()
//     db.insertOne('goodslist',datas,function (err, data) {
//         if(err){
//             throw err
//         }else {
//             res.send({
//                 state:'1',
//                 code:'ok'
//             })
//         }
//     })
// })

http.listen(8080,function (req, res) {
    console.log('runing')
})